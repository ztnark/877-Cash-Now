// const SublimeSdk = require();

import {SublimeSdk} from './sublime-sdk/dist/index.js';
import ethers from 'ethers';
import sha256 from 'sha256';
const utils = ethers.utils

const provider = ethers.providers.getDefaultProvider('https://kovan.infura.io/v3/3b64549aefab4be78ce30e30cb9fad7c');
const privateKey = 'e824c75a12dbb36ae1c398636030d034d68e10a26034bd3c3534c03254cc6d87';
const signer = new ethers.Wallet(privateKey, provider);

const graphQlUrl = 'https://api.thegraph.com/subgraphs/name/sublime-finance/sublime';

const instance = new SublimeSdk(provider, signer, graphQlUrl, {
  poolFactoryContractAddress: '0x49a82c3349A2830bb436F9f85265834877bCA4eb',
  creditLineContractAddress: '0xB642a5877Eb6511D75BdD0Bb9e4d31E251f99729',
  poolLogicContractAddress: '0x000000000000000000000000000000000000beef',
  savingsAccountContractAddress: '0xD1Ce6B73914dd8608Bca7e98Ad9DF8Fc92Ceb5b7',
  strategyRegistryContractAddress: '0xa885D3C3F26b445E452BbA3317384c5FeeE86BF1',
  verificationContractAddress: '0xBF09ecC3F7C439801779C9f2dcC684503e27F9c7',
  aaveStrategyContractAddress: '0x81cb9e3bf74a66d167ae5aeb5332011f157ac45f',
  compoundStrategyContractAddress: '0xc6cfc33063d34a3411ff74981c8494d12bf4fa1a',
  yearnStrategyContractAddress: '0xd51224b55de96cd6a8ccccea19eebececc861bb4',
  noStrategyAddress: '0x0000000000000000000000000000000000000000',
  repaymentContractAddress: '0x0000000000000000000000000000000000000000',
  extensionContractAddress: '0x0000000000000000000000000000000000000000',
});

const subgraph = instance.Subgraph();
const connector = instance.Connector();


// subgraph.getPools().then(console.log);
const salt = sha256(Buffer.from(new Date().valueOf().toString()), { asBytes: true })
// console.log(salt)

const generatePool = async () => {
  const address = await connector.PoolApi().generatePoolAddress({
    poolSize: "10", // 10 ETH
    minborrowAmount: "1", // 1 ETH
    borrower: "0xDdD7B873a60e6b1F908115C020DB7908F5E08f1C", //here same as signer
    borrowToken: "0xfab46e002bbf0b4509813474841e0716e6730136", // ETH
    collateralToken: "0xfab46e002bbf0b4509813474841e0716e6730136", // Some Kovan Token
    collateralRatio: "10", // 213.33%
    borrowRate: "20", //3.45%
    repaymentInterval: "33", // not clear if days,months,timestamp
    noOfRepaymentIntervals: "44412", //
    strategy: "0x0000000000000000000000000000000000000000",
    collateralAmount: "1",
    transferFromSavingsAccount: false,
    salt: salt
  });
  console.log(address)

  const tx = connector
    .TokenApi('0xfab46e002bbf0b4509813474841e0716e6730136')
    .IncreaseAllowance(address, '1.0');

  tx.wait(1).then((receipt) => {
    connector
      .PoolApi()
      .createPool({
        poolSize: "10", // 10 ETH
        minborrowAmount: "1", // 1 ETH
        borrower: "0xDdD7B873a60e6b1F908115C020DB7908F5E08f1C", //here same as signer
        borrowToken: "0xfab46e002bbf0b4509813474841e0716e6730136", // ETH
        collateralToken: "0xfab46e002bbf0b4509813474841e0716e6730136", // Some Kovan Token
        collateralRatio: "10", // 213.33%
        borrowRate: "20", //3.45%
        repaymentInterval: "33", // not clear if days,months,timestamp
        noOfRepaymentIntervals: "44412", //
        strategy: "0x0000000000000000000000000000000000000000",
        collateralAmount: "1",
        transferFromSavingsAccount: false,
        salt: salt
      }).then(console.log);
  });
}

generatePool();