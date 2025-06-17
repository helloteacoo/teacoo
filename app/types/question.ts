export type QuestionType = 
  | '單選題'
  | '多選題'
  | '填空題'
  | '簡答題'
  | '閱讀測驗'
  | '克漏字';

export interface BaseQuestion {
  id: string;
  type: '單選題' | '多選題' | '填空題' | '簡答題' | '閱讀測驗' | '克漏字';
  content: string;
  explanation: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: '單選題';
  options: string[];
  answer: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: '多選題';
  options: string[];
  answers: number[];
}

export interface FillInQuestion extends BaseQuestion {
  type: '填空題';
  blanks: string[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: '簡答題';
  answer: string;
}

export interface SubQuestion {
  id: string;
  content: string;
  options: string[];
  answer: string;
  explanation?: string;
  selectedOptionId?: string;
}

export interface ClozeSubQuestion {
  id: string;
  options: string[];
  answer: string;
  explanation?: string;
  selectedOptionId?: string;
}

export interface ReadingQuestion extends BaseQuestion {
  type: '閱讀測驗';
  article: string;
  questions: SubQuestion[];
}

export interface ClozeQuestion extends BaseQuestion {
  type: '克漏字';
  content: string;  // 包含 __1__, __2__ 等標記的文章
  questions: {
    content?: string;  // 選填，用於顯示額外的題目說明
    options: string[];
    answer: number;
  }[];
}

export type Question = 
  | SingleChoiceQuestion 
  | MultipleChoiceQuestion
  | FillInQuestion 
  | ShortAnswerQuestion 
  | ReadingQuestion 
  | ClozeQuestion;

export type FormMode = 'single' | 'group';

export interface BaseFormData {
  type: QuestionType;
  content: string;
  explanation?: string;
  tags: string[];
}

export interface SingleQuestionFormData extends BaseFormData {
  type: '單選題' | '多選題' | '填空題' | '簡答題';
  options?: string[];
  answer?: string;
}

export interface GroupQuestionFormData extends BaseFormData {
  type: '閱讀測驗' | '克漏字';
  article: string;
  questions: SubQuestion[];
} 