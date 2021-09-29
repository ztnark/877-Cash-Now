import { utils } from "ethers";
import { Button, Divider } from "antd";
import React, { useState, useEffect } from "react";
import { Address, Balance } from "../components";

const ROPSTEN_FDAI = '0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7';
const ROPSTEN_FDAIX = '0xBF6201a6c48B56d8577eDD079b84716BB4918E8A';

export default function ExampleUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  superfluid,
}) {

  const [userDetails, setUserDetails] = useState();
  // fetch details about connected address's superfluid flows
  useEffect(async () => {
    if (superfluid && address) {
      const user = superfluid.user({
        address: address,
        token: ROPSTEN_FDAIX,
      });
      const details = await user.details();
      setUserDetails(details);
    }
  }, [superfluid, address]);

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
        Your Address:
        <Address address={address} ensProvider={mainnetProvider} fontSize={16} />
        <Divider />
        {/* use utils.formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
        <div>OR</div>
        <Balance address={address} provider={localProvider} price={price} />
        <Divider />
        Your Contract Address:
        <Address address={readContracts?.YourContract?.address} ensProvider={mainnetProvider} fontSize={16} />
      </div>
    </div>
  );
}
