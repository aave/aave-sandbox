import { UiPoolDataProvider } from "./../typechain-types/UiPoolDataProvider";
import { ILendingPoolAddressesProvider } from "./../typechain-types/ILendingPoolAddressesProvider";
import { AaveProtocolDataProvider } from "./../typechain-types/AaveProtocolDataProvider";
import { formatTokenBalance, getErc20, getTokenSymbol } from "./utils";
import Bluebird, { AggregateError } from "bluebird";
import { ILendingPool } from "./../typechain-types/ILendingPool";
import { IPermissionManager } from "./../typechain-types/IPermissionManager";
import { IERC20 } from "../typechain-types/IERC20";
import { UserReserveDataStructOutput } from "../typechain-types/UiPoolDataProvider";
import { formatHealthFactor } from "./actions";
import { getMarketContracts } from "../config/addresses";
import { MarketIds } from "../config/types";

export const retrieveUsers = async (marketId: MarketIds) => {
  if (marketId === MarketIds.Arc) {
    const { permissionsManager, dataProvider } = await getMarketContracts(
      marketId
    );
    return await getArcUsersByManager(permissionsManager, dataProvider);
  }
  throw `[retrieveUsers] Strategy to retrieve users from market ${marketId} not implemented.`;
};

export const getArcUsersByManager = async (
  instance: IPermissionManager,
  poolData: AaveProtocolDataProvider
): Promise<string[]> => {
  const eventsFilter = await instance.filters.RoleSet(null, 0, null, null);
  const events = await instance.queryFilter(eventsFilter, 13431437, "latest"); // todo set blocks and parse events
  const registered = events.reduce<string[]>((acc, event) => {
    if (event.args.set === true) {
      acc.push(event.args.user);
      return acc;
    }
    const indexToRemove = acc.indexOf(event.args.user);
    if (indexToRemove > -1) {
      acc.splice(indexToRemove, 1);
    }
    return acc;
  }, []);

  const assets = await poolData.getAllATokens();
  const assetsInstances = await Bluebird.map(assets, (x) =>
    getErc20(x.tokenAddress)
  );
  const probeBalance = async (user: string, token: IERC20) =>
    new Promise(async (resolve, reject) => {
      const balance = await token.balanceOf(user);
      if (balance.gt("0")) {
        return resolve(true);
      } else {
        return reject();
      }
    });
  return Bluebird.filter(registered, async (user) =>
    Promise.resolve(
      Bluebird.any(assetsInstances.map((x) => probeBalance(user, x)))
        .then(() => true)
        .catch(Bluebird.AggregateError, (err) => {
          return false;
        })
    )
  );
};

export const getUserData =
  (
    addressesProvider: ILendingPoolAddressesProvider,
    uiPoolData: UiPoolDataProvider,
    pool: ILendingPool
  ) =>
  async (user: string, i: number) => {
    const [userReservesData] = await uiPoolData.getUserReservesData(
      addressesProvider.address,
      user
    );
    const hf = (await pool.getUserAccountData(user)).healthFactor;
    return {
      user,
      healthFactor: formatHealthFactor(hf),
      rawHealthFactor: hf,
      reserves: await Bluebird.map(
        userReservesData,
        async (x: UserReserveDataStructOutput) => ({
          enabledCollateral: x.usageAsCollateralEnabledOnUser,
          collateralBalance: await formatTokenBalance(
            x.scaledATokenBalance,
            x.underlyingAsset
          ),
          debtBalance: await formatTokenBalance(
            x.scaledVariableDebt.add(x.principalStableDebt),
            x.underlyingAsset
          ),
          symbol: await getTokenSymbol(x.underlyingAsset),
        })
      ),
    };
  };
