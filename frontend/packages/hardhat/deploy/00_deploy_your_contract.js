// deploy/00_deploy_your_contract.js

const { LogLevel } = require("@ethersproject/logger");

//const { ethers } = require("hardhat");

/*
NOTE: This contract is finicky. The following deployment config for ropsten will accept 
a $10/hr stream of DAI. More or less sometimes gets rejected. Not sure why.
*/

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  // DEPLOYED AT 0x233433c0BA7C049e82DA36cD826A9372659f4485
  await deploy("LoanRepaymentManager", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [
      "0x5cF1836B7434775e1871970a7C242f22fA725F9F", // borrower
      "0xffCD6F30Dd8C67C4696Ede6E1021a493cEc50f94", // lender
      35, // repaying 35% of all income
      10**17, // total to repay is only 10 cents, so it's quick
      "0xF2B4E81ba39F5215Db2e05B2F66f482BB8e87FD2", // host
      "0xaD2F1f7cd663f6a15742675f975CcBD42bb23a88", // CFAv1
      "0xBF6201a6c48B56d8577eDD079b84716BB4918E8A", // ropsten fdaiX
    ],
    log: true,
  });

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
};
module.exports.tags = ["LoanRepaymentManager"];
