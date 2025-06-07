import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Navigation from '@/components/Navigation';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import Sidebar from '@/components/question/sidebar';
import type { FilterKey } from '@/components/question/sidebar';

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

type Question = SingleQuestion | GroupQuestion;
export default function QuestionPage() {
// 假資料
const [questions, setQuestions] = useState<Question[]>([
  {
    id: 'q1',
    type: '單選題',
    content: '地球是第幾顆行星？',
    options: ['第一', '第二', '第三', '第四'],
    answer: '第三',
    tags: ['自然', '國小'],
  },
  {
    id: 'g1',
    type: '閱讀測驗',
    article: '太陽系由太陽和其周圍天體組成，包括八大行星...',
    questions: [
      {
        id: 'g1-q1',
        content: '太陽系中最大的行星是？',
        options: ['地球', '火星', '木星', '金星'],
        answer: '木星',
      },
      {
        id: 'g1-q2',
        content: '火星表面呈紅色是因為？',
        options: ['氧氣', '鐵', '氧化鐵', '沙子'],
        answer: '氧化鐵',
      },
    ],
    tags: ['自然', '國中'],
  },
  {
    id: 'g2',
    type: '閱讀測驗',
    article: '太陽系由太陽和其周圍天體組成，包括八大行星...',
    questions: [
      {
        id: 'g2-q1',
        content: '太陽系中最大的行星是？',
        options: ['地球', '火星', '木星', '金星'],
        answer: '木星',
      },
      {
        id: 'g2-q2',
        content: '火星表面呈紅色是因為？',
        options: ['氧氣', '鐵', '氧化鐵', '沙子'],
        answer: '氧化鐵',
      },
    ],
    tags: ['自然', '國中'],
  },
]);

const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(
    questions.flatMap(q => 
      q.type === '閱讀測驗' 
        ? [q.id, ...q.questions.map(subQ => subQ.id)] 
        : [q.id]
    )
  );
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    單題: false,
    單選題: false,
    多選題: false,
    填空題: false,
    簡答題: false,
    題組: false,
    閱讀測驗: false,
    克漏字: false,
    國文: false,
    自然: false,
    國小: false,
    國中: false,
  });
  
  const hasType = (type: string) => {
    return questions.some(q => q.type === type);
  };
  
  useEffect(() => {
    const types = new Set<string>();
    const tags = new Set<string>();
  
    questions.forEach(q => {
      types.add(q.type);
      q.tags.forEach(t => tags.add(t));
    });
  
    setFilters(prev => ({
      ...prev,
      單選題: types.has('單選題'),
      多選題: types.has('多選題'),
      填空題: types.has('填空題'),
      簡答題: types.has('簡答題'),
      閱讀測驗: types.has('閱讀測驗'),
      克漏字: types.has('克漏字'),
      題組: types.has('閱讀測驗') || types.has('克漏字'),
      單題: types.has('單選題') || types.has('填空題') || types.has('多選題') || types.has('簡答題'),
      國文: tags.has('國文'),
      自然: tags.has('自然'),
      國小: tags.has('國小'),
      國中: tags.has('國中'),
    }));
  }, [questions]);
  const [collapsedCards, setCollapsedCards] = useState<string[]>([]);
  const toggleCollapse = (id: string) => {
    setCollapsedCards(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };
  const [keyword, setKeyword] = useState('');
  useEffect(() => {
    const lowerKeyword = keyword.trim().toLowerCase();
  
    // 條件：沒勾題型 / 沒勾標籤，但輸入了關鍵字
    const noTypesSelected = !Object.entries(filters).some(([k, v]) =>
      v && ['單選題', '多選題', '填空題', '簡答題', '閱讀測驗', '克漏字'].includes(k)
    );
    const noTagsSelected = !Object.entries(filters).some(([k, v]) =>
      v && ['國文', '自然', '國小', '國中'].includes(k)
    );
  
    if (lowerKeyword !== '' && (noTypesSelected || noTagsSelected)) {
      const matched = questions.filter(q =>
        q.type === '單選題'
          ? q.content.toLowerCase().includes(lowerKeyword) ||
            q.options.some(opt => opt.toLowerCase().includes(lowerKeyword)) ||
            q.answer.toLowerCase().includes(lowerKeyword)
          : q.article.toLowerCase().includes(lowerKeyword) ||
            q.questions.some(sub =>
              sub.content.toLowerCase().includes(lowerKeyword) ||
              sub.options.some(opt => opt.toLowerCase().includes(lowerKeyword)) ||
              sub.answer.toLowerCase().includes(lowerKeyword)
            )
      );
  
      const matchedTypes = new Set<string>();
      const matchedTags = new Set<string>();
  
      matched.forEach(q => {
        matchedTypes.add(q.type);
        q.tags.forEach(tag => matchedTags.add(tag));
      });
  
      // 額外加上「單題 / 題組」對應條件
      if (matchedTypes.has('閱讀測驗') || matchedTypes.has('克漏字')) {
        matchedTypes.add('題組');
      }
      if (['單選題', '多選題', '填空題', '簡答題'].some(t => matchedTypes.has(t))) {
        matchedTypes.add('單題');
      }
  
      const ALL_TYPES: FilterKey[] = [
        '單選題', '多選題', '填空題', '簡答題',
        '閱讀測驗', '克漏字', '題組', '單題'
      ];
      const ALL_TAGS: FilterKey[] = ['國文', '自然', '國小', '國中'];
  
      setFilters(prev => {
        const newFilters: Record<FilterKey, boolean> = { ...prev };
  
        ALL_TYPES.forEach(type => {
          newFilters[type] = matchedTypes.has(type) || prev[type];
        });
  
        ALL_TAGS.forEach(tag => {
          newFilters[tag] = matchedTags.has(tag) || prev[tag];
        });
  
        return newFilters;
      });
    }
  }, [keyword, filters, questions]);
  
  
<Input
  placeholder="搜尋題目關鍵字..."
  className="w-full"
  value={keyword}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
/>

const filteredQuestions = useMemo(() => {
  const selectedTags = Object.entries(filters)
    .filter(([key, value]) => value && ['國文', '自然', '國小', '國中'].includes(key))
    .map(([key]) => key);

  const selectedTypes = Object.entries(filters)
    .filter(([key, value]) => value && ['單選題', '多選題', '填空題', '簡答題', '閱讀測驗', '克漏字'].includes(key))
    .map(([key]) => key);

  const lowerKeyword = keyword.trim().toLowerCase();

  // 如果三個條件都沒填，回傳空
  const isNoFilter = selectedTypes.length === 0 && selectedTags.length === 0 && lowerKeyword === '';
  if (isNoFilter) return [];

  return questions.filter(q => {
    // 題型是否符合
    const matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(q.type);

    // 標籤是否符合
    const matchesTags = selectedTags.length === 0 || q.tags.some(tag => selectedTags.includes(tag));

    // 關鍵字是否符合
    const matchesKeyword = lowerKeyword === '' || (
      q.type === '單選題'
        ? q.content.toLowerCase().includes(lowerKeyword) ||
          q.options.some(opt => opt.toLowerCase().includes(lowerKeyword)) ||
          q.answer.toLowerCase().includes(lowerKeyword)
        : q.article.toLowerCase().includes(lowerKeyword) ||
          q.questions.some(sub =>
            sub.content.toLowerCase().includes(lowerKeyword) ||
            sub.options.some(opt => opt.toLowerCase().includes(lowerKeyword)) ||
            sub.answer.toLowerCase().includes(lowerKeyword)
          )
    );

    // ✅ 最終條件：要「每一項條件都符合（如果有設）」
    return matchesTypes && matchesTags && matchesKeyword;
  });
}, [questions, filters, keyword]);

  const toggleSelection = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };
  
  const toggleFilter = (key: FilterKey) => {
    setFilters(prev => {
      const newValue = !prev[key];
  
      const newFilters: Record<FilterKey, boolean> = { ...prev, [key]: newValue };

  
      // 如果取消「單題」也要取消它的子項目
      if (key === '單題') {
        if (newValue) {
          if (hasType('單選題')) newFilters['單選題'] = true;
          if (hasType('多選題')) newFilters['多選題'] = true;
          if (hasType('填空題')) newFilters['填空題'] = true;
          if (hasType('簡答題')) newFilters['簡答題'] = true;
        } else {
          newFilters['單選題'] = false;
          newFilters['多選題'] = false;
          newFilters['填空題'] = false;
          newFilters['簡答題'] = false;
        }
      }
        
      // 如果取消「題組」也要取消它的子項目
      if (key === '題組') {
        if (newValue) {
          if (hasType('閱讀測驗')) newFilters['閱讀測驗'] = true;
          if (hasType('克漏字')) newFilters['克漏字'] = true;
        } else {
          newFilters['閱讀測驗'] = false;
          newFilters['克漏字'] = false;
        }
      }
      
      if (['單選題', '多選題', '填空題', '簡答題'].includes(key) && newValue) {
        newFilters['單題'] = true;
      }
      
      if (['閱讀測驗', '克漏字'].includes(key) && newValue) {
        newFilters['題組'] = true;
      }
      
      return newFilters;
    });
  };
  

  return (
    <div className="h-screen flex flex-col bg-mainBg">
      <Navigation />
      <div className="flex flex-1 overflow-hidden">
      <Sidebar
  filters={filters}
  toggleFilter={toggleFilter}
  showDeleteConfirm={showDeleteConfirm}
  setShowDeleteConfirm={setShowDeleteConfirm}
  selectedQuestions={selectedQuestions}
  setSelectedQuestions={setSelectedQuestions}
  setQuestions={setQuestions}
/>

        {/* Main */}
        <main className="flex-1 p-6">
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-mainBg pb-2 border-b border-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
              <Input
  placeholder="搜尋題目關鍵字..."
  className="w-[1000px] flex-shrink-0"
  value={keyword}
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
/>

                <Button 
                  variant="default"
                  onClick={() => {
                    const allIds = questions.flatMap(q => 
                      q.type === '閱讀測驗' 
                        ? [q.id, ...q.questions.map(subQ => subQ.id)] 
                        : [q.id]
                    );
                    setSelectedQuestions(allIds);
                  }}
                >
                  全部勾選
                </Button>
                <Button 
                  variant="default"
                  onClick={() => setSelectedQuestions([])}
                >
                  全部取消
                </Button>
                <Button
  variant="default"
  onClick={() => setShowDeleteConfirm(true)}
  disabled={selectedQuestions.length === 0}
>
  刪除題目
</Button>

              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="default">🤖 AI匯入</Button>
              <Button variant="default">➕ 新增題目</Button>
              <Button variant="default">🧪 自我練習</Button>
              <Button variant="default">📤 派發作業</Button>
              <Button variant="default">📄 匯出題目</Button>
            </div>
          </div>
          </div>
          {/* 題目清單 */}
<div className="overflow-y-auto h-[calc(100vh-64px-72px)] pr-2 space-y-4">
  {filteredQuestions.map((q) => {
    const isCollapsed = collapsedCards.includes(q.id);
    return (
      <div key={q.id} className="relative p-4 bg-cardBg border border-gray-300 rounded-xl shadow-lg">
  <Button
    onClick={() => alert(`編輯題目：${q.id}`)}
    className="absolute top-2 right-2 bg-cardBg hover:bg-gray-300 text-gray-700 px-2 py-1 h-auto"
    title="編輯"
  >
    ✏️
  </Button>
  <div className="flex items-start gap-2">

          <input
            type="checkbox"
            checked={selectedQuestions.includes(q.id)}
            onChange={() => toggleSelection(q.id)}
            className="mt-1"
          />
          <div className="flex-1">
            {/* 點擊上半部摺疊卡片 */}
            <div onClick={() => toggleCollapse(q.id)} className="cursor-pointer">
              <div className="text-sm text-gray-700">
                {q.type} ｜ {q.tags.join(', ')}
              </div>
              <div className="font-medium mt-1 text-gray-800">
                1. {q.type === '單選題' ? q.content : q.article}
              </div>
            </div>

            {/* 展開時才顯示內容 */}
            {!isCollapsed && (
              <>
                {q.type === '單選題' ? (
                  <>
                    <ul className="list-none pl-5 text-sm mt-1 text-gray-800">
                      {q.options.map((opt, i) => (
                        <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                      ))}
                    </ul>
                    <div className="text-sm mt-1 text-gray-800">
                      ✅ 正解：({String.fromCharCode(65 + q.options.indexOf(q.answer))}) {q.answer}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm mt-1 line-clamp-2 text-gray-800"></div>
                    <ul className="list-decimal pl-5 text-sm mt-2 text-gray-800">
                      {q.questions.map((sub, index) => (
                        <li key={sub.id} className="mb-2">
                          {sub.content}
                          <ul className="list-none pl-5 mt-1">
                            {sub.options.map((opt, i) => (
                              <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                            ))}
                          </ul>
                          <div className="text-sm mt-1">
                            ✅ 正解：({String.fromCharCode(65 + sub.options.indexOf(sub.answer))}) {sub.answer}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  })}
</div>  
        </main>
      </div>
    </div>
  );
}
