import type { Question } from '@/app/types/question';
import { v4 as uuidv4 } from 'uuid';

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
    
    // 確保回傳的是題目陣列
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('回傳格式錯誤');
    }

    const now = new Date().toISOString();

    // 確保每個題目都有必要的欄位
    return data.questions.map((q: any) => ({
      ...q,
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
        options: q.options || [],
        answers: Array.isArray(q.answers) ? q.answers : []
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
          content: subQ.content || '',
          options: Array.isArray(subQ.options) ? subQ.options : ['', '', '', ''],
          answer: typeof subQ.answer === 'string' ? subQ.answer : '',
          explanation: subQ.explanation || ''
        }))
      }),
      ...(q.type === '克漏字' && {
        content: q.content || '',
        questions: (q.questions || []).map((subQ: any) => ({
          content: subQ.content || '',
          options: Array.isArray(subQ.options) ? subQ.options : ['', '', '', ''],
          answer: typeof subQ.answer === 'number' ? subQ.answer : 0
        }))
      })
    }));
  } catch (error) {
    console.error('AI 轉換錯誤:', error);
    throw error;
  }
} 