import "../public/DateTimePicker.css";
import "../public/Calendar.css";

import type { AppProps } from "next/app";
import React from "react";

import { AppWrapper } from "../components/utils/AppWrapper";

const MyApp = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <AppWrapper>
      <Component {...pageProps} />
    </AppWrapper>
  );
};

export default MyApp;
