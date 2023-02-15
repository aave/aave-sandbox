import path from "path";
import fs from "fs";
import { MARKET, ALCHEMY_KEY } from "./env";
import {
  eArbitrumNetwork,
  eAvalancheNetwork,
  eEthereumNetwork,
  eFantomNetwork,
  eHarmonyNetwork,
  eNetwork,
  eOptimismNetwork,
  ePolygonNetwork,
  iParamsPerNetwork,
} from "./types";
import { HardhatNetworkForkingUserConfig } from "hardhat/types";

export const buildForkConfig = () => {
  switch (MARKET) {
    case "main-v2":
    case "arc":
      return {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
        blockNumber: getForkNumber(),
      };
    default:
      return buildV3ForkConfig();
  }
};

export const FORK = (process.env.FORK || "") as eNetwork;
export const FORK_BLOCK_NUMBER = process.env.FORK_BLOCK_NUMBER
  ? parseInt(process.env.FORK_BLOCK_NUMBER)
  : 0;

export const buildV3ForkConfig = ():
  | HardhatNetworkForkingUserConfig
  | undefined => {
  let forkMode: HardhatNetworkForkingUserConfig | undefined;
  if (FORK && NETWORKS_RPC_URL[FORK]) {
    forkMode = {
      url: NETWORKS_RPC_URL[FORK] as string,
    };
    if (FORK_BLOCK_NUMBER) {
      forkMode.blockNumber = FORK_BLOCK_NUMBER;
    }
  }
  return forkMode;
};
export const getForkNumber = () => {
  switch (MARKET) {
    case "main-v2":
    case "arc":
      return 13431462;
    default:
      return undefined;
  }
};

export const loadTasks = (taskFolders: string[]): void =>
  taskFolders.forEach((folder) => {
    const tasksPath = path.join(__dirname, "../tasks", folder);
    fs.readdirSync(tasksPath)
      .filter((pth) => pth.includes(".ts") || pth.includes(".js"))
      .forEach((task) => {
        require(`${tasksPath}/${task}`);
      });
  });

export const getAlchemyKey = (net: eNetwork) => {
  switch (net) {
    case eEthereumNetwork.kovan:
      return process.env.KOVAN_ALCHEMY_KEY || ALCHEMY_KEY;
    case eEthereumNetwork.main:
      return process.env.MAIN_ALCHEMY_KEY || ALCHEMY_KEY;
    case eOptimismNetwork.main:
      return process.env.OPTIMISM_ALCHEMY_KEY || ALCHEMY_KEY;
    case eOptimismNetwork.testnet:
      return process.env.KOVAN_OPTIMISM_ALCHEMY_KEY || ALCHEMY_KEY;
    case eEthereumNetwork.rinkeby:
      return process.env.RINKEBY_ALCHEMY_KEY || ALCHEMY_KEY;
    case ePolygonNetwork.mumbai:
      return process.env.POLYGON_MUMBAI_ALCHEMY_KEY || ALCHEMY_KEY;
    case ePolygonNetwork.polygon:
      return process.env.POLYGON_ALCHEMY_KEY || ALCHEMY_KEY;
    default:
      return ALCHEMY_KEY;
  }
};

export const NETWORKS_RPC_URL: iParamsPerNetwork<string> = {
  [eEthereumNetwork.kovan]: `https://eth-kovan.alchemyapi.io/v2/${getAlchemyKey(
    eEthereumNetwork.kovan
  )}`,
  [eEthereumNetwork.main]: `https://eth-mainnet.alchemyapi.io/v2/${getAlchemyKey(
    eEthereumNetwork.main
  )}`,
  [eEthereumNetwork.coverage]: "http://localhost:8555",
  [eEthereumNetwork.hardhat]: "http://localhost:8545",
  [ePolygonNetwork.mumbai]: `https://polygon-mumbai.g.alchemy.com/v2/${getAlchemyKey(
    ePolygonNetwork.mumbai
  )}`,
  [ePolygonNetwork.polygon]: `https://polygon-mainnet.g.alchemy.com/v2/${getAlchemyKey(
    ePolygonNetwork.polygon
  )}`,
  [eArbitrumNetwork.arbitrum]: `https://arb1.arbitrum.io/rpc`,
  [eArbitrumNetwork.arbitrumTestnet]: `https://rinkeby.arbitrum.io/rpc`,
  [eEthereumNetwork.rinkeby]: `https://eth-rinkeby.alchemyapi.io/v2/${getAlchemyKey(
    eEthereumNetwork.rinkeby
  )}`,
  [eHarmonyNetwork.main]: `https://a.api.s0.t.hmny.io/`,
  [eHarmonyNetwork.testnet]: `https://api.s0.b.hmny.io`,
  [eAvalancheNetwork.avalanche]: "https://api.avax.network/ext/bc/C/rpc",
  [eAvalancheNetwork.fuji]: "https://api.avax-test.network/ext/bc/C/rpc",
  [eFantomNetwork.main]: "https://rpc.ftm.tools/",
  [eFantomNetwork.testnet]: "https://rpc.testnet.fantom.network/",
  [eOptimismNetwork.testnet]: `https://opt-kovan.g.alchemy.com/v2/${getAlchemyKey(
    eOptimismNetwork.testnet
  )}`,
  [eOptimismNetwork.main]: `https://mainnet.optimism.io`,
};
