import OpenAI from "openai";

const openai = new OpenAI();
openai.apiKey = process.env.OPENAI_API_KEY || '';

export async function POST(req: Request) {
    try {
        const { transactions } = await req.json();

        if (!transactions || !Array.isArray(transactions)) {
            throw new Error("Invalid transactions format");
        }

        const results = await analyzeCall(transactions);
        return new Response(JSON.stringify({ results }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error("Error processing request:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500
        });
    }
}

async function analyzeCall(log: any[]) {
    const conversationData: any[] = [];
    log.forEach((convo: any) => {
        conversationData.push(`[Speaker:${convo.speaker}] ${convo.transcript}`);
    });

    const conversation = conversationData.join('\n');

    const systemPrompt = `
        You are an expert note taker, sentiment analyst, call evaluator, and call categorization specialist. You will be given a transcript of a call between a customer service agent and a customer. Perform the following tasks:

        1. Summarize the call in 3-4 sentences, if applicable.
        2. Analyze the call and rate the user sentiment on a scale of 'neutral', 'positive' or 'negative'. Your response should follow this format:
           User Sentiment: <neutral, positive or negative>
           Reason: 1-line reason for your decision.
        3. Determine if the call was successful based on the objectives inferred from the system prompt.
        4. Return the tags related to the call among the following: Order Tracking, Order Cancellation, Return Request, Order Exchange, Order Replacement, Warranty Claims, Payment and Refund Status, Policy & FAQs, Customer Details Updation, Pre-purchase Product Query, Tech Issues, Installation & Services, Delivery Delay Communication or none.

        Provide your response in the following format:
        Summary: <summary here>
        User Sentiment: <neutral, positive or negative>
        Reason: <reason here>
        Call Evaluation: <successful or not successful>
        Tags: <comma-separated tags here>
    `;

    const chatHistory: any = [{ role: "system", content: systemPrompt }];
    chatHistory.push({ role: "user", content: conversation });

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
