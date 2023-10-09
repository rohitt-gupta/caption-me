import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
	GetTranscriptionJobCommand,
	StartTranscriptionJobCommand,
	TranscribeClient,
} from "@aws-sdk/client-transcribe";

function getClient(): TranscribeClient {
	return new TranscribeClient({
		region: 'ap-southeast-1',
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY as string,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
		},
	});
}

function createTranscriptionCommand(filename: string): StartTranscriptionJobCommand {
	return new StartTranscriptionJobCommand({
		TranscriptionJobName: filename,
		OutputBucketName: process.env.BUCKET_NAME as string,
		OutputKey: filename + ".transcription",
		IdentifyLanguage: true,
		Media: {
			MediaFileUri: "s3://" + process.env.BUCKET_NAME + "/" + filename,
		},
	});
}

async function createTranscriptionJob(filename: string): Promise<any> {
	const transcribeClient = getClient();
	const transcriptionCommand = createTranscriptionCommand(filename);
	return transcribeClient.send(transcriptionCommand);
}

async function getJob(filename: string): Promise<any> {
	const transcribeClient = getClient();
	let jobStatusResult = null;
	try {
		const transcriptionJobStatusCommand = new GetTranscriptionJobCommand({
			TranscriptionJobName: filename,
		});
		jobStatusResult = await transcribeClient.send(transcriptionJobStatusCommand);
	} catch (e) { }
	return jobStatusResult;
}

async function streamToString(stream: any): Promise<string> {
	const chunks: Buffer[] = [];
	return new Promise((resolve, reject) => {
		stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
		stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
		stream.on("error", reject);
	});
}

/**
 * FUnction to get the transcribed file from the s3 ucket if it exists adont create any transcribing job
 * @param filename 
 * @returns 
 */
async function getTranscriptionFile(filename: string): Promise<any> {
	const transcriptionFile = filename + ".transcription";
	const s3client = new S3Client({
		region: "ap-southeast-1",
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY as string,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
		},
	});
	const getObjectCommand = new GetObjectCommand({
		Bucket: process.env.BUCKET_NAME as string,
		Key: transcriptionFile,
	});
	let transcriptionFileResponse = null;
	try {
		transcriptionFileResponse = await s3client.send(getObjectCommand);
	} catch (e) { }
	if (transcriptionFileResponse) {
		return JSON.parse(await streamToString(transcriptionFileResponse.Body));
	}
	return null;
}

export async function GET(req: any): Promise<any> {
	//step 1 : get filename from url
	const url = new URL(req.url);
	const searchParams = new URLSearchParams(url.searchParams);
	const filename = searchParams.get("filename");

	// 2 find ready transcription first in the bucket
	const transcription = await getTranscriptionFile(filename as string);
	if (transcription) {
		return Response.json({
			status: "COMPLETED",
			transcription,
		});
	}

	// check if already transcribing
	const existingJob = await getJob(filename as string);

	// if job existsreturn the status code
	if (existingJob) {
		return Response.json({
			status: existingJob.TranscriptionJob.TranscriptionJobStatus,
		});
	}

	// creating new transcription job
	if (!existingJob) {
		const newJob = await createTranscriptionJob(filename as string);
		return Response.json({
			status: newJob.TranscriptionJob.TranscriptionJobStatus,
		});
	}

	return Response.json(null);
}