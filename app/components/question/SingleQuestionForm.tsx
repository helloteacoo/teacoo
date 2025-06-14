"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import TagSelector from '../TagSelector';
import { Button } from '../ui/button';
import type { ChangeEvent } from 'react';
import type { Question, SingleChoiceQuestion, MultipleChoiceQuestion, FillInQuestion, ShortAnswerQuestion } from '../../types/question';
import { X } from 'lucide-react';

type SingleQuestionType = '單選題' | '多選題' | '填空題' | '簡答題';

type BaseFormData = {
  content: string;
  explanation: string;
  tags: string[];
};

type SingleQuestionFormData = BaseFormData & (
  | { type: '單選題'; options: string[]; answer: string }
  | { type: '多選題'; options: string[]; answers: string[] }
  | { type: '填空題'; answers: string[] }
  | { type: '簡答題'; answer: string }
);

type QuestionState = {
  id: string;
  content: string;
  explanation: string;
  tags: string[];
  type: SingleQuestionType;
  options: string[];
  answer: number | undefined;
  answers: number[];
  blanks: string[];
  shortAnswer: string;
  createdAt: string;
  updatedAt: string;
};

export interface SingleQuestionFormProps {
  type: SingleQuestionType;
  onChange: (data: Question) => void;
  defaultTags?: string[];
  isPremium?: boolean;
  initialData?: Question;
  allTags: string[];
}

function padOptions(options: string[] = [], minLength = 4): string[] {
  const padded = [...(options || [])];
  while (padded.length < minLength) {
    padded.push('');
  }
  return padded;
}

