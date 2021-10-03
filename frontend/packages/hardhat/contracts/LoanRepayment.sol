pragma solidity >=0.8.0 <0.9.0;
// safemath?


import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/utils/math/Math.sol";
// Upon receipt of any ETH
// a portion will go to the specified repayment contract.


// FOLLOWUP WORK
// this needs to work as the receiver of a superfluid stream. i.e,
// when a deposit is made, the outgoing streamer pays the gas cost.
// OR, we just make it so the owner is the one who triggers the repayment.
// They both have pros and cons, we can cover both approaches in a blog

// but for superfluid we might be limited to the manual-trigger mechanism
// where any time the owner withdraws funds, a portion goes to repayment,
// up until x is repaid.

// owner should be allowed to transfer, not just withdraw. this should behave like
// any other wallet/address once the loan is repaid.

// for superfluid, we want a dashboard where we can see if the given address
// has any incoming streams, OR they have subscribed to a loan repayment.
// i.e, one managing contract for all repayments.


/*
ONE MANAGEMENT CONTRACT. tracks addresses, repayment amount, total repaid.


in our dashboard, we can show "x is registered for auto-repayment".

The meaning is that stream x is going to the management contract, and a lender can be configured.


When the borrower has no loans, their repayment contract is simply a wallet holding their funds.

When the borrower has a loan, they specify a lender address (a sublime pool), amount, and repayment percent. Then,
all income to the management account is split, with the portion going to the lender, until the amount has been paid off.

Quetion is, how do we trustlessly add a lender to the management contract? It has to happen at the same time the loan is issued.


Maybe it's connected to a Pool...? idk. as Jeff about this.
Can you specify the loan address ahead of time, i.e., the borrower creates a pool, and then the pool repayment address goes into the management
contract?


OR, the manager additionally received the initial lump loan, and THIS is what triggers the repayment.
so:



1) Borrower B registers their income source I with the Manager M (i.e., points the I stream at M).
2) B opens a sublime pool, listing M as the recipient.
2) B sets the repayment terms with M.
3) Lender L peruses the dashboard of pending pools and sees that B has income I, which will
   automatically repay per the repayment terms.
4) L deposits the money in M.
5) A portion of all payments from I will be remitted to L until the loan amount is repaid.*

so M becomes a globally recognized income sink which can be easily configured for loan repayment


* At mininum this could just be a fixed amount set on M. But we could also leverage sublime contracts to check what 
the remaining balance of the loan is. we can mock out a sublime pool contract with a "balance remaining" function.

when fully repaid, the manager de-registers the terms of B so B can use it again in the future.


WE NEED THIS TO WORK WITH SUPERTOKENS. no just eth.
ETHx, DAIx.
So you need to implement handling to receive
ERC-777 tokens.

For the blog, you will work with ETH.
In fact, the blog won't even touch on the manager, it will be
a simple version such as this, and we'll ask if people are interested
in seeing the full hack version with a manager-based approach.


It's not perfect, but getting it perfect would require coordination and native support form both sublime and superfluid.
This is meant to be a proof of concept and it satisfies that purpose


*/

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


// contract LoanRepaymentSublime is LoanRepayment {
//     /*
//     Having some special conditions on the lender
//     where we can get how much balance is due by interfacing
//     with the sublime contract's public ABI

       //  or, we can just specify a max remittance.

//     */
// }





    // the only thing this contract does for us is pay forward a portion
    // of eth to the recipient
    // need to handle gas fees, too... hmmm
    // so we need some way to create a "Holding tank"
    // for any extra funds which must be drained before you can claim the
    // remainder
    // we have to check if this will work, might have to supply gas.. hm

    // so it works but it's the income source which swallows the transaction cost.
    // as a followup we could examine having the contract refund the income source
    // which would require additional overhead.


     // dunno if this will work...
        // require(msg.value >= remmitance + tx.gasprice); 


        // FROM SA:
        /*
        Using send() or transfer() will prevent reentrancy but it does so
        at the cost of being incompatible with any contract 
        whose fallback function requires more than 2,300 gas. 
        It is also possible to use 
        someAddress.call.value(ethAmount).gas(gasAmount)() 
        to forward a custom amount of gas.

        // I think this is more about the recipient... 
        // so we are making an assumption about the loan contract,
        // not the this one?
        */

        // I think this will work.. as long as the value of 
        // this contract after remittance can cover the cost of the transfer
        // (and the recipient is doing nothing expensive)