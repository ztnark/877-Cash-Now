// // SPDX-License-Identifier: MIT
// pragma solidity >=0.8.0 <0.9.0;

// // import "@openzeppelin/contracts/proxy/Initializable.sol";
// import {RepaymentStream, ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./RepaymentStream.sol";
// import {LoanRepaymentRegistry} from "./LoanRepaymentRegistry.sol";

// contract LoanRepaymentManager is RepaymentStream {
    
//     /*
//     E.g., args for repaying a 10 cent loan, 35% repayment, ropsten, James' test accounts
//     0x5cF1836B7434775e1871970a7C242f22fA725F9F,0xffCD6F30Dd8C67C4696Ede6E1021a493cEc50f94,35,100000000000000000,0xF2B4E81ba39F5215Db2e05B2F66f482BB8e87FD2,0xaD2F1f7cd663f6a15742675f975CcBD42bb23a88,0xBF6201a6c48B56d8577eDD079b84716BB4918E8A
//     */
    
//     // setting up a repayment stream is like asking your employer
//     // to change your bank account. It can be very uninstrusive and allows 
//     // you to set one up quickly after creating a sublime pool. 

//     constructor (
//         address payable borrower,
//         address payable lender, 
//         int8 loanRepaymentPercent, 
//         uint loanRepaymentAmount,
//         ISuperfluid host,
//         IConstantFlowAgreementV1 cfa,
//         ISuperToken acceptedToken  // xEth, xDai, etc
//         // LoanRepaymentRegistry registry 
//     ) RepaymentStream(
//         borrower,
//         lender, 
//         loanRepaymentPercent,
//         loanRepaymentAmount,
//         host,
//         cfa,
//         acceptedToken
//     ) {
//         // registry.register(borrower, lender);

//         // in the life of this contract, the borrow and lender are fixed.
//         // new loan = new contract.
//         // once repaid, the contract simply redirects any remaining income 
//         // flow in full to the borrower (the contract owner).
//     }

// }

