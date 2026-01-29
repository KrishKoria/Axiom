import { NextResponse } from "next/server";
import { z } from "zod";
import { generateText, Output } from "ai";
import { auth } from "@clerk/nextjs/server";
import { anthropic } from "@/lib/utils";
const suggestionSchema = z.object({
  suggestion: z
    .string()
    .describe(
      "The code snippet to insert at cursor, or empty string if no suggestion/completion is needed.",
    ),
});

const SUGGESTION_PROMPT = `You are a code suggestion assistant that provides inline completions.

<context>
<file_name>{fileName}</file_name>
<previous_lines>
{previousLines}
</previous_lines>
<current_line number="{lineNumber}">{currentLine}</current_line>
<before_cursor>{textBeforeCursor}</before_cursor>
<after_cursor>{textAfterCursor}</after_cursor>
<next_lines>
{nextLines}
</next_lines>
<full_code>
{code}
</full_code>
</context>

<instructions>
Analyze the cursor position and provide a completion suggestion.

1. Look at before_cursor - this is what the user has typed so far on the current line.

2. If the current line appears incomplete (e.g., a property without a type, an incomplete statement, a function signature without body), provide the completion.

3. Return empty string ONLY if:
   - The line is already complete (ends with ;, }, or ))
   - The cursor is at the end of a fully-formed statement
   - There is nothing meaningful to suggest

4. Your suggestion will be inserted at the cursor position. Only suggest NEW code - never repeat what's already in before_cursor or after_cursor.

5. Keep suggestions concise - complete the current statement or add the next logical piece.
</instructions>`;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }
    const {
      fileName,
      code,
      currentLine,
      previousLines,
      textBeforeCursor,
      textAfterCursor,
      nextLines,
      lineNumber,
    } = await request.json();
    if (!code) {
      return NextResponse.json(
        {
          error: "Code is Required",
        },
        { status: 400 },
      );
    }
    const prompt = SUGGESTION_PROMPT.replace("{fileName}", fileName)
      .replace("{code}", code)
      .replace("{currentLine}", currentLine)
      .replace("{previousLines}", previousLines || "")
      .replace("{textBeforeCursor}", textBeforeCursor)
      .replace("{textAfterCursor}", textAfterCursor)
      .replace("{nextLines}", nextLines || "")
      .replace("{lineNumber}", lineNumber.toString());

    const { output } = await generateText({
      model: anthropic("claude-3-5-haiku-latest"),
      output: Output.object({ schema: suggestionSchema }),
      prompt,
    });

    return NextResponse.json({ suggestion: output.suggestion });
  } catch (error) {
    console.error("Error generating suggestion:", error);
    return NextResponse.json(
      {
        error: "Failed to generate suggestion",
      },
      { status: 400 },
    );
  }
}
