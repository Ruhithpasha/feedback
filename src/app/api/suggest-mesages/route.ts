// Import the Google Gemini SDK (official Google AI package)
import { createGoogleGenerativeAI } from '@ai-sdk/google';
// Import Vercel AI SDK utilities for streaming and message handling
import { streamText } from 'ai';

// Initialize Gemini client with API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '',
});

// Use edge runtime for faster cold starts and better performance
export const runtime = 'edge';
// Set maximum duration to 30 seconds (prevents timeout for long responses)
export const maxDuration = 30;

// POST handler - this function runs when someone makes a POST request to this API route
export async function POST(request: Request) {
    try {
        // Define the prompt for generating conversation starter questions
        const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment."
        
        // Call Gemini API to generate three message suggestions
        const result = streamText({
            // Use Google's Gemini 1.5 Flash model (fast and free!)
            model: google('gemini-1.5-flash'),
            // Send the prompt to generate 3 conversation starters
            prompt: prompt,
            // Temperature controls randomness (0.7 = balanced between creative and focused)
            temperature: 0.7,
        });

        // Return the streaming response with 3 suggested messages
        // Response will be in format: "Question 1||Question 2||Question 3"
        return result.toTextStreamResponse();

    } catch (error) {
        // Log the error to the server console for debugging
        console.error('Error fetching DeepSeek response:', error);
        
        // Extract basic error details
        const errorObj = error as any;
        const statusCode = errorObj?.status || 500;
        const errorName = errorObj?.name || 'Error';
        const errorMessage = errorObj?.message || 'Error fetching DeepSeek response';
        
        // Return simple error response
        return Response.json({
            success: false,
            name: errorName,
            message: errorMessage,
            status: statusCode
        }, { 
            status: statusCode,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}