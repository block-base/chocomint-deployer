import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { ExternalProvider, JsonRpcFetchFunc, Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import { StepsStyleConfig as Steps } from "chakra-ui-steps";
import React from "react";

const theme = extendTheme({
  components: {
    Steps,
  },
});

export interface AppWrapperProps {
  children: React.ReactNode;
}

export const AppWrapper: React.VFC<AppWrapperProps> = ({ children }) => {
  const getLibrary = (provider: ExternalProvider | JsonRpcFetchFunc) => {
    return new Web3Provider(provider);
  };

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </Web3ReactProvider>
  );
};
