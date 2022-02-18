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
  Image,
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
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import CSVReader from "react-csv-reader";
import { FaInfoCircle } from "react-icons/fa";

import chainIdConfig from "../contracts/chainId.json";
import { generateMintSignature, injectedConnector, signDeploy, signMint } from "../lib/web3";

const Home: NextPage = () => {
  const { account, activate, library } = useWeb3React<Web3Provider>();

  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  const [pageStatus, setPageStatus] = React.useState("");
  const [chainId, setChainId] = React.useState("4");
  const [name, setName] = React.useState("");
  const [symbol, setSymbol] = React.useState("");
  const [version, setVersion] = React.useState("");
  const [salt, setSalt] = React.useState("");
  const [tokenURIBase, setTokenURIBase] = React.useState("");
  const [owner, setOwner] = React.useState("");
  const [adminList, setAdminList] = React.useState([]);
  const [deployingContract, setDeployingContract] = React.useState("");
  const [deployTxHash, setDeployTxHash] = React.useState("");
  const [mintTxHashList, setMintTxHashList] = React.useState([]);
  const [mintList, setMintList] = React.useState([]);
  const [nftContractAddress, setNFTContractAddress] = React.useState("");
  const [error, setError] = React.useState("");
  const [mintingCount, setMintingCount] = React.useState(0);
  const isRoot = false;
  const mintMaxNumber = 100;

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
    if (!name) {
      setError("name is undefined");
      return;
    }
    if (!symbol) {
      setError("symbol is undefined");
      return;
    }
    if (!version) {
      setError("version is undefined");
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
    setDeployingContract(deployedAddress);
    setNFTContractAddress(deployedAddress);
    setSalt(salt);
    const deployTx = await signer.sendTransaction({ to: to, data: deployCalldata });
    setDeployTxHash(deployTx.hash);
  };

  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  };

  const signMintToken = async () => {
    setMintingCount(0);
    if (!account || !library) {
      setError("connect your wallet");
      return;
    }
    if (!name) {
      setError("name is undefined");
      return;
    }
    if (!version) {
      setError("version is undefined");
      return;
    }
    if (!nftContractAddress) {
      setError("nftContractAddress is undefined");
      return;
    }

    const signer = library.getSigner();
    const signerAddress = await signer.getAddress();
    const { chocoMintERC721BulkMinterAddress, mintSignature, mintERC721Root, mintERC721leaves, mintERC721Tree } =
      await generateMintSignature(
        signer,
        name,
        version,
        Number(chainId),
        nftContractAddress,
        signerAddress,
        mintList,
        salt
      );

    for (let i = 0; i * mintMaxNumber < mintList.length; i++) {
      setMintingCount(i + 1);
      const slicedList = mintList.slice(i * mintMaxNumber, i * mintMaxNumber + mintMaxNumber);

      const { bulkMintCalldata } = await signMint(
        signer,
        mintSignature,
        Number(chainId),
        nftContractAddress,
        mintERC721Root,
        mintERC721leaves,
        mintERC721Tree,
        signerAddress,
        slicedList,
        i,
        salt
      );
      try {
        const mintTx = await signer.sendTransaction({ to: chocoMintERC721BulkMinterAddress, data: bulkMintCalldata });
        mintTxHashList.push(mintTx.hash);
        console.log(mintTxHashList);
        setMintTxHashList(mintTxHashList);
      } catch (e) {
        console.log(e);
        setError("tx failed");
      }
    }
  };

  const selectChainId = (
    <>
      <RadioGroup defaultValue="4" onChange={(e) => setChainId(e)} mb="4">
        <HStack spacing="24px">
          <Radio value="4">Rinkeby</Radio>
          <Radio value="1">Mainnet</Radio>
          <Radio value="137">Polygon</Radio>
          <Radio value="80001">Mumbai</Radio>
          <Radio value="31337">Local</Radio>
        </HStack>
      </RadioGroup>
    </>
  );

  const inputNewContractInfo = (
    <>
      <FormLabel>name</FormLabel>
      <Input placeholder="Chocomint Animals" value={name} onChange={(e) => setName(e.target.value)} mb="2"></Input>
      <FormLabel>symbol</FormLabel>
      <Input placeholder="CA" value={symbol} onChange={(e) => setSymbol(e.target.value)} mb="2"></Input>
      <FormLabel alignItems={"center"}>
        version
        <Tooltip label="If this is a new project, use 1.0.0">
          <span>
            <Icon as={FaInfoCircle} w={4} h={4} ml="1" color={"gray"}></Icon>
          </span>
        </Tooltip>
      </FormLabel>
      <Input placeholder="1.0.0" value={version} onChange={(e) => setVersion(e.target.value)} mb="2"></Input>
    </>
  );

  const inputExistingContractInfo = (
    <>
      <FormLabel>name</FormLabel>
      <Input placeholder="Chocomint Animals" value={name} onChange={(e) => setName(e.target.value)} mb="2"></Input>
      <FormLabel>version</FormLabel>
      <Input placeholder="1.0.0" value={version} onChange={(e) => setVersion(e.target.value)} mb="2"></Input>
      <FormLabel>NFT contract address</FormLabel>
      <Input
        placeholder="0x"
        value={nftContractAddress}
        onChange={(e) => setNFTContractAddress(e.target.value)}
        mb="2"
      ></Input>
      <FormLabel>salt</FormLabel>
      <Input placeholder="" value={salt} onChange={(e) => setSalt(e.target.value)} mb="2"></Input>
    </>
  );

  const inputTokenURIBase = (
    <>
      <Text textAlign={"left"} my="2">
        <Link href="metadata" color={"blue.400"}>
          Create a Metadata
        </Link>{" "}
        and store it on IPFS or any database of your choice.
      </Text>
      <FormLabel>tokenURIBase</FormLabel>
      <Input
        placeholder="ipfs://Qm..."
        value={tokenURIBase}
        onChange={(e) => setTokenURIBase(e.target.value)}
        mb="2"
      ></Input>
    </>
  );

  const setRole = (
    <>
      <FormLabel>
        owner address
        <Tooltip label="This address will be the contract owner">
          <span>
            <Icon as={FaInfoCircle} w={4} h={4} ml="1" color={"gray"}></Icon>
          </span>
        </Tooltip>
      </FormLabel>
      <Input placeholder="0x" value={owner} onChange={(e) => setOwner(e.target.value)} mb="2"></Input>
      <FormLabel>
        admin address
        <Tooltip label="[Optional] this address will have admin role and can mint token etc.">
          <span>
            <Icon as={FaInfoCircle} w={4} h={4} ml="1" color={"gray"}></Icon>
          </span>
        </Tooltip>
      </FormLabel>
      {adminList.map((admin, index) => {
        return (
          <Flex key={index}>
            <Input placeholder="0x" value={adminList[index]} onChange={(e) => handleAdmin(index, e)} mb="2"></Input>
            <Button colorScheme="teal" onClick={() => removeAdmin(index)}>
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
    </>
  );

  const deployContract = (
    <Box textAlign={"left"}>
      <Text px={2} fontSize="sm">
        chain: {chainIdConfig[chainId].name}
      </Text>
      <Text px={2} fontSize="sm">
        name: {name}
      </Text>
      <Text px={2} fontSize="sm">
        symbol: {symbol}
      </Text>
      <Text px={2} fontSize="sm">
        tokenURIBase: {tokenURIBase}
      </Text>
      <Text px={2} fontSize="sm">
        owner address: {owner}
      </Text>
      <Text px={2} fontSize="sm">
        admin address list:{" "}
        {adminList.map((admin) => {
          return admin + ",";
        })}
      </Text>
      {account ? (
        <Button onClick={signDeployContract} marginY="2" colorScheme={"teal"}>
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
      <Text my="2">
        salt: {salt}{" "}
        <Tooltip label="Keep this string as it will be needed when you mint token">
          <span>
            <Icon as={FaInfoCircle} w={4} h={4} ml="1" color={"gray"}></Icon>
          </span>
        </Tooltip>
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

  const inputMintList = (
    <Box textAlign={"left"}>
      <FormLabel mt="4">
        Input your mint list as a CSV. CSV format can be downloaded{" "}
        <Link href="" color={"blue.400"} isExternal>
          here
        </Link>
      </FormLabel>
      <Box mb="4">
        <CSVReader onFileLoaded={(data) => setMintList(data)} parserOptions={papaparseOptions} />
      </Box>
    </Box>
  );

  const mintToken = (
    <Box textAlign="left">
      <Text>Tx will be split into 100 tokens each.</Text>
      {account ? (
        <Button onClick={signMintToken} marginY="2" colorScheme="blue">
          Sign and Send Tx
        </Button>
      ) : (
        <Button onClick={connectWallet} marginY="2">
          Connect Wallet
        </Button>
      )}
      {error ? <Text color="red">Error: {error}</Text> : <></>}
      <Box my="4">
        <Text>You are currently minting ... </Text>
        {mintingCount}/{Math.ceil(mintList.length / 100)}
        {mintTxHashList.map((hash) => {
          <Text>{hash}</Text>;
        })}
      </Box>
    </Box>
  );

  const deploySteps = [
    { label: "Step 1: Select Chain", content: selectChainId },
    { label: "Step 2: Input Contract Info", content: inputNewContractInfo },
    { label: "Step 3: Input tokenURIBase", content: inputTokenURIBase },
    { label: "Step 4: Set Role", content: setRole },
    { label: "Step 5: Deploy Contract", content: deployContract },
  ];

  const mintSteps = [
    { label: "Step 1: Select Chain", content: selectChainId },
    { label: "Step 2: Input Contract Info", content: inputExistingContractInfo },
    { label: "Step 3: Input Mint List", content: inputMintList },
    { label: "Step 4: Mint Token", content: mintToken },
  ];

  const resetAll = () => {
    reset();
    setError("");
    setMintTxHashList([]);
    setMintingCount(0);
  };

  return (
    <Container maxW="container.lg">
      <Head>
        <title>Chocomint Deployer</title>
      </Head>

      <Heading size="lg" marginY="4">
        Chocomint Deployer
      </Heading>
      <Flex bg={"#F9FAFB"} p={50} w="full" alignItems="center" rounded="sm">
        <Box maxW="xs" mx="2" bg={"white"} shadow="lg" rounded="lg">
          <Box px={4} py={2}>
            <chakra.h1 color={"gray.800"} fontWeight="bold" fontSize="3xl" textTransform="uppercase">
              Create New Contract
            </chakra.h1>
            <chakra.p mt={1} fontSize="sm" color={"gray.600"}>
              Create new project and deploy a contract
            </chakra.p>
          </Box>

          <Button
            w="full"
            colorScheme={"teal"}
            onClick={() => {
              setPageStatus("deploy");
              resetAll();
            }}
          >
            Create
          </Button>
        </Box>
        <Box maxW="xs" mx="auto" bg={"white"} shadow="lg" rounded="lg">
          <Box px={4} py={2}>
            <chakra.h1 color={"gray.800"} fontWeight="bold" fontSize="3xl" textTransform="uppercase">
              Use Existing Contract
            </chakra.h1>
            <chakra.p mt={1} fontSize="sm" color={"gray.600"}>
              Mint NFT from existing contract
            </chakra.p>
          </Box>
          <Button
            w="full"
            colorScheme={"blue"}
            onClick={() => {
              setPageStatus("mint");
              resetAll();
            }}
          >
            Mint
          </Button>
        </Box>
      </Flex>
      {pageStatus == "deploy" ? (
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
              <Button isDisabled={activeStep === 0} mr={4} onClick={prevStep} size="sm" variant="ghost">
                Prev
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (activeStep === deploySteps.length - 1) {
                    setPageStatus("mint");
                    resetAll();
                  } else {
                    nextStep();
                  }
                }}
              >
                {activeStep === deploySteps.length - 1 ? "Proceed to Mint" : "Next"}
              </Button>
            </Flex>
          </>
        </Box>
      ) : (
        <></>
      )}

      {pageStatus == "mint" ? (
        <Box mb="8">
          <Heading size="md" mt="16" mb="4">
            Token Mint
          </Heading>
          <Steps orientation="vertical" activeStep={activeStep} colorScheme="blue">
            {mintSteps.map(({ label, content }) => (
              <Step width="100%" label={label} key={label}>
                {content}
              </Step>
            ))}
          </Steps>
          {activeStep === mintSteps.length ? (
            <Flex px={4} py={4} flexDirection="column">
              <Heading fontSize="xl" textAlign="center">
                Woohoo! All steps completed!
              </Heading>
              <Button mx="auto" mt={6} size="sm" onClick={reset}>
                Reset
              </Button>
            </Flex>
          ) : (
            <Flex justify="flex-end">
              <Button isDisabled={activeStep === 0} mr={4} onClick={prevStep} size="sm" variant="ghost">
                Prev
              </Button>
              <Button size="sm" onClick={nextStep}>
                {activeStep === mintSteps.length - 1 ? "Finish" : "Next"}
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        <></>
      )}
    </Container>
  );
};

export default Home;
