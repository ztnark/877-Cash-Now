// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/*
Whenever somebody deploys a loan repayment,
They will be listed in this registry so we can see 
in our marketplace that this person has set up repayment to a given pool.

Eg.,:

See all the repayments for a given borrower
See if a given sublime lending pool is the recipient of automatic repayment
See if any of an addresse's incoming streams are set up for automatic repayment

For simplicity we'll set up a mapping for both borrower and lender.
In a production env we'd probably want to invert control
and have the registrar deploy proxies. Otherwise there isn't really a way
to enforce access control on who can "register" in this control AFAIK.
*/

contract LoanRepaymentRegistry {
    // We map a borrower to all the repaymen
    mapping(address => address[]) public borrowerContracts;
    mapping(address => address[]) public lenderContracts;

    constructor() {}

    function register (address _borrower, address _lender) public {
        borrowerContracts[_borrower].push(msg.sender);
        lenderContracts[_lender].push(msg.sender);
    }
}