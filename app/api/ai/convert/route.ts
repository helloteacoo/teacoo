import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/auth';

// 檢查 API key 是否存在
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ 環境變數錯誤：缺少 OPENAI_API_KEY');
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

export async function POST(req: NextRequest) {
  try {
    // 解析請求內容
    let body;
    try {
      body = await req.json();
      console.log('📝 收到請求內容:', body);
    } catch (e) {
      console.error('❌ JSON 解析錯誤:', e);
      return NextResponse.json(
        { message: '無效的 JSON 格式' },
        { status: 400 }
      );
    }

    // 驗證必要欄位
    const { text, type } = body;
    if (!text || !type) {
      console.error('❌ 缺少必要欄位:', { text: !!text, type: !!type });
      return NextResponse.json(
        { message: '缺少必要欄位：text 或 type' },
        { status: 400 }
      );
    }

    // 檢查文字長度
    if (text.length > 1500) {
      console.error('❌ 文字長度超過限制:', text.length);
      return NextResponse.json(
        { message: '文字長度超過 1500 字元限制' },
        { status: 400 }
      );
    }

    console.log('🚀 開始呼叫 OpenAI API');

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "你是一個專業的題目轉換助手。請將輸入的文字轉換成結構化的題目，並以 JSON 格式回傳。"
          },
          {
            role: "user",
            content: `請將以下文字轉換成 ${type} 格式的題目：\n\n${text}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = completion.choices[0].message.content;
      if (!result) {
        console.error('❌ OpenAI 回應為空');
        throw new Error('Empty response from OpenAI');
      }

      console.log('✅ OpenAI 回應成功:', result);

      // 嘗試解析 JSON
      try {
        const jsonResult = JSON.parse(result);
        return NextResponse.json(jsonResult);
      } catch (e) {
        console.error('❌ JSON 解析錯誤:', e);
        return NextResponse.json(
          { message: 'OpenAI 回應格式錯誤', detail: result },
          { status: 500 }
        );
      }

    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        console.error('❌ OpenAI API 錯誤:', {
          status: error.status,
          message: error.message,
          type: error.type
        });
        return NextResponse.json(
          { message: 'OpenAI API 錯誤', detail: error.message },
          { status: error.status || 500 }
        );
      }
      throw error; // 重拋其他錯誤
    }

  } catch (error) {
    console.error('❌ 未預期的錯誤:', error);
    return NextResponse.json(
      { message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
} 