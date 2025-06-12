import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { QuestionType } from '../../types/question';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `你是一個專業的題目轉換助手。你的任務是將輸入的文字轉換成指定格式的題目。

請遵循以下規則：
1. 題目內容應該清晰、完整，並保持原意
2. 選項內容應該明確、互斥
3. 答案必須是選項中的一個
4. 解說應該簡潔明瞭
5. 標籤應該相關且有意義
6. 選項內容不要加上 "A.", "B.", "C.", "D." 等標記，直接寫選項內容

輸出格式：
{
  "type": "單選題" | "填空題" | "簡答題",
  "content": string,  // 題目內容
  "options"?: string[],  // 選項（單選題必須）
  "answer": string,  // 答案（單選題、簡答題必須）
  "answers"?: string[],  // 答案（填空題必須）
  "explanation"?: string,  // 解說（選填）
  "tags": string[]  // 標籤（至少一個）
}`;

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