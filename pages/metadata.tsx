import { Box, Button, Container, Flex, FormLabel, Heading, Textarea } from "@chakra-ui/react";
import csv from "csvtojson";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

const Metadata: NextPage = () => {
  const [metadataCSV, setMetadataCSV] = React.useState("");
  const dlMetadata = () => {
    const zip = new JSZip();
    csv()
      .fromString(metadataCSV)
      .then((jsonObj) => {
        console.log(jsonObj);
        for (let i = 0; i < jsonObj.length; i++) {
          zip.file(`${jsonObj[i].tokenId}`, JSON.stringify(jsonObj[i], null, "\t"));
        }
        zip.generateAsync({ type: "blob" }).then(function (zipData) {
          saveAs(zipData, "metadata.zip");
        });
      });
  };

  return (
    <Container>
      <Head>
        <title>Chocomint Deployer</title>
      </Head>

      <Heading size="lg" marginY="4">
        Chocomint Metadata Generator
      </Heading>
      <Box my="4">
        <FormLabel>input csv</FormLabel>
        <Box mb="4">
          <Textarea minHeight={"300px"} value={metadataCSV} onChange={(e) => setMetadataCSV(e.target.value)}></Textarea>
        </Box>
        <Button onClick={dlMetadata}>DL</Button>
      </Box>
    </Container>
  );
};

export default Metadata;
