import Bluebird from "bluebird";
import { ZERO_ADDRESS } from "../../config/constants";
import { task } from "hardhat/config";
import { getMarketContracts } from "../../config/addresses";
import { MarketIds } from "../../config/types";
import { formatHealthFactor, printHealthFactor } from "../../helpers/actions";
import { getArcUsersByManager, getUserData } from "../../helpers/getters";
import {
  UiPoolDataProvider,
  UserReserveDataStructOutput,
} from "../../typechain-types/UiPoolDataProvider";
import { formatTokenBalance, getTokenSymbol } from "../../helpers/utils";
import { formatEther, parseEther } from "ethers/lib/utils";

task("print-accounts", "Print a table with accounts pool information")
  .addOptionalParam("accounts")
  .addParam("market")
  .setAction(
    async ({ market, accounts }: { market: any; accounts: string }, hre) => {
      const [deployer] = await hre.getUnnamedAccounts();
      if (market != MarketIds.Arc) {
        console.error("[print-user] This task only supports Aave Arc.");
        return;
      }
      const {
        pool,
        permissionsManager,
        priceOracle,
        addressesProvider,
        dataProvider,
      } = await getMarketContracts(market);
      const uiPoolArtifact = await hre.deployments.deploy(
        "UiPoolDataProvider",
        {
          from: deployer,
          args: [ZERO_ADDRESS, priceOracle.address],
        }
      );
      const uiPoolData = (await hre.ethers.getContractAt(
        uiPoolArtifact.abi,
        uiPoolArtifact.address
      )) as UiPoolDataProvider;

      const users = accounts
        ? accounts.split(",")
        : await getArcUsersByManager(permissionsManager, dataProvider);

      if (!users.length) {
        console.error(
          "[print-accounts] Users not found. Market is not initialized or incorrect 'accounts' argument."
        );
      }
      const usersData = await Bluebird.map(
        users,
        getUserData(addressesProvider, uiPoolData, pool)
      );
      const liquidable = await usersData.filter(({ rawHealthFactor }) => {
        if (rawHealthFactor.gte(parseEther("1"))) {
          return false;
        }
        return true;
      });
      const safeUsers = await usersData.filter(({ rawHealthFactor }) => {
        if (rawHealthFactor.gte(parseEther("1"))) {
          return true;
        }
        return false;
      });

      await Bluebird.each(safeUsers, (userData) => {
        console.log(`User Info:`);
        console.log("- Address:", userData.user);
        console.log("- Health Factor:", userData.healthFactor);
        console.log("- Balances");
        console.table(userData.reserves);
      });
      console.log("\n==== Possible Liquidations ==== ");
      await Bluebird.each(liquidable, (userData) => {
        console.log(`User Info:`);
        console.log("- Address:", userData.user);
        console.log("- Health Factor:", userData.healthFactor);
        console.log("- Balances");
        console.table(userData.reserves);
      });
    }
  );
