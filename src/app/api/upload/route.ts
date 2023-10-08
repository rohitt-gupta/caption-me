import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import uniqid from 'uniqid';

export async function POST(request: NextRequest) {
  // const data = await request.formData();
  // const file: File | null = data.get('file') as unknown as File;
  const formData = await request.formData();
  const file = formData.get('file') as unknown as File;
  const { name, type } = file;
  // const data = await file.arrayBuffer();
  const data = await file.arrayBuffer();
  const buffer = Buffer.from(data);

  if (!file) {
    return NextResponse.json({ success: false })
  }

  // const { name, type } = file;
  // const fileData = await file.arrayBuffer();

  const s3client = new S3Client({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  const id = uniqid();
  const ext = name.split('.').slice(-1)[0];
  const newName = id + '.' + ext;

  try {
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Body: buffer,
      ACL: 'public-read',
      ContentType: type,
      Key: newName,
    });
    await s3client.send(uploadCommand);

  } catch (error) {
    console.log("error insse s30", error);
  }
  return NextResponse.json({ name, ext, newName, id });
}
