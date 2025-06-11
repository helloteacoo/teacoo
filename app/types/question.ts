export type QuestionType = '單選題' | '多選題' | '填空題' | '簡答題' | '閱讀測驗' | '克漏字';

export type BaseQuestion = {
  id: string;
  type: QuestionType;
  content: string;
  explanation?: string;
  tags: string[];
};

export type SingleChoiceQuestion = BaseQuestion & {
  type: '單選題';
  options: string[];
  answer: string;
};

export type MultipleChoiceQuestion = BaseQuestion & {
  type: '多選題';
  options: string[];
  answer: string[];
};

export type FillInQuestion = BaseQuestion & {
  type: '填空題';
  answers: string[];
};

export type ShortAnswerQuestion = BaseQuestion & {
  type: '簡答題';
  answer: string;
};

export type SubQuestion = {
  id: string;
  content: string;
  options: string[];
  answer: string;
  explanation?: string;
};

export type ReadingQuestion = BaseQuestion & {
  type: '閱讀測驗';
  article: string;
  questions: SubQuestion[];
};

export type ClozeQuestion = BaseQuestion & {
  type: '克漏字';
  article: string;
  questions: SubQuestion[];
};

export type Question = SingleChoiceQuestion | MultipleChoiceQuestion | FillInQuestion | ShortAnswerQuestion | ReadingQuestion | ClozeQuestion;

export type FormMode = 'single' | 'group'; 