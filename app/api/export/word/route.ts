import { NextResponse } from 'next/server';
import { generateWordDocument } from '@/app/lib/utils/exportWord';
import { Question } from '@/app/types/question';

export async function POST(request: Request) {
  try {
    const { questions } = await request.json() as { questions: Question[] };
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: '沒有選擇題目' }, { status: 400 });
    }

    const buffer = await generateWordDocument(questions);
    
    // 生成檔名：Teacoo_YYYYMMDD_HHMM_Q{題目數}.docx
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const filename = `Teacoo_${year}${month}${day}_${hours}${minutes}_Q${questions.length}.docx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=${filename}`
      }
    });
  } catch (error) {
    console.error('Error generating Word document:', error);
    return NextResponse.json(
      { error: '生成文件時發生錯誤' },
      { status: 500 }
    );
  }
} 