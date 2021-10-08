module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  // 0x3C892a34214804780469dE70E630e7f28f05655E on goerli
  await deploy("LoanRepaymentRegistry", {
    from: deployer,
    // args: [],
    log: true,
  });

};
module.exports.tags = ["LoanRepaymentRegistry"];