import fs from "fs";
import path from "path";
import { createClient } from "@deepgram/sdk";

export async function POST(req: Request) {
    const data = await req.formData();
    const file = data.get('file') as File;
    const tempDir = path.join(process.cwd(), 'temp');
    
    // Ensure the temp directory exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const filePath = path.join(tempDir, file.name);
    // const filePath = path.join(process.cwd(), 'src/assets/call_recordings/english.mp3');


    // Write the uploaded file to the temp directory
    fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

    try {
        const deepgramApiKey = process.env.DEEPGRAM_API_KEY ?? '';
        const deepgram = createClient(deepgramApiKey);

        const fileBuffer = fs.readFileSync(filePath);

        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            fileBuffer,
            {
                model: 'nova-2',
                language: 'en-IN',
                smart_format: true, 
                punctuate: true, 
                utterances: true, 
                utt_split: 0.8, 
                keywords: ['Jeeva:5', 'Silver:5', 'Jewelery:5', 'GIVA:2', 'Jiva:3'], 
                diarize: true, 
                filler_words: true,
            },
        );
        // console.log(result)

        if (error) {
            console.error('Deepgram API error:', error);
            fs.unlinkSync(filePath);
            return new Response(JSON.stringify(`Deepgram API error: ${error.message}`), { status: 500 });
        }

        const formattedResult:any = result.results.utterances?.map(
            (utterance: any) => `[Speaker:${utterance.speaker}] ${utterance.transcript}`
        ).join('\n');
        console.log(formattedResult);
        fs.unlinkSync(filePath);
        return new Response(formattedResult, {
            headers: { 'Content-Type': 'text/plain' },
        });
    } catch (error: any) {
        console.error('Error transcribing file:', error);
        return new Response(JSON.stringify(`Transcription failed: ${error.message}`), { status: 500 });
    }
}
