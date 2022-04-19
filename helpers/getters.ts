import { formatTokenBalance, getErc20, getTokenSymbol } from "./utils";
import Bluebird, { AggregateError } from "bluebird";
import { formatHealthFactor } from "./actions";
import { getMarketContracts } from "../config/addresses";
import {
  AaveProtocolDataProviderV2,
  AaveProtocolDataProviderV3,
  MarketIds,
} from "../config/types";
import {
  IPermissionManager,
  IERC20,
  ILendingPoolAddressesProvider,
  UiPoolDataProvider,
  UiPoolDataProviderV3,
  ILendingPool,
} from "../typechain-types";

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
  poolData: AaveProtocolDataProviderV2 | AaveProtocolDataProviderV3
): Promise<string[]> => {
  const eventsFilter = await instance.filters.RoleSet(null, 0, null, null);
  const events = await instance.queryFilter(eventsFilter, 13431437, "latest"); // todo set blocks and parse events
  const registered = events.reduce<string[]>((acc: string[], event: any) => {
    if (event.args.set === true) {
      acc.push(event.args.user);
      return acc;
    }
    const indexToRemove = acc.indexOf(event.args.user);
    if (indexToRemove > -1) {
      acc.splice(indexToRemove, 1);
    }
    return acc;
  }, [] as string[]);

  const assets = await poolData.getAllATokens();
  const assetsInstances = await Bluebird.map(assets, (x: any) =>
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
    uiPoolData: UiPoolDataProvider | UiPoolDataProviderV3,
    pool: ILendingPool
  ) =>
  async (user: string, i: number) => {
    const [userReservesData]: any = await uiPoolData.getUserReservesData(
      addressesProvider.address,
      user
    );
    const hf = (await pool.getUserAccountData(user)).healthFactor;
    return {
      user,
      healthFactor: formatHealthFactor(hf),
      rawHealthFactor: hf,
      reserves: await Bluebird.map(userReservesData, async (x: any) => ({
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
      })),
    };
  };
