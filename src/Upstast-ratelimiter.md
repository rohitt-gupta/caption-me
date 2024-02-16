# How to secure your API using Upstash Redis in Nextjs

While workig on a project which requires third party api for different services like AWS, OpenAI, etc it is important to ensure maximum uptime and consistent performance. If the traffic suddenly increase it  might affect the performance or the costing of the API.

For the first few time it is happening it is feasible to just increase the capacity, but when we're running on production it is important to manage the API calls, where we need to build applications on scale and there might be thousands of users hitting your server at the same time. Here the concept of **rate limiting** comes in the picture.

In this article, we will show you how to rate limit a Next.js app using Upstash Redis. We will be rebuilding [CaptionMe](https://caption-me.vercel.app/), an app that generates captions using transcribing servies provided by AWS. We will focus predominantly on how to implement *Upstash rate limiting* with a Redis database. You can checkout the original source code for this project on [GitHub](https://github.com/rohitt-gupta/caption-me).

# Features

1. User will be able to upload a video and transcribe the video.
2. User can edit the text on particular timeframe.
3. User can add custom color and add finalized caption to the video.

# Prerequisites

* An AWS Account with AWS Transcribe API keys. (You can use any other service for transcription like AssemblyAI or OpenAI Whisper)
* [An Upstash Account](https://upstash.com/)
* A NodeJs installation for [Nextjs server](https://nextjs.org/)

# What is Rate Limiting and what is Upstash?

Rate limiting is a technique that controls the rate at which requests are made to a network, server, or other resource. It sets predefined limits on the frequency at which requests can be made. It puts an cap on how often can someone do a particular task - like logging in to an account, etc.

### Upstash

Upstash Provides a powerful rate limiting API that helps you protect your applications from malious users and DDoS attacks. It provides an easy-to-use API that allows you to set limits on the number of requests a user can make to your application.

### Examples of rate limiting

Below are few examples where API limiting can be used.

1. ***To Prevent API Overuse*** -
While building a side project you want to add a pricing to the usage of the app, like upgrade to premium plan to have full access. So here if the user is not a pro user, you can limit the function of your product like you can use this twice a day or 5 times for free.
2. ***Enable Slow mode in your chat applications*** -
 If you hae ever used discord in some servers there is **slowmode enabled** which limits the user to type 2 frequest messages in a particular timeframe. That's ratelimiting.
3. ***Incorrect password block*** -
In some websites, while logging in if you attempt logging with wrong credentials for more than a particular number of tries, you can block the  user and let them try after 24 hours or some time.
4. ***If you expose an API like Twitter or Instagram***-
 If you ever wored with twitter API , when you call their API frequestly, it gives **Rate limit exceeded** error. Here they are useig rate limiting methods for protect their API.

These are some of the examples of how to use rate limiting methods. There is a lot more you can do with these methods to make an scalable application.

## How Upstash Rate Limiter works

Whenever we make an API call, the Upstash Redis DB stores the IP (if your are using the rate limit on IP) and the number of calles we did to the mentioned API config( see in implementation) in a key value data structure and update it with every call we do and they do it at a superfast speed.

>Note: There are many ways you can use rate limiting methods, like on userId, on IP address, on timezone etc.
>In this tutorial we are using **IP address**.

If the limit is exceeded by a particular IP, the ratelimiter returns `success:false`.

Also an expiration date is added when the first entry is made to keep track to time. In our application we are going to make it as
2 API calls per week or 7 days.

# Implementation

### High lever understanding of the flow

In the root level  `page.tsx` create a form with one input for video url and a submit button. The onClick handler for the submit button will trigger the API route `/api/transcribe` with videoUrl in the request.

Inside the API route we have a POST method which extracts the videoUrl and calls the transcribeVideo utils function  from `/utils/aws-transcribe.ts`
![Flow of Caption Me](https://res.cloudinary.com/ddkxvq59f/image/upload/v1697908556/Untitled-2023-10-21-1344_hatkqd.png)

### Set up the project

The first step is to create a Nextjs application in your empty folder.

    npx create-next-app@latest

The above CLI will start the installation of Next Js project. Complete the configuration according to your practice. I am going to use typescript for typesafety and tailwindcss for styling

Install Upstash dependencies

    npm install @upstash/ratelimit @upstash/redis
  Install AWS SDK
  
    @aws-sdk/client-transcribe

### Set up database (Upstash)

   Create a Redis database using the [Upstash Console](https://console.upstash.com/) or the [Upstash CLI](https://github.com/upstash/cli). Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` variables and place them in the `.env.local` file in the root directory of your Next project.

   After all the setup your `.env.local` look like this

    AWS_ACCESS_KEY=<your aws access key>
    AWS_SECRET_ACCESS_KEY=<your aws secret key>
    REDIS_URL=<your redis url>
    REDIS_TOKEN=<your redis token>
  You can get the AWS Secret Key from  [here](https://us-east-1.console.aws.amazon.com/billing/home?region=us-east-1#/account)

### Folder Structure

Below is the folder structure we are going to make for our project.
![Folder structure](https://res.cloudinary.com/ddkxvq59f/image/upload/v1697906047/folder-structure_xtcjfs.png)

# Creating files an logic

### middleware.ts

Create an `middleware.ts` in your src folder if you are using src directory.

In this file we are going to create an instance of redis and ratelimit which we imported from @upstash. This middleware is run between all the api calls. The Upstash's ratelimiter checks the rate limit to all the API routes provided in the config export and returns a bunch of properties -

    const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);

Here you can check if the success is not true then we can redirect the user to a /limit-exceeded page according to your need.

>Note: There are different algorithms for rate limiting like **token bucket, leaky bucket, fixed window, sliding window**, etc. In this application , we are using sliding window.

Below is the middleware.ts file

    import { NextFetchEvent, NextRequest, NextResponse } from  "next/server";
    import { Ratelimit } from  "@upstash/ratelimit";
    import { Redis } from  "@upstash/redis";
    
    const redis = new  Redis({
      url: process.env.REDIS_URL as  string,
      token: process.env.REDIS_TOKEN as  string
    });
    
    const ratelimit = new  Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(2, "7 d"), // 2 API calls per 7 days or per week
    });
    
    export  default  async  function  middleware(
    request: NextRequest,
    event: NextFetchEvent
    ):  Promise<Response  |  undefined>  {
      const ip = request.ip  ??  "127.0.0.1";
      const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
    
      console.log("ARE WE REDIS-IN?");
      console.log("success", success);
    
      // if success true then call next() middleware otherwise redirect to /blocked
      return success
        ? NextResponse.next()
        : NextResponse.redirect(new  URL("/blocked", request.url));
      }
    
      // api/transcribe will be blocked if he limit is exceeded
      // if you have more than one route 
      // matcher: ['/api/route1', '/api/route2/', '/api/route3']
      export  const config = {
        matcher: "/api/transcribe",
        };

### AWS transcribe utility function

create a `/utils/aws-transcribe.ts` file in your project which will be responsible for generating the transcription of provided video url.

    import { TranscribeClient, StartTranscriptionJobCommand, LanguageCode, MediaFormat } from  '@aws-sdk/client-transcribe';
    
    // create a transcribe client
    function  getClient(): TranscribeClient {
     return  new  TranscribeClient({
       region:  'ap-southeast-1', // Replace with your aws region
       credentials: {
         accessKeyId:  process.env.AWS_ACCESS_KEY_DEMO  as  string,
         secretAccessKey:  process.env.AWS_SECRET_ACCESS_KEY_DEMO  as  string,
       },
     });
    }
    
    export  const  transcribeVideo = async (videoUrl: string) => {
      const  params = {
        LanguageCode:  LanguageCode.EN_US, // Replace with the desired language code
        Media: { MediaFileUri:  videoUrl },
        MediaFormat:  MediaFormat.MP4, // Replace with your video format
        TranscriptionJobName:  "nocaption", // Replace with a job name
      };
      
      try {
        const  transcribeClient = getClient();
        const  command = new  StartTranscriptionJobCommand(params);
        const  response = await  transcribeClient.send(command);
        return response;
      } catch (error) {
        console.error('Error transcribing video:', error);
      }
    };

### page.tsx

    // page.tsx
    import  TranscribeForm  from  "../path/to/TranscribeForm"; 
    export  default  function  YourPage() 
    { 
        return ( 
          <div> 
            <h1>Transcribe Video</h1> 
            <TranscribeForm /> 
          </div> 
         ); 
    }

    // TranscribeForm.jsx  
    import { useState } from  "react";
    
    export  default  function  TranscribeForm() {
      const [videoUrl, setVideoUrl] = useState(""); 
      const  handleSubmit = async (e) => { 
        e.preventDefault(); 
        try { 
          const response = await  fetch("/api/transcribe", { 
            method: "POST", 
            headers: { "Content-Type": "application/json", }, 
            body: JSON.stringify({ videoUrl }), 
          }); 
        
          if (response.ok) { 
            // Handle a successful API response here  
            console.log("Transcription request sent successfully!"); 
          } 
          else { 
            // Handle API error here  
            console.error("Transcription request failed"); 
          } 
        } catch (error) { 
            console.error("An error occurred:", error); 
          }
        }; 
       return ( 
         <form onSubmit={handleSubmit}> 
           <label> Video URL: 
             <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} /> 
           </label> 
           <button type="submit">Submit</button> 
         </form> 
       );

### /api/transcribe/route.ts

    // app/api/transcribe.ts  
    import { NextApiRequest, NextApiResponse } from  'next'; 
    
    export  default  async (req: NextApiRequest, res: NextApiResponse) => { 
      if (req.method === 'POST') { 
        try { 
          const { videoUrl } = req.body; 
          console.log('Received video URL:', videoUrl); 
          await  transcribeVideo(videoUrl)
          // the above function will print the result we received from AWS transcribe
          // You can process the video URL here if needed  
          // Return the received video URL in the response  
          
          return res.status(200).json({ videoUrl }); 
        } catch (error) { 
            console.error('An error occurred:', error); 
            return res.status(500).json({ error: 'Internal server error' }); 
          } 
        } 
        else { 
            return res.status(405).json({ error: 'Method not allowed' }); 
        } 
      };

Now the rate limiter has been successfully added to your next js project.

# About the project (and possible next steps)

[Caption me](https://caption-me.vercel.app/) - the project we built in this tutorial is a clone to the [original version](https://github.com/rohitt-gupta/caption-me), where i have added a feature to further edit the captions and add it to the uploaded video which is stored in AWS S3 bucket.

1. Further we can add authentication to the whole app and add a **Rate Limiter** based of userId.
Simply we need to create an identifier of the user if and pass it to the ratelimiter.

    const identifier = userId
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(identifier);

2. Improve the UI -
In this tutorial we have focussed only on the logic building for rate limiting. We can improve the UI for better user experience

3. Show number of attempts remaining
We can show the user, the remaining number of call more he can do before the limit exceeds.

# Conclusion

You can add the Upstash rate limiter to any application to protect you API's. It is very useful tool to create scalable and production ready application which can take on any amount load, now that we have our rate limiter to handle the edge cases.
I hope this tutorial was helpful for you, and you are ready to use **Upstash** rate limiter in your next applications.

# About the Author

[Rohit Gupta](https://twitter.com/whyrohitwhy) is a full stack developer at mroads. Star his repo at [Github](https://github.com/rohitt-gupta/caption-me).
