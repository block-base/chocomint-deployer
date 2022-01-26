import { Box, Button, Container, Flex, FormLabel, Heading, Text, Textarea } from "@chakra-ui/react";
import csv from "csvtojson";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

const Metadata: NextPage = () => {
  const placeholder =
    "tokenId,name,description,image_url,animation_url,external_url,attributes.0.trait_type,attributes.0.value,attributes.1.trait_type,attributes.1.value";
  const [metadataCSV, setMetadataCSV] = React.useState("");
  const dlMetadata = () => {
    const zip = new JSZip();
    csv({ ignoreEmpty: true })
      .fromString(metadataCSV)
      .then((jsonObj) => {
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
        <FormLabel>input csv as a text</FormLabel>
        <Box mb="4">
          <Textarea
            placeholder={placeholder}
            minHeight={"300px"}
            value={metadataCSV}
            onChange={(e) => setMetadataCSV(e.target.value)}
          ></Textarea>
        </Box>
        <Button onClick={dlMetadata}>DL</Button>
        <Text>DL and host it to IPFS or your own metadata server.</Text>
      </Box>
    </Container>
  );
};

export default Metadata;
