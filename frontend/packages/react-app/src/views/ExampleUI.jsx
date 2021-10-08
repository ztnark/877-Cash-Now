import { utils } from "ethers";
import { Button, Divider, Input, InputNumber } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance, AddressInput } from "../components";

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

  const [userDetails, setUserDetails] = useState();
  // fetch details about connected address's superfluid flows
  useEffect(async () => {
    if (superfluid && address) {
      const user = superfluid.user({
        address: address,
        token: GOERLI_FDAIX,
      });
      const details = await user.details();
      setUserDetails(details);
  }
  }, [superfluid, address]);

  const allRegisteredContracts = useContractReader(readContracts, "LoanRepaymentRegistry", "getAllContracts") || []
  
  const [lenderAddress, setLenderAddres] = useState();
  const [repaymentPercent, setRepaymentPercent] = useState(30);
  const [repaymentAmount, setRepaymentAmount] = useState(5000);
  // for now we assume fdai

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: "80%", margin: "auto", marginTop: 64 }}>
        <h2>Example UI:</h2>
        <Divider />
        { userDetails?.cfa ? 
        <div style={{ margin: 8 }}>
          Superfluid version:{superfluid?.version}
          <div>
          fDaiX Flows:
          {
            userDetails.cfa.flows?.inFlows?.map((flow, i) => {
              return (
                <ul key={i}>
                  <li>{i} Flow Rate: {flow.flowRate}, Sender: {flow.sender}, Receiver: {flow.receiver}</li>
                </ul>
              )
            }
            )
          }
          </div>
        </div>
        : 
        <div>
          Loading...
        </div>
        }
        <Divider />
        <h3>Registered Flows</h3>
        {
          allRegisteredContracts?.map((cont) => {
            return (
              <div> SF Addr: {cont} </div>
            )
          })
        }
        <Divider />
        <h3>Set up a repayment contract</h3>
        Repayment Percent:<div>
          <InputNumber
            min={1}
            max={100}
            onChange={v => {
              setRepaymentPercent(v);
            }}
            value={repaymentPercent}
          />
        </div>
        Repayment Amount:<div>
          <InputNumber
            onChange={v => {
              setRepaymentAmount(v);
            }}
            value={repaymentAmount}
          />
        Lender Address:
        <AddressInput
            // autoFocus
            // ensProvider={props.ensProvider}
            placeholder="lender"
            address={lenderAddress}
            onChange={setLenderAddres}
          />
        </div>
        <Button
          disabled={!connected}
          onClick={() => {
            tx(
              writeContracts.LoanRepaymentRegistry.createRepaymentStream(
                address,
                lenderAddress,
                Number(repaymentPercent),
                utils.parseEther(repaymentAmount.toFixed(2))
              ),
            );
        }}>
          Create
        </Button>
        <Divider />
        Your Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        {/* use utils.formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
        <div>OR</div>
        <Balance address={address} provider={readProvider} price={price} />
        <Divider />
        Your Contract Address:
        <Address address={readContracts?.YourContract?.address} ensProvider={mainnetProvider} fontSize={16} />
      </div>
    </div>
  );
}
