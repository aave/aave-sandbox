export enum MarketIds {
  Main = "main",
  Arc = "arc",
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
