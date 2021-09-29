# Scaffold-ETH Barebones
A fork of [scaffold-eth](https://github.com/austintgriffith/scaffold-eth) that is meant to be a more a la carte
bootstrapping template, for use once you have some familiarity with web3 and understand your requirements. Removes
the more exploratory and learning-centric elements of scaffold-eth and uses three providers: a static read-only provider for users without a connected wallet, a mainnet provider for fetching exchange prices, ENS, etc, and an injected web3 provider.

# 🏄‍♂️ Quick Start

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> install and start your 👷‍ Hardhat chain:

```bash
cd scaffold-eth
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd scaffold-eth
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd scaffold-eth
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

## Testing
```yarn test```

🔬 Write tests in `packages/hardhat/test`

## Linting & Prettier
```cd packages/react-app && yarn run lint --fix``

## Shipping
- Deploy contracts to another network by editing `packages/hardhat/hardhat.config.js` and then running `yarn run deploy`
- Create a deployer account with `yarn run generate`
- Build app with `yarn run build`
- Ship it with `yarn run surge`

See main fork for shipping with s3 or IPFS.

# Subgraph
[The Graph](https://thegraph.com/docs/about/introduction) is an event indexing layer.
[Watch a video](https://youtu.be/T5ylzOTkn-Q) about its usage with scaffold-eth.

## Steps
- Clean up previous data: `yarn clean-graph-node`
- Spin up a local graph node: `yarn run-graph-node` (requires Docker)
- Create your local subgraph: `yarn graph-create-local` (only need to do this once)
- Deploy your local subgraph: `yarn graph-ship-local`
- Or deploy alongside contracts with `yarn deploy-and-graph`
- Edit your local subgraph in `packages/subgraph/src`

Config file: `packages/subgraph/src/subgraph.template.yaml` 
`packages/subgraph/config` and `packages/subgraph/abis` are dynamically generated when you publish your contracts.


# 📚 Further Reading

See the OG [scaffold-eth](https://github.com/austintgriffith/scaffold-eth) for more docs and examples
