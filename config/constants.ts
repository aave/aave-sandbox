import { BigNumber } from "ethers/lib/ethers";
import { parseUnits } from "ethers/lib/utils";

export const MAX_UINT_AMOUNT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const TASK_FOLDERS = ["sandbox"];

export const IGNORED_TOKENS_FOR_STORAGE_SEARCH = [
  "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
];

export const PERCENTAGE_FACTOR = "10000";
export const HALF_PERCENTAGE = BigNumber.from(PERCENTAGE_FACTOR)
  .div(2)
  .toString();
export const WAD = BigNumber.from(10).pow(18).toString();
export const HALF_WAD = BigNumber.from(WAD).div(2).toString();
export const RAY = BigNumber.from(10).pow(27).toString();
export const HALF_RAY = BigNumber.from(RAY).div(2).toString();
export const WAD_RAY_RATIO = parseUnits("1", 9).toString();
export const oneEther = parseUnits("1", 18);
export const oneRay = parseUnits("1", 27);
