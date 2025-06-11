"use client";

import { useState, useEffect, useCallback } from 'react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import TagSelector from '../TagSelector';
import type { ChangeEvent } from 'react';
import type { ReadingQuestion, ClozeQuestion } from '../../types/question';

type GroupQuestionType = '閱讀測驗' | '克漏字';

interface GroupQuestionFormProps {
  type: GroupQuestionType;
  onChange: (data: ReadingQuestion | ClozeQuestion) => void;
  defaultTags?: string[];
  isPremium?: boolean;
}

interface SubQuestion {
  id: string;
  content: string;
  options: string[];
  answer: string;
  explanation?: string;
  selectedOptionId?: string;
}

export default function GroupQuestionForm({ type, onChange, defaultTags = [], isPremium = false }: GroupQuestionFormProps) {
  const [article, setArticle] = useState('');
  const [questions, setQuestions] = useState<SubQuestion[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');

  // Reset form when type changes
  useEffect(() => {
    setArticle('');
    setQuestions([]);
    setTags(defaultTags);
    setExplanation('');
  }, [type, defaultTags]);

  const extractBlanks = useCallback((text: string) => {
    const matches = text.match(/\[\[(\d+)\]\]/g) || [];
    return matches.map(match => ({
      id: Math.random().toString(36).substring(7),
      content: '',
      options: ['', '', '', ''],
      answer: '',
    }));
  }, []);

  useEffect(() => {
    if (type === '克漏字') {
      const newQuestions = extractBlanks(article);
      if (newQuestions.length > 0 && newQuestions.length !== questions.length) {
        setQuestions(newQuestions);
      }
    }
  }, [article, type, extractBlanks, questions.length]);

  const handleQuestionChange = (index: number, field: keyof SubQuestion, value: string) => {
    const newQuestions = [...questions];
    if (field === 'answer') {
      newQuestions[index] = { 
        ...newQuestions[index], 
        selectedOptionId: value,
        answer: value ? newQuestions[index].options[parseInt(value.split('-').pop() || '0')] : ''
      };
    } else {
      newQuestions[index] = { ...newQuestions[index], [field]: value };
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    const options = [...newQuestions[questionIndex].options];
    options[optionIndex] = value;
    newQuestions[questionIndex] = { ...newQuestions[questionIndex], options };
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Math.random().toString(36).substring(7),
        content: '',
        options: ['', '', '', ''],
        answer: '',
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // 檢查必要欄位
    if (!article.trim()) {
      alert('請輸入文章內容');
      return;
    }

    if (type === '克漏字') {
      const blanks = extractBlanks(article);
      if (blanks.length === 0) {
        alert('請在文章中使用 [[1]], [[2]]... 標記空格處');
        return;
      }
    }

    if (questions.length === 0) {
      alert('請至少添加一個子題目');
      return;
    }

    // 檢查每個子題目
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content.trim()) {
        alert(`請輸入第 ${i + 1} 個子題目的內容`);
        return;
      }

      // 檢查至少有兩個選項
      const validOptions = q.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        alert(`請為第 ${i + 1} 個子題目至少填寫兩個選項`);
        return;
      }

      if (!q.selectedOptionId) {
        alert(`請為第 ${i + 1} 個子題目選擇正確答案`);
        return;
      }
    }

    if (tags.length === 0) {
      alert('請至少選擇一個標籤');
      return;
    }

    // 提交前將 selectedOptionId 轉換為對應的選項文字
    const formattedQuestions = questions.map(q => {
      // 只保留需要的欄位
      const { selectedOptionId, ...rest } = q;
      return rest;
    });

    const formData = {
      type,
      article,
      questions: formattedQuestions,
      explanation,
      tags,
    } as ReadingQuestion | ClozeQuestion;

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
        <Label>文章內容</Label>
        <Textarea
          value={article}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setArticle(e.target.value)}
          placeholder={type === '克漏字' ? '請使用 [[1]], [[2]]... 標記空格處' : '請輸入文章內容...'}
          className="mt-1.5 placeholder:text-gray-400"
          required
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>子題目</Label>
          {type === '閱讀測驗' && (
            <button
              type="button"
              onClick={addQuestion}
              className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
            >
              新增子題
            </button>
          )}
        </div>

        {questions.map((question, questionIndex) => (
          <div key={question.id} className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label>題目 {questionIndex + 1}</Label>
                <Textarea
                  value={question.content}
                  onChange={(e) => handleQuestionChange(questionIndex, 'content', e.target.value)}
                  placeholder="請輸入題目內容..."
                  className="mt-1.5 placeholder:text-gray-400"
                  required
                />
              </div>
              {type === '閱讀測驗' && (
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="px-2 py-1 text-sm text-red-500 hover:text-red-600"
                >
                  🗑️
                </button>
              )}
            </div>

            <div className="space-y-3">
              <Label>選項</Label>
              <RadioGroup
                value={question.selectedOptionId}
                onValueChange={(value) => {
                  if (value.trim()) {
                    handleQuestionChange(questionIndex, 'answer', value);
                  }
                }}
              >
                {question.options.map((option, optionIndex) => {
                  const optionId = `q${questionIndex}-option-${optionIndex}`;
                  return (
                    <div key={optionId} className="flex items-center gap-3">
                      <div className="w-6">
                        <RadioGroupItem value={optionId} id={optionId} />
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => {
                          handleOptionChange(questionIndex, optionIndex, e.target.value);
                          // 如果使用者剛好修改的是已選中的選項，更新正解內容
                          if (question.selectedOptionId === optionId) {
                            handleQuestionChange(questionIndex, 'answer', optionId);
                          }
                        }}
                        placeholder={`選項 ${String.fromCharCode(65 + optionIndex)}${optionIndex < 2 ? ' (必填)' : ''}`}
                        className="placeholder:text-gray-400"
                        required={optionIndex < 2}
                      />
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            <div>
              <Label>解說 (選填)</Label>
              <Textarea
                value={question.explanation || ''}
                onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                placeholder="請輸入解說..."
                className="mt-1.5 placeholder:text-gray-400"
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <Label>整體解說 (選填)</Label>
        <Textarea
          value={explanation}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setExplanation(e.target.value)}
          placeholder="請輸入整體解說..."
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