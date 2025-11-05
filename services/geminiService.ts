import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const model = 'gemini-2.5-pro';

  const audioPart = {
    inlineData: {
      mimeType: mimeType,
      data: audioBase64,
    },
  };

  const textPart = {
    text: 'Please provide a high-quality, verbatim transcript of the attached audio file. Ensure speaker labels are included if discernible (e.g., Speaker 1:, Speaker 2:).'
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [audioPart, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error transcribing audio with Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Audio transcription failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during audio transcription.");
  }
}

export async function generateMinutes(transcript: string, title?: string, time?: string): Promise<string> {
  const model = 'gemini-2.5-pro';

  const prompt = `
    You are an expert meeting assistant tasked with creating professional meeting minutes.
    Based on the following meeting transcript, please generate a concise and well-structured summary.

    The meeting minutes should include the following sections, if the information is available in the transcript:
    1.  **Meeting Title:** ${title ? `Use this exact title: "${title}"` : 'A concise title for the meeting.'}
    2.  **Date:** ${time ? `Use this exact date and time: "${time}"` : 'The date of the meeting (if mentioned, otherwise state "Not Mentioned").'}
    3.  **Attendees:** A list of people present.
    4.  **Key Discussion Points:** A bulleted list of the main topics discussed.
    5.  **Decisions Made:** A numbered list of any decisions that were reached.
    6.  **Action Items:** A table with three columns: "Task", "Assigned To", and "Due Date".

    If any of this information is not present in the transcript, please omit the entire section.
    
    Format the entire output in Markdown for readability. Ensure headings are bold.
    Use proper indentation for bullet points and ensure there is sufficient spacing between sections to enhance readability.

    Here is the transcript:
    ---
    ${transcript}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating minutes with Gemini API:", error);
    if (error instanceof Error) {
        return `Error: Failed to generate minutes. ${error.message}`;
    }
    return "Error: An unknown error occurred while generating minutes.";
  }
}