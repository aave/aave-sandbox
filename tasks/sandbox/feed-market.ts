import { AddressSetEvent } from "./../../typechain-types/ILendingPoolAddressesProvider";
import { MAX_UINT_AMOUNT } from "./../../config/constants";
import { getErc20, getTokenSymbol, waitForTx } from "./../../helpers/utils";
import { TokenDataStruct } from "./../../typechain-types/AaveProtocolDataProvider";
import Bluebird from "bluebird";
import { feedBalances, getUserBalances } from "../../helpers/utils";
import { task } from "hardhat/config";
import { getMarketContracts } from "../../config/addresses";
import {
  addPermissions,
  borrowFromMarket,
  injectLiquidity,
  printHealthFactor,
} from "../../helpers/actions";
import { BigNumber } from "ethers";
import { MarketIds } from "../../config/types";

task(
  "feed-market",
  "Feed liquidity and users to an Aave market in sandbox environment"
)
  .addParam("market")
  .setAction(async ({ market }, hre) => {
    const {
      dataProvider,
      pool,
      poolConfigurator,
      permissionsManager,
      addressesProvider,
      priceOracle,
    } = await getMarketContracts(market);
    const accounts = await hre.ethers.getSigners();
    const userAccounts = accounts.map((a) => a.address);
    const depositors = accounts.slice(0, 3);
    const borrowers = accounts.slice(3, 10);

    const assets = await dataProvider.getAllReservesTokens();
    const assetAddresses = assets.map(({ tokenAddress }) => tokenAddress);
    // Set balances of ERC20 tokens
    await feedBalances(userAccounts, assetAddresses);

    console.log("- Set user balances");

    // Add full permissions if Arc Market
    if (market == MarketIds.Arc) {
      await addPermissions(permissionsManager, ["0", "1", "2"], userAccounts);
      console.log("- Whitelisted users to PermissionManager");
    }

    // Depositors injects liquidity into market
    await injectLiquidity(depositors, assets, pool, "9000");
    console.log("- Injected liquidity from depositors");

    // Borrowers deposits collateral
    await injectLiquidity(borrowers, assets, pool, "5000");
    console.log("- Borrowers deposited collateral");

    // Borrowers borrow WBTC, WETH
    const borrowableAssetsList = ["WETH", "WBTC"];
    const borrowableAssets = assets.filter((a) =>
      borrowableAssetsList.includes(a.symbol)
    );
    await borrowFromMarket(borrowers, borrowableAssets, pool, priceOracle);
    console.log("- Borrowers perform borrows");

    await printHealthFactor(
      borrowers.map((x) => x.address),
      pool
    );
  });
