import type {
  Question,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  FillInQuestion,
  ShortAnswerQuestion,
  ReadingQuestion,
  ClozeQuestion,
} from '../types/question';

export const sampleQuestions: Question[] = [
  {
    id: 'sample-single',
    type: '單選題',
    content: '你剛進入這個超好用的題庫工具，準備新增第一題。請問下列哪個方法可以用來建立新的題目？',
    options: [
      '點擊「匯入題目」按鈕',
      '對著畫面說「Hey, Teacoo!」',
      '拖動滑鼠快速畫一個圓',
      '把瀏覽器重開兩次'
    ],
    answer: 0,
    tags: ['使用教學', '基礎功能'],
    explanation: '點擊「匯入題目」按鈕，即可開啟直覺的題目編輯介面，由AI將你的題目一鍵轉換格式匯入到你的題庫！',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as SingleChoiceQuestion,

  {
    id: 'sample-multiple',
    type: '多選題',
    content: '關於Teacoo，下列敘述何者為真？',
    options: [
      '其實單選題可以當成是非題來使用，簡答題也可以用來出翻譯',
      '新增題目時，不一定要輸入"解釋"也沒關係',
      '可以利用這個平台派送趣味又有互動性的課堂遊戲',
      '在新增題目時加上的標籤，都會出現在篩選區'
    ],
    answers: [0, 1, 3],
    tags: ['使用教學', '功能說明'],
    explanation: 'Teacoo目前還不援遊戲功能，但題目可轉成其他用途，不過你真的很想要加入這功能的話可以連絡我唷！',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as MultipleChoiceQuestion,

  {
    id: 'sample-fill',
    type: '填空題',
    content: '你可以利用_____或是_____來篩選希望看到的題目。',
    blanks: ['題型', '標籤'],
    tags: ['使用教學', '功能說明'],
    explanation: '使用題型和標籤篩選可以快速找到想要的題目。',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as FillInQuestion,

  {
    id: 'sample-short',
    type: '簡答題',
    content: '除了彙整題目之外，學生和老師分別還可以利用Teacoo做到什麼事？',
    answer: '老師可以派發題目給學生，當成作業或是線上考試；學生可以利用這平台整理題目並自我測試',
    tags: ['功能教學'],
    explanation: '老師能派發作業、學生能自我練習的雙重功能，展現對平台用途的全面掌握。',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as ShortAnswerQuestion,

  {
    id: 'sample-reading',
    type: '閱讀測驗',
    article: 'Teacoo，發音如中文的「題庫」(彙整題目的資料庫)，初衷是要__1__ 你也知道，老師們真正發光發熱的時候是在講課時或是替學生解答疑惑時，而不是在電腦前拼命出題目、整理文件、改考卷、算成績，因此，何不利用科技的力量，讓老師們利用一杯tea的時間完成這些麻煩事呢？只要把題目丟給Teacoo，__2__就可以在幾秒內幫你建立好專屬於你的題目，甚至可以派發這些題目給學生，學生無需帳號密碼，只要點開連結就能作答，系統還會自動幫你收試卷、__3__、算成績，這樣該有多好？',
    questions: [
      {
        id: 'sample-reading-1',
        content: 'Teacoo 的名字發音像什麼？',
        options: [
          '一種食材',
          '魔術方塊',
          '題目的資料庫',
          '一種遊戲'
        ],
        answer: '題目的資料庫',
        explanation: '這是 Teacoo 的命名由來與品牌精神，結合「題庫」的中文發音與輕鬆泡茶的意象，傳達出讓出題變簡單、教學更 chill 的理念。'
      },
      {
        id: 'sample-reading-2',
        content: '老師只要貼上教材內容，什麼會協助自動轉換成可編輯的結構化題目？',
        options: [
          'GDP',
          'CPU',
          'AI',
          'UI'
        ],
        answer: 'AI',
        explanation: 'AI 是 Teacoo 的核心功能，能自動將教材轉換為標準題目格式，大幅節省老師出題、排版的時間，提升教學效率。'
      },
      {
        id: 'sample-reading-3',
        content: '學生如何接收老師派發的題目？',
        options: [
          '註冊帳號並驗證信箱',
          '說「Hey, Teacoo！」來開啟題目',
          '綁定 Google Classroom',
          '點連結即可進入作答畫面'
        ],
        answer: '點連結即可進入作答畫面',
        explanation: 'Teacoo 支援「免登入作答」，學生只要取得老師提供的作業連結，點一下就能進入作答，無需帳號、密碼，降低使用門檻，也方便老師快速派發。'
      }
    ],
    tags: ['使用教學', '系統介紹'],
    explanation: '這篇文章完整介紹了Teacoo的核心功能和使用方式。',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as ReadingQuestion,

  {
    id: 'sample-cloze',
    type: '克漏字',
    content: 'Teacoo，發音如中文的「題庫」(彙整題目的資料庫)，初衷是要__1__ 你也知道，老師們真正發光發熱的時候是在講課時或是替學生解答疑惑時，而不是在電腦前拼命出題目、整理文件、改考卷、算成績，因此，何不利用科技的力量，讓老師們利用一杯tea的時間完成這些麻煩事呢？只要把題目丟給Teacoo，__2__就可以在幾秒內幫你建立好專屬於你的題目，甚至可以派發這些題目給學生，學生無需帳號密碼，只要點開連結就能作答，系統還會自動幫你收試卷、__3__、算成績，這樣該有多好？',
    questions: [
      {
        options: [
          'Make teachers sad.',
          'Make teachers cool.',
          'Make students cool.',
          'Make students sad.'
        ],
        answer: 1
      },
      {
        options: [
          'GDP',
          'CPU',
          'AI',
          'UI'
        ],
        answer: 2
      },
      {
        options: [
          '對答案',
          '唱情歌',
          '繳房貸',
          '考大學'
        ],
        answer: 0
      }
    ],
    tags: ['使用教學', '系統介紹'],
    explanation: '這段文字介紹了Teacoo的核心理念和主要功能。',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z'
  } as ClozeQuestion
]; 