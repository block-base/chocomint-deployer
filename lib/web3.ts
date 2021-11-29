import { Interface } from "@ethersproject/abi";
import { JsonRpcSigner } from "@ethersproject/providers";
import { SignTypedDataVersion, TypedDataUtils } from "@metamask/eth-sig-util";
import { InjectedConnector } from "@web3-react/injected-connector";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";

import importedContractsJson from "../contracts/address.json";
import {
  ALWAYS_VALID_FROM,
  ALWAYS_VALID_TO,
  BLOCKBASE_ADDRESS,
  CHOCO_FACTORY_CONTRACT,
  CHOCO_FACTORY_NAME,
  CHOCO_FACTORY_VERSION,
  CHOCO_FORWARDER_CONTRACT,
  CHOCO_MINT_ERC721_BULK_MINTER_CONTRACT,
  CHOCO_MINT_ERC721_IMPLEMENTATION_CONTRACT,
  NULL_BYTES,
  NULL_NUMBER,
} from "../contracts/constants";
import ChocoMintERC721BulkMinter from "../contracts/interfaces/ChocoMintERC721BulkMinter.json";
import IChocoFactoryABI from "../contracts/interfaces/IChocoFactory.json";
import IChocoMintERC721 from "../contracts/interfaces/IChocoMintERC721.json";
import {
  deployPrimaryType,
  deployType,
  mintERC721PrimaryType,
  mintERC721Type,
  signatureType,
} from "../contracts/structs";
import { AddressJson } from "../contracts/types";

const addressJson: AddressJson = importedContractsJson;
export const injectedConnector = new InjectedConnector({});

export interface MintList {
  tokenId: number;
  walletAddress: string;
}

export const signDeploy = async (
  chainId: number,
  signer: JsonRpcSigner,
  minter: string,
  owner: string,
  adminList: string[],
  name: string,
  tokenURIBase: string,
  version: string,
  symbol: string,
  isRoot: boolean,
  list?: MintList[]
) => {
  const chocoFactoryAddress = addressJson[chainId][CHOCO_FACTORY_CONTRACT];
  const chocoForwarderAddress = addressJson[chainId][CHOCO_FORWARDER_CONTRACT];
  const chocoMintERC721ImplementationAddress = addressJson[chainId][CHOCO_MINT_ERC721_IMPLEMENTATION_CONTRACT];

  const chocoFactoryContract = new ethers.Contract(chocoFactoryAddress, IChocoFactoryABI.abi, signer);

  const deployer = minter;

  const ChocoMintERC721ImplementationContract = new ethers.Contract(
    chocoMintERC721ImplementationAddress,
    IChocoMintERC721.abi,
    signer
  );

  console.log(ChocoMintERC721ImplementationContract.interface, "ChocoMintERC721ImplementationContract");

  const setAdminData = adminList.map((admin) => {
    return ChocoMintERC721ImplementationContract.interface.encodeFunctionData("setAdmin", [admin, true]);
  });

  const initializeData = [
    ChocoMintERC721ImplementationContract.interface.encodeFunctionData("initialize", [
      name,
      version,
      symbol,
      chocoForwarderAddress,
      [],
    ]),
    ChocoMintERC721ImplementationContract.interface.encodeFunctionData("setTokenURIBase", [tokenURIBase, false]),
  ];

  const salt = process.env.SALT || ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString();

  const securityData = {
    validFrom: ALWAYS_VALID_FROM,
    validTo: ALWAYS_VALID_TO,
    salt,
  };

  const mintERC721DataList = list.map((item) => {
    return {
      securityData,
      minter,
      to: item.walletAddress,
      tokenId: item.tokenId,
      data: NULL_BYTES,
    };
  });

  const mintERC721leaves = mintERC721DataList.map((data) => {
    return TypedDataUtils.hashStruct(mintERC721PrimaryType, data, mintERC721Type, SignTypedDataVersion.V4);
  });

  const mintERC721Tree = new MerkleTree(mintERC721leaves, keccak256, { sort: true });
  const mintERC721Root = mintERC721Tree.getHexRoot();

  const rootData = isRoot
    ? [ChocoMintERC721ImplementationContract.interface.encodeFunctionData("setRoot", [mintERC721Root, false])]
    : [];

  const data = initializeData
    .concat(setAdminData)
    .concat(rootData)
    .concat([ChocoMintERC721ImplementationContract.interface.encodeFunctionData("transferOwnership", [owner])]);

  const deployData = {
    securityData,
    deployer,
    implementation: chocoMintERC721ImplementationAddress,
    data,
  };

  const factoryDomain = {
    name: CHOCO_FACTORY_NAME,
    version: CHOCO_FACTORY_VERSION,
    chainId,
    verifyingContract: chocoFactoryContract.address,
  };
  const deployHash = TypedDataUtils.hashStruct(deployPrimaryType, deployData, deployType, SignTypedDataVersion.V4);

  const deployLeaves = [deployHash];
  const deployTree = new MerkleTree(deployLeaves, keccak256, { sort: true });
  const deployRoot = deployTree.getRoot();
  const deployProof = deployTree.getHexProof(deployHash);
  const deploySignature = await signer._signTypedData(factoryDomain, signatureType, { root: deployRoot });
  const signatureData = {
    root: deployRoot,
    proof: deployProof,
    signature: deploySignature,
  };
  const deployedAddress = await chocoFactoryContract.predict(deployData);
  const estimateGas = await chocoFactoryContract.estimateGas.deploy(deployData, signatureData);
  const deployCalldata = chocoFactoryContract.interface.encodeFunctionData("deploy", [deployData, signatureData]);
  console.log(deployCalldata, "deployCalldata");
  return { deployCalldata, to: chocoFactoryContract.address, deployedAddress, salt };
};

