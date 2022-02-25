import { Box, Button, Container, Heading, Link, Text, Textarea, VisuallyHidden } from "@chakra-ui/react";
import csv from "csvtojson";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { CSVLink } from "react-csv";

const data = [
  {
    tokenId: 1,
    name: "Namahamu #1",
    description: "This is description of the token",
    image_url: "ipfs://QmVZhQ3YWYnCvsRwMWAgtuUqKB6a57iaAbdKQ4tMjx6qoQ/1.png",
    animation_url: "",
    "attributes.0.trait_type": "Power",
    "attributes.0.value": 5,
    "attributes.1.trait_type": "Skill",
    "attributes.1.value": "Spell",
  },
  {
    tokenId: 2,
    name: "Namahamu #2",
    description: "This is description of the token",
    image_url: "ipfs://QmVZhQ3YWYnCvsRwMWAgtuUqKB6a57iaAbdKQ4tMjx6qoQ/2.png",
    animation_url: "",
    "attributes.0.trait_type": "Power",
    "attributes.0.value": 2,
    "attributes.1.trait_type": "Skill",
    "attributes.1.value": "Attack",
  },
  {
    tokenId: 3,
    name: "Namahamu #3",
    description: "This is description of the token",
    image_url: "ipfs://QmVZhQ3YWYnCvsRwMWAgtuUqKB6a57iaAbdKQ4tMjx6qoQ/3.png",
    animation_url: "",
    "attributes.0.trait_type": "Power",
    "attributes.0.value": 3,
  },
];

const Metadata: NextPage = () => {
  const placeholder =
    "tokenId,name,description,image_url,animation_url,external_url,attributes.0.trait_type,attributes.0.value,attributes.1.trait_type,attributes.1.value";
  const [metadataCSV, setMetadataCSV] = React.useState("");
  const csvLink = React.useRef(null);

  const downlaodSampleCsv = () => {
    if (!csvLink.current) return;
    csvLink.current.link.click();
  };

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
        <Box my="8">
          <Text fontSize="lg">① Download sample csv</Text>
          <Button onClick={downlaodSampleCsv} fontSize="sm">
            Download sample CSV
          </Button>
          <VisuallyHidden>
            <CSVLink data={data} ref={csvLink} filename={"metadata sample.csv"}></CSVLink>
          </VisuallyHidden>
        </Box>
        <Box my="8">
          <Text mt="4" fontSize="lg">
            ② Edit the csv in a spreadsheet or your favorite editor.
          </Text>
          <Text>
            Please refer to{" "}
            <Link href="https://docs.opensea.io/docs/metadata-standards" color={"blue.400"} isExternal>
              OpenSea metadata standard
            </Link>{" "}
            for more information on what to write.
          </Text>
        </Box>
        <Box my="8">
          <Text mt="4" fontSize="lg">
            ③ Paste your csv as a string here.
          </Text>

          <Textarea
            placeholder={placeholder}
            minHeight={"300px"}
            value={metadataCSV}
            onChange={(e) => setMetadataCSV(e.target.value)}
          ></Textarea>
        </Box>
        <Box my="8">
          <Text mt="4" fontSize="lg">
            ④ Download and host it to IPFS or your own metadata server.
          </Text>
          <Button colorScheme={"teal"} my="2" onClick={dlMetadata}>
            Download
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Metadata;
