import { ChakraProvider } from "@chakra-ui/react";
import {
  ExternalProvider,
  JsonRpcFetchFunc,
  Web3Provider
} from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import React from "react";
export interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.VFC<AppWrapperProps> = ({ children }) => {
  const getLibrary = (provider: ExternalProvider | JsonRpcFetchFunc) => {
    return new Web3Provider(provider);
  };

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ChakraProvider>{children}</ChakraProvider>
    </Web3ReactProvider>
  );
};
