interface SingleQuestion {
  id: string;
  type: '單選題';
  content: string;
  options: string[];
  answer: string;
  tags: string[];
}

interface GroupQuestion {
  id: string;
  type: '閱讀測驗';
  article: string;
  questions: {
    id: string;
    content: string;
    options: string[];
    answer: string;
  }[];
  tags: string[];
}

export type Question = SingleQuestion | GroupQuestion; 