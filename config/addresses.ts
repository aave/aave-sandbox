import { getContract } from "./../helpers/utils";
import * as markets from '@bgd-labs/aave-address-book';
import { MarketAddresses, MarketIds } from "./types";
import { ZERO_ADDRESS } from "./constants";
import {
  ILendingPoolAddressesProvider,
  ILendingPool,
  ILendingPoolConfigurator,
  IPermissionManager,
  AaveOracle,
  UiPoolDataProviderV3,
  UiPoolDataProvider,
} from "../typechain-types";
import {
  AaveProtocolDataProviderV2,
  AaveProtocolDataProviderV3,
} from "./sc-types";
const DETERMINISTIC_V3_ADDRESSES: MarketAddresses = {
  addressesProvider: markets.AaveV3Polygon.POOL_ADDRESSES_PROVIDER,
  pool: markets.AaveV3Polygon.POOL,
  poolConfigurator: markets.AaveV3Polygon.POOL_CONFIGURATOR,
  priceOracle: markets.AaveV3Polygon.ORACLE,
  dataProvider: markets.AaveV3Polygon.AAVE_PROTOCOL_DATA_PROVIDER,
  permissionsManager: ZERO_ADDRESS,
  uiPoolData: ZERO_ADDRESS,
};

export const Markets: { [key: string]: MarketAddresses } = {
  [MarketIds.MainV2]: {
    addressesProvider: markets.AaveV2Ethereum.POOL_ADDRESSES_PROVIDER,
    pool: markets.AaveV2Ethereum.POOL,
    poolConfigurator: markets.AaveV2Ethereum.POOL_CONFIGURATOR,
    priceOracle: markets.AaveV2Ethereum.ORACLE,
    dataProvider: markets.AaveV2Ethereum.AAVE_PROTOCOL_DATA_PROVIDER,
    permissionsManager: ZERO_ADDRESS,
    uiPoolData: '0xED200aceFd4E63fe17B97B02d2616228d0df5398', // older typechain version 
  },
  [MarketIds.MainV3]: {
    addressesProvider: markets.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
    pool: markets.AaveV3Ethereum.POOL,
    poolConfigurator: markets.AaveV3Ethereum.POOL_CONFIGURATOR,
    priceOracle: markets.AaveV3Ethereum.ORACLE,
    dataProvider: markets.AaveV3Ethereum.AAVE_PROTOCOL_DATA_PROVIDER,
    permissionsManager: ZERO_ADDRESS,
    uiPoolData: markets.AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
  },
  [MarketIds.Arc]: {
    addressesProvider: markets.AaveV2EthereumArc.POOL_ADDRESSES_PROVIDER,
    pool: markets.AaveV2EthereumArc.POOL,
    poolConfigurator: markets.AaveV2EthereumArc.POOL_CONFIGURATOR,
    priceOracle: markets.AaveV2EthereumArc.ORACLE,
    dataProvider: markets.AaveV2EthereumArc.AAVE_PROTOCOL_DATA_PROVIDER,
    permissionsManager: ZERO_ADDRESS,
    uiPoolData: '0xED200aceFd4E63fe17B97B02d2616228d0df5398', // using older typechain version
  },
  [MarketIds.ArbitrumV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: markets.AaveV3Arbitrum.UI_POOL_DATA_PROVIDER,
  },
  [MarketIds.OptimismV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: markets.AaveV3Optimism.UI_POOL_DATA_PROVIDER,
  },
  [MarketIds.PolygonV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: markets.AaveV3Polygon.UI_POOL_DATA_PROVIDER,
  },
  [MarketIds.AvalancheV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: markets.AaveV3Avalanche.UI_POOL_DATA_PROVIDER,
  },
  [MarketIds.HarmonyV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: markets.AaveV3Harmony.UI_POOL_DATA_PROVIDER,
  },
  [MarketIds.FantomV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: markets.AaveV3Fantom.UI_POOL_DATA_PROVIDER,
  },
};

export const ARC_WHITELISTER = "0x686a12a79008246f4df2f1ea30d136bd6de748b4";

export const getMarketConfig = (marketId: MarketIds): MarketAddresses => {
  switch (marketId) {
    case MarketIds.PolygonV3:
      return Markets[MarketIds.PolygonV3];
    case MarketIds.AvalancheV3:
      return Markets[MarketIds.AvalancheV3];
    case MarketIds.ArbitrumV3:
      return Markets[MarketIds.ArbitrumV3];
    case MarketIds.HarmonyV3:
      return Markets[MarketIds.HarmonyV3];
    case MarketIds.OptimismV3:
      return Markets[MarketIds.OptimismV3];
    case MarketIds.FantomV3:
      return Markets[MarketIds.FantomV3];
    case MarketIds.MainV3:
      return Markets[MarketIds.MainV3];
    case MarketIds.MainV2:
      return Markets[MarketIds.MainV2];
    case MarketIds.Arc:
      return Markets[MarketIds.Arc];
    default:
      throw `Missing market name ${marketId}. You must use one of the available markets: ${Object.values(
        MarketIds
      )}`;
  }
};

export const getMarketInstances = async (
  addresses: MarketAddresses,
  version: number
) => {
  const addressesProvider = (await getContract(
    "ILendingPoolAddressesProvider",
    addresses.addressesProvider
  )) as ILendingPoolAddressesProvider;
  const pool = (await getContract(
    "ILendingPool",
    addresses.pool
  )) as ILendingPool;
  const poolConfigurator = (await getContract(
    "ILendingPoolConfigurator",
    addresses.poolConfigurator
  )) as ILendingPoolConfigurator;
  const permissionsManager = (await getContract(
    "IPermissionManager",
    addresses.permissionsManager
  )) as IPermissionManager;
  const priceOracle = (await getContract(
    "AaveOracle",
    addresses.priceOracle
  )) as AaveOracle;
  const dataProvider =
    version === 3
      ? ((await getContract(
        "@aave/core-v3/contracts/misc/AaveProtocolDataProvider.sol:AaveProtocolDataProvider",
        addresses.dataProvider
      )) as AaveProtocolDataProviderV3)
      : ((await getContract(
        "@aave/protocol-v2/contracts/misc/AaveProtocolDataProvider.sol:AaveProtocolDataProvider",
        addresses.dataProvider
      )) as AaveProtocolDataProviderV2);
  const uiPoolData =
    version === 3
      ? ((await getContract(
        "UiPoolDataProviderV3",
        addresses.uiPoolData
      )) as UiPoolDataProviderV3)
      : ((await getContract(
        "UiPoolDataProvider",
        addresses.uiPoolData
      )) as UiPoolDataProvider);
  return {
    addressesProvider,
    pool,
    poolConfigurator,
    permissionsManager,
    priceOracle,
    dataProvider,
    uiPoolData,
  };
};

export const getMarketContracts = async (marketId: MarketIds) =>
  getMarketInstances(
    getMarketConfig(marketId),
    marketId.includes("v3") ? 3 : 2
  );
