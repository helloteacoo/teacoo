import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/lib/firebase';
import { Question, MultipleChoiceQuestion, ReadingQuestion } from '@/app/types/question';
import { v4 as uuidv4 } from 'uuid';

// 檢查 API key 是否存在
let openai: OpenAI;

function detectReadingTest(text: string): boolean {
  // 檢查是否有文章段落（超過100字的連續文字）
  const hasLongParagraph = text.split(/\d+\.\s*|\n/).some(part => {
    const cleanText = part.trim().replace(/[A-D]\.\s*[^\n]+/g, '').trim();
    return cleanText.length > 100;
  });

  // 如果沒有長段落，不是閱讀測驗
  if (!hasLongParagraph) {
    return false;
  }

  // 檢查是否有題目格式（數字編號開頭）
  const questionMatches = text.match(/\d+\.\s*[^\n]+/g);
  if (!questionMatches || questionMatches.length === 0) return false;

  // 檢查每個題目是否都有選項格式
  const questionSections = text.split(/\d+\.\s*/).slice(1); // 使用題號分割，並移除第一個空段落
  const hasValidQuestions = questionSections.every(section => {
    const optionMatches = section.match(/[A-D]\.\s*[^\n]+/g);
    return optionMatches ? optionMatches.length >= 2 : false;
  });

  return hasValidQuestions;
}

function detectSingleChoiceQuestion(text: string): boolean {
  // 檢查是否只有一個題目（沒有數字編號）
  const hasNumberedQuestions = text.match(/\d+\.\s*[^\n]+/g);
  if (hasNumberedQuestions && hasNumberedQuestions.length > 1) return false;

  // 檢查是否有選項（A-D）
  const optionMatches = text.match(/[A-D]\.\s*[^\n]+/g);
  if (!optionMatches || optionMatches.length < 2) return false;

  // 檢查是否有正確答案標記
  const hasAnswer = text.includes('正確答案：') || text.includes('### 正確答案：');

  return hasAnswer;
}

function processReadingTest(text: string): ReadingQuestion {
  // 找到第一個題目的位置
  const firstQuestionMatch = text.match(/\d+\.\s*[^\n]+/);
  const firstQuestionIndex = firstQuestionMatch ? text.indexOf(firstQuestionMatch[0]) : text.length;
  
  // 提取文章內容（第一個題目之前的所有內容）
  const article = text.slice(0, firstQuestionIndex).trim();
  
  // 提取所有題目
  const questionTexts = text.slice(firstQuestionIndex)
    .split(/(?=\d+\.\s*)/g) // 在題號前分割
    .filter(q => q.trim()); // 移除空白項目
  
  // 處理題目
  const questions = questionTexts.map(questionText => {
    // 提取題目編號和內容
    const questionMatch = questionText.match(/\d+\.\s*([^\n]+)/);
    const content = questionMatch ? questionMatch[1].trim() : '';
    
    // 提取選項
    const options = questionText.match(/[A-D]\.\s*([^\n]+)/g)?.map(opt => 
      opt.replace(/^[A-D]\.\s*/, '').trim()
    ) || [];
    
    // 提取正確答案
    const answerMatch = questionText.match(/正確答案：.*?([A-D])/);
    const answerLetter = answerMatch ? answerMatch[1] : '';
    const answerIndex = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    const answer = options[answerIndex] || '';
    
    // 提取解釋
    const explanationMatch = questionText.match(/題目解析：\s*([^\n]+)/);
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';
    
    return {
      id: uuidv4(),
      content,
      options,
      answer,
      explanation
    };
  });
  
  return {
    type: '閱讀測驗',
    content: '閱讀理解測驗',
    article,
    questions,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    explanation: ''
  } as ReadingQuestion;
}

