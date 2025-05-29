import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { APIError, ValidationError } from "@/types/api";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema for generating a word
const generateWordSchema = z.object({
  word: z
    .string()
    .min(1, "Word is required")
    .max(100, "Word cannot be longer than 100 characters")
    .trim(),
});

// Example words to show Claude the style we want
const EXAMPLE_WORDS = `
Examples of how to explain words like you're talking to a friend:

**serendipity**
- Finding something awesome when you weren't even looking for it
- When good stuff happens by pure luck

Examples:
- "I found my favorite coffee shop by serendipity - I was just wandering around lost and stumbled upon it"
- "Meeting my best friend was total serendipity - we accidentally grabbed each other's coffee order"

**procrastinate**
- Putting off stuff you know you should do
- Doing literally anything else instead of the important thing

Examples:
- "I procrastinated on my essay by organizing my entire room instead"
- "Stop procrastinating and just call the dentist already"

**nostalgia**
- That warm feeling when you remember good times from the past
- Missing how things used to be

Examples:
- "Looking at old photos always fills me with nostalgia"
- "Hearing that song brought back so much nostalgia from high school"

**ubiquitous**
- Something that's everywhere you look
- So common you can't escape it

Examples:
- "Smartphones are ubiquitous now - everyone has one"
- "Coffee shops have become ubiquitous in this neighborhood"

**clickbait**
- Content designed to make people click by being dramatic or misleading
- Saying controversial stuff online just to get attention and views

Examples:
- "That headline was total clickbait - the article was nothing like what they promised"
- "YouTubers use clickbait thumbnails to get more views"

**gaslighting**
- Making someone question their own memory or sanity
- Convincing someone they're crazy when they're actually right

Examples:
- "My ex was gaslighting me by saying conversations never happened"
- "Stop gaslighting me - I know what you said yesterday"

**trolling**
- Posting stuff online to make people angry and get reactions
- Saying things you don't even believe just to start arguments

Examples:
- "He's just trolling - ignore the comment"
- "I can tell you're trolling because nobody actually thinks that"
`;

