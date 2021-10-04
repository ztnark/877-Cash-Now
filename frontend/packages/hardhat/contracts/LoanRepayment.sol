pragma solidity >=0.8.0 <0.9.0;
// safemath?


import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/utils/math/Math.sol";


contract LoanRepayment is Ownable{

    uint public loanRepaymentPercent;
    uint public maxRemittance;
    uint public totalRemitted = 0;

    address payable public lender;
    address incomeSource;


    constructor(
        uint _loanRepaymentPercent, 
        uint _maxRemittance,
        address payable _lender, 
        address _incomeSource
    ) {
        require(_loanRepaymentPercent >= 1 && _loanRepaymentPercent <= 100);

        loanRepaymentPercent = _loanRepaymentPercent;
        maxRemittance = _maxRemittance;
        lender = _lender;
        incomeSource = _incomeSource;
    }


    receive () external payable {

        // REENTRANCY ATTACK
        // cannot initiate  a transfer until we have updated the balance
        // put this in the blog...

        if (msg.sender == incomeSource) {

            uint remittance = Math.min(
                msg.value * loanRepaymentPercent / 100,
                maxRemittance - totalRemitted
            );
            if (remittance > 0) {
                // https://ethereum.stackexchange.com/questions/78124/is-transfer-still-safe-after-the-istanbul-update
                // is it bad practice to use transfer
                lender.transfer(remittance);
            }

            // Here is the attack
            // if income source is malicious (possible in control of lender)
            // they could pay repeatedly and remit 
            totalRemitted += remittance;
        }
    }

    // owner can claim funds at any time as long as
    // proportionate repayment has been made.
    // have an option to repay upon receipt, and if there is not
    // sufficient gas or repayment fails, that repayment amount gets
    // earmarked for manual repayment later
    // if the given amount has not
    function claimFunds(address dest) public onlyOwner {

    } 

}
