import { feedBalances, getUserBalances } from "../../helpers/utils";
import { task } from "hardhat/config";
import { getMarketContracts } from "../../config/addresses";

task(
  "feed-accounts",
  "Change the forked ERC20 tokens balance of an account using hardhat_setStorage"
)
  .addParam("accounts")
  .addParam("market")
  .setAction(
    async ({ market, accounts }: { market: any; accounts: string }, hre) => {
      const { dataProvider } = await getMarketContracts(market);
      const userAccounts: string[] = accounts.split(",");
      const assets = await dataProvider.getAllReservesTokens();
      const assetAddresses = assets.map(({ tokenAddress }) => tokenAddress);
      console.log("- Replacing ERC20 balances of:");
      console.log(userAccounts.join(", "));

      await feedBalances(userAccounts, assetAddresses);

      console.log("- Succesfully changed the balance of input addresses to:");
      console.table(await getUserBalances(userAccounts[0], assetAddresses));
    }
  );
