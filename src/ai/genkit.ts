
import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/googleai'; // No longer using GoogleAI directly for tips

// We are using a direct fetch call to OpenRouter in the flow,
// so no specific Genkit plugin for OpenRouter is configured here.
// Genkit is still used for defining flows and schemas.
export const ai = genkit({
  plugins: [
    // If you had other Genkit plugins, they would go here.
    // For OpenRouter via fetch, no plugin is needed in this specific setup.
  ],
  // Model configuration is not set globally if using direct fetch.
  // It will be specified in the fetch call.
});
