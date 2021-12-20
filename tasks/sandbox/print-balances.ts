import { task } from "hardhat/config";
import { getMarketContracts } from "../../config/addresses";
import { getUserBalances } from "../../helpers/utils";

task("print-balances", "Print account ERC20 balances")
  .addParam("account")
  .addParam("market")
  .setAction(
    async ({ market, account }: { market: any; account: string }, hre) => {
      const { dataProvider } = await getMarketContracts(market);
      const assets = await dataProvider.getAllReservesTokens();
      const assetAddresses = assets.map(({ tokenAddress }) => tokenAddress);

      console.table(await getUserBalances(account, assetAddresses));
    }
  );
