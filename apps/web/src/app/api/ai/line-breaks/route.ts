import { Groq } from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const prompt = `You are a text formatting expert for social media content. Your job is to add line breaks to text to make it visually balanced and aesthetically pleasing for TikTok slides.

Rules:
1. Aim for lines that are roughly similar in visual width/length
2. Avoid orphaned words (single words on a line)
3. Break at natural pause points
4. Don't add any extra words or change the text - only add line breaks
6. Return ONLY the text with line breaks, no explanations

Text to format: "${text}"

Formatted text:`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "qwen-qwq-32b",
      temperature: 0.3,
      max_completion_tokens: 1024,
      top_p: 0.9,
      stream: false,
    });

    const formattedText = chatCompletion.choices[0]?.message?.content?.trim();

    if (!formattedText) {
      return NextResponse.json(
        { error: "Failed to format text" },
        { status: 500 }
      );
    }

    return NextResponse.json({ formattedText });
  } catch (error) {
    console.error("Error formatting text:", error);
    return NextResponse.json(
      { error: "Failed to format text" },
      { status: 500 }
    );
  }
}
