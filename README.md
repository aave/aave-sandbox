# Aave Sandbox

Sandbox of Aave Markets that replicates a forked production environment. The environment is envisioned for testing liquidations or other integrations that requires a production state using Hardhat Node and Alchemy.

## Requisites

- Git
- Node.js version >= 16
  - You can install and manage any Node.js version easily with [nvm](https://github.com/nvm-sh/nvm)

## Getting Started

Clone the repository:

```
git clone https://github.com/aave/aave-sandbox.git
```

Install dependencies:

```
npm i
```

Compile Contract:

```
npm run compile
```

Create a `.env` file

```
touch .env
```

Obtain an [Alchemy](https://www.alchemy.com/) API key to be able to fork chains. The free tier of Alchemy allows archival node.

Once you have the Alchemy key, open `.env` with your favorite editor and fill the environment variable named `ALCHEMY_KEY`, as follows:

```
# Content of .env file
ALCHEMY_KEY=your-alchemy-key
```

## Fork Aave V3 markets

If you want to integrate any of the deployed Aave V3 markets, you can spin a sandbox node in the following way.

In a separate window, run the sandbox Hardhat fork node that will be reachable via JSON RPC at `http://127.0.0.1:8545/`. You can spin the sandbox node with the following command, replacing "polygon" with the desired chain:

```
npm run node:fork:polygon-v3
```

Now you can connect to the Hardhat Node via JSON RPC at `http://127.0.0.1:8545/` in your project and use official deployed addresses to interact with the market.

Once the node is running, the following tasks will point to the sandbox node.

If you need the official ERC20 tokens at the sandbox environment, you can get ERC20 tokens using the `feed-account` task. The task will override the balance of the address via `hardhat_setStorage`.

You can use the following command as a faucet to get all ERC20 tokens being used inside a market:

```
npm run feed-accounts:polygon-v3 --accounts 0x976EA74026E726554dB657fA54763abd0C3a0aa9,<other-user-address>
```

View users positions at the Main market and possible liquidable positions, but only limited to a subset of addresses passed by the argument `--accounts`:

```
npm run print-accounts:polygon-v3 -- --accounts 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f,0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
```

Output:

```
User Info:
- Address: 0x976EA74026E726554dB657fA54763abd0C3a0aa9
- Health Factor:  0.918421511765627487
- Balances
┌─────────┬───────────────────┬───────────────────┬──────────────────────────┬────────┐
│ (index) │ enabledCollateral │ collateralBalance │       debtBalance        │ symbol │
├─────────┼───────────────────┼───────────────────┼──────────────────────────┼────────┤
│    0    │       true        │     '50000.0'     │          '0.0'           │ 'USDC' │
│    1    │       false       │       '0.0'       │          '43.0'          │ 'WBTC' │
│    2    │       false       │       '0.0'       │ '543.999999948668340512' │ 'WETH' │
│    3    │       true        │     '50000.0'     │          '0.0'           │ 'AAVE' │
└─────────┴───────────────────┴───────────────────┴──────────────────────────┴────────┘
[...]
```

## Aave Arc Sandbox

In a separate window, run the sandbox Hardhat node that will be reachable via JSON RPC at `http://127.0.0.1:8545/`. You can spin the sandbox node with the following command:

```
npm run node:fork:arc
```

Once the node is running, the following tasks will point to the sandbox node. You can also point your project to target the sandbox node.

To add liquidity to the Aave Arc, proceed to feed liquidity and create possible liquidable positions:

```
npm run feed-market:arc
```

Once there is liquidity at the market, you can view the users balance and possible liquidable positions with the following command:

```
npm run print-accounts:arc
```

Output:

```
User Info:
- Address: 0x976EA74026E726554dB657fA54763abd0C3a0aa9
- Health Factor:  0.918421511765627487
- Balances
┌─────────┬───────────────────┬───────────────────┬──────────────────────────┬────────┐
│ (index) │ enabledCollateral │ collateralBalance │       debtBalance        │ symbol │
├─────────┼───────────────────┼───────────────────┼──────────────────────────┼────────┤
│    0    │       true        │     '50000.0'     │          '0.0'           │ 'USDC' │
│    1    │       false       │       '0.0'       │          '43.0'          │ 'WBTC' │
│    2    │       false       │       '0.0'       │ '543.999999948668340512' │ 'WETH' │
│    3    │       true        │     '50000.0'     │          '0.0'           │ 'AAVE' │
└─────────┴───────────────────┴───────────────────┴──────────────────────────┴────────┘
[...]
```

If you need the official ERC20 tokens at the sandbox environment, you can get ERC20 tokens using the `feed-account` task. The task will override the balance of the address via `hardhat_setStorage`, so do not change balances of smart contracts with internal accounting.

You can use the following command as a faucet to get all ERC20 tokens being used inside a market:

```
npm run feed-accounts:arc --accounts 0x976EA74026E726554dB657fA54763abd0C3a0aa9,<other-user-address>
```

For whitelisting your accounts or smart contracts like liquidation bots into Aave Arc Sandbox, you can use the following command:

```
whitelist-accounts:arc --accounts <your-account-address>,<your-smart-contract-address>
```

Now you can connect your project to the Hardhat Node via JSON RPC at `http://127.0.0.1:8545/` in your project and use official deployed addresses to interact with the market.

## Aave V2 Main

If you want to integrate the permissionless Aave market, you can also spin a sandbox in the following way.

In a separate window, run the sandbox Hardhat node that will be reachable via JSON RPC at `http://127.0.0.1:8545/`. You can spin the sandbox node with the following command:

```
npm run node:fork:main-v2
```

Now you can connect to the Hardhat Node via JSON RPC at `http://127.0.0.1:8545/` in your project and use official deployed addresses to interact with the market.

Once the node is running, the following tasks will point to the sandbox node.

To add liquidity to the Aave Main market, proceed to feed liquidity and create possible liquidable positions:

```
npm run feed-market:main-v2
```

View users positions at the Main market and possible liquidable positions, but only limited to a subset of addresses passed by the argument `--accounts`:

```
npm run print-accounts:main-v2 -- --accounts 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f,0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
```

Output:

```
User Info:
- Address: 0x976EA74026E726554dB657fA54763abd0C3a0aa9
- Health Factor:  0.918421511765627487
- Balances
┌─────────┬───────────────────┬───────────────────┬──────────────────────────┬────────┐
│ (index) │ enabledCollateral │ collateralBalance │       debtBalance        │ symbol │
├─────────┼───────────────────┼───────────────────┼──────────────────────────┼────────┤
│    0    │       true        │     '50000.0'     │          '0.0'           │ 'USDC' │
│    1    │       false       │       '0.0'       │          '43.0'          │ 'WBTC' │
│    2    │       false       │       '0.0'       │ '543.999999948668340512' │ 'WETH' │
│    3    │       true        │     '50000.0'     │          '0.0'           │ 'AAVE' │
└─────────┴───────────────────┴───────────────────┴──────────────────────────┴────────┘
[...]
```

## Utilities

### Enable mining by interval

By default Hardhat node mines blocks every time you perform a transaction, but for some scenarios you may need the node to mine blocks by interval.

You can enable Hardhat to mine blocks every 5 seconds with the following command:

```
npm run set-interval-mining
```

To disable mining empty blocks, you can run:

```
npm run set-interval-mining:off
```
