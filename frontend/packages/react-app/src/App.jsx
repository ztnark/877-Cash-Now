import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";

import { Alert, Button, Menu } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { Account, Header } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import { useBalance, useContractLoader, useExchangePrice, useGasPrice } from "./hooks";
import { ExampleUI } from "./views";

const { ethers } = require("ethers");

const SuperfluidSDK = require("@superfluid-finance/js-sdk");
// const { Web3Provider } = require("@ethersproject/providers");

const DEBUG = false;
// Where you're deployed, e.g., localhost, MATIC, Mumbai testnet
const targetNetwork = NETWORKS.ropsten;
// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

// PROVIDERS
// Static provider for reading, when user has not connected their wallet
const readOnlyProvider = new ethers.providers.StaticJsonRpcProvider(targetNetwork.rpcUrl);
// Dedicated mainnet Infura provider;
// handy for looking up exchange prices, ENS,
// and other live data that you want in all environments, including dev.
const mainnetProvider = new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID);

function App(props) {
  // Injected provider for writing - connected via web3 modal
  const [injectedProvider, setInjectedProvider] = useState();

  const [superfluid, setSuperfluid] = useState();

  const address = useUserAddress(injectedProvider);

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");

  // You can warn the user if you would like them to be on a specific network
  const localChainId = targetNetwork?.chainId;
  const selectedChainId = injectedProvider?._network?.chainId;

  const transactor = Transactor(injectedProvider, gasPrice);

  const yourLocalBalance = useBalance(readOnlyProvider, address);

  const readContracts = useContractLoader(readOnlyProvider);
  const writeContracts = useContractLoader(injectedProvider, { chainId: localChainId });

  // 🧫 DEBUG 👨🏻‍🔬
  useEffect(() => {
    if (DEBUG && address && selectedChainId && yourLocalBalance) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
    }
  }, [address, selectedChainId, yourLocalBalance]);

  let networkDisplay = "";
  if (localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);
                    const tx = await ethereum.request({ method: "wallet_addEthereumChain", params: data }).catch();
                    if (tx) {
                      console.log(tx);
                    }
                  }}
                >
                  <b>{networkLocal && networkLocal.name}</b>
                </Button>
                .
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider?.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };


  // this function must be maintained between renders 
  // because it is a dependency to other useEffect hooks
  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  // set our superfluid instance once provider is injected..
  useEffect(async () => {
    
    if (injectedProvider && !superfluid) {
      const sf = new SuperfluidSDK.Framework({
        ethers: injectedProvider
      });
      // Can't set our state until we've initialized,
      // otherwise `undefined` errors will crop up
      await sf.initialize();
      setSuperfluid(sf);
    }

  }, [injectedProvider]);

  return (
    <div className="App">
      <Header />
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Main
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            <ExampleUI
              address={address}
              mainnetProvider={mainnetProvider}
              localProvider={readOnlyProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={transactor}
              writeContracts={writeContracts}
              readContracts={readContracts}
              superfluid={superfluid}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={injectedProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>
    </div>
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  // theme: "light",
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

export default App;
