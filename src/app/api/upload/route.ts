import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import uniqid from 'uniqid';
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const formData = await req.body;
  const file = formData.get('file');
  const { name, type } = file;
  const data = await file.arrayBuffer();

  const s3client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  const id = uniqid();
  const ext = name.split('.').slice(-1)[0];
  const newName = id + '.' + ext;

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Body: data,
    ACL: 'public-read',
    ContentType: type,
    Key: newName,
  });

  await s3client.send(uploadCommand);

  return res.json({ name, ext, newName, id });
}