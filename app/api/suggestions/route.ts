import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const suggestionsSchema = {
  type: "object",
  properties: {
    titles: {
      type: "array",
      items: {
        type: "string",
      },
    },
    headings: {
      type: "array",
      items: {
        type: "string",
      },
    },
    keywords: {
      type: "array",
      items: {
        type: "string",
      },
    },
    ideas: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: ["titles", "headings", "keywords", "ideas"],
  additionalProperties: false,
};

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const topic = body?.topic?.trim();

    if (!topic) {
      return NextResponse.json(
        {
          error: "Please enter a topic.",
        },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `
You are an AI content planning assistant for a blog platform.

The user wants to write a blog about:

${topic}

Generate useful content suggestions specifically for this topic.

Requirements:

- Provide 5 engaging blog titles.
- Provide 6 useful section headings.
- Provide 10 relevant SEO keywords.
- Provide 5 practical content ideas or angles.
- Keep every suggestion directly related to the requested topic.
- Do not use unrelated examples.
- Do not invent specific facts.
- Do not rely on Wikipedia.
- Keep suggestions natural and useful for a human writer.
- Return only the requested JSON object.
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionsSchema,
      },
    });

    const output = response.text?.trim();

    if (!output) {
      return NextResponse.json(
        {
          error: "AI did not return suggestions.",
        },
        { status: 500 }
      );
    }

    let suggestions;

    try {
      suggestions = JSON.parse(output);
    } catch {
      return NextResponse.json(
        {
          error: "AI returned an invalid suggestions format.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      suggestions,
    });
  } catch (error) {
    console.error("Suggestions error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate suggestions.",
      },
      { status: 500 }
    );
  }
}