# Aave Sandbox

Sandbox of Aave Markets that replicates a forked production environment. The environment is envisioned for testing liquidations or other integrations that requires a production state using Hardhat Node and Alchemy.

## Getting Started

Clone the repository:

```
git clone https://github.com/aave/aave-sandbox.git
```

Install dependencies:

```
npm i
```

## Aave Arc Sandbox

Run Hardhat node:

```
npm run node:fork:arc
```

Now you can connect to the Hardhat JSON RPC at `http://127.0.0.1:8545/` url.

Feed liquidity and possible liquidable positions:

```
npm run feed-market:arc
```

## Aave V2 Main market Sandbox

Run Hardhat node:

```
npm run node:fork:main
```

Now you can connect to the Hardhat JSON RPC at `http://127.0.0.1:8545/` url.

Feed liquidity and possible liquidable positions:

```
npm run feed-market:main
```
