import { getContract } from "./../helpers/utils";
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
  addressesProvider: "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
  pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  poolConfigurator: "0x8145eddDf43f50276641b55bd3AD95944510021E",
  priceOracle: "0xb023e699F5a33916Ea823A16485e259257cA8Bd1",
  dataProvider: "0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654",
  permissionsManager: ZERO_ADDRESS,
  uiPoolData: ZERO_ADDRESS,
};

export const Markets: { [key: string]: MarketAddresses } = {
  [MarketIds.MainV2]: {
    addressesProvider: "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5",
    pool: "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9",
    poolConfigurator: "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
    priceOracle: "0xa50ba011c48153de246e5192c8f9258a2ba79ca9",
    dataProvider: "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d",
    permissionsManager: ZERO_ADDRESS,
    uiPoolData: "0x47e300dDd1d25447482E2F7e5a5a967EA2DA8634",
  },
  [MarketIds.Arc]: {
    addressesProvider: "0x6FdfafB66d39cD72CFE7984D3Bbcc76632faAb00",
    pool: "0x37D7306019a38Af123e4b245Eb6C28AF552e0bB0",
    poolConfigurator: "0x4e1c7865e7be78a7748724fa0409e88dc14e67aa",
    permissionsManager: "0xF4a1F5fEA79C3609514A417425971FadC10eCfBE",
    priceOracle: "0xb8a7bc0d13b1f5460513040a97f404b4fea7d2f3",
    dataProvider: "0x71B53fC437cCD988b1b89B1D4605c3c3d0C810ea",
    uiPoolData: "0xED200aceFd4E63fe17B97B02d2616228d0df5398",
  },
  [MarketIds.ArbitrumV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: "0x3f960bB91e85Ae2dB561BDd01B515C5A5c65802b",
  },
  [MarketIds.OptimismV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: "0x64f558d4BFC1c03a8c8B2ff84976fF04c762b51f",
  },
  [MarketIds.PolygonV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: "0x8F1AD487C9413d7e81aB5B4E88B024Ae3b5637D0",
  },
  [MarketIds.AvalancheV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: "0xdBbFaFC45983B4659E368a3025b81f69Ab6E5093",
  },
  [MarketIds.HarmonyV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: "0xBC3c351349f6A919A419EE1e57F85f3e07E59dd1",
  },
  [MarketIds.FantomV3]: {
    ...DETERMINISTIC_V3_ADDRESSES,
    uiPoolData: "0x1CCbfeC508da8D5242D5C1b368694Ab0066b39f1",
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