async function fetchWiktionaryDefinitions(
  word: string
): Promise<string | null> {
  try {
    // Using the MediaWiki API for Wiktionary to get page content
    const response = await fetch(
      `https://en.wiktionary.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(word)}&origin=*`,
      {
        headers: {
          "User-Agent": "WordDirectory/1.0 (https://worddirectory.app)",
        },
      }
    );

    if (!response.ok) {
      console.log(
        `Wiktionary API returned ${response.status} for word: ${word}`
      );
      return null;
    }

    const data = await response.json();

    // Extract page content from the response
    if (data?.query?.pages) {
      const pages = Object.values(data.query.pages);
      const page = pages[0] as any;

      // Check if page exists and has content
      if (page && !page.missing && page.extract) {
        // Clean up the extract to focus on definitions
        let extract = page.extract;

        // Remove common Wiktionary formatting and get first few lines
        const lines = extract
          .split("\n")
          .filter((line: string) => line.trim().length > 0);
        const definitionLines = lines.slice(0, 10).join("\n"); // First 10 lines should contain definitions

        return definitionLines || null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching from Wiktionary:", error);
    return null;
  }
}

async function mergeDefinitionsWithClaude(
  word: string,
  existingDefinitions: any[],
  newDefinitions: any[]
) {
  const systemPrompt = `You are an expert dictionary editor who explains words like you're talking to a friend. Your job is to intelligently merge word definitions while maintaining our friendly, conversational style.

STYLE RULES (SUPER IMPORTANT):
1. Write definitions that are super simple and conversational
2. Use everyday language - avoid fancy words or jargon  
3. Make it sound like natural speech, not a textbook
4. Think about how you'd actually explain this word to someone who's never heard it
5. Examples should be full sentences that people actually say

AVOID FANCY WORDS - USE SIMPLE ALTERNATIVES:
- "deliberately" → say "on purpose"
- "irritating" → say "annoying" 
- "controversy" → say "drama" or "arguments"
- "provocative" → say "trying to start trouble"
- "generate" → say "make" or "create"
- "facilitate" → say "help" or "make happen"
- "subsequently" → say "then" or "after that"
- "utilize" → say "use"
- "commence" → say "start"
- "acquire" → say "get"

MERGING RULES:
1. Remove duplicate definitions (choose the better, more conversational version)
2. Add genuinely new definitions that don't exist
3. Improve existing definitions if the new ones are better written or more friendly
4. Handle different contexts (formal vs slang, different meanings, etc.)
5. If a definition sounds too formal or academic, replace it with a friendlier version
6. Prioritize clarity and conversational tone over everything else
7. Maximum 20 total definitions

AIM FOR:
- Conversational tone (like talking to your friend)
- Simple, clear language
- Direct explanations
- How people actually talk
- Straightforward, realistic examples

AVOID:
- Clinical/formal language
- Complex explanations
- Academic tone
- Using big words to explain simple concepts
- Metaphors and analogies
- Flowery or poetic language
- Words that sound like they're from a textbook

Format your response as JSON like this:
{
  "definitions": [
    {
      "text": "definition explanation here",
      "examples": ["example sentence 1", "example sentence 2"]
    }
  ]
}`;

  const userPrompt = `Merge these definitions for the word "${word}":

EXISTING DEFINITIONS:
${existingDefinitions.map((def, i) => `${i + 1}. ${def.text}\nExamples: ${def.examples.map((ex: any) => `"${ex.text}"`).join(", ")}`).join("\n\n")}

NEW DEFINITIONS TO MERGE:
${newDefinitions.map((def, i) => `${i + 1}. ${def.text}\nExamples: ${def.examples.join(", ")}`).join("\n\n")}

Intelligently merge these definitions. Remove duplicates, keep the best versions, add truly new ones. Maintain the conversational tone and make sure all examples are natural and realistic.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 2000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Error merging definitions with Claude:", error);
    throw new Error("Failed to merge definitions");
  }
}

export async function POST(request: Request) {
  try {
    // Get IP address and apply rate limiting
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
    await rateLimit(ip);

    // Parse and validate request body
    const body = await request.json();
    const validationResult = generateWordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid request data",
          status: 400,
          code: "VALIDATION_ERROR",
          errors: validationResult.error.flatten().fieldErrors,
        } satisfies ValidationError,
        { status: 400 }
      );
    }

    const { word } = validationResult.data;

    // Normalize the word (capitalize first letter, lowercase rest)
    const normalizedWord =
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

    // Check if word already exists in database
    const { data: existingWord } = await supabase
      .from("words")
      .select("id")
      .eq("word", normalizedWord)
      .single();

    let existingDefinitions = null;
    if (existingWord) {
      // Fetch existing definitions
      const { data: definitions } = await supabase
        .from("definitions")
        .select(
          `
          id,
          text,
          examples (
            id,
            text
          )
        `
        )
        .eq("word_id", existingWord.id)
        .order("order");

      existingDefinitions = definitions;
    }

    // Fetch official definitions from Wiktionary
    const wiktionaryDefinitions =
      await fetchWiktionaryDefinitions(normalizedWord);

    // Prepare the prompt for Claude
    const systemPrompt = `You are a friendly person explaining words to someone. Your job is to break down words in the simplest, most direct way possible - like you're talking to a friend over coffee.

Key rules:
1. Write definitions that are super simple and conversational
2. Use everyday language - avoid fancy words or jargon  
3. Make it sound like natural speech, not a textbook
4. Think about how you'd actually explain this word to someone who's never heard it
5. For each definition, provide 1-3 realistic examples that feel like real conversations
6. Examples should be full sentences that people actually say

AVOID FANCY WORDS - USE SIMPLE ALTERNATIVES. EXAMPLES:
- "deliberately" → say "on purpose"
- "irritating" → say "annoying" 
- "controversy" → say "drama" or "arguments"
- "provocative" → say "trying to start trouble"
- "generate" → say "make" or "create"
- "facilitate" → say "help" or "make happen"
- "subsequently" → say "then" or "after that"
- "utilize" → say "use"
- "commence" → say "start"
- "acquire" → say "get"

AVOID:
- Clinical/formal language
- Complex explanations
- Academic tone
- Using big words to explain simple concepts
- Metaphors and analogies (like "it's like poking a bear")
- Flowery or poetic language
- Being overly clever or creative
- Words that sound like they're from a textbook

AIM FOR:
- Conversational tone
- Simple, clear language
- Direct explanations
- How people actually talk
- Straightforward examples
- Words you'd use talking to your friend

Format your response as JSON like this:
{
  "definitions": [
    {
      "text": "definition explanation here",
      "examples": ["example sentence 1", "example sentence 2"]
    }
  ]
}`;

    const userPrompt = `Here are some examples of the conversational style I want:

${EXAMPLE_WORDS}

Now explain the word "${normalizedWord}" in the same friendly, conversational style.

${wiktionaryDefinitions ? `Here are the official definitions for reference:\n${wiktionaryDefinitions}` : `I couldn't find official definitions, so use your knowledge of the word.`}

Remember: explain it like you're talking to a friend over coffee. Keep it simple, direct, and conversational. NO metaphors or analogies - just say what the word means in plain English. Use words that regular people actually say - not fancy textbook words like "deliberately" or "irritating".`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Parse Claude's response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    let generatedData;
    try {
      generatedData = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse Claude response:", responseText);
      return NextResponse.json(
        {
          message: "Failed to generate definitions",
          status: 500,
          code: "AI_GENERATION_ERROR",
        } satisfies APIError,
        { status: 500 }
      );
    }

    let finalDefinitions = generatedData.definitions;
    let wasMerged = false;

    // If word exists, merge with existing definitions
    if (existingDefinitions && existingDefinitions.length > 0) {
      try {
        const mergeResult = await mergeDefinitionsWithClaude(
          normalizedWord,
          existingDefinitions,
          generatedData.definitions
        );
        finalDefinitions = mergeResult.definitions;
        wasMerged = true;
      } catch (error) {
        console.error("Error merging definitions:", error);
        // Fall back to just the new definitions if merging fails
        finalDefinitions = generatedData.definitions;
      }
    }

    return NextResponse.json({
      message: wasMerged
        ? "Definitions generated and merged with existing ones"
        : "Word definitions generated successfully",
      data: {
        word: normalizedWord,
        definitions: finalDefinitions,
        source: wiktionaryDefinitions ? "wiktionary" : "ai_knowledge",
        merged: wasMerged,
        existingCount: existingDefinitions ? existingDefinitions.length : 0,
      },
    });
  } catch (error) {
    console.error("[Generate Word API Error]", error);

    if (error instanceof Error) {
      if (error.message === "Too many requests") {
        return NextResponse.json(
          {
            message: "Too many requests. Please slow down.",
            status: 429,
            code: "RATE_LIMIT_EXCEEDED",
          } satisfies APIError,
          {
            status: 429,
            headers: { "Retry-After": "60" },
          }
        );
      }

      if (process.env.NODE_ENV === "development") {
        return NextResponse.json(
          {
            message: error.message,
            status: 500,
            code: "INTERNAL_SERVER_ERROR",
          } satisfies APIError,
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "An error occurred while generating the word",
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
      } satisfies APIError,
      { status: 500 }
    );
  }
}