export const signMint = async (
  signer: JsonRpcSigner,
  name: string,
  version: string,
  chainId: number,
  verifyingContract: string,
  minter: string,
  list: MintList[],
  inputSalt?: string
) => {
  const salt = inputSalt || ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString();
  const chocoMintERC721BulkMinterAddress = addressJson[chainId][CHOCO_MINT_ERC721_BULK_MINTER_CONTRACT];
  const chocoMintERC721BulkMinterContract = new ethers.Contract(
    chocoMintERC721BulkMinterAddress,
    ChocoMintERC721BulkMinter.abi,
    signer
  );

  const securityData = {
    validFrom: ALWAYS_VALID_FROM,
    validTo: ALWAYS_VALID_TO,
    salt,
  };

  const mintERC721DataList = list.map((item) => {
    return {
      securityData,
      minter,
      to: item.walletAddress,
      tokenId: item.tokenId,
      data: NULL_BYTES,
    };
  });

  const mintERC721leaves = mintERC721DataList.map((data) => {
    console.log(data);
    return TypedDataUtils.hashStruct(mintERC721PrimaryType, data, mintERC721Type, SignTypedDataVersion.V4);
  });

  const mintERC721Tree = new MerkleTree(mintERC721leaves, keccak256, {
    sort: true,
  });
  const mintERC721Root = mintERC721Tree.getHexRoot();

  const chocomintDomain = {
    name,
    version,
    chainId,
    verifyingContract,
  };

  const mintSignature = await signer._signTypedData(chocomintDomain, signatureType, { root: mintERC721Root });

  const signatureDataList = mintERC721leaves.map((leaf: Buffer) => {
    const mintERC721proof = mintERC721Tree.getHexProof(leaf);
    return {
      root: mintERC721Root,
      proof: mintERC721proof,
      signature: mintSignature,
    };
  });

  const bulkMintCalldata = chocoMintERC721BulkMinterContract.interface.encodeFunctionData("mint", [
    verifyingContract,
    mintERC721DataList,
    signatureDataList,
  ]);
  console.log(bulkMintCalldata);
  return { to: chocoMintERC721BulkMinterAddress, calldata: bulkMintCalldata };
};
