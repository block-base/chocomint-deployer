// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

const totalSupply = 30;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const images = req.body.file;
  const buff1 = Buffer.from(req.body.file[0][0].image.split(",")[1], "base64");
  console.log(buff1);

  const outputs = [];
  for (let i = 1; i <= totalSupply; i++) {
    const composite = Object.values(images).map((item: any, i) => {
      const rates = Object.values(item).map((a: any) => a.rate);
      const sum = rates.reduce((a, b) => {
        return a + b;
      });
      const hit = Math.floor(Math.random() * sum);
      let rate = 0;
      let indexCount = 0;
      for (const prop of Object.values(item).map((a: any) => a.rate)) {
        rate += prop;
        if (hit <= rate) {
          break;
        }
        indexCount++;
      }
      return { input: Buffer.from(item[indexCount].image.split(",")[1], "base64") };
    });
    outputs.push(await sharp(buff1).composite(composite).toBuffer());
  }

  res.status(200).json({ image: outputs });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};
