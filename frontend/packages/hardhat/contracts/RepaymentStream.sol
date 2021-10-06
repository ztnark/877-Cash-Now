// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {
    ISuperfluid,
    ISuperToken,
    ISuperApp,
    ISuperAgreement,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {
    SuperAppBase
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import "@openzeppelin/contracts/utils/math/Math.sol";


contract RepaymentStream is SuperAppBase {

    address public _lender;
    address public _borrower;

    int8 public _repaymentPercent;
    uint public _repaymentAmount;
    // uint private _totalRepaid;

    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token

    constructor(
        address borrower,
        address lender,
        int8 repaymentPercent,
        uint repaymentAmount,
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken
    ) {
        require(repaymentPercent >= 1 && repaymentPercent <= 100);
        require(address(borrower) != address(lender));

        assert(address(host) != address(0));
        assert(address(cfa) != address(0));
        assert(address(acceptedToken) != address(0));
        assert(address(lender) != address(0));
        assert(address(borrower) != address(0));

        //assert(!_host.isApp(ISuperApp(lender)));

        _borrower = borrower;
        _lender = lender;
        _repaymentPercent = repaymentPercent;
        _repaymentAmount = repaymentAmount;

        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;

        // Super App constants. These are events upon which the host calls our contract
        uint256 configWord =
            SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        _host.registerApp(configWord);
    }


    /**************************************************************************
     * Redirect Logic
     *************************************************************************/

    function currentLender()
        external view
        returns (
            uint256 startTime,
            address lender,
            int96 flowRate
        )
    {
        if (_lender != address(0)) {
            (startTime, flowRate,,) = _cfa.getFlow(_acceptedToken, address(this), _lender);
            lender = _lender;
        }
    }

    function getFlowRates() public view returns (
        int96 inFlowRate, int96 lenderOutFlowRate, int96 borrowerOutFlowRate  
    ) {
         int96 _netFlowRate = _cfa.getNetFlow(_acceptedToken, address(this));

        (,int96 _lenderOutFlowRate,,) = _cfa.getFlow(_acceptedToken, address(this), _lender);
        (,int96 _borrowerOutFlowRate,,) = _cfa.getFlow(_acceptedToken, address(this), _borrower);

        int96 _inFlowRate =  _netFlowRate + _lenderOutFlowRate + _borrowerOutFlowRate;
        if (_inFlowRate < 0 ) _inFlowRate = -_inFlowRate; 

        return (_inFlowRate, _lenderOutFlowRate, _borrowerOutFlowRate);      
    }

    function getNewRates(int96 totalRate) public view returns (
        int96 newLenderRate, int96 newBorrowerRate
    ) {
            int96 newLenderFlowRate = (totalRate * _repaymentPercent) / 100 ;
            int96 newBorrowerFlowRate = totalRate - newLenderFlowRate;
            if (newBorrowerFlowRate < 0) newBorrowerFlowRate = 0; 
            // uint96 newBorrowerFlowRate =  Math.max(uint256(uint96(totalRate) - uint96(newLenderFlowRate)), uint256(0)); // potential rounding issue  
            return (newLenderFlowRate, newBorrowerFlowRate);
    }

    function amountRepaid() public view returns (
        uint balance
    ) {
        (uint256 timestamp, int96 flowRate,,) = _cfa.getFlow(
            _acceptedToken,
            address(this),
            _lender
        );
        return uint(uint96(flowRate) * (block.timestamp - timestamp));
    }

    function ceaseRepayment() external {
        // delete flow to lender, and set rate to borrower = 100%

        uint balance = amountRepaid();
        require(balance >= _repaymentAmount, "Full amount has not yet been repaid");

        (int96 inFlowRate,,) = getFlowRates();

        // Delete lender flow
        _host.callAgreement(
            _cfa,
            abi.encodeWithSelector(
                _cfa.deleteFlow.selector,
                _acceptedToken,
                address(this),
                _lender,
                new bytes(0)
            ),
            new bytes(0) 
        );
        // Update borrower flow to 100%
        _host.callAgreement(
            _cfa,
            abi.encodeWithSelector(
                _cfa.updateFlow.selector,
                _acceptedToken,
                _borrower,
                inFlowRate,
                new bytes(0)
            ),
            new bytes(0) 
        );
    }


    // @dev If a new stream is opened, or an existing one is updated
    // remember - this contract is an intermediary, outflow should always
    // equal inflow
    function _updateOutflow(bytes calldata ctx)
        private
        returns (bytes memory newCtx)
    {
        newCtx = ctx;
        
        (int96 inFlowRate, int96 lenderOutFlowRate, int96 borrowerOutFlowRate) = getFlowRates();

        
        // STEP 1
        // Delete the current flows to the borrower and lender.
        if (borrowerOutFlowRate != int96(0)) {
            // Delete borrower flow
            (newCtx, ) = _host.callAgreementWithContext(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.deleteFlow.selector,
                    _acceptedToken,
                    address(this),
                    _borrower,
                    new bytes(0) // placeholder
                ),
                "0x",
                newCtx
            );
        }
        if (lenderOutFlowRate != int96(0)) {
            // Delete lender flow
            (newCtx, ) = _host.callAgreementWithContext(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.deleteFlow.selector,
                    _acceptedToken,
                    address(this),
                    _lender,
                    new bytes(0) // placeholder
                ),
                "0x",
                newCtx
            );        
        }

        // STEP 2
        // Calculate the new flow rates for borrower and lender.
        if (inFlowRate > 0) {
            (int96 newLenderFlowRate, int96 newBorrowerFlowRate) = getNewRates(inFlowRate);

            assert(newLenderFlowRate + newBorrowerFlowRate == inFlowRate);
            
            (newCtx, ) = _host.callAgreementWithContext(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.createFlow.selector,
                    _acceptedToken,
                    _lender,
                    newLenderFlowRate,
                    new bytes(0) // placeholder
                ),
                "0x",
                newCtx
            );
            
            if (newBorrowerFlowRate > int96(0)) {
                (newCtx, ) = _host.callAgreementWithContext(
                    _cfa,
                    abi.encodeWithSelector(
                        _cfa.createFlow.selector,
                        _acceptedToken,
                        _borrower,
                        newBorrowerFlowRate,
                        new bytes(0) // placeholder
                    ),
                    "0x",
                    newCtx
                );   
            }
        }

    }


    /**************************************************************************
     * SuperApp callbacks

     These are called when a new flow is created, updated, deleted.
     (Remember: our app is a *Constant Flow Agreement*)
     *************************************************************************/

    function afterAgreementCreated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, // _agreementId,
        bytes calldata /*_agreementData*/,
        bytes calldata ,// _cbdata,
        bytes calldata _ctx
    )
        external override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        return _updateOutflow(_ctx);
    }

    function afterAgreementUpdated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32 ,//_agreementId,
        bytes calldata /*_agreementData*/,
        bytes calldata ,//_cbdata,
        bytes calldata _ctx
    )
        external override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        return _updateOutflow(_ctx);
    }

    function afterAgreementTerminated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32 ,//_agreementId,
        bytes calldata /*_agreementData*/,
        bytes calldata ,//_cbdata,
        bytes calldata _ctx
    )
        external override
        onlyHost
        returns (bytes memory newCtx)
    {
        // According to the app basic law, we should never revert in a termination callback
        if (!_isSameToken(_superToken) || !_isCFAv1(_agreementClass)) return _ctx;
        return _updateOutflow(_ctx);
    }

    function _isSameToken(ISuperToken superToken) private view returns (bool) {
        return address(superToken) == address(_acceptedToken);
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return ISuperAgreement(agreementClass).agreementType()
            == keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");
    }

    modifier onlyHost() {
        require(msg.sender == address(_host), "RedirectAll: support only one host");
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isSameToken(superToken), "RedirectAll: not accepted token");
        require(_isCFAv1(agreementClass), "RedirectAll: only CFAv1 supported");
        _;
    }

}
