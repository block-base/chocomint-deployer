import {
  Box,
  Button,
  Container,
  Flex,
  FormLabel,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Spacer,
  Text,
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
  const [salt, setSalt] = React.useState("");
  const [tokenURIBase, setTokenURIBase] = React.useState("");
  const [owner, setOwner] = React.useState("");
  const [adminList, setAdminList] = React.useState([]);
  const [deployingContract, setDeployingContract] = React.useState("");
  const [mintList, setMintList] = React.useState([]);
  const [nftContractAddress, setNFTContractAddress] = React.useState("");
  const [error, setError] = React.useState("");
  const isRoot = false;

  const connectWallet = async () => {
    activate(injectedConnector);
  };

  const addAdmin = () => {
    console.log(adminList);
    const newList = adminList.concat([""]);
    setAdminList(newList);
  };

  const handleAdmin = (index: number, e) => {
    const newAttributes = adminList.map((admin, i) => {
      if (i === index) {
        return e.target.value;
      } else return admin;
    });
    setAdminList(newAttributes);
  };

  const removeAdmin = (index: number) => {
    const newAttributes = adminList
      .filter((admin, i) => {
        return i !== index;
      })
      .map((admin, i) => {
        return admin;
      });
    setAdminList(newAttributes);
  };

  const signDeployContract = async () => {
    setError("");
    if (!name || !symbol) {
      setError("name is undefined");
      return;
    }
    if (!account || !library) {
      setError("connect your wallet");
      return;
    }

    const signer = library.getSigner();
    const signerAddress = await signer.getAddress();
    const { deployCalldata, to, deployedAddress, salt } = await signDeploy(
      Number(chainId),
      signer,
      signerAddress,
      owner,
      adminList,
      name,
      tokenURIBase,
      version,
      symbol,
      isRoot,
      mintList
    );
    console.log(deployCalldata, to, deployedAddress, salt);
    setDeployingContract(deployedAddress);
    setNFTContractAddress(deployedAddress);
    setSalt(salt);
    signer.sendTransaction({ to: to, data: deployCalldata });
  };

  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  };

  const signMintToken = async () => {
    if (!account || !library) {
      setError("connect your wallet");
      return;
    }
    const signer = library.getSigner();
    const signerAddress = await signer.getAddress();
    const mintMaxNumber = 100;
    for (let i = 0; i * mintMaxNumber < mintList.length; i++) {
      const slicedList = mintList.slice(i * mintMaxNumber, i * mintMaxNumber + (mintMaxNumber - 1));
      const { chocoMintERC721BulkMinterAddress, bulkMintCalldata } = await signMint(
        signer,
        name,
        version,
        Number(chainId),
        nftContractAddress,
        signerAddress,
        slicedList,
        salt
      );
      await signer.sendTransaction({ to: chocoMintERC721BulkMinterAddress, data: bulkMintCalldata });
    }
  };

  return (
    <Container>
      <Head>
        <title>Chocomint Deployer</title>
      </Head>

      <Heading size="lg" marginY="4">
        Chocomint Deployer
      </Heading>
      <Heading size="md" marginY="4">
        Contract Deploy
      </Heading>

      <FormLabel mt="2">chainId</FormLabel>
      <RadioGroup defaultValue="4" onChange={(e) => setChainId(e)} mb="4">
        <HStack spacing="24px">
          <Radio value="4">Rinkeby</Radio>
          <Radio value="1">Mainnet</Radio>
          <Radio value="137">Polygon</Radio>
          <Radio value="80001">Mumbai</Radio>
          <Radio value="31337">Local</Radio>
        </HStack>
      </RadioGroup>

      <FormLabel>name</FormLabel>
      <Input placeholder="Chocomint Animals" value={name} onChange={(e) => setName(e.target.value)} mb="2"></Input>
      <FormLabel>symbol</FormLabel>
      <Input placeholder="CA" value={symbol} onChange={(e) => setSymbol(e.target.value)} mb="2"></Input>
      <FormLabel>version</FormLabel>
      <Input placeholder="0.0.0" value={version} onChange={(e) => setVersion(e.target.value)} mb="2"></Input>
      <FormLabel>tokenURIBase</FormLabel>
      <Input
        placeholder="https://ipfs/..."
        value={tokenURIBase}
        onChange={(e) => setTokenURIBase(e.target.value)}
        mb="2"
      ></Input>
      <FormLabel>owner address</FormLabel>
      <Input placeholder="0x" value={owner} onChange={(e) => setOwner(e.target.value)} mb="2"></Input>
      <FormLabel>admin address</FormLabel>
      {adminList.map((admin, index) => {
        return (
          <Flex key={index}>
            <Input placeholder="0x" value={adminList[index]} onChange={(e) => handleAdmin(index, e)} mb="2"></Input>
            <Button colorScheme="teal" onClick={(e) => removeAdmin(index)}>
              ×
            </Button>
          </Flex>
        );
      })}
      <Flex>
        <Spacer />
        <Button colorScheme="teal" onClick={addAdmin}>
          +
        </Button>
      </Flex>
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

      <Text mt="8">Deployed Contract: {deployingContract}</Text>

      <Heading size="md" mt="8" mb="4">
        Token Mint
      </Heading>
      <Box my="4">
        <FormLabel>NFT contract address</FormLabel>
        <Input
          placeholder="0x"
          value={nftContractAddress}
          onChange={(e) => setNFTContractAddress(e.target.value)}
          mb="2"
        ></Input>
        <FormLabel mt="4">Input your mint list as a CSV</FormLabel>
        <Box mb="4">
          <CSVReader
            onFileLoaded={(data, fileInfo, originalFile) => setMintList(data)}
            parserOptions={papaparseOptions}
          />
        </Box>
      </Box>

      {account ? (
        <Button onClick={signMintToken} marginY="2">
          Send Tx
        </Button>
      ) : (
        <Button onClick={connectWallet} marginY="2">
          Connect Wallet
        </Button>
      )}
      <Box my="4">
        <FormLabel>Minting tokenIds and walletAddresses for check purpose↓</FormLabel>

        {mintList.map((data) => {
          return (
            <Text key={data.tokenId}>
              {data.tokenId}, {data.walletAddress}
            </Text>
          );
        })}
      </Box>
    </Container>
  );
};

export default Home;
