import type { Question } from '@/app/types/question';
import { doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const CONVERT_SYSTEM_PROMPT = `You are a question format expert. Convert the input text into question data in JSON format. Do not explain.

Supported Question Types:
1. Single Choice Question:
   - type: "單選題"
   - content: question content
   - options: array of 4 options
   - answer: index of correct answer (0-3)
   - Characteristic: Only one answer is marked (e.g., "答案：A")

2. Multiple Choice Question:
   - type: "多選題"
   - content: question content
   - options: array of 4 options
   - answers: array of correct answer indices (e.g., [0, 2] means A and C are correct)
   - Characteristic: Multiple answers are marked (e.g., "答案：A D" or "答案：A、C、D")

3. Fill in the Blank:
   - type: "填空題"
   - content: question content with blanks
   - blanks: array of answers

4. Short Answer:
   - type: "簡答題"
   - content: question content
   - answer: answer text

5. Cloze Test:
   - type: "克漏字"
   - content: passage with numbered blanks (e.g., ______ (1), ______ (2))
   - questions: array of sub-questions, each containing:
     * options: array of exactly 4 options
     * answer: index of correct answer (0-3, where 0=A, 1=B, 2=C, 3=D)
   - Characteristics:
     * One passage with multiple blanks
     * Each blank has exactly 4 options
     * No sub-question content, only options and answer
     * Each blank has only one correct answer

6. Reading Comprehension:
   - type: "閱讀測驗"
   - article: article content
   - questions: array of sub-questions, each containing:
     * content: question content (required)
     * options: array of 4 options
     * answer: correct answer text
   - Characteristics:
     * One article with multiple questions
     * Each question has its own content
     * Each question has 4 options and one answer

Important Rules:
1. Convert each question in the input text into the corresponding JSON format
2. Response format must be: { "questions": [...array of all questions...] }
3. When determining question type:
   - If the content has numbered blanks like ______ (1) and each blank has 4 options without question content, it's a Cloze Test
   - If there's an article followed by multiple questions with their own content, it's a Reading Comprehension
4. For Cloze Test questions:
   - Keep the original blank markers in the content
   - Each blank must have exactly 4 options
   - Convert letter answers (A, B, C, D) to indices (0, 1, 2, 3)
   - Do not include question content for blanks
5. Do not auto-generate tags, they will be selected by users

Example Input:
Many people enjoy traveling during their free time. It gives them a chance to relax and learn new things. Some people like to visit big cities, while others prefer the quiet of nature. Traveling also helps people understand different ______ (1). Tourists often take ______ (2) to remember the places they have seen.

(1)
A. languages
B. cultures
C. games
D. schools
Answer: B

(2)
A. photos
B. clothes
C. books
D. tickets
Answer: A

Example Output:
{
  "questions": [
    {
      "type": "克漏字",
      "content": "Many people enjoy traveling during their free time. It gives them a chance to relax and learn new things. Some people like to visit big cities, while others prefer the quiet of nature. Traveling also helps people understand different ______ (1). Tourists often take ______ (2) to remember the places they have seen.",
      "questions": [
        {
          "options": ["languages", "cultures", "games", "schools"],
          "answer": 1
        },
        {
          "options": ["photos", "clothes", "books", "tickets"],
          "answer": 0
        }
      ]
    }
  ]
}`;

export const CONVERT_EXAMPLE = `Input:
Many people enjoy traveling during their free time. It gives them a chance to relax and learn new things. Some people like to visit big cities, while others prefer the quiet of nature. Traveling also helps people understand different ______ (1). Tourists often take ______ (2) to remember the places they have seen.

(1)
A. languages
B. cultures
C. games
D. schools
Answer: B

(2)
A. photos
B. clothes
C. books
D. tickets
Answer: A

Output:
{
  "questions": [
    {
      "type": "克漏字",
      "content": "Many people enjoy traveling during their free time. It gives them a chance to relax and learn new things. Some people like to visit big cities, while others prefer the quiet of nature. Traveling also helps people understand different ______ (1). Tourists often take ______ (2) to remember the places they have seen.",
      "questions": [
        {
          "options": ["languages", "cultures", "games", "schools"],
          "answer": 1
        },
        {
          "options": ["photos", "clothes", "books", "tickets"],
          "answer": 0
        }
      ]
    }
  ]
}`;

export async function convertQuestionsWithAI(rawText: string): Promise<Question[]> {
  try {
    console.log('[AI 轉換] 開始轉換文字:', rawText.substring(0, 100) + '...');

    const response = await fetch('/api/ai/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: rawText,
        systemPrompt: CONVERT_SYSTEM_PROMPT,
        example: CONVERT_EXAMPLE,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '無法解析錯誤訊息' }));
      console.error('[AI 轉換] API 回應錯誤:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error
      });
      throw new Error(errorData.error || `AI 服務暫時無法使用 (${response.status})`);
    }

    const data = await response.json();
    console.log('[AI 轉換] API 回應內容:', JSON.stringify(data, null, 2));
    
    // 確保回傳的是題目陣列
    if (!data.questions || !Array.isArray(data.questions)) {
      console.error('[AI 轉換] 回傳格式錯誤:', data);
      throw new Error('AI 回傳格式錯誤：不是題目陣列');
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
          break;
        case '克漏字':
          if (!q.content) {
            throw new Error(`第 ${index + 1} 題（克漏字）缺少文章內容`);
          }
          if (!Array.isArray(q.questions) || q.questions.length === 0) {
            throw new Error(`第 ${index + 1} 題（克漏字）缺少空格選項`);
          }
          break;
        default:
          if (!q.content) {
            console.error(`[AI 轉換] 第 ${index + 1} 題格式錯誤:`, q);
            throw new Error(`第 ${index + 1} 題缺少必要欄位（題型或內容）`);
          }
      }
    });

    const now = new Date().toISOString();

    // 確保每個題目都有必要的欄位
    return data.questions.map((q: any) => {
      try {
        // 為主題目生成 Firebase ID
        const mainQuestionId = doc(collection(db, 'questions')).id;

        const baseQuestion = {
          ...q,
          id: mainQuestionId,
          createdAt: now,
          updatedAt: now,
          tags: q.tags || [],
          explanation: q.explanation || ''
        };

        // 根據題型處理
        switch (q.type) {
          case '單選題':
            return {
              ...baseQuestion,
              options: q.options || [],
              answer: typeof q.answer === 'string' ? 
                q.options.findIndex((opt: string) => opt === q.answer) : 
                q.answer || 0
            };

          case '多選題':
            return {
              ...baseQuestion,
              options: q.options || [],
              answers: Array.isArray(q.answers) ? q.answers : []
            };

          case '填空題':
            return {
              ...baseQuestion,
              blanks: q.blanks || []
            };

          case '簡答題':
            return {
              ...baseQuestion,
              answer: q.answer || ''
            };

          case '閱讀測驗':
            return {
              ...baseQuestion,
              article: q.article || '',
              questions: (q.questions || []).map((subQ: any) => ({
                id: doc(collection(db, 'questions')).id, // 為子題目生成 Firebase ID
                content: subQ.content || '',
                options: Array.isArray(subQ.options) ? subQ.options : ['', '', '', ''],
                answer: typeof subQ.answer === 'string' ? subQ.answer : '',
                explanation: subQ.explanation || ''
              }))
            };

          case '克漏字':
            return {
              ...baseQuestion,
              questions: (q.questions || []).map((subQ: any) => ({
                id: doc(collection(db, 'questions')).id, // 為子題目生成 Firebase ID
                options: Array.isArray(subQ.options) ? subQ.options : ['', '', '', ''],
                answer: typeof subQ.answer === 'number' ? subQ.answer : 0
              }))
            };

          default:
            return baseQuestion;
        }
      } catch (err) {
        const error = err as Error;
        console.error(`[AI 轉換] 處理第 ${q.type || '未知類型'} 題時發生錯誤:`, error);
        throw new Error(`處理題目時發生錯誤：${error.message}`);
      }
    });
  } catch (err) {
    const error = err as Error;
    console.error('[AI 轉換] 發生錯誤:', error);
    // 如果是已經處理過的錯誤，直接拋出
    if (error.message.includes('AI 服務') || 
        error.message.includes('回傳格式') || 
        error.message.includes('第') || 
        error.message.includes('處理題目')) {
      throw error;
    }
    // 其他未預期的錯誤
    throw new Error('AI 服務暫時無法使用');
  }
} 