// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/proxy/Clones.sol";

import {RepaymentStream, ISuperToken, IConstantFlowAgreementV1, ISuperfluid } from "./RepaymentStream.sol";

contract LoanRepaymentRegistry {
    mapping(address => address[]) public borrowerContracts;
    // mapping(address => address[]) public lenderContracts;
    
    address[] public allContracts;

    address immutable implementation;

    // Goerli
    // ISuperfluid private _host = "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9"; // host
    // IConstantFlowAgreementV1 private _cfa = "0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8"; // the stored constant flow agreement class address
    // ISuperToken private _acceptedToken = "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00"; // accepted token


    constructor() public {
        implementation = address(
            new RepaymentStream()
        );
    }

    function register (address _stream, address _borrower/*, address _lender*/) internal {
        borrowerContracts[_borrower].push(_stream);
        // lenderContracts[_lender].push(_stream);
        allContracts.push(_stream);
    }

    function createRepaymentStream(
        address payable borrower
        // address payable lender, 
        // int8 loanRepaymentPercent, 
        // uint loanRepaymentAmount        
    ) external returns (address) {
        address clone = Clones.clone(implementation);
        RepaymentStream(clone).initialize(
            borrower, 
            // lender, 
            // loanRepaymentPercent, 
            // loanRepaymentAmount, 
            ISuperfluid(0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9), 
            IConstantFlowAgreementV1(0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8), 
            ISuperToken(0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00)
            // "0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9", // host
            // "0xEd6BcbF6907D4feEEe8a8875543249bEa9D308E8", // CFAv1
            // "0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00" // goerli fdaiX
        );

        register(clone, borrower);
    }

    
    function getContractsForBorrower(address borrower) external view returns( address [] memory){
        return borrowerContracts[borrower];
    }

    // function getContractsForLender(address lender) external view returns( address [] memory){
    //     return lenderContracts[lender];
    // }

    function getAllContracts() external view returns( address [] memory){
        return allContracts;
    }
}
