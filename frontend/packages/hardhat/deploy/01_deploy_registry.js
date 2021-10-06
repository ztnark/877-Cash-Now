module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  // 0xA4E868ECa68d159Be5e50A5718b1916e15D3FFc5 on goerli
  await deploy("LoanRepaymentRegistry", {
    from: deployer,
    // args: [],
    log: true,
  });

};
module.exports.tags = ["LoanRepaymentRegistry"];