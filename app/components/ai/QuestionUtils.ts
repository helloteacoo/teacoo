import { Question, SingleChoiceQuestion, MultipleChoiceQuestion, FillInQuestion, ShortAnswerQuestion, ReadingQuestion, ClozeQuestion } from '@/app/types/question';
import { v4 as uuidv4 } from 'uuid';
import i18n from '@/app/i18n';

const getQuestionType = (type: string) => {
  const t = i18n.t;
  return {
    single: t('ai.questionTypes.single'),
    multiple: t('ai.questionTypes.multiple'),
    fillIn: t('ai.questionTypes.fillIn'),
    shortAnswer: t('ai.questionTypes.shortAnswer'),
    reading: t('ai.questionTypes.reading'),
    cloze: t('ai.questionTypes.cloze')
  }[type] || type;
};

export const QUESTION_TYPES = [
  { value: '單選題', label: getQuestionType('single') },
  { value: '多選題', label: getQuestionType('multiple') },
  { value: '填空題', label: getQuestionType('fillIn') },
  { value: '簡答題', label: getQuestionType('shortAnswer') },
  { value: '閱讀測驗', label: getQuestionType('reading') },
  { value: '克漏字', label: getQuestionType('cloze') },
];

export function sanitizeQuestion(raw: any): Question | null {
  try {
    const base = {
      id: raw.id || '',
      content: raw.content || '',
      explanation: raw.explanation || '',
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      type: raw.type || '單選題',
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };

    const previousType = raw.type;
    if (previousType) {
      switch (previousType) {
        case '單選題':
          return {
            ...base,
            type: '單選題',
            options: Array.isArray(raw.options) && raw.options.length > 0 
              ? raw.options 
              : ['', '', '', ''],
            answer: typeof raw.answer === 'number' && raw.answer >= 0 && raw.answer < 4
              ? raw.answer
              : 0
          } as SingleChoiceQuestion;

        case '多選題':
          const options = Array.isArray(raw.options) && raw.options.length > 0
            ? raw.options
            : ['', '', '', ''];
          
          let answers = Array.isArray(raw.answers) 
            ? raw.answers.filter((i: number) => i >= 0 && i < options.length)
            : [];

          answers = answers.map((ans: any) => {
            if (typeof ans === 'number') return ans;
            if (typeof ans === 'string') {
              if (/^[A-Z]$/.test(ans)) {
                return ans.charCodeAt(0) - 65;
              }
              return parseInt(ans, 10);
            }
            return 0;
          }).filter((num: number) => !isNaN(num) && num >= 0 && num < options.length);

          return {
            ...base,
            type: '多選題',
            options,
            answers
          } as MultipleChoiceQuestion;

        case '填空題':
          return {
            ...base,
            type: '填空題',
            blanks: Array.isArray(raw.blanks) ? raw.blanks : []
          } as FillInQuestion;

        case '簡答題':
          return {
            ...base,
            type: '簡答題',
            answer: raw.answer || ''
          } as ShortAnswerQuestion;

        case '閱讀測驗':
          return {
            ...base,
            type: '閱讀測驗',
            article: raw.article || '',
            questions: Array.isArray(raw.questions)
              ? raw.questions.map((q: any) => ({
                  id: q.id || uuidv4(),
                  content: q.content || '',
                  options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
                  answer: typeof q.answer === 'string' ? q.answer : '',
                  explanation: q.explanation || ''
                }))
              : []
          } as ReadingQuestion;

        case '克漏字':
          const questions = Array.isArray(raw.questions)
            ? raw.questions.map((q: any) => ({
                content: q.content || '',
                options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
                answer: typeof q.answer === 'number' ? q.answer : 0
              }))
            : [];

          if (questions.length === 0) {
            const blankCount = (raw.content.match(/(?:\[\[(\d+)\]\])|(?:【(\d+)】)|(?:__(\d+)__)/g) || []).length;
            for (let i = 0; i < blankCount; i++) {
              questions.push({
                content: i18n.t('ai.fields.blank', { number: i + 1 }),
                options: ['', '', '', ''],
                answer: 0
              });
            }
          }

          return {
            ...base,
            type: '克漏字',
            questions
          } as ClozeQuestion;

        default:
          return null;
      }
    }

    return {
      ...base,
      type: '單選題',
      options: ['', '', '', ''],
      answer: 0
    } as SingleChoiceQuestion;
  } catch (error) {
    console.error(i18n.t('ai.convert.errors.formatError'), error);
    return null;
  }
} 