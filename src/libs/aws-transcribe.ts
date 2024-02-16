import { TranscribeClient, StartTranscriptionJobCommand, LanguageCode, MediaFormat } from '@aws-sdk/client-transcribe';

function getClient(): TranscribeClient {
  return new TranscribeClient({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_DEMO as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_DEMO as string,
    },
  });
}

export const transcribeVideo = async (videoUrl: string) => {
  const params = {
    LanguageCode: LanguageCode.EN_US, // Replace with the desired language code
    Media: { MediaFileUri: videoUrl },
    MediaFormat: MediaFormat.MP4, // Replace with your video format
    TranscriptionJobName: "nocaption", // Replace with a job name
  };
  console.log("video url: ", videoUrl);

  try {
    const transcribeClient = getClient();
    const command = new StartTranscriptionJobCommand(params);
    console.log("command", command);

    const response = await transcribeClient.send(command);
    console.log("response", response);

    console.log('Transcription job started:', response);
  } catch (error) {
    console.error('Error transcribing video:', error);
  }
};