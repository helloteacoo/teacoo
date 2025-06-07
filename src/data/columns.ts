import { ColDef, ISetFilterParams } from 'ag-grid-community';

type QuestionRow = {
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

const defaultColConfig: Partial<ColDef<QuestionRow>> = {
  sortable: true,
  filter: 'agSetColumnFilter',
  filterParams: {
    buttons: ['apply', 'reset'],
    closeOnApply: true,
    suppressMiniFilter: false
  },
  headerClass: 'ag-header-cell-center',
  resizable: true,
  minWidth: 80,
  flex: 1
};

export const columnDefs: ColDef<QuestionRow>[] = [
  { ...defaultColConfig, field: 'id', headerName: 'Question ID', minWidth: 100, flex: 0.8 },
  { ...defaultColConfig, field: 'article', headerName: 'Article', minWidth: 150, flex: 2 },
  { ...defaultColConfig, field: 'content', headerName: 'Question', minWidth: 150, flex: 2 },
  { ...defaultColConfig, field: 'option1', headerName: 'Option 1', minWidth: 120, flex: 1 },
  { ...defaultColConfig, field: 'option2', headerName: 'Option 2', minWidth: 120, flex: 1 },
  { ...defaultColConfig, field: 'option3', headerName: 'Option 3', minWidth: 120, flex: 1 },
  { ...defaultColConfig, field: 'option4', headerName: 'Option 4', minWidth: 120, flex: 1 },
  { ...defaultColConfig, field: 'answer', headerName: 'Answer', minWidth: 80, flex: 0.8 },
  { ...defaultColConfig, field: 'tag1', headerName: 'tag 1', minWidth: 80, flex: 0.8 },
  { ...defaultColConfig, field: 'tag2', headerName: 'tag 2', minWidth: 80, flex: 0.8 },
  { 
    ...defaultColConfig, 
    field: 'tag3', 
    headerName: 'tag 3', 
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    resizable: false,
    suppressSizeToFit: true,
    flex: undefined
  }
];
