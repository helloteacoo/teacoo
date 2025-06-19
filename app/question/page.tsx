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
import TopbarButtons from '../components/question/TopbarButtons';
import QuestionCards from '../components/question/QuestionCards';
import type { 
  Question,
  SingleChoiceQuestion,
  FillInQuestion,
  ShortAnswerQuestion,
  ReadingQuestion,
  ClozeQuestion,
  SubQuestion,
  ClozeSubQuestion,
  QuestionType,
  MultipleChoiceQuestion
} from '../types/question';
import { sampleQuestions } from '../data/sampleQuestions';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { safeLocalStorage } from '@/lib/utils/storage';
import AssignQuizModal from '../components/AssignQuiz/AssignQuizModal';
import { getAllQuestions, addQuestion, updateQuestion, deleteQuestion, searchQuestions, getQuestionsByTags } from '@/app/lib/firebase/questions';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/app/lib/firebase/firebase';

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

function isMultipleChoiceQuestion(q: Question): q is MultipleChoiceQuestion {
  return q.type === '多選題';
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
  const [isClient, setIsClient] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignModalMode, setAssignModalMode] = useState<'assign' | 'practice'>('assign');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPremium] = useState(false); // 預設為免費版
  const [isFirstLogin, setIsFirstLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState<'single' | 'batch'>('single');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [collapsedCards, setCollapsedCards] = useState<string[]>([]);

  const ITEMS_PER_PAGE = 25; // 每頁顯示的卡片數量
  const MAX_ITEMS = isPremium ? 1000 : 100; // 最大卡片數量限制
  
  // 設置 client-side 標記
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 載入題目
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);

        // 確保用戶已認證
        if (!auth.currentUser) {
          console.log('等待用戶認證...');
          return;
        }

        console.log('用戶已認證，ID:', auth.currentUser.uid);

        // 載入所有題目
        console.log('開始載入所有題目...');
        const existingQuestions = await getAllQuestions();
        console.log('成功載入題目，數量:', existingQuestions.length);

        // 如果是新帳號（沒有任何題目），則載入範例題目
        if (existingQuestions.length === 0) {
          console.log('新帳號，載入範例題目...');
          
          try {
            // 載入範例題目
            const addedQuestions = await Promise.all(
              sampleQuestions.map(async (question) => {
                const { id, ...rest } = question;
                console.log('新增範例題目:', rest.content);
                try {
                  const newId = await addQuestion({
                    ...rest,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                  });
                  return { ...rest, id: newId };
                } catch (error) {
                  console.error('新增範例題目失敗:', error);
                  throw error;
                }
              })
            );

            console.log('範例題目載入完成，數量:', addedQuestions.length);
            setQuestions(addedQuestions);
            toast.success('歡迎使用 Teacoo！已為您載入範例題目');
          } catch (error) {
            console.error('載入範例題目失敗:', error);
            toast.error('載入範例題目失敗，請稍後再試');
          }
        } else {
          console.log('載入現有題目');
          setQuestions(existingQuestions);
        }
      } catch (error) {
        console.error('載入題目失敗:', error);
        toast.error('載入題目失敗，請稍後再試');
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // 監聽認證狀態變化
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('認證狀態變化:', user ? '已登入' : '未登入');
      if (user) {
        loadQuestions();
      } else {
        setQuestions([]);
      }
    });

    // 清理訂閱
    return () => unsubscribe();
  }, []); // 移除 auth.currentUser 依賴，改用 onAuthStateChanged

  // 處理新增題目
  const handleAddQuestion = async (newQuestion: Omit<Question, 'id'>) => {
    try {
      const id = await addQuestion(newQuestion);
      const question = { ...newQuestion, id } as Question;
      setQuestions(prev => [question, ...prev]); // 新題目加到最前面
      return question;
      } catch (error) {
      console.error('新增題目失敗:', error);
      throw error;
    }
  };

  // 處理更新題目
  const handleUpdateQuestion = async (id: string, updatedQuestion: Partial<Question>) => {
    try {
      await updateQuestion(id, updatedQuestion);
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updatedQuestion } as Question : q));
      
    } catch (error) {
      console.error('更新題目失敗:', error);
      
    }
  };

  // 處理刪除題目
  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('題目已刪除');
    } catch (error) {
      console.error('刪除題目失敗:', error);
      toast.error('刪除題目失敗，請稍後再試');
    }
  };

  // 處理批量刪除題目
  const handleBatchDelete = async () => {
    try {
      if (selectedQuestionIds.length === 0) {
        toast.error('請先選擇要刪除的題目');
        return;
      }

      // 逐一刪除選中的題目
      for (const id of selectedQuestionIds) {
        await deleteQuestion(id);
      }

      // 更新本地狀態
      setQuestions(prev => prev.filter(q => !q.id || !selectedQuestionIds.includes(q.id)));
      setSelectedQuestionIds([]); // 清空選中的題目
      setShowDeleteConfirm(false);
      
      toast.success(`已成功刪除 ${selectedQuestionIds.length} 個題目`);
    } catch (error) {
      console.error('批量刪除失敗:', error);
      toast.error('刪除失敗，請稍後再試');
    }
  };

  // 處理搜尋題目
  const handleSearch = async (searchKeyword: string) => {
    try {
      if (!searchKeyword.trim()) {
        const allQuestions = await getAllQuestions();
        setQuestions(allQuestions);
        return;
      }
      const searchResults = await searchQuestions(searchKeyword);
      setQuestions(searchResults);
    } catch (error) {
      console.error('搜尋題目失敗:', error);
      
    }
  };

  // 處理標籤篩選
  const handleTagFilter = async (tags: string[]) => {
    try {
      if (tags.length === 0) {
        const allQuestions = await getAllQuestions();
        setQuestions(allQuestions);
        return;
      }
      const filteredQuestions = await getQuestionsByTags(tags);
      setQuestions(filteredQuestions);
    } catch (error) {
      console.error('篩選題目失敗:', error);
      
    }
  };

  // 初始化摺疊狀態（預設全部摺疊）
  useEffect(() => {
    if (questions.length > 0) {
      const validIds = questions.map(q => q.id).filter((id): id is string => id !== undefined);
      setCollapsedCards(validIds);
    }
  }, [questions]);

  // 根據選中的 ID 獲取完整的 Question 物件
  const selectedQuestions = useMemo(() => {
    return questions.filter(q => q.id && selectedQuestionIds.includes(q.id));
  }, [questions, selectedQuestionIds]);

  // 在伺服器端返回範例題目
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
            createdAt: q.createdAt instanceof Timestamp ? q.createdAt.toDate().toISOString() : 
              q.updatedAt instanceof Timestamp ? q.updatedAt.toDate().toISOString() :
              (typeof q.createdAt === 'string' ? q.createdAt : 
               typeof q.updatedAt === 'string' ? q.updatedAt : 
               new Date().toISOString())
          });
        }
      });
    });

    // 加入所有在 filters 中的標籤
    Object.keys(filters).forEach(key => {
      if (!['單題', '單選題', '多選題', '填空題', '簡答題', '題組', '閱讀測驗', '克漏字'].includes(key) && !tagMap.has(key)) {
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

  const toggleCollapse = (id: string) => {
    setCollapsedCards(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

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
        } else if (isMultipleChoiceQuestion(q)) {
          const multipleChoiceQ = q as MultipleChoiceQuestion;
          return q.content.toLowerCase().includes(lowerKeyword) ||
            multipleChoiceQ.options.some((opt: string) => opt.toLowerCase().includes(lowerKeyword)) ||
            multipleChoiceQ.answers.some(answerIndex => 
              multipleChoiceQ.options[answerIndex].toLowerCase().includes(lowerKeyword)
            );
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
            q.questions.some(sub =>
              sub.options.some(opt => opt.toLowerCase().includes(lowerKeyword)) ||
              sub.options[sub.answer].toLowerCase().includes(lowerKeyword)
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
      if (['單選題', '多選題', '填空題', '簡答題'].some(t => matchedTypes.has(t))) {
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
      .filter(([key, value]) => value && ['單選題', '多選題', '填空題', '簡答題', '閱讀測驗', '克漏字'].includes(key))
      .map(([key]) => key);

    const lowerKeyword = keyword.trim().toLowerCase();

    // 如果沒有選擇任何題型和標籤，且沒有搜尋關鍵字，則顯示所有題目
    if (selectedTypes.length === 0 && selectedTags.length === 0 && lowerKeyword === '') {
      return questions;
    }

    return questions.filter((q: Question) => {
      // 檢查是否符合題型條件
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(q.type);
      
      // 檢查是否符合標籤條件
      const matchesTags = selectedTags.length === 0 || q.tags.some(tag => selectedTags.includes(tag));
      
      // 檢查是否符合關鍵字條件
      const matchesKeyword = lowerKeyword === '' || (() => {
        if (isSingleChoiceQuestion(q)) {
          return q.content.toLowerCase().includes(lowerKeyword) ||
            q.options.some((opt: string) => opt.toLowerCase().includes(lowerKeyword)) ||
            q.options[q.answer].toLowerCase().includes(lowerKeyword);
        } else if (isMultipleChoiceQuestion(q)) {
          const multipleChoiceQ = q as MultipleChoiceQuestion;
          return q.content.toLowerCase().includes(lowerKeyword) ||
            multipleChoiceQ.options.some((opt: string) => opt.toLowerCase().includes(lowerKeyword)) ||
            multipleChoiceQ.answers.some(answerIndex => 
              multipleChoiceQ.options[answerIndex].toLowerCase().includes(lowerKeyword)
            );
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
            q.questions.some(sub =>
              sub.options.some(opt => opt.toLowerCase().includes(lowerKeyword)) ||
              sub.options[sub.answer].toLowerCase().includes(lowerKeyword)
            );
        }
        return false;
      })();

      // 只要符合題型或標籤其中一個條件，且符合關鍵字條件，就顯示題目
      return (matchesType || matchesTags) && matchesKeyword;
    });
  }, [questions, filters, keyword, allTags]);

  const toggleSelection = (id: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
    );
  };

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

  const handleEditQuestion = async (data: Question) => {
    try {
      if (!data.id) {
        toast.error('題目 ID 不存在');
      return;
    }
      await handleUpdateQuestion(data.id, data);
      setShowEditModal(false);
      setEditingQuestion(null);
      } catch (error) {
      console.error('編輯題目失敗:', error);
      
    }
  };

  const handleDeleteQuestions = async () => {
    try {
      await handleBatchDelete();
      setShowDeleteConfirm(false);
      } catch (error) {
      console.error('刪除題目失敗:', error);
      
    }
  };

  const handleSelectAll = () => {
    const validIds = filteredQuestions
      .map(q => q.id)
      .filter((id): id is string => id !== undefined);
    
    if (selectedQuestionIds.length === validIds.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(validIds);
    }
  };

  const handleEditClick = (question: Question) => {
    setEditingQuestion(question);
    setShowEditModal(true);
  };

  const handleAIModalChange = (open: boolean) => {
    setShowAIModal(open);
  };

  const handleImportQuestions = async (questions: Question[]) => {
    try {
      // 為每個題目添加必要的欄位
      const processedQuestions = questions.map(question => ({
        ...question,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // 批次新增題目
      await Promise.all(processedQuestions.map(q => addQuestion(q)));
      
      // 更新題目列表
      const updatedQuestions = await getAllQuestions();
      setQuestions(updatedQuestions);
      
      toast.success('題目匯入成功');
    } catch (error) {
      console.error('匯入失敗:', error);
      toast.error('匯入失敗，請稍後再試');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    // 從所有題目中移除該標籤
    setQuestions(prevQuestions => 
      prevQuestions.map(question => ({
        ...question,
        tags: question.tags.filter(tag => tag !== tagToDelete)
      }))
    );

    // 從篩選器中移除該標籤
    setFilters(prevFilters => {
      const { [tagToDelete]: _, ...rest } = prevFilters;
      return rest;
    });

    toast.success(`已刪除標籤：${tagToDelete}`);
  };

  const handleAssignQuestions = () => {
    setAssignModalMode('assign');
    setShowAssignModal(true);
  };

  const handleSelfPractice = () => {
    setAssignModalMode('practice');
    setShowAssignModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteMode === 'single' && editingQuestion?.id) {
        await handleDeleteQuestion(editingQuestion.id);
        setShowDeleteConfirm(false);
        setEditingQuestion(null);
      } else if (deleteMode === 'batch' && selectedQuestionIds.length > 0) {
        await handleBatchDelete();
      }
    } catch (error) {
      console.error('刪除失敗:', error);
      toast.error('刪除失敗，請稍後再試');
    }
  };

  // 如果還在伺服器端，返回 null 或載入中的狀態
  if (!isClient) {
    return null;
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
          selectedQuestions={selectedQuestionIds}
          setSelectedQuestions={setSelectedQuestionIds}
          setQuestions={setQuestions}
          allTags={allTags}
          isPremium={isPremium}
          onDeleteTag={handleDeleteTag}
        />

        <main className="flex-1 p-2 lg:p-6 overflow-auto max-w-full">
          <TopbarButtons
            onAIModalChange={handleAIModalChange}
            onAssignQuestions={handleAssignQuestions}
            onSelfPractice={handleSelfPractice}
            selectedQuestionIds={selectedQuestionIds}
            selectedQuestions={selectedQuestions}
            keyword={keyword}
            onKeywordChange={handleKeywordChange}
            onSelectAll={handleSelectAll}
            onClearSelection={() => setSelectedQuestionIds([])}
            onShowDeleteConfirm={() => {
              setDeleteMode('batch');
              setShowDeleteConfirm(true);
            }}
          />

          <QuestionCards
            questions={paginatedQuestions}
            selectedQuestionIds={selectedQuestionIds}
            collapsedCards={collapsedCards}
            onToggleCollapse={toggleCollapse}
            onToggleSelection={toggleSelection}
            onEditClick={handleEditClick}
            MAX_ITEMS={MAX_ITEMS}
            isPremium={isPremium}
          />

          {/* 分頁控制區 */}
          <div className="flex justify-center items-center gap-2 mt-4 pb-4">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="text-gray-200 h-8 w-8 p-0 text-sm"
            >
              ←
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  className={`w-8 h-8 p-0 text-sm ${
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
              className="text-gray-200 h-8 w-8 p-0 text-sm"
            >
              →
            </Button>
          </div>
        </main>
      </div>

      <ConfirmDeleteModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteConfirm}
      />

      <AddQuestionModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
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
        onImport={handleImportQuestions}
        availableTags={allTags}
      />

      <AssignQuizModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        selectedQuestions={selectedQuestions}
        mode={assignModalMode}
      />
    </div>
  );
}