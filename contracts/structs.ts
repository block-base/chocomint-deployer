export const EIP712Domain = [
  {
    name: "name",
    type: "string"
  },
  {
    name: "version",
    type: "string"
  },
  {
    name: "chainId",
    type: "uint256"
  },
  {
    name: "verifyingContract",
    type: "address"
  }
];

export const eip712DomainType = {
  EIP712Domain
};

export const eip712DomainPrimaryType = "EIP712Domain";

export const ForwardRequest = [
  {
    name: "from",
    type: "address"
  },
  {
    name: "to",
    type: "address"
  },
  {
    name: "value",
    type: "uint256"
  },
  {
    name: "gas",
    type: "uint256"
  },
  {
    name: "nonce",
    type: "uint256"
  },
  {
    name: "data",
    type: "bytes"
  }
];

export const forwardRequestType = {
  ForwardRequest
};

export const forwardRequestPrimaryType = "ForwardRequest";

export const SignatureData = [{ name: "root", type: "bytes32" }];

export const signatureType = {
  SignatureData
};

export const signaturePrimaryType = "SignatureData";

export const SecurityData = [
  { name: "validFrom", type: "uint256" },
  { name: "validTo", type: "uint256" },
  { name: "salt", type: "uint256" }
];

export const securityType = {
  SecurityData
};

export const securityPrimaryType = "SecurityData";

export const DeployData = [
  { name: "securityData", type: "SecurityData" },
  { name: "deployer", type: "address" },
  { name: "implementation", type: "address" },
  { name: "data", type: "bytes[]" }
];

export const deployType = {
  DeployData,
  SecurityData
};

export const deployPrimaryType = "DeployData";

export const RoyaltyData = [
  { name: "recipient", type: "address" },
  { name: "bps", type: "uint256" }
];

export const royaltyType = {
  RoyaltyData
};

export const royaltyPrimaryType = "RoyaltyData";

export const MintERC721Data = [
  { name: "securityData", type: "SecurityData" },
  { name: "minter", type: "address" },
  { name: "to", type: "address" },
  { name: "tokenId", type: "uint256" },
  { name: "data", type: "bytes" }
];

export const mintERC721Type = {
  MintERC721Data,
  SecurityData
};

export const mintERC721PrimaryType = "MintERC721Data";

export const AssetData = [
  { name: "class", type: "bytes4" },
  { name: "data", type: "bytes" }
];

export const assetType = {
  AssetData
};

export const assetPrimaryType = "AssetData";

export const FeeData = [
  { name: "reciepients", type: "address[]" },
  { name: "ratios", type: "uint256[]" }
];

export const feeType = {
  FeeData
};

export const feePrimaryType = "FeeData";

export const OrderData = [
  { name: "securityData", type: "SecurityData" },
  { name: "feeData", type: "FeeData" },
  { name: "makeAssetData", type: "AssetData[]" },
  { name: "takeAssetData", type: "AssetData[]" },
  { name: "maker", type: "address" },
  { name: "taker", type: "address" }
];

export const orderType = {
  OrderData,
  AssetData,
  SecurityData,
  FeeData
};

export const orderPrimaryType = "OrderData";
