import React, { useState, useEffect } from "react";

import { useCustomContractLoader, useContractReader, useFetch } from "../hooks";

import { formatEther } from "@ethersproject/units";

import { Button, Col, Input, InputNumber, Image, Row } from "antd";

export default function LoanRepaymentDetail({ tx, readProvider, writeProvider, contractAddress, readContracts, writeContracts }) {

  let inFlowRate, lenderOutFlowRate, borrowerOutFlowRate;
  const contract = useCustomContractLoader(writeProvider || readProvider, "RepaymentStream", contractAddress);
  
  const lenderAddress = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "_lender");
  const borrowerAddress = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "_borrower");
  const repaymentPercent = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "_repaymentPercent");
  const repaymentAmount = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "_repaymentAmount");

  
  const flowRates = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "getFlowRates");

  const amountRepaid = useContractReader({ RepaymentStream: contract }, "RepaymentStream", "amountRepaid");

  const connected = !!writeProvider;

  useEffect(() => {
    console.log('contract', contract);
    if (flowRates) {
      ({ inFlowRate, lenderOutFlowRate, borrowerOutFlowRate } = flowRates);
      console.log('flow rates', inFlowRate, lenderOutFlowRate, borrowerOutFlowRate);
    }
  }, [contract, flowRates]);

  

  return (
    <div>
      <div>Address: {contractAddress}</div>
      <div>Lender: {lenderAddress}</div>
      <div>Borrower: {borrowerAddress}</div>
      <div>Repayment Percent: {repaymentPercent}</div>
      <div>Amount Repaid: {amountRepaid? formatEther(amountRepaid) : "--"} / {repaymentAmount? formatEther(repaymentAmount) : "--"} </div>
      <Button
        disabled={!connected}
        onClick={() => {
          tx(contract.ceaseRepayment({ value: val }));
        }}
      > End Repayment 
      </Button>
    </div>
  );
}