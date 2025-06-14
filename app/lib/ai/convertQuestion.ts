import { Question } from "@/app/types/question";
import { CONVERT_SYSTEM_PROMPT, CONVERT_EXAMPLE } from "@/app/lib/ai/convertPrompt";

export async function convertToQuestion(text: string): Promise<Question> {
  try {
    const response = await fetch("/api/ai/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        systemPrompt: CONVERT_SYSTEM_PROMPT,
        example: CONVERT_EXAMPLE,
      }),
    });

    if (!response.ok) {
      throw new Error("轉換失敗");
    }

    const data = await response.json();
    
    // 檢查是否有錯誤
    if (data.error) {
      throw new Error(data.error);
    }

    // 取得第一個題目
    if (!data.questions || !data.questions.length) {
      throw new Error("轉換失敗：沒有收到題目");
    }

    return data.questions[0];
  } catch (error) {
    console.error("轉換失敗:", error);
    throw error;
  }
} 