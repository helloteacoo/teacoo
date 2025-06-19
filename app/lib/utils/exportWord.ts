import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat, NumberFormat, Packer } from 'docx';
import { Question } from '@/app/types/question';

function formatAnswer(question: Question): string {
  switch (question.type) {
    case '單選題':
      return `${question.options[question.answer]}`;
    case '多選題':
      return question.answers.map(index => question.options[index]).join('、');
    case '填空題':
      return question.blanks.join('、');
    case '簡答題':
      return question.answer;
    case '閱讀測驗':
      return question.questions.map((q, idx) => 
        `${idx + 1}. ${q.answer}`
      ).join('\n');
    case '克漏字':
      return question.questions.map((q, idx) => 
        `${idx + 1}. ${q.options[q.answer]}`
      ).join('\n');
    default:
      return '';
  }
}

function formatOptions(question: Question): string[] {
  if ('options' in question) {
    return question.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`);
  }
  return [];
}

export async function generateWordDocument(questions: Question[]): Promise<Buffer> {
  const children: Paragraph[] = [];
  let questionNumber = 1;  // 從1開始計數

  questions.forEach((question) => {
    // 題目內容
    children.push(
      new Paragraph({
        text: question.type === '閱讀測驗' ? 
          `${questionNumber}. ${question.content || ''}` :
          `${questionNumber}. ${question.content}`,
        spacing: { after: 200 }
      })
    );

    // 如果是閱讀測驗，加入文章
    if (question.type === '閱讀測驗') {
      children.push(
        new Paragraph({
          text: question.article,
          spacing: { before: 200, after: 200 }
        })
      );

      question.questions.forEach((subQ, subIdx) => {
        children.push(
          new Paragraph({
            text: `(${subIdx + 1}) ${subQ.content}`,
            spacing: { before: 200 }
          })
        );
        subQ.options.forEach((opt, optIdx) => {
          children.push(
            new Paragraph({
              text: `${String.fromCharCode(65 + optIdx)}. ${opt}`,
              indent: { left: 720 }
            })
          );
        });
      });
    }
    // 如果是克漏字，加入子題目
    else if (question.type === '克漏字') {
      question.questions.forEach((subQ, subIdx) => {
        // 第一個選項與題號同一行
        children.push(
          new Paragraph({
            text: `(${subIdx + 1}) ${String.fromCharCode(65)}. ${subQ.options[0]}`,
            spacing: { before: 200 }
          })
        );
        
        // 其餘選項對齊，縮排距離改為 360
        for (let optIdx = 1; optIdx < subQ.options.length; optIdx++) {
          children.push(
            new Paragraph({
              text: `${String.fromCharCode(65 + optIdx)}. ${subQ.options[optIdx]}`,
              indent: { left: 360 }
            })
          );
        }
      });
    }
    // 其他題型的選項
    else {
      const options = formatOptions(question);
      options.forEach(opt => {
        children.push(
          new Paragraph({
            text: opt,
            indent: { left: 360 }
          })
        );
      });
    }

    // 答案
    children.push(
      new Paragraph({
        text: '答案：' + formatAnswer(question),
        spacing: { before: 200 }
      })
    );

    // 解說（如果有）
    if (question.explanation) {
      children.push(
        new Paragraph({
          text: '解說：' + question.explanation,
          spacing: { before: 200 }
        })
      );
    }

    // 加入分隔線（除了最後一題）
    if (questionNumber < questions.length) {
      children.push(
        new Paragraph({
          text: '',
          spacing: { before: 400, after: 400 }
        })
      );
    }

    questionNumber++; // 遞增題號
  });

  const doc = new Document({
    sections: [{
      children: children,
      properties: {}
    }]
  });

  return await Packer.toBuffer(doc);
} 