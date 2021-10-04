/*
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
*/

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import {RepaymentStream, ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./RepaymentStream.sol";


contract LoanRepaymentManager is Ownable, RepaymentStream {

    // // arrays tracking all of the borrower/lender pairs ?
    // // and the terms of their loans
    // address payable[] public lender;
    // address payable[] public borrower;
    // address[] incomeSource;

    // uint[] public loanRepaymentPercent;
    // uint[] public maxRemittance;
    // uint[] public totalRemitted = 0;

    
    constructor (
        address payable borrower,
        address payable lender, 
        int96 loanRepaymentPercent, 
        uint loanRepaymentAmount,
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken  // xEth, xDai, etc
    ) RepaymentStream(
        borrower,
        lender, 
        loanRepaymentPercent,
        loanRepaymentAmount,
        host,
        cfa,
        acceptedToken
    ) {
        // TODO register this loan in LoanRepaymentRegistry

        // in the life of this contract, the borrow and lender are fixed.
        // new loan = new contract.
        // once repaid, the contract simply redirects any remaining income 
        // flow in full to the borrower (the contract owner).
    }

}

