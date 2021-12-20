import { HardhatUserConfig } from "hardhat/config";

import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-dependency-compiler";
import "hardhat-deploy";
import { buildForkConfig, loadTasks } from "./config/hardhat-config";
import { SKIP_LOAD } from "./config/env";
import { TASK_FOLDERS } from "./config/constants";

// Prevent to load tasks before compilation and typechain
if (!SKIP_LOAD) {
  loadTasks(TASK_FOLDERS);
}

const config: HardhatUserConfig = {
  solidity: "0.6.12",
  networks: {
    localhost: {
      url: "http://localhost:8545/",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
      },
      saveDeployments: false,
    },
    hardhat: {
      forking: buildForkConfig(),
    },
  },
  dependencyCompiler: {
    paths: [
      "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol",
      "@aave/protocol-v2/contracts/interfaces/ILendingPoolConfigurator.sol",
      "@aave/protocol-v2/contracts/interfaces/IPriceOracle.sol",
      "@aave/protocol-v2/contracts/misc/AaveOracle.sol",
      "@aave/protocol-v2/contracts/interfaces/IPermissionManager.sol",
      "@aave/protocol-v2/contracts/misc/AaveProtocolDataProvider.sol",
      "@aave/protocol-v2/contracts/mocks/oracle/CLAggregators/MockAggregator.sol",
      "@aave/protocol-v2/contracts/misc/UiPoolDataProvider.sol",
    ],
  },
};

export default config;
