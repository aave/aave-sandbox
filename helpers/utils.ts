import { IERC20 } from "./../typechain-types/IERC20";
import { BigNumber, Contract, ContractTransaction, Signer } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { IERC20Detailed } from "../typechain-types/IERC20Detailed";
import { IERC20DetailedBytes } from "../typechain-types/IERC20DetailedBytes";
import {
  formatEther,
  formatUnits,
  parseBytes32String,
  parseUnits,
} from "ethers/lib/utils";
import Bluebird from "bluebird";

declare var hre: HardhatRuntimeEnvironment;

export const getContract = async <ContractType extends Contract>(
  id: string,
  address: string
): Promise<ContractType> => {
  const artifact = await hre.deployments.getArtifact(id);
  return hre.ethers.getContractAt(
    artifact.abi,
    address
  ) as Promise<ContractType>;
};

const abiEncode = (types: string[], values: (string | number)[]) =>
  hre.ethers.utils.defaultAbiCoder.encode(types, values);

export const slotCache: { [key: string]: number } = {
  "0xdAC17F958D2ee523a2206206994597C13D831ec7 ": 2,
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599 ": 0,
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 ": 3,
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984 ": 4,
  "0x0D8775F648430679A709E98d2b0Cb6250d2887EF ": 1,
  "0x4Fabb145d64652a948d72533023f6E7A623C7C53 ": 1,
  "0x6B175474E89094C44Da98b954EedeAC495271d0F ": 2,
  "0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c ": 7,
  "0xdd974D5C2e2928deA5F71b9825b8b646686BD200 ": 1,
  "0x514910771AF9Ca656af840dff83E8264EcF986CA ": 1,
  "0x0F5D2fB29fb7d3CFeE444a200298f468908cC942 ": 1,
  "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2 ": 1,
  "0x408e41876cCCDC0F92210600ef50372656052a38 ": 1,
  "0x0000000000085d4780B73119b644AE5ecd22b376 ": 14,
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 ": 9,
  "0xba100000625a3754423978a60c9317c58a424e3D ": 1,
  "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919 ": 6,
  "0x8E870D67F660D95d5be530380D0eC0bd388289E1 ": 1,
};
// Code Snippet from Euler.finance
// Read more at: https://blog.euler.finance/brute-force-storage-layout-discovery-in-erc20-contracts-with-hardhat-7ff9342143ed
async function findBalancesSlot(tokenAddress: string) {
  if (slotCache[tokenAddress]) {
    return slotCache[tokenAddress];
  }
  const { ethers, network } = hre;

  const account = ethers.constants.AddressZero;
  const probeA = abiEncode(["uint"], [1]);
  const probeB = abiEncode(["uint"], [2]);
  const token = await ethers.getContractAt("IERC20", tokenAddress);
  for (let i = 0; i < 100; i++) {
    let probedSlot = ethers.utils.keccak256(
      abiEncode(["address", "uint"], [account, i])
    );
    // remove padding for JSON RPC
    while (probedSlot.startsWith("0x0"))
      probedSlot = "0x" + probedSlot.slice(3);
    const prev = await network.provider.send("eth_getStorageAt", [
      tokenAddress,
      probedSlot,
      "latest",
    ]);
    // make sure the probe will change the slot value
    const probe = prev === probeA ? probeB : probeA;

    await hre.network.provider.send("hardhat_setStorageAt", [
      tokenAddress,
      probedSlot,
      probe,
    ]);

    const balance = await token.balanceOf(account);
    // reset to previous value
    await network.provider.send("hardhat_setStorageAt", [
      tokenAddress,
      probedSlot,
      prev,
    ]);
    if (balance.eq(ethers.BigNumber.from(probe))) {
      slotCache[tokenAddress] = i;
      return i;
    }
  }
  throw `Balances slot not found for ${tokenAddress}`;
}

export const changeBalanceStorage = async (
  token: string,
  user: string,
  amount: string
) => {
  const decimals = await (
    (await getContract("IERC20Detailed", token)) as IERC20Detailed
  ).decimals();
  const rawAmount = parseUnits(amount, decimals);
  const slotValue = abiEncode(["uint"], [rawAmount.toString()]);

  const balanceSlot = await findBalancesSlot(token);
  let accountSlotLocation = hre.ethers.utils.keccak256(
    abiEncode(["address", "uint"], [user, balanceSlot])
  );

  // remove padding for JSON RPC
  while (accountSlotLocation.startsWith("0x0"))
    accountSlotLocation = "0x" + accountSlotLocation.slice(3);

  await hre.network.provider.send("hardhat_setStorageAt", [
    token,
    accountSlotLocation,
    slotValue,
  ]);
};

export const feedBalances = async (accounts: string[], tokens: string[]) => {
  await Bluebird.each(accounts, async (accountAddress) => {
    // Set 100 ETH as balance
    await hre.network.provider.send("hardhat_setBalance", [
      accountAddress,
      "0x56BC75E2D63100000",
    ]);
    // Set 100.000 of each ERC20 token
    await Bluebird.each(tokens, async (token) => {
      try {
        await changeBalanceStorage(token, accountAddress, "100000");
      } catch (error) {
        console.error("[warning] balance storage layout not found for", token);
      }
    });
  });
};

export const getTokenSymbol = async (token: string) => {
  const erc20Instance = (await getContract(
    "IERC20Detailed",
    token
  )) as IERC20Detailed;

  let symbol = "";
  try {
    symbol = await erc20Instance.symbol();
  } catch {
    const erc20BytesInstance = (await getContract(
      "IERC20DetailedBytes",
      token
    )) as IERC20DetailedBytes;
    symbol = parseBytes32String(await erc20BytesInstance.symbol());
  }
  return symbol;
};

export const getUserBalances = async (
  accountAddress: string,
  tokens: string[]
) => {
  const erc20Balances = await Bluebird.map(tokens, async (token) => {
    const erc20Instance = (await getContract(
      "IERC20Detailed",
      token
    )) as IERC20Detailed;
    const decimals = await erc20Instance.decimals();
    const rawBalance = await erc20Instance.balanceOf(accountAddress);

    return {
      symbol: await getTokenSymbol(token),
      balance: formatUnits(rawBalance, decimals),
    };
  });
  const ethBalance = formatEther(
    await hre.ethers.provider.getBalance(accountAddress)
  );
  const balances = [
    ...erc20Balances,
    ...[{ symbol: "ETH", balance: ethBalance }],
  ];
  return balances;
};

export const getErc20 = async (token: string) => {
  const artifact = await hre.deployments.getArtifact("IERC20");
  return (await hre.ethers.getContractAt(artifact.abi, token)) as IERC20;
};

export const waitForTx = async (tx: ContractTransaction) => await tx.wait(1);

export const impersonateAddress = async (address: string): Promise<Signer> => {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });
  // Fix ethers provider missing external account getSigner https://github.com/nomiclabs/hardhat/issues/1226#issuecomment-924352129
  const provider = new hre.ethers.providers.JsonRpcProvider(
    "http://localhost:8545"
  );
  const signer = await provider.getSigner(address);

  return signer;
};
