import type {
  Question,
  SingleChoiceQuestion,
  FillInQuestion,
  ShortAnswerQuestion,
  ReadingQuestion,
  ClozeQuestion,
} from '../types/question';

export const sampleQuestions: Question[] = [
  {
    id: 'sample-single',
    type: '單選題',
    content: '在TeaCoo中，要如何新增一個題目？',
    options: [
      '點擊「新增題目」按鈕',
      '直接在頁面上輸入',
      '從檔案匯入',
      '使用命令列'
    ],
    answer: 0,
    tags: ['使用教學', '基礎功能'],
    explanation: '點擊「新增題目」按鈕，或是「AI出題」按鈕，即可開啟新增題目的表單。',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as SingleChoiceQuestion,

  {
    id: 'sample-fill',
    type: '填空題',
    content: '在TeaCoo中，免費版用戶每個題目最多可以添加 ___ 個標籤，付費版用戶最多可以添加 ___ 個標籤。',
    blanks: ['2', '5'],
    tags: ['使用教學', '權限說明'],
    explanation: '免費版用戶每題最多2個標籤，付費版用戶每題最多5個標籤。',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as FillInQuestion,

  {
    id: 'sample-short',
    type: '簡答題',
    content: '請簡述TeaCoo的主要功能是什麼？',
    answer: 'TeaCoo是一個題目管理系統，可以幫助使用者建立、管理和組織各種類型的題目。系統支援單選題、填空題、簡答題、閱讀測驗和克漏字等多種題型，並提供標籤功能來分類管理題目。',
    tags: ['使用教學', '系統介紹'],
    explanation: '這是TeaCoo系統的基本介紹，幫助新用戶快速了解系統功能。',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as ShortAnswerQuestion,

  {
    id: 'sample-reading',
    type: '閱讀測驗',
    content: 'TeaCoo的進階功能介紹',
    article: 'TeaCoo除了基本的題目管理功能外，還提供了許多進階功能。例如，您可以為每個題目添加標籤，方便分類和搜尋。系統也支援題目的批量操作，包括批量刪除和批量修改標籤。在搜尋功能方面，您可以使用關鍵字搜尋，也可以通過標籤篩選題目。此外，系統還提供了題目匯入匯出功能，方便您管理大量題目。',
    questions: [
      {
        id: 'sample-reading-1',
        content: '以下哪個不是TeaCoo提供的功能？',
        options: ['標籤管理', '批量操作', '自動出題', '題目匯出'],
        answer: '自動出題',
        explanation: 'TeaCoo目前不支援自動出題功能。',
      },
      {
        id: 'sample-reading-2',
        content: '如何在TeaCoo中快速找到特定題目？',
        options: ['使用關鍵字搜尋', '使用標籤篩選', '以上皆是', '以上皆非'],
        answer: '以上皆是',
        explanation: 'TeaCoo支援關鍵字搜尋和標籤篩選兩種方式來查找題目。',
      }
    ],
    tags: ['使用教學', '進階功能'],
    explanation: '這篇文章介紹了TeaCoo的主要進階功能。',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as ReadingQuestion,

  {
    id: 'sample-cloze',
    type: '克漏字',
    content: 'TeaCoo使用指南',
    article: '在TeaCoo中，您可以透過【1】按鈕來新增題目。每個題目都可以添加【2】來方便分類。如果您想要尋找特定題目，可以使用【3】或【4】功能。',
    questions: [
      {
        id: 'sample-cloze-1',
        options: ['新增題目', '編輯', '刪除', '匯入'],
        answer: '新增題目',
        explanation: '點擊右上角的「新增題目」按鈕來新增題目。',
      },
      {
        id: 'sample-cloze-2',
        options: ['答案', '標籤', '說明', '選項'],
        answer: '標籤',
        explanation: '標籤功能可以幫助您更好地組織和分類題目。',
      },
      {
        id: 'sample-cloze-3',
        options: ['關鍵字搜尋', '複製', '預覽', '排序'],
        answer: '關鍵字搜尋',
        explanation: '使用關鍵字搜尋功能可以快速找到包含特定文字的題目。',
      },
      {
        id: 'sample-cloze-4',
        options: ['標籤篩選', '排序', '匯出', '刪除'],
        answer: '標籤篩選',
        explanation: '使用標籤篩選功能可以顯示具有特定標籤的題目。',
      }
    ],
    tags: ['使用教學', '基礎功能'],
    explanation: '這是一個關於TeaCoo基本使用方法的克漏字題目。',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as ClozeQuestion,

    
]; 