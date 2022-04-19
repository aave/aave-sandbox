import { retrieveUsers } from "./../../helpers/getters";
import Bluebird from "bluebird";
import { task } from "hardhat/config";
import { getMarketContracts } from "../../config/addresses";
import { getUserData } from "../../helpers/getters";
import { parseEther } from "ethers/lib/utils";

task("print-accounts", "Print a table with accounts pool information")
  .addOptionalParam("accounts")
  .addParam("market")
  .setAction(
    async ({ market, accounts }: { market: any; accounts: string }, hre) => {
      const { pool, addressesProvider, uiPoolData } = await getMarketContracts(
        market
      );

      console.log("\n- Retrieve users addresses list...");
      const users = accounts
        ? accounts.split(",")
        : await retrieveUsers(market);

      if (!users.length) {
        console.error(
          "[print-accounts] Users not found. Market is not initialized or incorrect 'accounts' argument."
        );
      }
      console.log(`- Found ${users.length} users`);
      console.log("- Loading user data...\n");
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

      console.log("\n==== Safe users ====\n");
      await Bluebird.each(safeUsers, (userData) => {
        console.log(`User Info:`);
        console.log("- Address:", userData.user);
        console.log("- Health Factor:", userData.healthFactor);
        console.log("- Balances");
        console.table(userData.reserves);
      });
      console.log("\n==== Possible Liquidations ====\n");
      await Bluebird.each(liquidable, (userData) => {
        console.log(`User Info:`);
        console.log("- Address:", userData.user);
        console.log(
          "- Health Factor:",
          "\x1b[33m",
          userData.healthFactor,
          "\x1b[0m"
        );
        console.log("- Balances");
        console.table(userData.reserves);
      });
    }
  );
