import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
const CRM_RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        records: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    created_at: { type: 'STRING', description: 'Normalized convertible date string.' },
                    name: { type: 'STRING' },
                    email: { type: 'STRING' },
                    country_code: { type: 'STRING', description: 'E.g., +91' },
                    mobile_without_country_code: { type: 'STRING' },
                    company: { type: 'STRING' },
                    city: { type: 'STRING' },
                    state: { type: 'STRING' },
                    country: { type: 'STRING' },
                    lead_owner: { type: 'STRING' },
                    crm_status: { 
                        type: 'STRING', 
                        enum: ['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE'] 
                    },
                    data_source: { 
                        type: 'STRING', 
                        enum: ['leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots', 'unknown'] 
                    },
                    crm_note: { type: 'STRING', description: 'General remarks, extra phones, or secondary email listings.' },
                    possession_time: { type: 'STRING' },
                    description: { type: 'STRING' }
                }
            }
        }
    },
    required: ['records']
};

const SYSTEM_PROMPT = `
You are an advanced CRM lead parser. Your goal is to map messy, randomly named arrays of objects extracted from a user's CSV to the GrowEasy structured CRM layout.

STRICT ASSIGNMENT COMPLIANCE RULES:
1. Multiple Contact Info: If a record includes multiple email strings or mobile choices, place the first one inside the designated root field, and append all additional records cleanly into 'crm_note'.
2. Fallback: If an input row cannot offer any realistic approximation for a field, set it to an empty string "" or null.
`;

export async function processBatchWithAI(rawRowsBatch) {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
        try {
            attempt++;
            
            const response = await ai.models.generateContent({
                model: 'gemini-3.1-flash-lite', 
                contents: `Map this unorganized batch data into the target CRM layout format: ${JSON.stringify(rawRowsBatch)}`,
                config: {
                    systemInstruction: SYSTEM_PROMPT, 
                    responseMimeType: 'application/json', 
                    responseSchema: CRM_RESPONSE_SCHEMA, 
                    temperature: 0.1 
                }
            });

            const textResponse = response.text;
            if (!textResponse) {
                throw new Error("Received empty text candidate from Gemini API cluster.");
            }

            const cleanedText = textResponse.replace(/^```json\s*|```$/g, '').trim();
            const parsedResponse = JSON.parse(cleanedText);
            
            return parsedResponse.records || [];

        } catch (error) {
            console.warn(`[Gemini AI Service] Attempt ${attempt} failed: ${error.message}`);
            
            if (attempt >= maxAttempts) {
                throw new Error(`Gemini processing pipeline failed permanently after ${maxAttempts} attempts.`);
            }
            
    
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}