
'use server';

/**
 * @fileOverview Provides personalized tips and suggestions based on habit tracking data using OpenRouter.
 *
 * - getPersonalizedHabitTips - A function that returns personalized habit tips.
 * - PersonalizedHabitTipsInput - The input type for the getPersonalizedHabitTips function.
 * - PersonalizedHabitTipsOutput - The return type for the getPersonalizedHabitTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DEFAULT_OPENROUTER_MODEL = "deepseek/deepseek-chat";

const PersonalizedHabitTipsInputSchema = z.object({
  habitData: z
    .string()
    .describe(
      'A JSON string containing the user habit data. The data should include habit names, completion status, and any notes or observations.'
    ),
  apiKey: z.string().optional().describe('OpenRouter API key provided by the client.'),
  modelName: z.string().optional().describe(`Optional OpenRouter model name. Defaults to ${DEFAULT_OPENROUTER_MODEL} if not provided.`),
  systemPrompt: z.string().optional().describe('Custom system prompt to customize AI behavior.'),
});

export type PersonalizedHabitTipsInput = z.infer<typeof PersonalizedHabitTipsInputSchema>;

const PersonalizedHabitTipsOutputSchema = z.object({
  tips: z
    .array(z.string())
    .describe('An array of personalized tips to improve habit consistency and effectiveness.'),
});

export type PersonalizedHabitTipsOutput = z.infer<typeof PersonalizedHabitTipsOutputSchema>;

// This Genkit prompt definition is not directly used by callOpenRouterAPI
// but is kept for potential future Genkit native integration or tooling.
// The actual prompting logic is within callOpenRouterAPI.
ai.definePrompt({
  name: 'personalizedHabitTipsPrompt', 
  input: {schema: PersonalizedHabitTipsInputSchema},
  output: {schema: PersonalizedHabitTipsOutputSchema},
  prompt: `System: You are an AI habit coach. Analyze the user's habit data.
Provide personalized tips to improve consistency and effectiveness.
Respond ONLY with a valid JSON object. The JSON object should have a single key "tips" which is an array of strings.
For example: {"tips": ["Make sure to drink water first thing in the morning.", "Try breaking down your reading goal into smaller 10-minute chunks."]}

User: Habit Data: {{{habitData}}}
Model Preference (if any): {{{modelName}}}
`,
});


async function callOpenRouterAPI(
    habitDataJson: string,
    clientApiKey?: string,
    clientModelName?: string,
    customSystemPrompt?: string
): Promise<PersonalizedHabitTipsOutput> {
  const apiKeyToUse = clientApiKey || process.env.OPENROUTER_API_KEY;
  const modelToUse = clientModelName || process.env.OPENROUTER_DEFAULT_MODEL || DEFAULT_OPENROUTER_MODEL;

  if (!apiKeyToUse) {
    console.error("OpenRouter API Key is not configured (neither in .env nor provided by client).");
    throw new Error("AI service is not configured. Missing API Key.");
  }

  const defaultSystemMessage = `You are an AI habit coach. Analyze the user's habit data provided by the user. Your goal is to provide actionable, personalized tips to help the user improve their habit consistency and effectiveness.
  Focus on patterns, successes, and areas for improvement evident in the data.
  You MUST respond ONLY with a valid JSON object. This JSON object must conform to the following structure:
  {
    "tips": ["string", "string", ...]
  }
  Do not include any text or explanation outside of this JSON object.`;

  const systemMessage = customSystemPrompt
    ? `${customSystemPrompt}\n\nYou MUST respond ONLY with a valid JSON object. This JSON object must conform to the following structure:\n{\n  "tips": ["string", "string", ...]\n}\nDo not include any text or explanation outside of this JSON object.`
    : defaultSystemMessage;

  const userMessage = `Here is the user's habit data in JSON format:
  ${habitDataJson}

  Please provide personalized tips based on this data, following the JSON structure specified in the system prompt.`;

  const messages = [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage }
  ];

  const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
  // It's good practice to declare these, even if optional for the API, for potential tracking.
  const siteUrl = process.env.OPENROUTER_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:9005");
  const siteName = process.env.OPENROUTER_SITE_NAME || "Habit Tracker";

  // Debug logging
  console.log("Model to use:", modelToUse);
  console.log("Site URL:", siteUrl);
  console.log("Site Name:", siteName);
  console.log("Habit data length:", habitDataJson.length);

  try {
    const requestBody = {
      model: modelToUse,
      messages: messages,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    const response = await fetch(openRouterUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKeyToUse}`,
        "Content-Type": "application/json",
        // Recommended by OpenRouter for attribution/ranking
        "HTTP-Referer": siteUrl,
        "X-Title": siteName
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenRouter API Error (${response.status}) for model ${modelToUse}: ${errorBody}`);
      if (response.status === 401) {
         throw new Error(`OpenRouter API Key is invalid or unauthorized. Status: ${response.status}`);
      }
      throw new Error(`Failed to fetch tips from AI service using model ${modelToUse}. Status: ${response.status}`);
    }

    const responseData = await response.json();
    
    let content = responseData.choices?.[0]?.message?.content;
    if (!content) {
        console.error("OpenRouter response missing content for model", modelToUse, ":", responseData);
        throw new Error("AI service returned an empty response.");
    }

    // Attempt to extract JSON from potentially verbose response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch && jsonMatch[0]) {
        content = jsonMatch[0];
    }

    try {
      const parsedContent = JSON.parse(content);
      const validationResult = PersonalizedHabitTipsOutputSchema.safeParse(parsedContent);
      if (!validationResult.success) {
        console.error("OpenRouter response validation error for model", modelToUse, ":", validationResult.error.flatten());
        console.error("Raw content from AI:", content);
        throw new Error("AI service response did not match expected format.");
      }
      return validationResult.data;
    } catch (e) {
      console.error("Error parsing JSON from OpenRouter response for model", modelToUse, ":", e);
      console.error("Raw content from AI:", content);
      throw new Error("Failed to process response from AI service.");
    }

  } catch (error) {
    console.error("Error calling OpenRouter API for model", modelToUse, ":", error);
    if (error instanceof Error) {
      if ((error as any).name === 'AbortError') {
        throw new Error('AI request timed out');
      }
      throw error; // Re-throw known errors
    }
    throw new Error("An unexpected error occurred while fetching AI tips.");
  }
}


export async function getPersonalizedHabitTips(
  input: PersonalizedHabitTipsInput
): Promise<PersonalizedHabitTipsOutput> {
  return callOpenRouterAPI(input.habitData, input.apiKey, input.modelName, input.systemPrompt);
}

const personalizedHabitTipsFlow = ai.defineFlow(
  {
    name: 'personalizedHabitTipsFlow',
    inputSchema: PersonalizedHabitTipsInputSchema,
    outputSchema: PersonalizedHabitTipsOutputSchema,
  },
  async (input: PersonalizedHabitTipsInput) => {
    return getPersonalizedHabitTips(input);
  }
);
