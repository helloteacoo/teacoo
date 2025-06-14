import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/auth';
import { Question } from '@/app/types/question';
import { v4 as uuidv4 } from 'uuid';

// 檢查 API key 是否存在
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ 環境變數錯誤：缺少 OPENAI_API_KEY');
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

export async function POST(request: Request) {
  try {
    const { text, systemPrompt, example } = await request.json();

    // 呼叫 OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `範例格式：\n${example}\n\n請轉換以下題目：\n${text}`
        }
      ]
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error('OpenAI 回應為空');
    }

    console.log('🔍 OpenAI 原始回應:', result);

    // 解析 JSON 回應
    const parsedResult = JSON.parse(result);
    console.log('🔍 解析後的回應:', parsedResult);

    const now = new Date().toISOString();

    // 確保回應是陣列
    const rawQuestions = Array.isArray(parsedResult) ? parsedResult : 
                        Array.isArray(parsedResult.questions) ? parsedResult.questions : 
                        [parsedResult];

    console.log('🔍 處理前的題目:', rawQuestions);

    // 添加必要欄位
    const questions = rawQuestions.map((q: Record<string, any>) => {
      console.log('🔍 處理題目:', q);
      return {
        ...q,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
        tags: q.tags || [],
        explanation: q.explanation || ''
      };
    });

    console.log('🔍 最終題目:', questions);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('AI 轉換錯誤:', error);
    return NextResponse.json(
      { error: '轉換失敗' },
      { status: 500 }
    );
  }
} 