import fs from "fs";
import path from "path";
import { createClient } from "@deepgram/sdk";
import OpenAI from "openai";
import { v4 as uuidv4 } from 'uuid';
import { db, bucket, auth } from "@/lib/firebase2";
import Sugar from 'sugar';

const openai = new OpenAI();
openai.apiKey = process.env.OPENAI_API_KEY || '';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        const data = await req.formData();
        const files = data.getAll('files') as File[];
        const sessionID = uuidv4();
        const sessionDir = path.join(process.cwd(), 'uploads', sessionID);

        // Ensure the session directory exists
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }

        const deepgramApiKey = process.env.DEEPGRAM_API_KEY ?? '';
        const deepgram = createClient(deepgramApiKey);

        const results = [];

        for (const file of files) {
            const fileID = uuidv4();
            const filePath = path.join(sessionDir, file.name);

            // Write the uploaded file to the session directory
            fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

            const fileBuffer = fs.readFileSync(filePath);

            const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
                fileBuffer,
                {
                    model: 'nova-2',
                    language: 'hi-Latn',
                    smart_format: true, 
                    punctuate: true, 
                    utterances: true, 
                    diarize: true, 
                    filler_words: true,
                    keywords: ['Jeeva:5', 'Silver:5', 'Jewelery:5', 'GIVA:2', 'Jiva:3'], 
                },
            );

            if (error) {
                console.error('Deepgram API error:', error);
                fs.unlinkSync(filePath);
                return new Response(JSON.stringify({ error: `Deepgram API error: ${error.message}` }), { status: 500 });
            }

            const formattedResult: any = result.results.utterances?.map(
                (utterance: any) => `[Speaker:${utterance.speaker}] ${utterance.transcript}`
            ).join('\n');

            console.log(formattedResult);

            // Analyze the transcription
            const analysisResults = await analyzeCall(formattedResult);

            // Upload audio file to Firebase Storage
            await bucket.upload(filePath, {
                destination: `voice/${fileID}/${file.name}`
            });

            // Get the public URL of the uploaded audio file
            const audioFile = bucket.file(`voice/${fileID}/${file.name}`);
            const [url] = await audioFile.getSignedUrl({
                action: 'read',
                expires: '03-01-2500'
            });

            const timestamp = new Date();
            const date = Sugar.Date.format(timestamp, '%Y-%m-%d %H:%M:%S');
            
            // Save the transcript, analysis, and audio file URL to Firestore
            await db.collection('voice').doc(fileID).set({
                userId: decodedToken.uid, // Use the decoded token UID
                fileName: file.name,
                transcript: formattedResult,
                analysis: analysisResults,
                audioURL: url,
                createdAt: date
            });

            results.push({
                fileID,
                fileName: file.name,
                transcript: formattedResult,
                analysis: analysisResults,
                audioURL: url
            });

            // Clean up the temp file
            fs.unlinkSync(filePath);
        }
        fs.rmdirSync(sessionDir, { recursive: true });

        return new Response(JSON.stringify({ sessionID, results }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error processing request:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}

async function analyzeCall(transcript: string) {
    const systemPrompt = `
        You are an expert note taker, sentiment analyst, call evaluator, and call categorization specialist. You will be given a transcript of a call between a customer service agent and a customer. Perform the following tasks:

        1. Summarize the call in 3-4 sentences, if applicable.
        2. Analyze the call and rate the user sentiment on a scale of 'neutral', 'positive' or 'negative'. Your response should follow this format:
           User Sentiment: <neutral, positive or negative>
           Reason: 1-line reason for your decision.
        3. Determine if the call was successful based on the objectives inferred from the system prompt.
        4. Return the tags related to the call among the following: COD Confirmation, Delivery Delay Communication, NDR (Non delivery reason) Collection, Abandoned cart calling, Feedback/Review Collection or none.

        Provide your response in the following format:
        Summary: <summary here>
        User Sentiment: <neutral, positive or negative>
        Reason: <reason here>
        Call Evaluation: <successful or not successful>
        Tags: <comma-separated tags here>
    `;

    const chatHistory: any = [{ role: "system", content: systemPrompt }];
    chatHistory.push({ role: "user", content: transcript });

    const completion = await openai.chat.completions.create({
        messages: chatHistory,
        model: "gpt-3.5-turbo",
        temperature: 1.1,
        max_tokens: 160
    });

    const response = completion.choices[0].message.content;
    console.log(response);

    // Parse the response to extract the individual results
    const summaryMatch = response?.match(/Summary: (.*)/);
    const sentimentMatch = response?.match(/User Sentiment: (.*)/);
    const reasonMatch = response?.match(/Reason: (.*)/);
    const evaluationMatch = response?.match(/Call Evaluation: (.*)/);
    const tagsMatch = response?.match(/Tags: (.*)/);

    const results = {
        summary: summaryMatch ? summaryMatch[1].trim() : null,
        userSentiment: sentimentMatch ? sentimentMatch[1].trim() : null,
        sentimentReason: reasonMatch ? reasonMatch[1].trim() : null,
        callEvaluation: evaluationMatch ? evaluationMatch[1].trim() : null,
        tags: tagsMatch ? tagsMatch[1].trim() : null
    };

    return results;
}
