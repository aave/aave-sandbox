import { task } from "hardhat/config";

task("set-interval-mining", "Enable to mine blocks by interval")
  .addOptionalParam(
    "interval",
    "Interval in milliseconds to mine a block",
    "5000"
  )
  .setAction(
    async ({ interval }: { enable: string; interval: string }, hre) => {
      const msPerBlock = Number(interval);
      await hre.ethers.provider.send("evm_setIntervalMining", [msPerBlock]);
    }
  );
