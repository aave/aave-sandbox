import { evmResetFork, evmRevert, evmSnapshot } from "./../../helpers/utils";
import { feedBalances } from "../../helpers/utils";
import { task } from "hardhat/config";
import { getMarketContracts } from "../../config/addresses";
import {
  addPermissions,
  borrowFromMarket,
  injectLiquidity,
  printHealthFactor,
  replaceOracleSources,
} from "../../helpers/actions";
import { MarketIds } from "../../config/types";

task(
  "feed-market",
  "Feed liquidity and users to an Aave market in sandbox environment"
)
  .addParam("market")
  .addFlag(
    "disableReset",
    "Prevent to reset the Node state to the initial fork before feeding the market. Do not enable"
  )
  .setAction(async ({ market, disableReset }, hre) => {
    const { dataProvider, pool, permissionsManager, priceOracle } =
      await getMarketContracts(market);
    const accounts = await hre.ethers.getSigners();
    const userAccounts = accounts.map((a) => a.address);
    const depositors = accounts.slice(0, 3);
    const borrowers = accounts.slice(3, 10);

    if (!disableReset) {
      await evmResetFork();
    }
    const initialSnapshot = await evmSnapshot();

    const assets = await dataProvider.getAllReservesTokens();
    const assetAddresses = assets.map(({ tokenAddress }) => tokenAddress);
    const borrowableAssetsList = ["WETH", "WBTC"];
    const borrowableAssets = assets.filter((a) =>
      borrowableAssetsList.includes(a.symbol)
    );
    const borrowerCollateralAssets = assets.filter(
      (a) => !borrowableAssetsList.includes(a.symbol)
    );

    // Set balances of ERC20 tokens
    await feedBalances(userAccounts, assetAddresses);

    console.log("- Faucet ERC20 reserves to users");

    // Add full permissions if Arc Market
    if (market == MarketIds.Arc) {
      await addPermissions(permissionsManager, ["0", "1", "2"], userAccounts);

      console.log("- Whitelisted users to PermissionManager");
    }

    // Depositors injects liquidity into market
    await injectLiquidity(depositors, assets, pool, "9000");

    console.log(
      "- Injected liquidity from depositors:",
      assets.map(({ symbol }) => symbol).join(", ")
    );

    // Borrowers deposits 10% of their collateral
    await injectLiquidity(borrowers, borrowerCollateralAssets, pool, "5000");

    console.log(
      "- Borrowers deposited collateral:",
      borrowerCollateralAssets.map(({ symbol }) => symbol).join(", ")
    );

    // Borrowers borrows max of WBTC, WETH
    await borrowFromMarket(
      borrowers,
      borrowableAssets,
      pool,
      priceOracle,
      "9999"
    );

    console.log(
      "- Borrowers perform borrows of:",
      borrowableAssets.map(({ symbol }) => symbol).join(", ")
    );

    // Dump collateral down to 30% of original price
    await replaceOracleSources(
      "7000",
      borrowerCollateralAssets.map(({ tokenAddress }) => tokenAddress),
      priceOracle
    );
    console.log(
      "- Dump collateral prices up to 30% for creating liquidable positions"
    );
    console.log("- Borrowers Health Factor table");
    await printHealthFactor(
      borrowers.map((x) => x.address),
      pool
    );
    const afterSnapshot = await evmSnapshot();

    console.log(
      "Successfully injected liquidity and liquidable borrowers to the market."
    );
    console.log("- Inital Snapshot ID:", initialSnapshot);
    console.log("- After Snapshot ID:", afterSnapshot);
  });
