export type QuestionRow = {
  id: number;
  content: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  article: string;
  answer: string;
  tag1: string;
  tag2: string;
  tag3: string;
};

export interface DataGridProps {
  data: QuestionRow[];
  onCellClicked?: (value: string) => void;
  onGridReady?: () => void;
} 