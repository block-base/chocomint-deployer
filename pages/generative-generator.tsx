import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  Input,
  Text,
  Textarea,
  VisuallyHidden,
} from "@chakra-ui/react";
import axios from "axios";
import csv from "csvtojson";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

const Generative: NextPage = () => {
  const [metadataCSV, setMetadataCSV] = React.useState("");
  const [images, setImages] = React.useState({ 0: { 0: { image: "", name: "", rate: 0 } } });
  const [base64Image, setBase64Image] = React.useState([]);

  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const inputRefs = arr.map(() => {
    return arr.map(() => {
      return React.useRef<HTMLInputElement>(null);
    });
  });

  const sharpTest = async () => {
    axios
      .post("/api/generate-img", {
        file: images,
      })
      .then(function (response: any) {
        const base64String = response.data.image.map((image) => {
          return Buffer.from(image).toString("base64");
        });

        setBase64Image(base64String);
      })
      .catch(function (err: any) {
        console.error(err);
      });
  };

  const uploadPicture = (e: any, i: number, j: number) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages({
          ...images,
          [i]: { ...images[i], [j]: { image: reader.result as string, name: file.name, rate: 0 } },
        });
      };
      reader.readAsDataURL(file);
    } else {
      setImages(images);
    }
  };

  const handleRateInput = (e: any, i: number, j: number) => {
    setImages({ ...images, [i]: { ...images[i], [j]: { ...images[i][j], rate: Number(e.target.value) } } });
  };

  const addColumn = (i: number) => {
    if (Object.keys(images[i]).length >= 10) return;
    const length = Object.keys(images[i]).length;
    setImages({ ...images, [i]: { ...images[i], [length]: { image: "", name: "", rate: 0 } } });
  };
  const addAttribute = () => {
    if (Object.keys(images).length >= 10) return;
    const length = Object.keys(images).length;
    setImages({ ...images, [length]: { 0: { image: "", name: "", rate: 0 } } });
  };

  const imageClick = (i, j) => {
    inputRefs[i][j].current?.click();
  };

  return (
    <Container maxW="container.xl">
      <Head>
        <title>Chocomint Deployer</title>
      </Head>
      <Heading size="lg" marginY="4">
        Chocomint Generative Generator
      </Heading>
      <Box my="8">
        {Object.keys(images).map((i) => (
          <Box my="8" bgColor={"gray.50"} rounded="lg" p="2" key={i}>
            <Flex alignItems={"center"} my="2">
              <Text>Attribute {i}</Text>
              <Input w="24" mx="4"></Input>
            </Flex>
            <Flex alignItems={"center"}>
              {Object.keys(images[i]).map((j) => (
                <Box key={j} mx="1">
                  <VisuallyHidden>
                    <input
                      type="file"
                      ref={inputRefs[i][j]}
                      hidden
                      onChange={(e) => {
                        uploadPicture(e, Number(i), Number(j));
                      }}
                    />
                  </VisuallyHidden>
                  {images[Number(i)][Number(j)].image ? (
                    <Center>
                      <Image src={images[Number(i)][Number(j)].image} w="32" alt=""></Image>
                    </Center>
                  ) : (
                    <Center>
                      <Image onClick={() => imageClick(Number(i), Number(j))} src={"back.png"} w="32" alt=""></Image>
                    </Center>
                  )}
                  <Text textAlign={"center"}>{images[Number(i)][Number(j)].name}</Text>
                  <Input
                    placeholder="appearance rate"
                    w="full"
                    onChange={(e) => handleRateInput(e, Number(i), Number(j))}
                  ></Input>
                </Box>
              ))}
              <Button onClick={() => addColumn(Number(i))}>+</Button>
            </Flex>
          </Box>
        ))}
        <Button onClick={() => addAttribute()}>+ add attribute</Button>
      </Box>
      <Button onClick={sharpTest}>Generate</Button>
      <Grid templateColumns="repeat(10, 1fr)" my="8">
        {base64Image.map((image, i) => (
          <Box key={i}>{image ? <Image w="32" src={`data:image/png;base64,${image}`} alt="" /> : <></>}</Box>
        ))}
      </Grid>
    </Container>
  );
};

export default Generative;
