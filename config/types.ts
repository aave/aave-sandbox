export enum MarketIds {
  MainV2 = "main-v2",
  Arc = "arc",
  PolygonV3 = "polygon-v3",
  FantomV3 = "fantom-v3",
  AvalancheV3 = "avalanche-v3",
  ArbitrumV3 = "arbitrum-v3",
  OptimismV3 = "optimism-v3",
  HarmonyV3 = "harmony-v3",
  MainV3 = 'main-v3',
}

export interface MarketAddresses {
  addressesProvider: string;
  pool: string;
  poolConfigurator: string;
  permissionsManager: string;
  priceOracle: string;
  dataProvider: string;
  uiPoolData: string;
}

export type eNetwork =
  | eEthereumNetwork
  | ePolygonNetwork
  | eXDaiNetwork
  | eAvalancheNetwork
  | eArbitrumNetwork
  | eHarmonyNetwork
  | eFantomNetwork
  | eOptimismNetwork
  | eTenderlyNetwork;

type eTenderlyNetwork = "tenderly";

export enum eFantomNetwork {
  main = "fantom",
  testnet = "fantom-testnet",
}

export enum eOptimismNetwork {
  main = "optimism",
  testnet = "optimism-testnet",
}

export enum eEthereumNetwork {
  buidlerevm = "buidlerevm",
  kovan = "kovan",
  ropsten = "ropsten",
  main = "main",
  coverage = "coverage",
  hardhat = "hardhat",
  tenderly = "tenderly",
  rinkeby = "rinkeby",
  mainnet = "mainnet",
}

export enum ePolygonNetwork {
  polygon = "polygon",
  mumbai = "mumbai",
}

export enum eXDaiNetwork {
  xdai = "xdai",
}

export enum eAvalancheNetwork {
  avalanche = "avalanche",
  fuji = "fuji",
}

export enum eArbitrumNetwork {
  arbitrum = "arbitrum",
  arbitrumTestnet = "arbitrum-testnet",
}

export enum eHarmonyNetwork {
  main = "harmony",
  testnet = "harmony-testnet",
}

export enum EthereumNetworkNames {
  kovan = "kovan",
  ropsten = "ropsten",
  main = "main",
  matic = "matic",
  mumbai = "mumbai",
  xdai = "xdai",
  avalanche = "avalanche",
  fuji = "fuji",
}

export type iParamsPerNetwork<T> = {
  [k in eNetwork]?: T;
};
