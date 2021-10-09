import React, { useState, useEffect } from "react";

import { useCustomContractLoader, useContractReader, useFetch } from "../hooks";

import { AddressInput, Address  } from "../components";

import { formatEther, parseEther } from "@ethersproject/units";

import { AddressZero } from "@ethersproject/constants";


import { Button, Divider, Col, Input, InputNumber, Image, Row } from "antd";


function FlowDisplay({rate}) {
  return (
    <span>
    <img 
      loading="lazy" 
      src="https://assets.superfluid.finance/tokens/dai/icon.svg?max-age=3600" 
      alt="dai-img" 
      style={{width: '24px', height: '24px', opacity: 1}}>
    </img>
    {rate? `$${Number(formatEther(rate.mul(86400))).toFixed(2)} /day` : ''}  
    </span>  
  )
}


export default function LoanRepaymentDetail({ 
  tx, readProvider, writeProvider, mainnetProvider, contractAddress, 
  readContracts, writeContracts 
}) {

  const contract = useCustomContractLoader(writeProvider || readProvider, "RepaymentStream", contractAddress);
  
  const lenderAddress = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "_lender");
  const borrowerAddress = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "_borrower");
  const repaymentPercent = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "_repaymentPercent");
  const repaymentAmount = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "_repaymentAmount");


  const isRepaid = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "_repaid");



  const flowRates = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "getFlowRates");

  const amountRepaid = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "amountRepaid");

  const connected = !!writeProvider;

  const [borrowerOutFlowRate, setBorrowerOutFlowRate] = useState();
  const [lenderOutFlowRate, setLenderOutFlowRate] = useState();
  const [inFlowRate, setInFlowRate] = useState();


  useEffect(() => {
    if (flowRates) {
      setBorrowerOutFlowRate(flowRates.borrowerOutFlowRate);
      setLenderOutFlowRate(flowRates.lenderOutFlowRate);
      setInFlowRate(flowRates.inFlowRate);
    }
  }, [contract, flowRates]);

  
  const [lenderAddressArg, setLenderAddres] = useState();
  const [repaymentPercentArg, setRepaymentPercent] = useState(30);
  const [repaymentAmountArg, setRepaymentAmount] = useState(5000);

  const canEndRepayment = (repaidAmount, totalAmount) => {
    return (!isRepaid) && totalAmount && repaidAmount && repaidAmount.gte(totalAmount);
  }

  return (

    <div>
      <div>
        <Address address={contractAddress} ensProvider={mainnetProvider} fontSize={16} />
      </div>
      <FlowDisplay rate={inFlowRate} />


      <div>Automatic Repayment</div>
      {
        lenderAddress && lenderAddress !== AddressZero ?
        <div>
          <ul>
            {
              isRepaid ?
              <div>
                {repaymentAmount? `$${Number(formatEther(repaymentAmount)).toFixed(2)}` : "--"} 
                 has been repaid in full to <Address address={lenderAddress} ensProvider={mainnetProvider} fontSize={16} />
              </div>
              :
              <div>
                <li>Repaying: <Address address={lenderAddress} ensProvider={mainnetProvider} fontSize={16} /></li>
                <li>Current Rate: <FlowDisplay rate={lenderOutFlowRate} /> ({repaymentPercent}% of income)</li>
                <li>
                  Amount Repaid: 
                  {amountRepaid? `$${Number(formatEther(amountRepaid)).toFixed(2)}` : "--"} 
                  / 
                  {repaymentAmount? `$${Number(formatEther(repaymentAmount)).toFixed(2)}` : "--"}
                </li>
              </div>
            }
          </ul>
          {
            canEndRepayment(amountRepaid, repaymentAmount) ?
            <Button
              disabled={!connected}
              onClick={() => {
                tx(contract.ceaseRepayment());
              }}
            > End Repayment 
            </Button>
            : ''
          }
        </div>
        :
        <div>
        <div><span>Repayment Percent:
             <InputNumber
              min={1}
              max={100}
              onChange={v => {
                setRepaymentPercent(v);
              }}
              value={repaymentPercentArg}
            />
          </span></div>
          <div><span>Repayment Amount:
            <InputNumber
              onChange={v => {
                setRepaymentAmount(v);
              }}
              value={repaymentAmountArg}
            />
          </span></div>
          <div><span>
          Repay to:
          <AddressInput
              // autoFocus
              // ensProvider={props.ensProvider}
              placeholder="lender"
              address={lenderAddressArg}
              onChange={setLenderAddres}
            />
          </span></div>
          <Button
            disabled={!connected}
            onClick={() => {
              tx(
                contract.addLender(
                  lenderAddressArg,
                  Number(repaymentPercentArg),
                  parseEther(repaymentAmountArg.toFixed(2))
                ),
              );
          }}>
            Set Terms
          </Button>
        </div>
      }




    </div>
  );
}