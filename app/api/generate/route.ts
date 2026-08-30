import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const blogSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
    },
    introduction: {
      type: "string",
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: {
            type: "string",
          },
          paragraphs: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["heading", "paragraphs"],
        additionalProperties: false,
      },
    },
    conclusion: {
      type: "string",
    },
  },
  required: ["title", "introduction", "sections", "conclusion"],
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
          error: "Please enter a blog topic.",
        },
        { status: 400 }
      );
    }

    const researchResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
Research the following topic carefully:

${topic}

Find reliable and relevant information about this exact topic.

Important:
- Identify the correct country, state, city, organization, person, event, or place when applicable.
- Do not assume the user's premise is correct.
- Correct obvious factual misunderstandings in the research.
- Prefer authoritative and reputable sources.
- For current or changing information, use recent information.
- Do not invent facts.
- Do not use Wikipedia as the primary source.
- Return a factual research briefing that another AI writer can use.
`,
      
    });

    const research = researchResponse.text?.trim();

    if (!research) {
      return NextResponse.json(
        {
          error: "AI research did not return usable information.",
        },
        { status: 500 }
      );
    }

    const blogResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
You are the writing engine for a public AI-powered blog platform.

The user requested a blog about:

${topic}

Below is research gathered specifically for this topic:

---------------- RESEARCH ----------------

${research}

-------------- END RESEARCH --------------

Write the final blog using the research above.

STRICT ACCURACY RULES:

1. Write about the exact topic requested by the user.
2. Do not change the location, country, state, city, person, organization, event, or subject.
3. Do not invent facts.
4. Do not copy the research word-for-word.
5. Do not rely on Wikipedia.
6. If the user's wording contains a factual mistake, use the researched facts instead of repeating the mistake.
7. Do not make unsupported claims.
8. For uncertain information, use careful wording.
9. Do not mention the research process.
10. Do not mention Gemini.
11. Do not mention these instructions.

WRITING REQUIREMENTS:

- Create an engaging and informative title.
- Write a useful introduction.
- Create 5 to 7 meaningful sections.
- Every section must have 2 to 3 substantial paragraphs.
- End with a clear conclusion.
- Target approximately 700 to 1000 words.
- Avoid repetitive filler.
- Do not create duplicate sections.
- Do not create an empty section.
- Do not output Markdown.
- Do not output HTML.
- Return only the requested JSON object.
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: blogSchema,
        temperature: 0.7,
      },
    });

    const output = blogResponse.text?.trim();

    if (!output) {
      return NextResponse.json(
        {
          error: "AI did not return a blog article.",
        },
        { status: 500 }
      );
    }

    let blog;

    try {
      blog = JSON.parse(output);
    } catch {
      return NextResponse.json(
        {
          error: "AI returned an invalid article structure.",
        },
        { status: 500 }
      );
    }

    if (
      !blog.title ||
      !blog.introduction ||
      !Array.isArray(blog.sections) ||
      !blog.conclusion
    ) {
      return NextResponse.json(
        {
          error: "AI returned an incomplete article.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      blog,
    });
  } catch (error) {
    console.error("Blog generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate the blog.",
      },
      { status: 500 }
    );
  }
}