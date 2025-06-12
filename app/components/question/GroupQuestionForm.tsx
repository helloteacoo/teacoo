"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import TagSelector from '../TagSelector';
import type { ChangeEvent } from 'react';
import type { 
  Question, 
  ReadingQuestion, 
  ClozeQuestion, 
  SubQuestion,
  ClozeSubQuestion 
} from '../../types/question';

export interface GroupQuestionFormProps {
  type: '閱讀測驗' | '克漏字';
  onChange: (data: Question) => void;
  defaultTags?: string[];
  isPremium?: boolean;
  initialData?: Question;
}

export default function GroupQuestionForm({
  type,
  onChange,
  defaultTags = [],
  isPremium = false,
  initialData
}: GroupQuestionFormProps) {
  const [article, setArticle] = useState('');
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState<(SubQuestion | ClozeSubQuestion)[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [explanation, setExplanation] = useState('');
  const [blankError, setBlankError] = useState<string>('');
  const [showError, setShowError] = useState(false);

  // 同步 initialData 的變化
  useEffect(() => {
    console.log('🧪 GroupQuestionForm - initialData:', initialData);
    if (initialData && initialData.type === type) {
      if (type === '閱讀測驗') {
        const data = initialData as ReadingQuestion;
        setArticle(data.article);
        setContent(data.content || '');
        setExplanation(data.explanation || '');
        setTags(data.tags);

        const formattedQuestions = data.questions.map(q => ({
          ...q,
          selectedOptionId: `q${q.id}-option-${q.options.indexOf(q.answer)}`
        }));
        setQuestions(formattedQuestions);
      } else {
        const data = initialData as ClozeQuestion;
        setArticle(data.article);
        setContent(data.content || '');
        setExplanation(data.explanation || '');
        setTags(data.tags);

        const formattedQuestions = data.questions.map(q => ({
          ...q,
          selectedOptionId: `q${q.id}-option-${q.options.indexOf(q.answer)}`
        }));
        setQuestions(formattedQuestions);
      }
    }
  }, [initialData, type]);

  // Reset form when type changes
  useEffect(() => {
    if (!initialData) {
      setArticle('');
      setContent('');
      setQuestions([]);
      setTags(defaultTags);
      setExplanation('');
    }
  }, [type, defaultTags, initialData]);

  const extractBlanks = useCallback((text: string) => {
    const matches = text.match(/\[\[(\d+)\]\]/g) || [];
    return matches.map(match => ({
      id: Math.random().toString(36).substring(7),
      options: ['', '', '', ''],
      answer: '',
      selectedOptionId: '',
    }));
  }, []);

  const validateBlanks = useCallback((text: string) => {
    const matches = text.match(/\[\[(\d+)\]\]/g) || [];
    const numbers = matches.map(match => parseInt(match.match(/\d+/)?.[0] || '0'));
    
    // 檢查是否有重複的編號
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      return '空格編號有重複';
    }

    // 檢查是否從1開始且連續
    const sortedNumbers = Array.from(uniqueNumbers).sort((a, b) => a - b);
    if (sortedNumbers[0] !== 1) {
      return '空格編號必須從1開始';
    }
    
    for (let i = 1; i < sortedNumbers.length; i++) {
      if (sortedNumbers[i] !== sortedNumbers[i-1] + 1) {
        return '空格編號必須連續';
      }
    }

    return '';
  }, []);

  useEffect(() => {
    if (type === '克漏字') {
      const error = validateBlanks(article);
      setBlankError(error);
      
      if (!error) {
        const newQuestions = extractBlanks(article);
        if (newQuestions.length > 0 && newQuestions.length !== questions.length) {
          setQuestions(newQuestions);
        }
      }
    }
  }, [article, type, extractBlanks, questions.length, validateBlanks]);

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    if (field === 'answer') {
      newQuestions[index] = { 
        ...newQuestions[index], 
        selectedOptionId: value,
        answer: value ? newQuestions[index].options[parseInt(value.split('-').pop() || '0')] : ''
      };
    } else if (type === '閱讀測驗' && (field === 'content' || field === 'explanation')) {
      newQuestions[index] = { 
        ...newQuestions[index], 
        [field]: value 
      } as SubQuestion;
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

  const validateForm = useMemo(() => {
    // 共同條件：至少一個標籤
    if (tags.length === 0) {
      return '請至少選擇一個標籤';
    }

    // 文章內容不可為空
    if (!article.trim()) {
      return '請輸入文章內容';
    }

    if (type === '閱讀測驗') {
      // 至少要有一個子題
      if (questions.length === 0) {
        return '請至少添加一個子題目';
      }

      // 檢查每個子題
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i] as SubQuestion;
        
        // 題目內容不可為空
        if (!q.content?.trim()) {
          return `第 ${i + 1} 個子題目的內容不可為空`;
        }

        // 至少要有 A 和 B 兩個選項
        const validOptions = q.options.slice(0, 2).filter(opt => opt.trim());
        if (validOptions.length < 2) {
          return `請為第 ${i + 1} 個子題目至少填寫選項 A 和 B`;
        }

        // 必須選擇一個正確答案
        if (!q.answer) {
          return `請為第 ${i + 1} 個子題目選擇正確答案`;
        }
      }
    } else if (type === '克漏字') {
      // 檢查空格編號
      const error = validateBlanks(article);
      if (error) {
        return error;
      }

      // 檢查每個空格的選項
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i] as ClozeSubQuestion;
        
        // 至少要有 A 和 B 兩個選項
        const validOptions = q.options.slice(0, 2).filter(opt => opt.trim());
        if (validOptions.length < 2) {
          return `請為第 ${i + 1} 個空格至少填寫選項 A 和 B`;
        }

        // 必須選擇一個正確答案
        if (!q.answer) {
          return `請為第 ${i + 1} 個空格選擇正確答案`;
        }
      }
    }

    return ''; // 通過所有驗證
  }, [
    type,
    article,
    questions,
    tags,
    validateBlanks
  ]);

  const handleSubmit = () => {
    // 檢查必要欄位
    if (!article.trim()) {
      alert('請輸入文章內容');
      return;
    }

    if (type === '閱讀測驗') {
      if (questions.length === 0) {
        alert('請至少添加一個子題目');
        return;
      }

      // 檢查每個子題目
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i] as SubQuestion;
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

        if (!q.answer) {
          alert(`請為第 ${i + 1} 個子題目選擇正確答案`);
          return;
        }
      }
    } else if (type === '克漏字') {
      const blanks = extractBlanks(article);
      if (blanks.length === 0) {
        alert('請在文章中使用 [[1]], [[2]]... 標記空格處');
        return;
      }

      // 檢查每個空格的選項
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i] as ClozeSubQuestion;
        // 檢查至少有兩個選項
        const validOptions = q.options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          alert(`請為第 ${i + 1} 個空格至少填寫兩個選項`);
          return;
        }

        if (!q.answer) {
          alert(`請為第 ${i + 1} 個空格選擇正確答案`);
          return;
        }
      }
    }

    if (tags.length === 0) {
      alert('請至少選擇一個標籤');
      return;
    }

    const baseData = {
      id: Math.random().toString(36).substring(7),
      type,
      content: type === '克漏字' ? '' : content,
      article,
      explanation,
      tags,
    };

    let questionData: Question;

    if (type === '閱讀測驗') {
      questionData = {
        ...baseData,
        questions: (questions as SubQuestion[]).map(q => ({
          id: q.id,
          content: q.content,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation
        }))
      } as ReadingQuestion;
    } else {
      questionData = {
        ...baseData,
        questions: (questions as ClozeSubQuestion[]).map(q => ({
          id: q.id,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation
        }))
      } as ClozeQuestion;
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
        <Label>文章內容</Label>
        <Textarea
          value={article}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setArticle(e.target.value)}
          placeholder={type === '克漏字' ? '請使用 [[1]], [[2]]... 標記空格處' : '請輸入文章內容...'}
          className="mt-1.5 placeholder:text-gray-400"
          required
        />
      </div>

      {type === '閱讀測驗' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label>子題目</Label>
            <button
              type="button"
              onClick={addQuestion}
              className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
            >
              新增子題
            </button>
          </div>

          {questions.map((question, questionIndex) => (
            <div key={question.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Label>題目 {questionIndex + 1}</Label>
                  <Textarea
                    value={(question as SubQuestion).content}
                    onChange={(e) => handleQuestionChange(questionIndex, 'content', e.target.value)}
                    placeholder="請輸入題目內容..."
                    className="mt-1.5 placeholder:text-gray-400"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="px-2 py-1 text-sm text-red-500 hover:text-red-600"
                >
                  🗑️
                </button>
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

              {'explanation' in question && (
                <div>
                  <Label>解說 (選填)</Label>
                  <Textarea
                    value={question.explanation || ''}
                    onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                    placeholder="請輸入解說..."
                    className="mt-1.5 placeholder:text-gray-400"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {type === '克漏字' && questions.length > 0 && (
        <div className="space-y-6">
          <Label>空格選項</Label>
          {questions.map((question, questionIndex) => (
            <div key={question.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <Label>空格 {questionIndex + 1}</Label>
              </div>

              <div className="space-y-3">
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
                  placeholder="請輸入此空格的解說..."
                  className="mt-1.5 placeholder:text-gray-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}

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