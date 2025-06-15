"use client";
import type { ChangeEvent } from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import Navigation from '../components/Navigation';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import Sidebar from '../components/question/sidebar';
import type { FilterKey } from '../components/question/sidebar';
import AddQuestionModal from '../components/modals/AddQuestionModal';
import { AIConvertModal } from '../components/ai/AIConvertModal';
import type { 
  Question,
  SingleChoiceQuestion,
  FillInQuestion,
  ShortAnswerQuestion,
  ReadingQuestion,
  ClozeQuestion,
  SubQuestion,
  ClozeSubQuestion,
  QuestionType
} from '../types/question';
import { sampleQuestions } from '../data/sampleQuestions';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { safeLocalStorage } from '@/lib/utils/storage';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  title?: string;
}

// Type Guards
function isSingleChoiceQuestion(q: Question): q is SingleChoiceQuestion {
  return q.type === '單選題';
}

function isFillInQuestion(q: Question): q is FillInQuestion {
  return q.type === '填空題';
}

function isShortAnswerQuestion(q: Question): q is ShortAnswerQuestion {
  return q.type === '簡答題';
}

function isReadingQuestion(q: Question): q is ReadingQuestion {
  return q.type === '閱讀測驗';
}

function isClozeQuestion(q: Question): q is ClozeQuestion {
  return q.type === '克漏字';
}

function isGroupQuestion(q: Question): q is ReadingQuestion | ClozeQuestion {
  return q.type === '閱讀測驗' || q.type === '克漏字';
}

