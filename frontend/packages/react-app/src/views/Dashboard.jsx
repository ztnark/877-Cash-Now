import { utils } from "ethers";
import { Button, Divider, Input, InputNumber } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, AddressInput ,LoanRepaymentDetail } from "../components";

import { useContractReader, useContractLoader } from "../hooks";

const ROPSTEN_FDAI = '0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7';
const ROPSTEN_FDAIX = '0xBF6201a6c48B56d8577eDD079b84716BB4918E8A';

const GOERLI_FDAI = '0x88271d333C72e51516B67f5567c728E702b3eeE8';
const GOERLI_FDAIX = '0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00';


export default function ExampleUI({
  address,
  mainnetProvider,
  readProvider,
  writeProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  superfluid,
}) {

  const connected = !!writeProvider;

  const allRegisteredContracts = useContractReader(readContracts, "LoanRepaymentRegistry", "getAllContracts") || []
  
  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: "80%", margin: "auto", marginTop: 64}}>
        {
          allRegisteredContracts?.map((cont, i) => {
            return (
              <div>
              <Divider />
              <LoanRepaymentDetail 
                key={i} 
                contractAddress={cont} 
                tx={tx}
                readProvider={readProvider}
                writeProvider={writeProvider}
                readContracts={readContracts}
                mainnetProvider={mainnetProvider}
              />
              </div>
            )
          })
        }
        <Divider />

        <Button
          disabled={!connected}
          onClick={() => {
            tx(
              writeContracts.LoanRepaymentRegistry.createRepaymentStream(
                address
              ),
            );
        }}>
          Create a new repayment account
        </Button>
      </div>
    </div>
  );
}
