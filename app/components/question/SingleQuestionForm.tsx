"use client";

import { useState, useEffect, useCallback } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import TagSelector from '../TagSelector';
import { Button } from '../ui/button';
import type { ChangeEvent } from 'react';

type SingleQuestionType = '單選題' | '多選題' | '填空題' | '簡答題';

type BaseFormData = {
  content: string;
  explanation: string;
  tags: string[];
};

type SingleQuestionFormData = BaseFormData & (
  | { type: '單選題'; options: string[]; answer: string }
  | { type: '多選題'; options: string[]; answer: string[] }
  | { type: '填空題'; answers: string[] }
  | { type: '簡答題'; answer: string }
);

interface SingleQuestionFormProps {
  type: SingleQuestionType;
  onChange: (data: SingleQuestionFormData) => void;
  defaultTags?: string[];
  isPremium?: boolean;
}

export default function SingleQuestionForm({ type, onChange, defaultTags = [], isPremium = false }: SingleQuestionFormProps) {
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number>(-1); // 改用索引
  const [selectedAnswerIndices, setSelectedAnswerIndices] = useState<number[]>([]); // 多選用索引陣列
  const [fillInAnswers, setFillInAnswers] = useState<string[]>([]);
  const [shortAnswer, setShortAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [blanks, setBlanks] = useState<string[]>([]);

  // Reset form when type changes
  useEffect(() => {
    setContent('');
    setOptions(['', '', '', '']);
    setSelectedAnswerIndex(-1);
    setSelectedAnswerIndices([]);
    setFillInAnswers([]);
    setShortAnswer('');
    setExplanation('');
    setTags(defaultTags);
    setBlanks([]);
  }, [type, defaultTags]);

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

  const handleMultipleChoiceChange = (index: number, checked: boolean) => {
    if (checked) {
      if (!selectedAnswerIndices.includes(index)) {
        setSelectedAnswerIndices([...selectedAnswerIndices, index]);
      }
    } else {
      setSelectedAnswerIndices(selectedAnswerIndices.filter(i => i !== index));
    }
  };

  const handleFillInAnswerChange = (index: number, value: string) => {
    const newAnswers = [...fillInAnswers];
    newAnswers[index] = value;
    setFillInAnswers(newAnswers);
  };

  const handleSubmit = () => {
    // 檢查必要欄位
    if (!content.trim()) {
      alert('請輸入題目內容');
      return;
    }

    if (type === '單選題' || type === '多選題') {
      // 檢查至少有兩個選項
      const validOptions = options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        alert('請至少填寫兩個選項');
        return;
      }

      if (type === '單選題' && selectedAnswerIndex === -1) {
        alert('請選擇正確答案');
        return;
      }

      if (type === '多選題' && selectedAnswerIndices.length === 0) {
        alert('請選擇至少一個正確答案');
        return;
      }
    }

    if (type === '填空題') {
      const newBlanks = extractBlanks(content);
      if (newBlanks.length === 0) {
        alert('請在題目中使用 [[答案]] 標記填空處');
        return;
      }

      if (fillInAnswers.some(ans => !ans.trim())) {
        alert('請填寫所有填空答案');
        return;
      }
    }

    if (type === '簡答題' && !shortAnswer.trim()) {
      alert('請輸入答案');
      return;
    }

    if (tags.length === 0) {
      alert('請至少選擇一個標籤');
      return;
    }

    const baseData: BaseFormData = {
      content,
      explanation,
      tags,
    };

    const formData: SingleQuestionFormData = type === '單選題' ? {
      ...baseData,
      type: '單選題',
      options,
      answer: selectedAnswerIndex >= 0 ? options[selectedAnswerIndex] : ''
    } : type === '多選題' ? {
      ...baseData,
      type: '多選題',
      options,
      answer: selectedAnswerIndices.map(i => options[i])
    } : type === '填空題' ? {
      ...baseData,
      type: '填空題',
      answers: fillInAnswers
    } : {
      ...baseData,
      type: '簡答題',
      answer: shortAnswer
    };

    onChange(formData);
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
          className="mt-1.5 placeholder:text-gray-400"
          required
        />
      </div>

      {(type === '單選題' || type === '多選題') && (
        <div className="space-y-4">
          <Label>選項</Label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-6">
                {type === '單選題' ? (
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="single-choice"
                    checked={selectedAnswerIndex === index}
                    onChange={() => handleSingleChoiceChange(index)}
                    className="h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary"
                  />
                ) : (
                  <Checkbox
                    checked={selectedAnswerIndices.includes(index)}
                    onCheckedChange={(checked) => handleMultipleChoiceChange(index, checked as boolean)}
                    className="rounded-full"
                  />
                )}
              </div>
              <Input
                value={option}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleOptionChange(index, e.target.value)}
                placeholder={`選項 ${String.fromCharCode(65 + index)}${index < 2 ? ' (必填)' : ''}`}
                className="placeholder:text-gray-400"
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
            className="mt-1.5 placeholder:text-gray-400"
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
          className="mt-1.5 placeholder:text-gray-400"
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

      <div className="flex justify-end">
        <Button type="submit">
        💾儲存
        </Button>
      </div>
    </form>
  );
}