export default function QuestionPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // 設置 client-side 標記
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 初始化題目列表，優先使用 localStorage 中的題目
  const [questions, setQuestions] = useState<Question[]>(() => {
    // 在伺服器端返回範例題目
    if (typeof window === 'undefined') {
      return sampleQuestions;
    }
    
    // 嘗試從 localStorage 讀取題目
    const savedQuestions = safeLocalStorage.getItem('questions');
    if (savedQuestions) {
      try {
        const parsed = JSON.parse(savedQuestions);
        // 檢查是否已經包含範例題目
        const hasSampleQuestions = parsed.some((q: Question) => q.id.startsWith('sample-'));
        // 如果沒有範例題目，則添加
        return hasSampleQuestions ? parsed : [...parsed, ...sampleQuestions];
      } catch (error) {
        console.error('解析已保存題目失敗:', error);
        return sampleQuestions;
      }
    }
    // 如果沒有已保存的題目，使用範例題目
    return sampleQuestions;
  });

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (!isClient) return;
    
    const hasVisited = safeLocalStorage.getItem('hasVisitedTeaCoo');
    if (!hasVisited) {
      safeLocalStorage.setItem('hasVisitedTeaCoo', 'true');
      setIsFirstLogin(true);
    } else {
      setIsFirstLogin(false);
    }
  }, [isClient]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 修改 filters 的初始狀態，根據當前題目設置
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>(() => {
    const initialFilters: Record<string, boolean> = {
      單題: true,
      單選題: true,
      多選題: true,
      填空題: true,
      簡答題: true,
      題組: true,
      閱讀測驗: true,
      克漏字: true,
    };

    return initialFilters;
  });

  // 計算所有現有的標籤
  const allTags = useMemo(() => {
    const tagMap = new Map<string, { tag: string; createdAt: string }>();
    
    // 從問題中收集標籤
    questions.forEach(q => {
      q.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, {
            tag,
            createdAt: q.createdAt || q.updatedAt || new Date().toISOString()
          });
        }
      });
    });

    // 加入所有在 filters 中的標籤
    Object.keys(filters).forEach(key => {
      if (!['單題', '單選題', '填空題', '簡答題', '題組', '閱讀測驗', '克漏字'].includes(key) && !tagMap.has(key)) {
        tagMap.set(key, {
          tag: key,
          createdAt: new Date().toISOString()
        });
      }
    });

    // 轉換為陣列並按時間排序
    return Array.from(tagMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(item => item.tag);
  }, [questions, filters]);

  const toggleFilter = useCallback((key: FilterKey) => {
    setFilters(prev => {
      const next = { ...prev };
      if (key in next) {
        next[key] = !next[key];
      } else {
        // 如果是新標籤，將其加入到 filters 中
        next[key] = true;
      }
      return next;
    });
  }, []);

  // 當有新標籤被加入時，更新所有相關組件
  useEffect(() => {
    const newTags = allTags.filter(tag => !(tag in filters));
    if (newTags.length > 0) {
      setFilters(prev => {
        const next = { ...prev };
        newTags.forEach(tag => {
          if (!(tag in next)) {
            next[tag] = true;
          }
        });
        return next;
      });
    }
  }, [questions]); // 只在 questions 改變時更新

  const hasType = (type: string) => {
    return questions.some((q: Question) => q.type === type);
  };

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
      v && allTags.includes(k)
    );

    if (lowerKeyword !== '' && (noTypesSelected || noTagsSelected)) {
      const matched = questions.filter((q: Question) => {
        if (isSingleChoiceQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.options.some(opt => opt.toLowerCase().includes(lowerKeyword)) ||
            q.options[q.answer].toLowerCase().includes(lowerKeyword);
        } else if (isFillInQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.blanks.some((blank: string) => blank.toLowerCase().includes(lowerKeyword));
        } else if (isShortAnswerQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.answer.toLowerCase().includes(lowerKeyword);
        } else if (isReadingQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.article.toLowerCase().includes(lowerKeyword) ||
            q.questions.some((sub: SubQuestion) =>
              sub.content.toLowerCase().includes(lowerKeyword) ||
              sub.options.some(opt => opt.toLowerCase().includes(lowerKeyword)) ||
              sub.answer.toLowerCase().includes(lowerKeyword)
            );
        } else if (isClozeQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.article.toLowerCase().includes(lowerKeyword) ||
            q.questions.some((sub: ClozeSubQuestion) =>
              sub.options.some(opt => opt.toLowerCase().includes(lowerKeyword)) ||
              sub.answer.toLowerCase().includes(lowerKeyword)
            );
        }
        return false;
      });

      const matchedTypes = new Set<string>();
      const matchedTags = new Set<string>();

      matched.forEach(q => {
        matchedTypes.add(q.type);
        q.tags.forEach(tag => matchedTags.add(tag));
      });

      if (matchedTypes.has('閱讀測驗') || matchedTypes.has('克漏字')) {
        matchedTypes.add('題組');
      }
      if (['單選題', '填空題', '簡答題'].some(t => matchedTypes.has(t))) {
        matchedTypes.add('單題');
      }

      const ALL_TYPES: FilterKey[] = [
        '單選題', '多選題', '填空題', '簡答題',
        '閱讀測驗', '克漏字', '題組', '單題'
      ];

      setFilters(prev => {
        const newFilters: Record<FilterKey, boolean> = { ...prev };

        ALL_TYPES.forEach(type => {
          newFilters[type] = matchedTypes.has(type) || prev[type];
        });

        // 處理所有匹配到的標籤
        matchedTags.forEach(tag => {
          newFilters[tag] = true;
        });

        return newFilters;
      });
    }
  }, [keyword, filters, questions, allTags]);

  const filteredQuestions = useMemo(() => {
    const selectedTags = Object.entries(filters)
      .filter(([key, value]) => value && allTags.includes(key))
      .map(([key]) => key);

    const selectedTypes = Object.entries(filters)
      .filter(([key, value]) => value && ['單選題', '填空題', '簡答題', '閱讀測驗', '克漏字'].includes(key))
      .map(([key]) => key);

    const lowerKeyword = keyword.trim().toLowerCase();

    // 如果沒有選擇任何題型或標籤，則不顯示任何題目
    if (selectedTypes.length === 0 && selectedTags.length === 0) return [];

    return questions.filter((q: Question) => {
      // 檢查是否符合題型條件
      let matchesTypes = false;
      
      // 如果勾選了「題組」但沒有勾選任何單題類型
      if (filters.題組 && !filters.單題) {
        // 只顯示閱讀測驗和克漏字類型的題目
        matchesTypes = q.type === '閱讀測驗' || q.type === '克漏字';
      }
      // 如果勾選了「單題」但沒有勾選題組
      else if (filters.單題 && !filters.題組) {
        // 只顯示單題類型的題目
        matchesTypes = ['單選題', '填空題', '簡答題'].includes(q.type);
      }
      // 如果同時勾選了題組和單題，或者選擇了特定的題型
      else {
        matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(q.type);
      }

      // 檢查是否符合標籤條件
      const matchesTags = selectedTags.length === 0 || q.tags.some(tag => selectedTags.includes(tag));
      
      // 必須同時符合題型和標籤條件
      const matchesTypeOrTag = matchesTypes && matchesTags;
      
      // 如果有搜尋關鍵字，還需要符合關鍵字條件
      const matchesKeyword = lowerKeyword === '' || (() => {
        if (isSingleChoiceQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.options.some((opt: string) => opt.toLowerCase().includes(lowerKeyword)) ||
            q.options[q.answer].toLowerCase().includes(lowerKeyword);
        } else if (isFillInQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.blanks.some((blank: string) => blank.toLowerCase().includes(lowerKeyword));
        } else if (isShortAnswerQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.answer.toLowerCase().includes(lowerKeyword);
        } else if (isReadingQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.article.toLowerCase().includes(lowerKeyword) ||
            q.questions.some((sub: SubQuestion) =>
              sub.content.toLowerCase().includes(lowerKeyword) ||
              sub.options.some((opt: string) => opt.toLowerCase().includes(lowerKeyword)) ||
              sub.answer.toLowerCase().includes(lowerKeyword)
            );
        } else if (isClozeQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.article.toLowerCase().includes(lowerKeyword) ||
            q.questions.some((sub: ClozeSubQuestion) =>
              sub.options.some((opt: string) => opt.toLowerCase().includes(lowerKeyword)) ||
              sub.answer.toLowerCase().includes(lowerKeyword)
            );
        }
        return false;
      })();

      // 只要符合題型或標籤其中一個條件，且符合關鍵字條件就顯示
      return matchesTypeOrTag && matchesKeyword;
    });
  }, [questions, filters, keyword, allTags]);

  const toggleSelection = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const [isPremium] = useState(false); // 改回 false，預設為免費版
  const ITEMS_PER_PAGE = 25; // 每頁顯示的卡片數量
  const MAX_ITEMS = isPremium ? 1000 : 100; // 最大卡片數量限制
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedQuestions = useMemo(() => {
    // 每次題目列表更新時，如果當前頁碼大於最大頁數，自動調整到最後一頁
    const maxPage = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredQuestions.slice(startIndex, endIndex);
  }, [filteredQuestions, currentPage]);

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // 滾動到頁面頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [lastUsedTags, setLastUsedTags] = useState<string[]>([]);

  const handleAddQuestion = (data: Question) => {
    // 檢查是否超過題目數量限制
    if (questions.length >= MAX_ITEMS) {
      alert(isPremium ? '您已達到付費版本的1000題上限' : '您已達到免費版本的100題上限。升級至付費版本可存放最多1000題！');
      return;
    }

    // 新增題目時，將新題目加到陣列最前面
    setQuestions(prev => [{ ...data, id: Math.random().toString(36).substring(7) }, ...prev]);
    handleModalChange(false);
  };

  const handleModalChange = (open: boolean) => {
    setShowAddModal(open);
  };

  const handleDeleteQuestions = () => {
    const updatedQuestions = questions.filter(q => !selectedQuestions.includes(q.id));
    setQuestions(updatedQuestions);
    setShowDeleteConfirm(false);
    setSelectedQuestions([]);
  };

  // 在全選按鈕的點擊處理函數中，只選擇符合篩選條件的題目
  const handleSelectAll = () => {
    const filteredIds = filteredQuestions.flatMap((q: Question) => 
      isGroupQuestion(q)
        ? [q.id, ...q.questions.map(subQ => subQ.id)]
        : [q.id]
    );
    setSelectedQuestions(filteredIds);
  };

  const handleEditQuestion = (data: Question) => {
    setQuestions(prev => 
      prev.map(q => q.id === editingQuestion?.id ? { ...data, id: q.id } : q)
    );
    setShowEditModal(false);
    setEditingQuestion(null);
  };

  const handleEditClick = (question: Question) => {
    setEditingQuestion(question);
    setTimeout(() => setShowEditModal(true), 0);
  };

  const handleAIModalChange = (open: boolean) => {
    setShowAIModal(open);
  };

  const handleAIConvert = async (question: Question) => {
    try {
      // 檢查是否超過題目數量限制
      if (questions.length >= MAX_ITEMS) {
        toast.error(
          isPremium ? '您已達到付費版本的1000題上限' : '您已達到免費版本的100題上限。升級至付費版本可存放最多1000題！'
        );
        return;
      }

      // 新增題目時，將新題目加到陣列最前面，並確保狀態更新
      setQuestions(prev => {
        const updatedQuestions = [question, ...prev];
        // 立即儲存到 localStorage
        try {
          safeLocalStorage.setItem('questions', JSON.stringify(updatedQuestions));
          toast.success('題目已成功匯入');
        } catch (error) {
          console.error('儲存到 localStorage 失敗:', error);
          toast.error('儲存失敗，請確保瀏覽器有足夠的儲存空間');
          return prev; // 如果儲存失敗，不更新狀態
        }
        return updatedQuestions;
      });

      // 確保新題目會出現在第一頁
      setCurrentPage(1);

      // 關閉 AI 轉換視窗
      setShowAIModal(false);

    } catch (error) {
      console.error('匯入失敗:', error);
      toast.error('匯入失敗，請稍後再試');
    }
  };

  // 如果還在伺服器端，返回 null 或載入中的狀態
  if (!isClient) {
    return <div className="h-screen flex items-center justify-center">載入中...</div>;
  }

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
          allTags={allTags}
          isPremium={isPremium}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto max-w-full">
          <div className="sticky top-0 z-10 bg-mainBg dark:bg-gray-900 pb-2 border-b border-transparent overflow-hidden">
            {/* 桌面版/平板橫放布局 (lg 以上) */}
            <div className="hidden sm:flex sm:flex-col gap-4 mb-4">
              {/* 第一行：功能按鈕 */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
                <Button 
                  onClick={() => handleAIModalChange(true)}
                  className="text-gray-200"
                >
                  🤖 AI匯入
                </Button>
                <Button 
                  onClick={() => handleModalChange(true)}
                  className="text-gray-200"
                >
                  ➕ 新增題目
                </Button>
                <Button className="text-gray-200">🧪 自我練習</Button>
                <Button className="text-gray-200">📤 派發作業</Button>
                <Button className="text-gray-300">📄 匯出題目</Button>
              </div>

              {/* 第二行：搜尋和選擇按鈕 */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
                <Input
                  placeholder="搜尋題目關鍵字..."
                  className="w-[300px] placeholder:text-gray-400 dark:placeholder:text-gray-400"
                  value={keyword}
                  onChange={handleKeywordChange}
                />
                <Button
                  onClick={handleSelectAll}
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
                className="w-full placeholder:text-gray-400 dark:placeholder:text-gray-500"
                value={keyword}
                onChange={handleKeywordChange}
              />
              <div className="overflow-x-auto pb-2 hide-scrollbar">
                <div className="flex gap-2 min-w-min">
                  <Button
                    onClick={handleSelectAll}
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
                  <Button 
                    onClick={() => handleAIModalChange(true)}
                    className="whitespace-nowrap text-gray-200"
                  >
                    🤖 AI匯入
                  </Button>
                  <Button 
                    onClick={() => handleModalChange(true)}
                    className="whitespace-nowrap text-gray-200"
                  >
                    ➕ 新增題目
                  </Button>
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
                    onClick={() => handleEditClick(q)}
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
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-700 dark:text-gray-400">
                            {q.type} ｜ {q.tags.join(', ')}
                          </div>
                          <div className="font-medium mt-1 text-gray-800 dark:text-gray-300">
                            1. {(() => {
                              if (isReadingQuestion(q)) return q.article;
                              if (isClozeQuestion(q)) return q.article;
                              if (isFillInQuestion(q)) {
                                return q.content.replace(/\[\[.*?\]\]/g, '_____');
                              }
                              return q.content;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <>
                        {isSingleChoiceQuestion(q) ? (
                          <>
                            <ul className="list-none pl-5 text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                              {q.options.map((opt: string, i: number) => (
                                <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                              ))}
                            </ul>
                            <div className="text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                              🟢 正解：({String.fromCharCode(65 + q.answer)}) {q.options[q.answer]}
                            </div>
                            {q.explanation && (
                              <div className="text-sm mt-1 text-gray-600 dark:text-gray-400 ml-6">
                                💡 解釋：{q.explanation}
                              </div>
                            )}
                          </>
                        ) : isFillInQuestion(q) ? (
                          <>
                            <div className="text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                              🟢 正解：{q.blanks.join('、')}
                            </div>
                            {q.explanation && (
                              <div className="text-sm mt-1 text-gray-600 dark:text-gray-400 ml-6">
                                💡 解釋：{q.explanation}
                              </div>
                            )}
                          </>
                        ) : isShortAnswerQuestion(q) ? (
                          <>
                            <div className="text-sm mt-1 text-gray-800 dark:text-gray-300 ml-6">
                              🟢 正解：{q.answer}
                            </div>
                            {q.explanation && (
                              <div className="text-sm mt-1 text-gray-600 dark:text-gray-400 ml-6">
                                💡 解釋：{q.explanation}
                              </div>
                            )}
                          </>
                        ) : isReadingQuestion(q) ? (
                          <>
                            <ul className="list-decimal pl-5 text-sm mt-2 text-gray-800 dark:text-gray-300 ml-6">
                              {q.questions.map((sub: SubQuestion) => (
                                <li key={sub.id} className="mb-2">
                                  {sub.content}
                                  <ul className="list-none pl-5 mt-1">
                                    {sub.options.map((opt: string, i: number) => (
                                      <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                                    ))}
                                  </ul>
                                  <div className="text-sm mt-1">
                                    🟢 正解：({String.fromCharCode(65 + sub.options.indexOf(sub.answer))}) {sub.answer}
                                  </div>
                                  {sub.explanation && (
                                    <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                                      💡 解釋：{sub.explanation}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                            {q.explanation && (
                              <div className="text-sm mt-2 text-gray-600 dark:text-gray-400 ml-6">
                                💡 整體解釋：{q.explanation}
                              </div>
                            )}
                          </>
                        ) : isClozeQuestion(q) && (
                          <>
                            <ul className="list-decimal pl-5 text-sm mt-2 text-gray-800 dark:text-gray-300 ml-6">
                              {q.questions.map((sub: ClozeSubQuestion, index: number) => (
                                <li key={sub.id} className="mb-2">
                                  <ul className="list-none pl-5">
                                    {sub.options.map((opt: string, i: number) => (
                                      <li key={i}>({String.fromCharCode(65 + i)}) {opt}</li>
                                    ))}
                                  </ul>
                                  <div className="text-sm mt-1">
                                    🟢 正解：({String.fromCharCode(65 + sub.options.indexOf(sub.answer))}) {sub.answer}
                                  </div>
                                  {sub.explanation && (
                                    <div className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                                      💡 解釋：{sub.explanation}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                            {q.explanation && (
                              <div className="text-sm mt-2 text-gray-600 dark:text-gray-400 ml-6">
                                💡 整體解釋：{q.explanation}
                              </div>
                            )}
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

      <ConfirmDeleteModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteQuestions}
      />

      <AddQuestionModal
        open={showAddModal}
        onOpenChange={handleModalChange}
        onSubmit={handleAddQuestion}
        defaultTags={[]}
        isPremium={isPremium}
        allTags={allTags}
      />

      <AddQuestionModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSubmit={handleEditQuestion}
        defaultTags={editingQuestion?.tags || []}
        isPremium={isPremium}
        initialData={editingQuestion}
        isEditMode
        allTags={allTags}
      />

      <AIConvertModal
        open={showAIModal}
        onOpenChange={handleAIModalChange}
        onImport={handleAIConvert}
        availableTags={allTags}
      />
    </div>
  );
}