require('dotenv').config();
//const cron = require('node-cron');
import { ethers,Contract, providers} from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import styles from '@/styles/Home.module.css'
import{
  TOKEN_ABI,
  NFT_ABI,
  TOKEN_ADDRESS,
  NFT_ADDRESS}from "../constants/index";

export default function Home(){
  const[walletConnected,setWalletConnected] = useState(false);
  const[airDropStarted,setAirDropStarted] = useState(false);
  const[count,setCount] = useState("0");
  const[isOwner,setIsOwner] = useState(false);
  const[tokenReceived,setTokenReceived] = useState([]);
  const web3ModalRef = useRef();
  const privateKey = process.env.PRIVATE_KEY;

  const getSignerOrProvider = async(needSigner = false) => {
    const provider = await  web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const {chainId} = await web3Provider.getNetwork();

    if(chainId != 5){
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }
    if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  async function getTokensMinted(){
    try {
      const provider = await getSignerOrProvider();
      const tokenContract = new Contract(TOKEN_ADDRESS,TOKEN_ABI,provider);
      const _tokens = await tokenContract.totalSupply();
      setCount(ethers.utils.formatEther(_tokens));
    } catch (err) {
      console.error(err);
    }
  }
  async function connectWallet(){
    try{
      await getSignerOrProvider();
      setWalletConnected(true);
      getOwner();
    }catch(err){
      console.error(err);
    }
  }

  async function sendAirDrop(){
    try{
      const provider =  await getSignerOrProvider();
      const wallet = new ethers.Wallet(privateKey,provider);
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS,TOKEN_ABI,provider);
      const nftContract = new ethers.Contract(NFT_ADDRESS,NFT_ABI,provider);
      const tokenContractWithWallet = tokenContract.connect(wallet);
      let supplyArr = [];
      let holdersArr = [];
      let nftHolders = null;
      const supply =  nftContract.totalSupply();
      supply.then(value =>{
        for(let i=0;i<value;i++){
          let token = i+1;
          supplyArr.push(token)
        }
        supplyArr.forEach(async (id) => {
          const owner = nftContract.ownerOf([id]);
          owner.then(value => {
            holdersArr.push(value);
            nftHolders = (holdersArr.toString());
          })
        })
      })
      await new Promise(r => setTimeout(r,2500));
      const formatArray = nftHolders.replace(/,(?=[^\s])/g,",");
      let receiver = formatArray.split(',');
      console.log(receiver);
      const tx = await tokenContractWithWallet.mintAirDrop(receiver);
      await checkAirDropStarted();
      await tx.wait();
      let received = Array.from(new Set(receiver));
      setTokenReceived(received);
      console.log(received);
      await getTokensMinted();
      await getOwner();
    }catch(err){
      console.error(err)
    }
  }

    async function checkAirDropStarted(){
      try{
        const provider = await getSignerOrProvider();
        const tokenContract = new Contract(TOKEN_ADDRESS,TOKEN_ABI,provider);
        const _airDropStarted = await tokenContract.airDropStarted();
        if(_airDropStarted){
          await getOwner();
        }
        setAirDropStarted(_airDropStarted);
        return _airDropStarted;
      }catch(err){
        console.error(err);
        return false;
      }
    }

    async function getOwner(){
      try{
        const provider = await getSignerOrProvider();
        const tokenContract = new Contract(TOKEN_ADDRESS,TOKEN_ABI,provider);
        const _owner = await tokenContract.owner();
  
        const signer = await getSignerOrProvider(true);
        const address = await signer.getAddress();
        if(address.toLowerCase() === _owner.toLowerCase()){
          setIsOwner(true);
        }
      }catch(err){
      console.error(err.message);
      }
    }
    useEffect(() =>{
      if(!walletConnected){
        web3ModalRef.current = new Web3Modal({
          network:"goerli",
          providerOptions:{},
          disableInjectedProvider: false,
        });
        connectWallet();
        getTokensMinted();
        checkAirDropStarted();
      }
    },[walletConnected])

    /*cron.schedule("* 5 * * * *",function(){
      if(airDropStarted){
        sendAirDrop()
      }
    })*/
    

    /*useEffect(() => {
      setInterval(async function(){
        if(airDropStarted){
          sendAirDrop();
        }
      },600000);
    })*/

    function renderButton(){
      if(!walletConnected){
        return (<button onClick={connectWallet} className={styles.button}>Connect your wallet</button>);
      }
      if(isOwner){
        return(<button onClick={sendAirDrop} className={styles.button}>AirDrop</button>)
      }
      if(airDropStarted){
        return(<button className={styles.button}>AirDrop running</button>)
      }
      if(!airDropStarted){
        return(<button className={styles.button}>AirDrop not yet started</button>)
      }
    }
    return(
      <div>
        <Head>
          <title>Krypto AirDrop</title>
          <meta name="description" content="AirDrop" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to NTH AirDrop!</h1>
            <div className={styles.description}>
              It&#39;s an Airdrop for the Krypto Civilian NFT holders!
            </div>
            <div className={styles.description}>
              {count}/50000 NTH tokens have been minted.
            </div>
            {renderButton()}
            {tokenReceived && tokenReceived.map((log, index) => (
              <div className={styles.log} key={index}>
                {log} have received their NTH Tokens.
              </div>
            ))}
          </div>
        </div>
        <footer className={styles.footer}>
        Made with &#10084; by Krypto Civilians
      </footer>
      </div>
    )
  }