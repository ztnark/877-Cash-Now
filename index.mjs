// const SublimeSdk = require();

import {SublimeSdk} from './sublime-sdk/dist/index.js';
import ethers from 'ethers';
import sha256 from 'sha256';
const utils = ethers.utils

const provider = ethers.providers.getDefaultProvider('https://kovan.infura.io/v3/3b64549aefab4be78ce30e30cb9fad7c');
const privateKey = 'e824c75a12dbb36ae1c398636030d034d68e10a26034bd3c3534c03254cc6d87';
const signer = new ethers.Wallet(privateKey, provider);

const graphQlUrl = 'https://api.thegraph.com/subgraphs/name/sublime-finance/sublime';

// savingsAccount: '0x3398818F4C563E71F62E0F107a82d71c9C4930Ff',
// strategyRegistry: '0xDC4DAbcc00b6f3bdC64d7c76CE5c9327B3a7ed1D',
// creditLines: '0xA969469e309339c08937417563001C4c9da20df2',
// proxyAdmin: '0x03f484190bc6889B28739Af182D996df57B02CC9',
// admin: '0x4813CB98f2322CFb9fbf2f2dAFe01297FD70D19e',
// aaveYield: '0xd63E746B7613dDa68EE3a76748BEFbfaf24BbFa9',
// compoundYield: '0xa0786b2adC611e7c23396eEf9ae9e874B12A0c81',
// verification: '0x06880474a41C00A5b4680F43586155CBD8815200',
// priceOracle: '0x791986078f4B157E5A8995a88ED4c1625B252BB4',
// extension: '0x552332E79Dca3e396D8B83963629BA07ab161E4A',
// poolLogic: '0x133F9faBeBd6a720b7e96e522b44660E2Ea1399D',
// poolTokenLogic: '0x8b0b3ABda7ba8Cc257F27A63E266Ca3834618Ee4',
// repaymentLogic: '0xe178b21C1b7f62281A1aF5e6019698c8Ab93047a',
// poolFactory: '0x119cA47EB9116bF902eD945eCFB7c90306017C47'

const instance = new SublimeSdk(provider, signer, graphQlUrl, {
  poolFactoryContractAddress: '0x119cA47EB9116bF902eD945eCFB7c90306017C47',
  creditLineContractAddress: '0xA969469e309339c08937417563001C4c9da20df2',
  poolLogicContractAddress: '0x133F9faBeBd6a720b7e96e522b44660E2Ea1399D',
  savingsAccountContractAddress: '0x3398818F4C563E71F62E0F107a82d71c9C4930Ff',
  strategyRegistryContractAddress: '0xDC4DAbcc00b6f3bdC64d7c76CE5c9327B3a7ed1D',
  verificationContractAddress: '0x06880474a41C00A5b4680F43586155CBD8815200',
  aaveStrategyContractAddress: '0xd63E746B7613dDa68EE3a76748BEFbfaf24BbFa9',
  compoundStrategyContractAddress: '0xa0786b2adC611e7c23396eEf9ae9e874B12A0c81',
  yearnStrategyContractAddress: '0xd51224b55de96cd6a8ccccea19eebececc861bb4',
  noStrategyAddress: '0x0000000000000000000000000000000000000000',
  repaymentContractAddress: '0xe178b21C1b7f62281A1aF5e6019698c8Ab93047a',
  extensionContractAddress: '0x552332E79Dca3e396D8B83963629BA07ab161E4A',
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

  const tx = await connector
    .TokenApi('0xfab46e002bbf0b4509813474841e0716e6730136')
    .IncreaseAllowance(address, '1.0');

  console.log(tx)

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

const getPools = () => {
  subgraph.getPools().then(console.log);
}

const getActivePools = () => {
  subgraph.getAllPoolsByPoolType('Active').then(console.log);
}

// generatePool();
getPools();