"use client";
import type { ChangeEvent } from 'react';
import { useState, useMemo, useEffect } from 'react';
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

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
}

type Question = SingleQuestion | GroupQuestion;

export default function QuestionPage() {
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
    questions.flatMap((q: Question) => 
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
    return questions.some((q: Question) => q.type === type);
  };

  useEffect(() => {
    const types = new Set<string>();
    const tags = new Set<string>();

    questions.forEach((q: Question) => {
      types.add(q.type);
      q.tags.forEach(tag => tags.add(tag));
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

  const handleKeywordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  useEffect(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    const noTypesSelected = !Object.entries(filters).some(([k, v]) =>
      v && ['單選題', '多選題', '填空題', '簡答題', '閱讀測驗', '克漏字'].includes(k)
    );
    const noTagsSelected = !Object.entries(filters).some(([k, v]) =>
      v && ['國文', '自然', '國小', '國中'].includes(k)
    );

    if (lowerKeyword !== '' && (noTypesSelected || noTagsSelected)) {
      const matched = questions.filter((q: Question) =>
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

      matched.forEach((q: Question) => {
        matchedTypes.add(q.type);
        q.tags.forEach(tag => matchedTags.add(tag));
      });

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

  const filteredQuestions = useMemo(() => {
    const selectedTags = Object.entries(filters)
      .filter(([key, value]) => value && ['國文', '自然', '國小', '國中'].includes(key))
      .map(([key]) => key);

    const selectedTypes = Object.entries(filters)
      .filter(([key, value]) => value && ['單選題', '多選題', '填空題', '簡答題', '閱讀測驗', '克漏字'].includes(key))
      .map(([key]) => key);

    const lowerKeyword = keyword.trim().toLowerCase();

    const isNoFilter = selectedTypes.length === 0 && selectedTags.length === 0 && lowerKeyword === '';
    if (isNoFilter) return [];

    return questions.filter((q: Question) => {
      const matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(q.type);
      const matchesTags = selectedTags.length === 0 || q.tags.some(tag => selectedTags.includes(tag));
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

  const [isPremium] = useState(false); // 用戶訂閱狀態
  const ITEMS_PER_PAGE = 25; // 每頁顯示的卡片數量
  const MAX_ITEMS = isPremium ? 1000 : 100; // 最大卡片數量限制
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, currentPage]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="h-screen flex flex-col bg-mainBg dark:bg-gray-900">
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

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="sticky top-0 z-10 bg-mainBg dark:bg-gray-900 pb-2 border-b border-transparent">
            {/* 桌面版/平板橫放布局 (lg 以上) */}
            <div className="hidden sm:flex sm:flex-col gap-4 mb-4">
              {/* 第一行：功能按鈕 */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
                <Button className="text-gray-200">🤖 AI匯入</Button>
                <Button className="text-gray-200">➕ 新增題目</Button>
                <Button className="text-gray-200">🧪 自我練習</Button>
                <Button className="text-gray-200">📤 派發作業</Button>
                <Button className="text-gray-300">📄 匯出題目</Button>
              </div>

              {/* 第二行：搜尋和選擇按鈕 */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
                <Input
                  placeholder="搜尋題目關鍵字..."
                  className="w-[300px] flex-shrink-0"
                  value={keyword}
                  onChange={handleKeywordChange}
                />
                <Button
                  onClick={() => {
                    const allIds = questions.flatMap((q: Question) => 
                      q.type === '閱讀測驗' 
                        ? [q.id, ...q.questions.map(subQ => subQ.id)] 
                        : [q.id]
                    );
                    setSelectedQuestions(allIds);
                  }}
                  className="text-gray-200"
                >
                  ✅ 全選
                </Button>
                <Button 
                  onClick={() => setSelectedQuestions([])} 
                  className="text-gray-300"
                >
                  ⬜️ 取消
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={selectedQuestions.length === 0}
                  className="text-gray-200"
                >
                  🗑️ 刪除
                </Button>
              </div>
            </div>

            {/* 手機版直立布局 (sm 以下) */}
            <div className="sm:hidden space-y-4 mb-4">
              <Input
                placeholder="搜尋題目關鍵字..."
                className="w-full"
                value={keyword}
                onChange={handleKeywordChange}
              />
              <div className="overflow-x-auto pb-2 hide-scrollbar">
                <div className="flex gap-2 min-w-min">
                  <Button
                    onClick={() => {
                      const allIds = questions.flatMap((q: Question) => 
                        q.type === '閱讀測驗' 
                          ? [q.id, ...q.questions.map(subQ => subQ.id)] 
                          : [q.id]
                      );
                      setSelectedQuestions(allIds);
                    }}
                    className="whitespace-nowrap text-gray-200"
                  >
                    ✅ 全部勾選
                  </Button>
                  <Button 
                    onClick={() => setSelectedQuestions([])} 
                    className="whitespace-nowrap text-gray-300"
                  >
                    ⬜️ 全部取消
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={selectedQuestions.length === 0}
                    className="whitespace-nowrap text-gray-200"
                  >
                    🗑️ 刪除題目
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto pb-2 hide-scrollbar">
                <div className="flex gap-2 min-w-min">
                  <Button className="whitespace-nowrap text-gray-200">🤖 AI匯入</Button>
                  <Button className="whitespace-nowrap text-gray-200">➕ 新增題目</Button>
                  <Button className="whitespace-nowrap text-gray-200">🧪 自我練習</Button>
                  <Button className="whitespace-nowrap text-gray-200">📤 派發作業</Button>
                  <Button className="whitespace-nowrap text-gray-300">📄 匯出題目</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-64px-72px-40px)] pr-2 space-y-4">
            {questions.length > MAX_ITEMS && (
              <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mb-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  {isPremium ? '您已達到付費版本的1000題上限' : '您已達到免費版本的100題上限。升級至付費版本可存放最多1000題！'}
                </p>
              </div>
            )}
            
            {paginatedQuestions.map((q: Question) => {
              const isCollapsed = collapsedCards.includes(q.id);
              return (
                <div key={q.id} className="relative p-4 bg-cardBg dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
                  <Button
                    onClick={() => alert(`編輯題目：${q.id}`)}
                    className="absolute top-3 right-3 bg-transparent hover:bg-transparent text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 p-0 h-auto shadow-none"
                    title="編輯"
                    variant="ghost"
                  >
                    ✏️
                  </Button>
                  <div className="flex-1">
                    <div onClick={() => toggleCollapse(q.id)} className="cursor-pointer">
                      <div className="flex">
                        <div className="w-[24px]">
                          <Checkbox
                            checked={selectedQuestions.includes(q.id)}
                            onCheckedChange={() => toggleSelection(q.id)}
                            className="mt-[2px]"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-700 dark:text-gray-400">
                            {q.type} ｜ {q.tags.join(', ')}
                          </div>
                          <div className="font-medium mt-1 text-gray-800 dark:text-gray-300">
                            1. {q.type === '單選題' ? q.content : q.article}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <>
                        {q.type === '單選題' ? (
                          <>
                            <ul className="list-none pl-5 text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                              {q.options.map((opt, i) => (
                                <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                              ))}
                            </ul>
                            <div className="text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                              🟢 正解：({String.fromCharCode(65 + q.options.indexOf(q.answer))}) {q.answer}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm mt-1 line-clamp-2 text-gray-800 dark:text-gray-300 ml-6"></div>
                            <ul className="list-decimal pl-5 text-sm mt-2 text-gray-800 dark:text-gray-300 ml-6">
                              {q.questions.map((sub, index) => (
                                <li key={sub.id} className="mb-2">
                                  {sub.content}
                                  <ul className="list-none pl-5 mt-1">
                                    {sub.options.map((opt, i) => (
                                      <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                                    ))}
                                  </ul>
                                  <div className="text-sm mt-1">
                                    🟢 正解：({String.fromCharCode(65 + sub.options.indexOf(sub.answer))}) {sub.answer}
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
              );
            })}
          </div>

          {/* 分頁控制區 */}
          <div className="flex justify-center items-center gap-2 mt-4 pb-4">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="text-gray-200"
            >
              ←
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  className={`w-8 h-8 p-0 ${
                    currentPage === pageNum
                      ? "bg-primary text-white"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {pageNum}
                </Button>
              ))}
            </div>

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="text-gray-200"
            >
              →
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}