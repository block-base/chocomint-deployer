import {
  Button,
  Container,
  FormLabel,
  Heading,
  Input,
  Textarea,
  RadioGroup,
  HStack,
  Radio,
  Text,
  Box,
  Flex
} from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import CSVReader from "react-csv-reader";

import { injectedConnector, signDeploy, signMint } from "../lib/web3";

const Home: NextPage = () => {
  const { account, activate, library } = useWeb3React<Web3Provider>();

  const [chainId, setChainId] = React.useState("4");
  const [name, setName] = React.useState("");
  const [symbol, setSymbol] = React.useState("");
  const [version, setVersion] = React.useState("");
  const [root, setRoot] = React.useState("");
  const [tokenURIBase, setTokenURIBase] = React.useState("");
  const [owner, setOwner] = React.useState("");
  const [admin, setAdmin] = React.useState("");
  const [deployCalldata, setDeployCalldata] = React.useState("");
  const [deployingContract, setDeployingContract] = React.useState("");
  const [factoryAddress, setFactoryAddress] = React.useState("");
  const [mintList, setMintList] = React.useState([]);
  const [mintCalldata, setMintCalldata] = React.useState("");
  const [nftContractAddress, setNFTContractAddress] = React.useState("");
  const [error, setError] = React.useState("");

  const connectWallet = async () => {
    activate(injectedConnector);
  };

  const signDeployContract = async () => {
    setError("");
    if (!name || !symbol) {
      setError("name is undefined");
      console.log("name is undefined");
      return;
    }
    if (!account || !library) {
      setError("connect your wallet");
      return;
    }

    const signer = library.getSigner();
    const signerAddress = await signer.getAddress();
    const { deployCalldata, to, deployedAddress } = await signDeploy(
      Number(chainId),
      signer,
      signerAddress,
      owner,
      admin,
      name,
      tokenURIBase,
      version,
      symbol
    );
    console.log(deployCalldata, to, deployedAddress);
    setDeployCalldata(deployCalldata);
    setDeployingContract(deployedAddress);
    setNFTContractAddress(deployedAddress);
    setFactoryAddress(to);
  };

  const deployContract = async () => {
    if (!account || !library) {
      setError("connect your wallet");
      return;
    }
    const signer = library.getSigner();
    signer.sendTransaction({ to: factoryAddress, data: deployCalldata });
  };

  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  };

  const signMintToken = async () => {
    if (!account || !library) {
      setError("connect your wallet");
      return;
    }
    const signer = library.getSigner();
    const signerAddress = await signer.getAddress();
    console.log(mintList);
    const { to, calldata } = await signMint(
      signer,
      name,
      version,
      Number(chainId),
      nftContractAddress,
      signerAddress,
      mintList
    );
    setMintCalldata(calldata);
    signer.sendTransaction({ to, data: mintCalldata });
  };

  return (
    <Container>
      <Head>
        <title>Chocomint Deployer</title>
      </Head>

      <Heading size="lg" marginY="4">
        Chocomint Deployer
      </Heading>
      <FormLabel>mint先</FormLabel>
      <Box mb="4">
        <CSVReader
          onFileLoaded={(data, fileInfo, originalFile) => setMintList(data)}
          parserOptions={papaparseOptions}
        />
      </Box>

      <FormLabel>chainId</FormLabel>
      <RadioGroup defaultValue="4" onChange={(e) => setChainId(e)} mb="4">
        <HStack spacing="24px">
          <Radio value="4">Rinkeby</Radio>
          <Radio value="1">Mainnet</Radio>
          <Radio value="31337">Local</Radio>
        </HStack>
      </RadioGroup>

      <FormLabel>name</FormLabel>
      <Input
        placeholder="Chocomint Animals"
        value={name}
        onChange={(e) => setName(e.target.value)}
        mb="2"
      ></Input>
      <FormLabel>symbol</FormLabel>
      <Input
        placeholder="CA"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        mb="2"
      ></Input>
      <FormLabel>version</FormLabel>
      <Input
        placeholder="0.0.0"
        value={version}
        onChange={(e) => setVersion(e.target.value)}
        mb="2"
      ></Input>
      <FormLabel>tokenURIBase</FormLabel>
      <Input
        placeholder="https://ipfs/..."
        value={tokenURIBase}
        onChange={(e) => setTokenURIBase(e.target.value)}
        mb="2"
      ></Input>
      <FormLabel>owner address</FormLabel>
      <Input
        placeholder="0x"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        mb="2"
      ></Input>
      <FormLabel>admin address</FormLabel>
      <Input
        placeholder="0x"
        value={admin}
        onChange={(e) => setAdmin(e.target.value)}
        mb="2"
      ></Input>
      <Text color="red">{error}</Text>
      {account ? (
        <Button onClick={signDeployContract} marginY="2">
          Sign
        </Button>
      ) : (
        <Button onClick={connectWallet} marginY="2">
          Connect Wallet
        </Button>
      )}

      <Text mt="8">Deploying Contract: {deployingContract}</Text>
      <Textarea disabled value={deployCalldata}></Textarea>
      {account ? (
        <Button onClick={deployContract} marginY="2">
          Send Tx
        </Button>
      ) : (
        <Button onClick={connectWallet} marginY="2">
          Connect Wallet
        </Button>
      )}

      <Text mt="8" fontSize="xl">
        Token mint
      </Text>
      <FormLabel>NFT contract address</FormLabel>
      <Input
        placeholder="0x"
        value={nftContractAddress}
        onChange={(e) => setNFTContractAddress(e.target.value)}
        mb="2"
      ></Input>
      <FormLabel>Minting tokenIds</FormLabel>
      <Flex>
        {mintList.map((data) => {
          return <Text key={data.tokenId}>{data.tokenId}, </Text>;
        })}
      </Flex>
      {account ? (
        <Button onClick={signMintToken} marginY="2">
          Send Tx
        </Button>
      ) : (
        <Button onClick={connectWallet} marginY="2">
          Connect Wallet
        </Button>
      )}
    </Container>
  );
};

export default Home;
