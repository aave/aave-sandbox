import { formatEther } from "ethers/lib/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import Bluebird from "bluebird";
import { task } from "hardhat/config";

task("print-local-accounts").setAction(async (_, hre) => {
  const accounts = await hre.ethers.getSigners();
  const tableInfo = await Bluebird.map(
    accounts,
    async (acc: SignerWithAddress) => {
      return {
        address: acc.address,
        balance: formatEther(await acc.getBalance()),
      };
    }
  );
  console.table(tableInfo);
});
