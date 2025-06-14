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
    return data.questions.map((q: any) => ({
      ...q,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      tags: q.tags || [],
      explanation: q.explanation || '',
      // 根據題型設置預設值
      ...(q.type === '單選題' && {
        options: q.options || [],
        answer: typeof q.answer === 'string' ? 
          q.options.findIndex((opt: string) => opt === q.answer) : 
          q.answer || 0
      }),
      ...(q.type === '多選題' && {
        answers: q.answers || []
      }),
      ...(q.type === '填空題' && {
        blanks: q.blanks || []
      }),
      ...(q.type === '簡答題' && {
        answer: q.answer || ''
      }),
      ...(q.type === '閱讀測驗' && {
        article: q.article || '',
        questions: (q.questions || []).map((subQ: any) => ({
          id: uuidv4(),
          content: subQ.content,
          options: subQ.options,
          answer: subQ.answer,
          explanation: subQ.explanation || ''
        }))
      })
    }));
  } catch (error) {
    console.error('AI 轉換錯誤:', error);
    throw error;
  }
} 