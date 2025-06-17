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

  const [content, setContent] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [answer, setAnswer] = useState<number | undefined>();
  const [answers, setAnswers] = useState<number[]>([]);
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [blanks, setBlanks] = useState<string[]>([]);
  const [shortAnswer, setShortAnswer] = useState('');
  const [showError, setShowError] = useState(false);

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
  }, [initialData]);

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

  // 移除 content 變更時的填空處理
  useEffect(() => {
    if (type === '填空題' && content) {
      // 不再從內容中提取填空
      console.log('📝 填空題內容更新:', { content });
    }
  }, [content, type]);

  const handleSubmit = () => {
    let questionData: Question;
    const baseData = {
      id: initialData?.id || Math.random().toString(36).substring(7),
      content,
      explanation,
      tags,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    switch (type) {
      case '單選題':
        if (answer === undefined) return;
        questionData = {
          ...baseData,
          type: '單選題',
          options: options.filter(Boolean),
          answer: answer,
        } as SingleChoiceQuestion;
        break;

      case '多選題':
        questionData = {
          ...baseData,
          type: '多選題',
          options: options.filter(Boolean),
          answers: answers,
        } as MultipleChoiceQuestion;
        break;

      case '填空題':
        questionData = {
          ...baseData,
          type: '填空題',
          blanks: blanks,
        } as FillInQuestion;
        break;

      case '簡答題':
        questionData = {
          ...baseData,
          type: '簡答題',
          answer: shortAnswer,
        } as ShortAnswerQuestion;
        break;

      default:
        throw new Error(`未知的題型：${type}`);
    }

    onChange(questionData);
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
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  placeholder={`選項 ${index + 1}${index < 2 ? ' (必填)' : ''}`}
                  className="placeholder:text-gray-400 bg-mainBg dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                />
              </div>
            ))}
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
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[index] = e.target.value;
                    setOptions(newOptions);
                  }}
                  placeholder={`選項 ${index + 1}${index < 3 ? ' (必填)' : ''}`}
                  className="placeholder:text-gray-400 bg-mainBg dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                />
              </div>
            ))}
          </div>
        );
      case '填空題':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>填空答案</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBlanks([...blanks, ''])}
                className="text-xs"
              >
                新增答案
              </Button>
            </div>
            {blanks.map((blank, index) => (
              <div key={index} className="flex items-center gap-3">
                <Label className="w-20">空格 {index + 1}:</Label>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={blank}
                    onChange={(e) => {
                      const newBlanks = [...blanks];
                      newBlanks[index] = e.target.value;
                      setBlanks(newBlanks);
                    }}
                    placeholder="請輸入答案..."
                    className="flex-1 bg-mainBg dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newBlanks = [...blanks];
                      newBlanks.splice(index, 1);
                      setBlanks(newBlanks);
                    }}
                    className="text-gray-500 hover:text-red-500"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
            {blanks.length === 0 && (
              <div className="text-gray-500 text-center py-2">
                請點擊「新增答案」來新增填空答案
              </div>
            )}
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
              className="mt-1.5 placeholder:text-gray-400 hover:bg-primary/80 dark:text-gray-800 dark:border-gray-700"
              required
            />
          </div>
        );
      default:
        return null;
    }
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
        // 只檢查是否有填寫答案
        if (blanks.length === 0) {
          return '請新增至少一個填空答案';
        }
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

    // 共同條件：至少一個標籤
    if (tags.length === 0) {
      return '請至少選擇一個標籤';
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
    blanks
  ]);

  return (
    <form 
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div>
        <Label>題目內容</Label>
        <Textarea
          value={content}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          placeholder={type === '填空題' ? '請輸入題目內容...' : '請輸入題目內容...'}
          className="mt-1.5 placeholder:text-gray-400 bg-mainBg dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
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
          className="mt-1.5 placeholder:text-gray-400 bg-mainBg dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
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
          <span className="text-white dark:text-mainBg">💾儲存</span>
        </Button>
      </div>
    </form>
  );
}