export async function POST(request: Request) {
  try {
    // 檢查 API key 是否存在
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ 環境變數錯誤：缺少 OPENAI_API_KEY');
      return NextResponse.json(
        { error: '伺服器設定錯誤：OpenAI API 金鑰未設定' },
        { status: 500 }
      );
    }

    if (!openai) {
      openai = new OpenAI({
        apiKey: apiKey,
      });
    }

    const { text, systemPrompt, example } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: '請提供要轉換的文字' },
        { status: 400 }
      );
    }

    // 檢查題目類型
    const isReadingTest = detectReadingTest(text);
    const isSingleChoice = !isReadingTest && detectSingleChoiceQuestion(text);

    if (isReadingTest) {
      console.log('🔍 檢測到閱讀測驗格式');
      try {
        const readingQuestion = processReadingTest(text);
        return NextResponse.json({ questions: [readingQuestion] });
      } catch (error) {
        console.error('❌ 閱讀測驗處理錯誤:', error);
        return NextResponse.json(
          { error: '閱讀測驗格式處理失敗' },
          { status: 500 }
        );
      }
    }

    if (isSingleChoice) {
      console.log('🔍 檢測到單選題格式');
    }

    // 呼叫 OpenAI API
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const result = completion.choices[0].message.content;
      if (!result) {
        return NextResponse.json(
          { error: '無法轉換題目：AI 回應為空' },
          { status: 500 }
        );
      }

      console.log('🔍 OpenAI 原始回應:', result);

      // 解析 JSON 回應
      let data;
      try {
        data = JSON.parse(result);
        console.log('🔍 解析後的回應:', data);
      } catch (error) {
        console.error('❌ JSON 解析錯誤:', error);
        return NextResponse.json(
          { error: '題目格式錯誤：無法解析 AI 回應' },
          { status: 400 }
        );
      }

      // 確保回傳的是題目陣列
      if (!data.questions || !Array.isArray(data.questions)) {
        return NextResponse.json(
          { error: '題目格式錯誤：回傳的不是題目陣列' },
          { status: 400 }
        );
      }

      // 驗證每個題目的基本結構
      data.questions.forEach((q: any, index: number) => {
        if (!q.type) {
          console.error(`[AI 轉換] 第 ${index + 1} 題格式錯誤:`, q);
          throw new Error(`第 ${index + 1} 題缺少必要欄位（題型）`);
        }

        // 根據題型檢查必要欄位
        switch (q.type) {
          case '閱讀測驗':
            if (!q.article) {
              throw new Error(`第 ${index + 1} 題（閱讀測驗）缺少文章內容`);
            }
            if (!Array.isArray(q.questions) || q.questions.length === 0) {
              throw new Error(`第 ${index + 1} 題（閱讀測驗）缺少子題目`);
            }
            // 檢查每個子題目
            q.questions.forEach((subQ: any, subIndex: number) => {
              if (!subQ.content) {
                throw new Error(`第 ${index + 1} 題的第 ${subIndex + 1} 個子題目缺少題目內容`);
              }
              if (!Array.isArray(subQ.options) || subQ.options.length < 2) {
                throw new Error(`第 ${index + 1} 題的第 ${subIndex + 1} 個子題目選項不足`);
              }
              if (!subQ.answer) {
                throw new Error(`第 ${index + 1} 題的第 ${subIndex + 1} 個子題目缺少答案`);
              }
            });
            break;

          case '克漏字':
            if (!q.content) {
              throw new Error(`第 ${index + 1} 題（克漏字）缺少文章內容`);
            }
            if (!Array.isArray(q.questions) || q.questions.length === 0) {
              throw new Error(`第 ${index + 1} 題（克漏字）缺少空格選項`);
            }
            // 檢查每個空格的選項
            q.questions.forEach((blank: any, blankIndex: number) => {
              if (!Array.isArray(blank.options) || blank.options.length < 2) {
                throw new Error(`第 ${index + 1} 題的第 ${blankIndex + 1} 個空格選項不足`);
              }
              if (typeof blank.answer !== 'number') {
                throw new Error(`第 ${index + 1} 題的第 ${blankIndex + 1} 個空格缺少答案`);
              }
            });
            break;

          default:
            // 一般題型都需要題目內容，但閱讀測驗和克漏字除外
            if (!q.type.match(/^(閱讀測驗|克漏字)$/) && !q.content) {
              throw new Error(`第 ${index + 1} 題缺少題目內容`);
            }
            // 選擇題需要選項
            if ((q.type === '單選題' || q.type === '多選題') && 
                (!Array.isArray(q.options) || q.options.length < 2)) {
              throw new Error(`第 ${index + 1} 題選項不足`);
            }
            // 檢查答案
            if (q.type === '單選題' && typeof q.answer !== 'number' && typeof q.answer !== 'string') {
              throw new Error(`第 ${index + 1} 題缺少答案`);
            }
            if (q.type === '多選題' && (!Array.isArray(q.answers) || q.answers.length === 0)) {
              throw new Error(`第 ${index + 1} 題缺少答案`);
            }
            if (q.type === '填空題' && (!Array.isArray(q.blanks) || q.blanks.length === 0)) {
              throw new Error(`第 ${index + 1} 題缺少填空答案`);
            }
            if (q.type === '簡答題' && !q.answer) {
              throw new Error(`第 ${index + 1} 題缺少答案`);
            }
            break;
        }
      });

      return NextResponse.json(data);
    } catch (error) {
      console.error('❌ OpenAI API 錯誤:', error);
      return NextResponse.json(
        { error: 'AI 服務暫時無法使用' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('❌ 整體處理錯誤:', error);
    return NextResponse.json(
      { error: '轉換失敗' },
      { status: 500 }
    );
  }
} 