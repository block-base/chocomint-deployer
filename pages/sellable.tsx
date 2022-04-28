import {
  Box,
  Button,
  chakra,
  Container,
  Flex,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Link,
  Radio,
  RadioGroup,
  Spacer,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import CSVReader from "react-csv-reader";
import DateTimePicker from "react-datetime-picker/dist/entry.nostyle";
import { FaInfoCircle } from "react-icons/fa";

import chainIdConfig from "../contracts/chainId.json";
import { NULL_BYTES32 } from "../contracts/constants";
import ChocoMintSellebaleWrapper from "../contracts/interfaces/ChocoMintSellableWrapper.json";
import IChocoMintERC721 from "../contracts/interfaces/IChocoMintERC721.json";
import { generateMintSignature, generateSellableContract, injectedConnector, signDeploy, signMint } from "../lib/web3";

const Home: NextPage = () => {
  const papaparseOptions = {
    header: false,
    dynamicTyping: true,
    skipEmptyLines: true,
  };

  const { account, activate, library } = useWeb3React<Web3Provider>();

  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });
  const [chainId, setChainId] = React.useState("4");
  const [pageStatus, setPageStatus] = React.useState("");
  const [nftContractAddress, setNFTContractAddress] = React.useState("");
  const [maxSupply, setMaxSupply] = React.useState("");
  const [mintPerAddress, setMintPerAddress] = React.useState("");
  const [preSalePrice, setPreSalePrice] = React.useState("");
  const [publicSalePrice, setPublicSalePrice] = React.useState("");
  const [error, setError] = React.useState("");
  const [deployTxHash, setDeployTxHash] = React.useState("");
  const [deployingContract, setDeployingContract] = React.useState("");
  const [whiteListData, setWhiteListData] = React.useState([]);
  const [merkleRoot, setMerkleRoot] = React.useState("");
  const [preSaleDateTime, setPreSaleDateTime] = React.useState(new Date());
  const [publicSaleDateTime, setPublicSaleDateTime] = React.useState(new Date());

  const connectWallet = async () => {
    activate(injectedConnector);
  };

  const deploy = async () => {
    const signer = library.getSigner();
    const deployer = await signer.getAddress();
    const { deployCalldata, to, deployedAddress } = await generateSellableContract(
      Number(chainId),
      signer,
      deployer,
      nftContractAddress,
      ethers.utils.parseEther(preSalePrice),
      ethers.utils.parseEther(publicSalePrice),
      Number(maxSupply),
      Number(mintPerAddress),
      Math.floor(preSaleDateTime.getTime() / 1000),
      Math.floor(publicSaleDateTime.getTime() / 1000),
      [deployer, "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"],
      [975, 25]
    );
    setDeployingContract(deployedAddress);

    await signer.sendTransaction({ to: to, data: deployCalldata });
  };

  const setAdmin = async () => {
    const signer = library.getSigner();
    const chocoMintERC721Contract = new ethers.Contract(nftContractAddress, IChocoMintERC721.abi, library);

    const nftTxn = await chocoMintERC721Contract.connect(signer).setAdmin(deployingContract, true);
    await nftTxn.wait();
  };

  const setSaleWhitelist = async () => {
    const signer = library.getSigner();
    const sellableContract = new ethers.Contract(deployingContract, ChocoMintSellebaleWrapper.abi, library);

    const nftTxn = await sellableContract.connect(signer).setSaleMerkleRoot(merkleRoot);
    await nftTxn.wait();
  };

  const readWhiteList = async (data: any[]) => {
    setWhiteListData(data);
    console.log(data);
    const leaves = data.map((item) => item[0]);
    const tree = new MerkleTree(leaves, keccak256, {
      sortLeaves: true,
      sortPairs: true,
    });
    const root = tree.getHexRoot();
    setMerkleRoot(root);
  };

  const selectChainId = (
    <>
      <RadioGroup defaultValue="4" onChange={(e) => setChainId(e)} mb="4">
        <HStack spacing="24px">
          <Radio value="4">Rinkeby</Radio>
          <Radio value="3">Ropsten</Radio>
          <Radio value="1">Mainnet</Radio>
          <Radio value="137">Polygon</Radio>
          <Radio value="80001">Mumbai</Radio>
          <Radio value="31337">Local</Radio>
        </HStack>
      </RadioGroup>
    </>
  );

  const inputContractInfo = (
    <>
      <FormLabel>NFT contract address</FormLabel>
      <Input
        placeholder="0x"
        value={nftContractAddress}
        onChange={(e) => setNFTContractAddress(e.target.value)}
        mb="2"
      ></Input>
      <FormLabel>Max supply</FormLabel>
      <Input placeholder="10000" value={maxSupply} onChange={(e) => setMaxSupply(e.target.value)} mb="2"></Input>
      <FormLabel>Mint per address</FormLabel>
      <Input placeholder="3" value={mintPerAddress} onChange={(e) => setMintPerAddress(e.target.value)} mb="2"></Input>
    </>
  );

  const inputPreSaleInfo = (
    <Box textAlign={"left"}>
      <FormLabel>Presale Price (ETH)</FormLabel>
      <Input placeholder="0.01" value={preSalePrice} onChange={(e) => setPreSalePrice(e.target.value)} mb="2"></Input>
      <FormLabel>Presale Date</FormLabel>
      <DateTimePicker onChange={setPreSaleDateTime} value={preSaleDateTime} />
    </Box>
  );

  const inputPublicSaleInfo = (
    <Box textAlign={"left"}>
      <FormLabel>Public Sale Price (ETH)</FormLabel>
      <Input
        placeholder="0.01"
        value={publicSalePrice}
        onChange={(e) => setPublicSalePrice(e.target.value)}
        mb="2"
      ></Input>
      <FormLabel>Public Sale Date</FormLabel>
      <DateTimePicker onChange={setPublicSaleDateTime} value={publicSaleDateTime} />
    </Box>
  );

  const deployContract = (
    <Box textAlign={"left"}>
      <Text px={2} fontSize="sm">
        chain: {chainIdConfig[chainId].name}
      </Text>
      <Text px={2} fontSize="sm">
        nft contract address: {nftContractAddress}
      </Text>
      <Text px={2} fontSize="sm">
        max supply: {maxSupply}
      </Text>
      <Text px={2} fontSize="sm">
        mint per address: {mintPerAddress}
      </Text>
      <Text px={2} fontSize="sm">
        presale price: {preSalePrice}
      </Text>
      <Text px={2} fontSize="sm">
        public sale price: {publicSalePrice}
      </Text>

      {account ? (
        <Button onClick={deploy} marginY="2" colorScheme={"teal"}>
          Deploy
        </Button>
      ) : (
        <Button onClick={connectWallet} marginY="2">
          Connect Wallet
        </Button>
      )}
      {error ? <Text color="red">Error: {error}</Text> : <></>}

      <Text mt="8">
        Deploying Contract:{" "}
        <Link href={`${chainIdConfig[chainId].explore}address/${deployingContract}`} color={"blue.400"} isExternal>
          {deployingContract}
        </Link>
      </Text>
      {deployTxHash ? (
        <Link href={`${chainIdConfig[chainId].explore}tx/${deployTxHash}`} color={"blue.400"} isExternal>
          {chainIdConfig[chainId].explore}
          {deployTxHash}
        </Link>
      ) : (
        <></>
      )}
    </Box>
  );

  const setAdminRole = (
    <Box textAlign={"left"}>
      <Text px={2}>nft contract address: {nftContractAddress}</Text>
      <Text px={2}>sale contract address: {deployingContract}</Text>
      {account ? (
        <Button onClick={setAdmin} marginY="2" colorScheme={"teal"}>
          Set Admin Role
        </Button>
      ) : (
        <Button onClick={connectWallet} marginY="2">
          Connect Wallet
        </Button>
      )}
    </Box>
  );

  const setWhiteList = (
    <Box textAlign={"left"}>
      <FormLabel mt="4">
        Input your whitelist as a CSV. CSV format can be downloaded{" "}
        <Link href="" color={"blue.400"} isExternal>
          here
        </Link>
      </FormLabel>
      <Box mb="4">
        <CSVReader onFileLoaded={(data) => readWhiteList(data)} parserOptions={papaparseOptions} />
      </Box>
      {account ? (
        <Button onClick={setSaleWhitelist} marginY="2" colorScheme={"teal"}>
          Set Whitelist
        </Button>
      ) : (
        <Button onClick={connectWallet} marginY="2">
          Connect Wallet
        </Button>
      )}
    </Box>
  );

  const deploySteps = [
    { label: "Step 1: Select Chain", content: selectChainId },
    { label: "Step 2: Input Contract Info", content: inputContractInfo },
    { label: "Step 3: Input Presale Info", content: inputPreSaleInfo },
    { label: "Step 4: Input Public Sale Info", content: inputPublicSaleInfo },
    { label: "Step 5: Deploy Contract", content: deployContract },
    { label: "Step 6: Set Admin Role to sellable contract", content: setAdminRole },
    { label: "Step 7: Set Whitelist (Optional)", content: setWhiteList },
  ];

  return (
    <Container maxW="container.lg">
      <Box mb="8">
        <Heading size="md" mt="16" mb="4">
          Contract Deploy
        </Heading>
        <>
          <Steps orientation="vertical" activeStep={activeStep} colorScheme={"teal"}>
            {deploySteps.map(({ label, content }) => (
              <Step width="100%" label={label} key={label}>
                {content}
              </Step>
            ))}
          </Steps>
          <Flex justify="flex-end">
            <Button
              isDisabled={activeStep === 0}
              mr={4}
              onClick={() => {
                prevStep();
              }}
              size="sm"
              variant="ghost"
            >
              Prev
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (activeStep === deploySteps.length - 1) {
                  setPageStatus("mint");
                } else {
                  nextStep();
                }
              }}
            >
              {activeStep === deploySteps.length - 1 ? "" : "Next"}
            </Button>
          </Flex>
        </>
      </Box>
    </Container>
  );
};

export default Home;
