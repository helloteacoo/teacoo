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
import type { Question, SingleChoiceQuestion, FillInQuestion, ShortAnswerQuestion } from '../../types/question';

type SingleQuestionType = '單選題' | '填空題' | '簡答題';

type BaseFormData = {
  content: string;
  explanation: string;
  tags: string[];
};

type SingleQuestionFormData = BaseFormData & (
  | { type: '單選題'; options: string[]; answer: string }
  | { type: '填空題'; answers: string[] }
  | { type: '簡答題'; answer: string }
);

export interface SingleQuestionFormProps {
  type: '單選題' | '填空題' | '簡答題';
  onChange: (data: Question) => void;
  defaultTags?: string[];
  isPremium?: boolean;
  initialData?: Question;
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
  initialData
}: SingleQuestionFormProps) {
  const [content, setContent] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [answer, setAnswer] = useState('');
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(-1);
  const [fillInAnswers, setFillInAnswers] = useState<string[]>([]);
  const [shortAnswer, setShortAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [blanks, setBlanks] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);

  // 專門處理 convertedData 的初始設定
  useEffect(() => {
    console.log('🔥 SingleQuestionForm - initialData:', initialData);
    console.log('🔥 SingleQuestionForm - type:', type);

    if (initialData && initialData.type === type) {
      setContent(initialData.content);
      setExplanation(initialData.explanation || '');
      setTags(initialData.tags);

      if (type === '單選題') {
        const data = initialData as SingleChoiceQuestion;
        console.log('🔍 單選題資料:', {
          options: data.options,
          answer: data.answer,
          correctIndex: data.correctIndex ?? data.options.findIndex(opt => opt === data.answer),
          paddedOptions: padOptions(data.options)
        });

        const correctIndex = data.correctIndex ?? data.options.findIndex(opt => opt === data.answer);
        setSelectedAnswerIndex(correctIndex);
        setOptions(padOptions(data.options));
      }

      if (type === '填空題') {
        const data = initialData as FillInQuestion;
        setFillInAnswers(data.answers);
      }

      if (type === '簡答題') {
        const data = initialData as ShortAnswerQuestion;
        setShortAnswer(data.answer);
      }
    }
  }, [initialData, type]);

  // Reset form when type changes
  useEffect(() => {
    if (!initialData) {
      setContent('');
      setOptions(padOptions());  // 使用 padOptions 確保有四個空選項
      setAnswer('');
      setSelectedAnswerIndex(-1);
      setFillInAnswers([]);
      setShortAnswer('');
      setExplanation('');
      setTags(defaultTags);
      setBlanks([]);
    }
  }, [type, defaultTags, initialData]);

  const extractBlanks = useCallback((text: string) => {
    const matches = text.match(/\[\[(.*?)\]\]/g) || [];
    return matches.map(match => match.slice(2, -2));
  }, []);

  useEffect(() => {
    if (type === '填空題') {
      const newBlanks = extractBlanks(content);
      setBlanks(newBlanks);
      // 自動設置填空答案
      setFillInAnswers(newBlanks);
    }
  }, [content, type, extractBlanks]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSingleChoiceChange = (index: number) => {
    if (selectedAnswerIndex === index) {
      setSelectedAnswerIndex(-1); // 取消選擇
    } else {
      setSelectedAnswerIndex(index); // 選擇新的選項
    }
  };

  const handleFillInAnswerChange = (index: number, value: string) => {
    const newAnswers = [...fillInAnswers];
    newAnswers[index] = value;
    setFillInAnswers(newAnswers);
  };

  const validateForm = useMemo(() => {
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
        if (selectedAnswerIndex === -1) {
          return '請選擇正確答案';
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
        if (fillInAnswers.some(ans => !ans.trim())) {
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
    selectedAnswerIndex,
    fillInAnswers,
    shortAnswer,
    tags,
    extractBlanks
  ]);

  const handleSubmit = () => {
    // 檢查必要欄位
    if (!content.trim()) {
      alert('請輸入題目內容');
      return;
    }

    if (type === '單選題' && selectedAnswerIndex === -1) {
      alert('請選擇正確答案');
      return;
    }

    if (type === '填空題' && fillInAnswers.some(ans => !ans.trim())) {
      alert('請填寫所有填空答案');
      return;
    }

    if (type === '簡答題' && !shortAnswer.trim()) {
      alert('請輸入答案');
      return;
    }

    if (tags.length === 0) {
      alert('請至少選擇一個標籤');
      return;
    }

    const baseData = {
      id: Math.random().toString(36).substring(7),
      content,
      explanation,
      tags,
    };

    let questionData: Question;

    switch (type) {
      case '單選題':
        questionData = {
          ...baseData,
          type,
          options,
          answer: options[selectedAnswerIndex],
        } as SingleChoiceQuestion;
        break;

      case '填空題':
        questionData = {
          ...baseData,
          type,
          answers: fillInAnswers,
        } as FillInQuestion;
        break;

      case '簡答題':
        questionData = {
          ...baseData,
          type,
          answer: shortAnswer,
        } as ShortAnswerQuestion;
        break;

      default:
        throw new Error(`未知的題型：${type}`);
    }

    onChange(questionData);
  };

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
          placeholder={type === '填空題' ? '請使用 [[答案]] 標記填空處...' : '請輸入題目內容...'}
          className="mt-1.5 placeholder:text-gray-400 dark:bg-white dark:text-gray-800 dark:border-gray-300"
          required
        />
      </div>

      {type === '單選題' && (
        <div className="space-y-4">
          <Label>選項</Label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-6">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="single-choice"
                  checked={selectedAnswerIndex === index}
                  onChange={() => handleSingleChoiceChange(index)}
                  className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <Input
                value={option}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleOptionChange(index, e.target.value)}
                placeholder={`選項 ${String.fromCharCode(65 + index)}${index < 2 ? ' (必填)' : ''}`}
                className="placeholder:text-gray-400 dark:bg-white dark:text-gray-800 dark:border-gray-300"
                required={index < 2}
              />
            </div>
          ))}
        </div>
      )}

      {type === '填空題' && blanks.length > 0 && (
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
      )}

      {type === '簡答題' && (
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
      )}

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
          defaultTags={defaultTags}
          className="mt-1.5"
          maxTags={isPremium ? 5 : 2}
        />
      </div>

      <div className="flex justify-end gap-4 items-center">
        {showError && validateForm && (
          <span className="text-red-500">⚠️ {validateForm}</span>
        )}
        <div 
          onClick={() => {
            if (validateForm) {
              setShowError(true);
            }
          }}
        >
          <Button type="submit" disabled={!!validateForm}>
            <span className="text-white dark:text-mainBg">💾儲存</span>
          </Button>
        </div>
      </div>
    </form>
  );
}