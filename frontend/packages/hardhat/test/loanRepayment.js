const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Loan Repayment", function () {
  let loanRepaymentContract;

  describe("LoanRepaymentContract", function () {
    it("Should deploy LoanRepaymentContract", async function () {
      const [owner, lender, income] = await ethers.getSigners();
    
      const LoanRepayment = await ethers.getContractFactory("LoanRepayment");

      loanRepaymentContract = await LoanRepayment.deploy(
        100, 
        ethers.utils.parseEther("100.00"),
        lender.address, 
        income.address
      );

      expect(await loanRepaymentContract.owner()).to.equal(owner.address);
    });

    describe("receive()", function () {
      it("Should remit funds to lender", async function() {

        // By default first address is the deployer (the borrower)
        const [borrower, lender, incomeSource] = await ethers.getSigners();
        const LoanRepayment = await ethers.getContractFactory("LoanRepayment");
        
        // test with various percentages
        loanRepaymentContract = await LoanRepayment.deploy(
          50, 
          ethers.utils.parseEther("100.00"),
          lender.address, 
          incomeSource.address
        );

        const owner = await loanRepaymentContract.owner();


        // const before = await ethers.provider.getBalance(lender);

        let incomeBalance = await ethers.provider.getBalance(incomeSource.address);
        console.log('incomesource balance', ethers.utils.formatEther(incomeBalance));

        let contractBalance =  await ethers.provider.getBalance(loanRepaymentContract.address);
        console.log('smartcontract balance', ethers.utils.formatEther(contractBalance));

        let lenderBalance =  await ethers.provider.getBalance(lender.address);
        console.log('lender balance', ethers.utils.formatEther(lenderBalance));


        // await incomeSource.transfer(loanRepaymentContract.address, ethers.utils.parseUnits("1.0"));
        
        await incomeSource.sendTransaction({
          from: incomeSource.address,
          to: loanRepaymentContract.address,
          value: ethers.utils.parseEther("1.00")
        });

        incomeBalance = await ethers.provider.getBalance(incomeSource.address);
        console.log('incomesource balance after', ethers.utils.formatEther(incomeBalance));

        contractBalance =  await ethers.provider.getBalance(loanRepaymentContract.address);
        console.log('smartcontract balance after', ethers.utils.formatEther(contractBalance));

        lenderBalance =  await ethers.provider.getBalance(lender.address);
        console.log('lender balance after', ethers.utils.formatEther(lenderBalance));



        console.log('owner', owner);
        console.log('lender', lender.address);

      })
      it("Should not repay if payment comes from different source", async function() {

        const [borrower, lender, incomeSource, otherAddress] = await ethers.getSigners();
        const LoanRepayment = await ethers.getContractFactory("LoanRepayment");
        
        // test with various percentages
        loanRepaymentContract = await LoanRepayment.deploy(
          50,
          ethers.utils.parseEther("100.00"), 
          lender.address, 
          incomeSource.address
        );

        
        await otherAddress.sendTransaction({
          from: otherAddress.address,
          to: loanRepaymentContract.address,
          value: ethers.utils.parseEther("1.00")
        });

        expect(await ethers.provider.getBalance(loanRepaymentContract.address)).to.equal(ethers.utils.parseEther("1.00"))

      })
    })

    // describe("setPurpose()", function () {
    //   it("Should be able to set a new purpose", async function () {
    //     const newPurpose = "Test Purpose";

    //     await myContract.setPurpose(newPurpose);
    //     expect(await myContract.purpose()).to.equal(newPurpose);
    //   });
    // });
  });
});
