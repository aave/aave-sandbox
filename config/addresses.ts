import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ILendingPool } from "./../typechain-types/ILendingPool";
import { ILendingPoolConfigurator } from "./../typechain-types/ILendingPoolConfigurator";
import { IPriceOracle } from "./../typechain-types/IPriceOracle";
import { AaveProtocolDataProvider } from "./../typechain-types/AaveProtocolDataProvider";
import { IPermissionManager } from "./../typechain-types/IPermissionManager";
import { getContract } from "./../helpers/utils";
import { MarketAddresses, MarketIds } from "./types";
import { ZERO_ADDRESS } from "./constants";

export const Markets: { [key: string]: MarketAddresses } = {
  [MarketIds.Main]: {
    addressesProvider: "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5",
    pool: "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9",
    poolConfigurator: "0x311bb771e4f8952e6da169b425e7e92d6ac45756",
    priceOracle: "0xa50ba011c48153de246e5192c8f9258a2ba79ca9",
    dataProvider: "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d",
    permissionsManager: ZERO_ADDRESS,
  },
  [MarketIds.Arc]: {
    addressesProvider: "0x6FdfafB66d39cD72CFE7984D3Bbcc76632faAb00",
    pool: "0x37D7306019a38Af123e4b245Eb6C28AF552e0bB0",
    poolConfigurator: "0x4e1c7865e7be78a7748724fa0409e88dc14e67aa",
    permissionsManager: "0xF4a1F5fEA79C3609514A417425971FadC10eCfBE",
    priceOracle: "0xb8a7bc0d13b1f5460513040a97f404b4fea7d2f3",
    dataProvider: "0x71B53fC437cCD988b1b89B1D4605c3c3d0C810ea",
  },
};

export const ARC_WHITELISTER = "0x686a12a79008246f4df2f1ea30d136bd6de748b4";

export const getMarketConfig = (marketId: MarketIds): MarketAddresses => {
  switch (marketId) {
    case MarketIds.Main:
      return Markets[MarketIds.Main];
    case MarketIds.Arc:
      return Markets[MarketIds.Arc];
    default:
      throw `Missing market name ${marketId}. You must use one of the available markets: ${Object.values(
        MarketIds
      )}`;
  }
};

export const getMarketInstances = async (addresses: MarketAddresses) => {
  const addressesProvider = await getContract(
    "ILendingPoolAddressesProvider",
    addresses.addressesProvider
  );
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
    "IPriceOracle",
    addresses.priceOracle
  )) as IPriceOracle;
  const dataProvider = (await getContract(
    "AaveProtocolDataProvider",
    addresses.dataProvider
  )) as AaveProtocolDataProvider;
  return {
    addressesProvider,
    pool,
    poolConfigurator,
    permissionsManager,
    priceOracle,
    dataProvider,
  };
};

export const getMarketContracts = async (marketId: MarketIds) =>
  getMarketInstances(getMarketConfig(marketId));
