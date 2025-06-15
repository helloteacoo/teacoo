import type { Question } from '@/app/types/question';
import { v4 as uuidv4 } from 'uuid';

export const CONVERT_SYSTEM_PROMPT = `你是一個考題格式專家，請將以下原始文字轉換成題目資料。請使用 JSON 格式，不要解釋。

支援題型：
1. 單選題：
   - type: "單選題"
   - content: 題目內容
   - options: 選項陣列
   - answer: 正確答案的索引 (0-3)

2. 多選題：
   - type: "多選題"
   - content: 題目內容
   - options: 選項陣列
   - answers: 正確答案的索引陣列 (例如：[0, 2] 表示 A 和 C 都是正確答案)

3. 填空題：
   - type: "填空題"
   - content: 題目內容（不需要包含 [[]]）
   - blanks: 答案陣列

4. 簡答題：
   - type: "簡答題"
   - content: 題目內容
   - answer: 答案文字

5. 閱讀測驗：
   - type: "閱讀測驗"
   - content: 題目標題
   - article: 文章內容
   - questions: 子題目陣列，每個子題目包含：
     * content: 題目內容
     * options: 選項陣列
     * answer: 正確答案文字

可選欄位：
- explanation: 解釋（選填）

請根據輸入文字的格式，自動判斷題型並轉換成對應的 JSON 格式。
如果答案包含多個選項（例如：A、B、D），請將題目視為多選題。
請不要自動生成標籤，標籤將由使用者自行選擇。`;

export const CONVERT_EXAMPLE = `輸入範例：
關於 Teacoo，下列敘述何者為真？
(A) 其實單選題可以當成是非題來使用，簡答題也可以用來出翻譯
(B) 新增題目時，不一定要輸入"解釋"也沒關係
(C) 可以利用這個平台派送趣味又有互動性的課堂遊戲
(D) 在新增題目時加上的標籤，都會出現在篩選區
答案：A、B、D

輸出範例：
{
  "type": "多選題",
  "content": "關於 Teacoo，下列敘述何者為真？",
  "options": [
    "其實單選題可以當成是非題來使用，簡答題也可以用來出翻譯",
    "新增題目時，不一定要輸入"解釋"也沒關係",
    "可以利用這個平台派送趣味又有互動性的課堂遊戲",
    "在新增題目時加上的標籤，都會出現在篩選區"
  ],
  "answers": [0, 1, 3],
  "explanation": ""
}`;

export async function convertQuestionsWithAI(rawText: string): Promise<Question[]> {
  try {
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
      throw new Error('轉換失敗');
    }

    const data = await response.json();
    const now = new Date().toISOString();

    // 確保每個題目都有必要的欄位
    return data.questions.map((q: any) => {
      // 基本資料
      const baseQuestion = {
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
        tags: q.tags || [],
        explanation: q.explanation || '',
        content: q.content || '',
        type: q.type || '單選題'
      };

      // 根據題型處理特定欄位
      switch (q.type) {
        case '單選題': {
          const options = Array.isArray(q.options) ? q.options : [];
          let answer = 0;
          if (typeof q.answer === 'string') {
            // 如果答案是字串（例如 'A'），轉換成索引
            answer = q.answer.charCodeAt(0) - 'A'.charCodeAt(0);
          } else if (typeof q.answer === 'number') {
            answer = q.answer;
          }
          return {
            ...baseQuestion,
            type: '單選題',
            options,
            answer: answer >= 0 && answer < options.length ? answer : 0
          };
        }

        case '多選題': {
          const options = Array.isArray(q.options) ? q.options : ['', '', '', ''];
          let answers: number[] = [];
          
          if (Array.isArray(q.answers)) {
            answers = q.answers
              .map((ans: any) => {
                if (typeof ans === 'number') return ans;
                if (typeof ans === 'string') {
                  // 如果是字母（A, B, C...），轉換為數字
                  if (/^[A-Z]$/.test(ans)) {
                    return ans.charCodeAt(0) - 65;
                  }
                  // 如果是數字字串，轉換為數字
                  const num = parseInt(ans, 10);
                  return isNaN(num) ? -1 : num;
                }
                return -1;
              })
              .filter((index: number) => index >= 0 && index < options.length);
          }

          // 如果沒有有效答案，設置預設值
          if (answers.length === 0) {
            answers = [0];
          }

          console.log('處理多選題:', {
            原始選項: q.options,
            處理後選項: options,
            原始答案: q.answers,
            處理後答案: answers
          });

          return {
            ...baseQuestion,
            type: '多選題',
            options,
            answers: answers.sort((a, b) => a - b) // 確保答案索引是排序的
          };
        }

        case '填空題':
          return {
            ...baseQuestion,
            type: '填空題',
            blanks: Array.isArray(q.blanks) ? q.blanks : []
          };

        case '簡答題':
          return {
            ...baseQuestion,
            type: '簡答題',
            answer: q.answer || ''
          };

        case '閱讀測驗':
          return {
            ...baseQuestion,
            type: '閱讀測驗',
            article: q.article || '',
            questions: (q.questions || []).map((subQ: any) => ({
              id: uuidv4(),
              content: subQ.content || '',
              options: Array.isArray(subQ.options) ? subQ.options : ['', '', '', ''],
              answer: typeof subQ.answer === 'string' ? subQ.answer : '',
              explanation: subQ.explanation || ''
            }))
          };

        default:
          return baseQuestion;
      }
    });
  } catch (error) {
    console.error('AI 轉換錯誤:', error);
    throw error;
  }
} 