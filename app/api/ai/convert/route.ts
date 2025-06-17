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
        throw new Error('無法轉換題目');
      }

      console.log('🔍 OpenAI 原始回應:', result);

      // 解析 JSON 回應
      let data;
      try {
        data = JSON.parse(result);
        console.log('🔍 解析後的回應:', data);
      } catch (error) {
        console.error('❌ JSON 解析錯誤:', error);
        return NextResponse.json({ error: '題目格式錯誤' }, { status: 400 });
      }

      // 確保回傳的是題目陣列
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('回傳格式錯誤');
      }

      // 驗證每個題目的格式
      data.questions.forEach((q: any, index: number) => {
        if (!q.type || !q.content) {
          throw new Error(`第 ${index + 1} 題格式錯誤`);
        }

        // 根據題型驗證必要欄位
        switch (q.type) {
          case '單選題':
            if (!Array.isArray(q.options) || typeof q.answer !== 'number') {
              throw new Error(`第 ${index + 1} 題（單選題）格式錯誤`);
            }
            break;
          case '多選題':
            if (!Array.isArray(q.options) || !Array.isArray(q.answers)) {
              throw new Error(`第 ${index + 1} 題（多選題）格式錯誤`);
            }
            break;
          case '填空題':
            if (!Array.isArray(q.blanks)) {
              throw new Error(`第 ${index + 1} 題（填空題）格式錯誤`);
            }
            break;
          case '簡答題':
            if (typeof q.answer !== 'string') {
              throw new Error(`第 ${index + 1} 題（簡答題）格式錯誤`);
            }
            break;
          case '閱讀測驗':
            if (!q.article || !Array.isArray(q.questions)) {
              throw new Error(`第 ${index + 1} 題（閱讀測驗）格式錯誤`);
            }
            break;
          case '克漏字':
            if (!q.content || !Array.isArray(q.questions)) {
              throw new Error(`第 ${index + 1} 題（克漏字）格式錯誤`);
            }
            // 檢查每個子題目
            q.questions.forEach((subQ: any, subIndex: number) => {
              // 確保每個空格都有剛好 4 個選項
              if (!Array.isArray(subQ.options) || subQ.options.length !== 4) {
                throw new Error(`第 ${index + 1} 題第 ${subIndex + 1} 個空格必須有 4 個選項`);
              }
              // 確保答案是 0-3 的數字
              if (typeof subQ.answer !== 'number' || subQ.answer < 0 || subQ.answer > 3) {
                throw new Error(`第 ${index + 1} 題第 ${subIndex + 1} 個空格的答案必須是 0-3 的數字`);
              }
              // 確保沒有 content 欄位
              if ('content' in subQ) {
                throw new Error(`第 ${index + 1} 題第 ${subIndex + 1} 個空格不應該有題目內容`);
              }
            });
            break;
          default:
            throw new Error(`第 ${index + 1} 題題型不支援`);
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