export default function SingleQuestionForm({
  type,
  onChange,
  defaultTags = [],
  isPremium = false,
  initialData,
  allTags
}: SingleQuestionFormProps) {
  console.log('🧩 type:', type, 'initialData?.type:', initialData?.type);

  const createEmptyQuestion = (): QuestionState => ({
    id: Math.random().toString(36).substring(7),
    content: '',
    explanation: '',
    tags: defaultTags,
    type: type,
    options: ['', '', '', ''],
    answer: undefined,
    answers: [],
    blanks: [],
    shortAnswer: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [questions, setQuestions] = useState<QuestionState[]>([createEmptyQuestion()]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 當前正在編輯的題目
  const currentQuestion = questions[currentQuestionIndex];

  const [content, setContent] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [answer, setAnswer] = useState<number | undefined>();
  const [answers, setAnswers] = useState<number[]>([]);
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [blanks, setBlanks] = useState<string[]>([]);
  const [shortAnswer, setShortAnswer] = useState('');
  const [showError, setShowError] = useState(false);

  const extractBlanks = useCallback((text: string) => {
    // 合併兩種格式的匹配結果
    const bracketMatches = text.match(/\[\[(.*?)\]\]/g) || [];
    const boldMatches = text.match(/\*\*(.*?)\*\*/g) || [];
    
    // 提取答案內容
    const bracketAnswers = bracketMatches.map(match => match.slice(2, -2));
    const boldAnswers = boldMatches.map(match => match.slice(2, -2));
    
    return [...bracketAnswers, ...boldAnswers];
  }, []);

  // 將粗體轉換為填空格式
  const convertBoldToBrackets = useCallback((text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '[[($1)]]');
  }, []);

  // 專門處理 initialData 的設定，不依賴 type
  useEffect(() => {
    if (initialData && 'content' in initialData) {
      console.log('🔥 SingleQuestionForm - initialData:', initialData);
      setContent(initialData.content || '');
      setExplanation(initialData.explanation || '');
      setTags(initialData.tags || []);

      if (initialData.type === '填空題' && 'blanks' in initialData) {
        const fillInData = initialData as FillInQuestion;
        setBlanks(fillInData.blanks || []);
      } else if (initialData.type === '單選題' && 'options' in initialData && 'answer' in initialData) {
        const mcData = initialData as SingleChoiceQuestion;
        setOptions(padOptions(mcData.options));
        setAnswer(mcData.answer);
      } else if (initialData.type === '多選題' && 'options' in initialData && 'answers' in initialData) {
        const mcData = initialData as MultipleChoiceQuestion;
        setOptions(padOptions(mcData.options));
        setAnswers(mcData.answers || []);
      } else if (initialData.type === '簡答題' && 'answer' in initialData) {
        const saData = initialData as ShortAnswerQuestion;
        setShortAnswer(saData.answer || '');
      }
    }
  }, [initialData, extractBlanks]);

  // Reset form when type changes and no initialData
  useEffect(() => {
    if (!initialData) {
      setContent('');
      setOptions(['', '', '', '']);
      setAnswer(undefined);
      setAnswers([]);
      setExplanation('');
      setTags(defaultTags);
      setBlanks([]);
      setShortAnswer('');
    }
  }, [type, defaultTags, initialData]);

  // 更新 content 時的處理
  useEffect(() => {
    if (type === '填空題' && content) {
      // 先將粗體轉換為填空格式
      const convertedContent = convertBoldToBrackets(content);
      if (convertedContent !== content) {
        setContent(convertedContent);
        return;
      }

      // 解析所有填空
      const newBlanks = extractBlanks(convertedContent);
      console.log('📝 解析填空:', { content: convertedContent, newBlanks });
      setBlanks(newBlanks);
      setAnswers(newBlanks.map((_, index) => index));
    }
  }, [content, type, extractBlanks, convertBoldToBrackets]);

  // 🧪 調試日誌
  useEffect(() => {
    console.log('🧪 渲染內容:', {
      content,
      answers,
      initialData,
      type,
      blanks
    });
  }, [content, answers, initialData, type, blanks]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAnswerChange = (optionIndex: number) => {
    const newAnswers = answers.includes(optionIndex)
      ? answers.filter(a => a !== optionIndex)
      : [...answers, optionIndex];
    setAnswers(newAnswers);
  };

  const validateForm = useMemo(() => {
    // 檢查是否選擇題型
    if (!type) {
      return '請選擇題型';
    }

    // 共同條件：題目內容不可為空
    if (!content.trim()) {
      return '請輸入題目內容';
    }

    // 共同條件：至少一個標籤
    if (tags.length === 0) {
      return '請至少選擇一個標籤';
    }

    switch (type) {
      case '單選題': {
        // 檢查至少有 A 和 B 兩個選項
        const validOptions = options.slice(0, 2).filter(opt => opt.trim());
        if (validOptions.length < 2) {
          return '請至少填寫選項 A 和 B';
        }
        // 必須選擇一個正確答案
        if (answer === undefined) {
          return '請選擇正確答案';
        }
        break;
      }

      case '多選題': {
        // 檢查前三個必填選項
        const requiredOptions = options.slice(0, 3).filter(opt => opt.trim());
        if (requiredOptions.length < 3) {
          return '請填寫前三個必填選項';
        }
        // 檢查是否選擇了至少兩個答案
        if (answers.length < 2) {
          return '請至少選擇兩個答案';
        }
        // 檢查所有選擇的答案是否有效
        if (answers.some(index => !options[index]?.trim())) {
          return '請確保所有選擇的答案都已填寫';
        }
        break;
      }

      case '填空題': {
        // 檢查是否有填空標記
        const newBlanks = extractBlanks(content);
        if (newBlanks.length === 0) {
          return '請在題目中使用 [[答案]] 標記填空處';
        }
        // 檢查所有答案是否填寫
        if (blanks.some(ans => !ans.trim())) {
          return '請填寫所有填空答案';
        }
        break;
      }

      case '簡答題': {
        // 檢查標準答案是否填寫
        if (!shortAnswer.trim()) {
          return '請輸入標準答案';
        }
        break;
      }
    }

    return ''; // 通過所有驗證
  }, [
    type,
    content,
    options,
    answer,
    answers,
    shortAnswer,
    tags,
    extractBlanks,
    blanks
  ]);

  const handleAddAnswer = () => {
    setOptions([...options, '']);
  };

  const handleRemoveAnswer = (index: number) => {
    // 如果是多選題且是前三個選項，不允許刪除
    if (type === '多選題' && index < 3) {
      return;
    }
    
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);

    // 更新正確答案
    if (type === '單選題' && answer === index) {
      setAnswer(undefined);
    } else if (type === '多選題') {
      setAnswers(answers.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    }
  };

  // 新增題目
  const handleAddQuestion = () => {
    const newQuestion = createEmptyQuestion();
    newQuestion.tags = tags; // 繼承當前題目的標籤
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
    
    // 清空表單，但保留標籤
    setContent('');
    setOptions(['', '', '', '']);
    setAnswer(undefined);
    setAnswers([]);
    setExplanation('');
    setBlanks([]);
    setShortAnswer('');
  };

  // 切換題目
  const handleQuestionChange = (index: number) => {
    // 先儲存當前題目的狀態
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      content,
      explanation,
      tags,
      options,
      answer,
      answers,
      blanks,
      shortAnswer,
      updatedAt: new Date().toISOString(),
    };
    setQuestions(updatedQuestions);

    // 切換到選擇的題目
    setCurrentQuestionIndex(index);
    const selectedQuestion = updatedQuestions[index];
    
    // 更新表單狀態
    setContent(selectedQuestion.content);
    setExplanation(selectedQuestion.explanation);
    setTags(selectedQuestion.tags);
    setOptions(selectedQuestion.options);
    setAnswer(selectedQuestion.answer);
    setAnswers(selectedQuestion.answers);
    setBlanks(selectedQuestion.blanks);
    setShortAnswer(selectedQuestion.shortAnswer);
  };

  // 刪除題目
  const handleDeleteQuestion = (index: number) => {
    if (questions.length === 1) {
      alert('至少要保留一題');
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    if (currentQuestionIndex >= index) {
      setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
    }
  };

  const handleSubmit = () => {
    // 先儲存當前題目的狀態
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      content,
      explanation,
      tags,
      options,
      answer,
      answers,
      blanks,
      shortAnswer,
      updatedAt: new Date().toISOString(),
    };

    // 驗證所有題目
    for (const q of updatedQuestions) {
      if (!q.content.trim()) {
        alert('所有題目都必須填寫內容');
        return;
      }
      if (q.tags.length === 0) {
        alert('所有題目都必須選擇至少一個標籤');
        return;
      }
      // 根據題型檢查必填欄位
      if (type === '單選題' && q.answer === undefined) {
        alert('所有單選題都必須選擇正確答案');
        return;
      }
      if (type === '多選題' && q.answers.length < 2) {
        alert('所有多選題都必須選擇至少兩個答案');
        return;
      }
      if (type === '填空題' && q.blanks.some(b => !b.trim())) {
        alert('所有填空題都必須填寫答案');
        return;
      }
      if (type === '簡答題' && !q.shortAnswer.trim()) {
        alert('所有簡答題都必須填寫答案');
        return;
      }
    }

    // 將每個題目轉換為正確的型別並儲存
    updatedQuestions.forEach(q => {
      let questionData: Question;
      const baseData = {
        id: q.id,
        content: q.content,
        explanation: q.explanation,
        tags: q.tags,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      };

      switch (type) {
        case '單選題':
          if (q.answer === undefined) return;
          questionData = {
            ...baseData,
            type: '單選題',
            options: q.options.filter(Boolean),
            answer: q.answer,
          } as SingleChoiceQuestion;
          break;

        case '多選題':
          questionData = {
            ...baseData,
            type: '多選題',
            options: q.options.filter(Boolean),
            answers: q.answers,
          } as MultipleChoiceQuestion;
          break;

        case '填空題':
          questionData = {
            ...baseData,
            type: '填空題',
            blanks: q.blanks,
          } as FillInQuestion;
          break;

        case '簡答題':
          questionData = {
            ...baseData,
            type: '簡答題',
            answer: q.shortAnswer,
          } as ShortAnswerQuestion;
          break;

        default:
          throw new Error(`未知的題型：${type}`);
      }

      onChange(questionData);
    });
  };

  const renderAnswerInput = () => {
    switch (type) {
      case '單選題':
        return (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroup value={answer?.toString() || ''} onValueChange={(value) => setAnswer(parseInt(value))}>
                  <RadioGroupItem value={index.toString()} />
                </RadioGroup>
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`選項 ${index + 1}${index < 2 ? ' (必填)' : ''}`}
                  className="placeholder:text-gray-400 dark:bg-white dark:text-gray-800 dark:border-gray-300"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAnswer}
              className="mt-2"
            >
              新增選項
            </Button>
          </div>
        );
      case '多選題':
        return (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  checked={answers.includes(index)}
                  onCheckedChange={(checked) => {
                    const newAnswers = [...answers];
                    if (checked) {
                      newAnswers.push(index);
                    } else {
                      const answerIndex = newAnswers.indexOf(index);
                      if (answerIndex > -1) {
                        newAnswers.splice(answerIndex, 1);
                      }
                    }
                    setAnswers(newAnswers);
                  }}
                />
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`選項 ${index + 1}${index < 3 ? ' (必填)' : ''}`}
                  className="placeholder:text-gray-400 dark:bg-white dark:text-gray-800 dark:border-gray-300"
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAnswer}
              className="mt-2"
            >
              新增選項
            </Button>
          </div>
        );
      case '填空題':
        return (
          <div className="space-y-4">
            <Label>填空答案</Label>
            {blanks.map((blank, index) => (
              <div key={index} className="flex items-center gap-3">
                <Label className="w-20">空格 {index + 1}:</Label>
                <div className="flex-1 p-2 border rounded-md bg-gray-50">
                  {blank}
                </div>
              </div>
            ))}
          </div>
        );
      case '簡答題':
        return (
          <div>
            <Label>答案</Label>
            <Textarea
              value={shortAnswer}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setShortAnswer(e.target.value)}
              placeholder="請輸入答案"
              className="mt-1.5 placeholder:text-gray-400 dark:bg-white dark:text-gray-800 dark:border-gray-300"
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form 
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {/* 題目切換區 */}
      <div className="flex items-center gap-2 mb-4 max-w-full">
        <div className="flex-1 flex gap-2 overflow-x-auto pb-2 min-w-0">
          <div className="flex gap-2 min-w-min">
            {questions.map((q, index) => (
              <Button
                key={q.id}
                type="button"
                variant={currentQuestionIndex === index ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuestionChange(index)}
                className={`whitespace-nowrap ${
                  currentQuestionIndex === index 
                    ? 'bg-primary text-white'
                    : 'text-gray-600'
                }`}
              >
                題目 {index + 1}
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuestion(index);
                    }}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                )}
              </Button>
            ))}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddQuestion}
          className="flex-shrink-0 text-gray-600 dark:text-gray-800 dark:border-gray-700 dark:hover:bg-gray-300"
        >
          再出一題
        </Button>
      </div>

      <div>
        <Label>題目內容</Label>
        <Textarea
          value={content}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          placeholder={type === '填空題' ? '請使用 [[答案]] 標記填空處...' : '請輸入題目內容...'}
          className="mt-1.5 placeholder:text-gray-400 dark:bg-white dark:text-gray-800 dark:border-gray-300"
          required
        />
      </div>

      {renderAnswerInput()}

      <div>
        <Label>解說 (選填)</Label>
        <Textarea
          value={explanation}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setExplanation(e.target.value)}
          placeholder="請輸入解說..."
          className="mt-1.5 placeholder:text-gray-400 dark:bg-white dark:text-gray-800 dark:border-gray-300"
        />
      </div>

      <div>
        <Label>標籤</Label>
        <TagSelector
          value={tags}
          onChange={setTags}
          className="mt-1.5"
          maxTags={4}
          minTags={1}
          allTags={allTags}
          disabled={false}
        />
      </div>

      <div className="flex justify-end gap-4 items-center">
        {showError && validateForm && (
          <span className="text-red-500 animate-fadeIn text-sm">
            ⚠️ {validateForm}
          </span>
        )}
        <Button 
          type="submit" 
          className={`transition ${validateForm ? 'cursor-not-allowed opacity-50' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setShowError(true);
            setTimeout(() => setShowError(false), 3000);
            if (validateForm) {
              return;
            }
            handleSubmit();
          }}
        >
          <span className="text-white dark:text-mainBg">💾儲存 ({questions.length})</span>
        </Button>
      </div>
    </form>
  );
}