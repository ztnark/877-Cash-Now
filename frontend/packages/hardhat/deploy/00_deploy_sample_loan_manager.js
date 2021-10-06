// deploy/00_deploy_your_contract.js

const { LogLevel } = require("@ethersproject/logger");

const { ethers } = require("hardhat");

/*
NOTE: This contract is finicky. The following deployment config for goerli will accept 
a $10/hr stream of DAI. More or less sometimes gets rejected. Not sure why.
*/

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  // DEPLOYED AT 0x76533ebB89CCa5e89DbA21Cfbf5dB09Fe8452B32 on Goerli
  await deploy("LoanRepaymentManager", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [
      "0x5cF1836B7434775e1871970a7C242f22fA725F9F", // borrower
      "0xffCD6F30Dd8C67C4696Ede6E1021a493cEc50f94", // lender
      35, // repaying 35% of all income
      ethers.utils.parseEther("0.10"), // total to repay is only 10 cents, so it's quick
      "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9", // host
      "0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8", // CFAv1
      "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00", // goerli fdaiX
      "0xA4E868ECa68d159Be5e50A5718b1916e15D3FFc5", // Registry deployed on Goerli
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
