import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { QuestionType } from '../../types/question';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a question format converter. Your job is to convert the provided raw text into a structured JSON format based on the original content.

🚫 Do NOT invent new questions or answers.
✅ Only extract and restructure the information from the original input.

===========================================
🔸 For Single Choice Questions (單選題):
===========================================
- The input will contain a question and four options, with the correct answer marked or listed separately.
- Do not modify or rewrite the question or options.
- Remove labels like "A.", "B.", "C." if present in the options.
- Use the original correct answer as-is.
- If an explanation is provided, include it. Otherwise, set explanation to null.

Return format:
{
  "type": "單選題",
  "content": "<question text>",
  "options": ["<option1>", "<option2>", "<option3>", "<option4>"],
  "answer": "<correct option>",
  "explanation": "<explanation text or null>",
  "tags": ["<tag1>", "<tag2>"]
}

===========================================
🔸 For Fill-in-the-Blank Questions (填空題):
===========================================
- The input may contain blanks such as "____", "( )", or bolded answers like **this**.
- You must convert all such blanks or answer placeholders into the format [[answer]].
- If the input already uses **bold**, treat it as an answer and convert to [[...]].
- Do NOT return any format using "____", "( )", or **bold** — only use [[...]].
- Keep the original sentence structure intact.
- The number of answers must match the number of blanks.

EXAMPLE INPUT 1:
"You can combine _____ and _____ to get purple color."
Answer: red, blue

EXAMPLE INPUT 2:
"You can combine **red** and **blue** to get purple color."

BOTH SHOULD OUTPUT:
{
  "type": "填空題",
  "content": "You can combine [[red]] and [[blue]] to get purple color.",
  "answers": ["red", "blue"]
}

Return format:
{
  "type": "填空題",
  "content": "<sentence with [[answer]] for each blank>",
  "answers": ["<answer1>", "<answer2>"]
}
  ⚠️ The use of double square brackets [[answer]] is mandatory. Do not use other formats such as single brackets, parentheses, underscores, or bold text.
`;

export async function POST(request: Request) {
  if (!openai.apiKey) {
    return NextResponse.json(
      { message: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { text, type } = await request.json();

    if (!text || !type) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `請將以下文字轉換成${type}：\n\n${text}`,
        },
      ],
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No result from OpenAI');
    }

    try {
      const parsedResult = JSON.parse(result);
      return NextResponse.json(parsedResult);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', result);
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 