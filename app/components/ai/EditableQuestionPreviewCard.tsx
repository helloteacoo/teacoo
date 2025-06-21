import { Question, SingleChoiceQuestion, MultipleChoiceQuestion, FillInQuestion, ShortAnswerQuestion, ReadingQuestion, ClozeQuestion } from '@/app/types/question';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import TagSelector from '@/app/components/TagSelector';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';

interface Props {
  question: Question;
  questions: Question[];
  currentIndex: number;
  totalQuestions: number;
  availableTags: string[];
  onPrevious: () => void;
  onNext: () => void;
  onImport: (questions: Question[]) => void;
  onSkip: () => void;
}

const QUESTION_TYPES = [
  { value: '單選題', label: 'ai.questionTypes.single' },
  { value: '多選題', label: 'ai.questionTypes.multiple' },
  { value: '填空題', label: 'ai.questionTypes.fillIn' },
  { value: '簡答題', label: 'ai.questionTypes.shortAnswer' },
  { value: '閱讀測驗', label: 'ai.questionTypes.reading' },
  { value: '克漏字', label: 'ai.questionTypes.cloze' },
];

function sanitizeQuestion(raw: any): Question | null {
  try {
    const base = {
      id: raw.id || '',
      content: raw.content || '',
      explanation: raw.explanation || '',
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      type: raw.type || '單選題',
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || new Date().toISOString(),
    };

    // 如果沒有選項或答案，但有之前的題型，保留該題型的基本結構
    const previousType = raw.type;
    if (previousType) {
      switch (previousType) {
        case '單選題':
          return {
            ...base,
            type: '單選題',
            options: Array.isArray(raw.options) && raw.options.length > 0 
              ? raw.options 
              : ['', '', '', ''],
            answer: typeof raw.answer === 'number' && raw.answer >= 0 && raw.answer < 4
              ? raw.answer
              : 0
          } as SingleChoiceQuestion;

        case '多選題':
          const options = Array.isArray(raw.options) && raw.options.length > 0
            ? raw.options
            : ['', '', '', ''];
          
          let answers = Array.isArray(raw.answers) 
            ? raw.answers.filter((i: number) => i >= 0 && i < options.length)
            : [];

          // 確保答案是數字陣列
          answers = answers.map((ans: any) => {
            if (typeof ans === 'number') return ans;
            if (typeof ans === 'string') {
              // 如果是字母（A, B, C...），轉換為數字
              if (/^[A-Z]$/.test(ans)) {
                return ans.charCodeAt(0) - 65;
              }
              // 如果是數字字串，轉換為數字
              return parseInt(ans, 10);
            }
            return 0;
          }).filter((num: number) => !isNaN(num) && num >= 0 && num < options.length);

          return {
            ...base,
            type: '多選題',
            options,
            answers
          } as MultipleChoiceQuestion;

        case '填空題':
          return {
            ...base,
            type: '填空題',
            blanks: Array.isArray(raw.blanks) ? raw.blanks : []
          } as FillInQuestion;

        case '簡答題':
          return {
            ...base,
            type: '簡答題',
            answer: raw.answer || ''
          } as ShortAnswerQuestion;

        case '閱讀測驗':
          return {
            ...base,
            type: '閱讀測驗',
            article: raw.article || '',
            questions: Array.isArray(raw.questions)
              ? raw.questions.map((q: any) => ({
                  id: q.id || uuidv4(),
                  content: q.content || '',
                  options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
                  answer: typeof q.answer === 'string' ? q.answer : '',
                  explanation: q.explanation || ''
                }))
              : []
          } as ReadingQuestion;

        case '克漏字':
          const questions = Array.isArray(raw.questions)
            ? raw.questions.map((q: any) => ({
                content: q.content || '',
                options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
                answer: typeof q.answer === 'number' ? q.answer : 0
              }))
            : [];

          // 如果沒有子題目，根據內容中的空格數量自動創建
          if (questions.length === 0) {
            // 支援多種空格標記格式
            const blankCount = (raw.content.match(/(?:\[\[(\d+)\]\])|(?:【(\d+)】)|(?:__(\d+)__)/g) || []).length;
            for (let i = 0; i < blankCount; i++) {
              questions.push({
                content: `空格${i + 1}`,
                options: ['', '', '', ''],
                answer: 0
              });
            }
          }

          return {
            ...base,
            type: '克漏字',
            questions
          } as ClozeQuestion;

        default:
          return null;
      }
    }

    // 如果是新題目，使用預設的單選題結構
    return {
      ...base,
      type: '單選題',
      options: ['', '', '', ''],
      answer: 0
    } as SingleChoiceQuestion;
  } catch (error) {
    console.error('題目資料清洗錯誤:', error);
    return null;
  }
}

export function EditableQuestionPreviewCard({
  question: initialQuestion,
  questions,
  currentIndex,
  totalQuestions,
  availableTags,
  onPrevious,
  onNext,
  onImport,
  onSkip,
}: Props) {
  const { t } = useTranslation();
  const [editedQuestions, setEditedQuestions] = useState<Question[]>(
    questions.map(q => sanitizeQuestion(q) || q)
  );
  const [editedQuestion, setEditedQuestion] = useState<Question>(sanitizeQuestion(initialQuestion) || initialQuestion);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialQuestion.tags || []);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const sanitized = sanitizeQuestion({
      ...initialQuestion,
      type: editedQuestion.type,
      tags: selectedTags,
    });
    if (sanitized) {
      setEditedQuestion(sanitized);
      setEditedQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[currentIndex] = sanitized;
        return newQuestions;
      });
    }
  }, [initialQuestion, currentIndex]);

  useEffect(() => {
    setEditedQuestions(prev => 
      prev.map(q => ({
        ...q,
        tags: selectedTags
      }))
    );
  }, [selectedTags]);

  const updateEditedQuestion = (updatedQuestion: Question) => {
    setEditedQuestion(updatedQuestion);
    setEditedQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[currentIndex] = updatedQuestion;
      return newQuestions;
    });
  };

  const handleTypeChange = (newType: string) => {
    const transformed = sanitizeQuestion({
      ...editedQuestion,
      type: newType,
      options: newType === '單選題' || newType === '多選題' ? ['', '', '', ''] : undefined,
      answer: newType === '單選題' ? 0 : newType === '簡答題' ? '' : undefined,
      answers: newType === '多選題' ? [] : undefined,
      blanks: newType === '填空題' ? [] : undefined,
      article: newType === '閱讀測驗' ? '' : undefined,
      questions: newType === '閱讀測驗' ? [] : undefined,
    });
    if (transformed) {
      updateEditedQuestion(transformed);
    }
  };

  const validateTags = () => {
    if (selectedTags.length === 0) {
      return t('ai.convert.errors.tagRequired');
    }
    if (selectedTags.length > 4) {
      return t('ai.convert.errors.tagLimit');
    }
    return '';
  };

  const handleImportClick = () => {
    const tagError = validateTags();
    if (tagError) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    const questionsWithTags = editedQuestions.map(q => ({
      ...q,
      tags: selectedTags
    }));
    
    onImport(questionsWithTags);
  };

  const renderSingleChoiceEditor = (q: SingleChoiceQuestion) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('ai.fields.stem')}</label>
        <Textarea
          value={q.content}
          onChange={(e) => updateEditedQuestion({ ...q, content: e.target.value } as SingleChoiceQuestion)}
          placeholder={t('ai.fields.stem')}
          className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('ai.fields.options')}</label>
        <div className="space-y-2">
          {q.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-6">{String.fromCharCode(65 + index)}</span>
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...q.options];
                  newOptions[index] = e.target.value;
                  updateEditedQuestion({ ...q, options: newOptions } as SingleChoiceQuestion);
                }}
                placeholder={`${t('ai.fields.options')} ${String.fromCharCode(65 + index)}`}
                className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('ai.fields.answer')}</label>
        <Select
          value={q.answer.toString()}
          onValueChange={(value) => updateEditedQuestion({ ...q, answer: parseInt(value) } as SingleChoiceQuestion)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('ai.fields.answer')} />
          </SelectTrigger>
          <SelectContent>
            {q.options.map((_, index) => (
              <SelectItem key={index} value={index.toString()}>
                {String.fromCharCode(65 + index)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderMultipleChoiceEditor = (q: MultipleChoiceQuestion) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('ai.fields.stem')}</label>
        <Textarea
          value={q.content}
          onChange={(e) => updateEditedQuestion({ ...q, content: e.target.value } as MultipleChoiceQuestion)}
          placeholder={t('ai.fields.stem')}
          className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('ai.fields.options')}</label>
        <div className="space-y-2">
          {q.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Checkbox
                checked={q.answers.includes(index)}
                onCheckedChange={(checked) => {
                  const newAnswers = checked
                    ? [...q.answers, index].sort()
                    : q.answers.filter(a => a !== index);
                  updateEditedQuestion({ ...q, answers: newAnswers } as MultipleChoiceQuestion);
                }}
              />
              <span className="w-6">{String.fromCharCode(65 + index)}</span>
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...q.options];
                  newOptions[index] = e.target.value;
                  updateEditedQuestion({ ...q, options: newOptions } as MultipleChoiceQuestion);
                }}
                placeholder={`${t('ai.fields.options')} ${String.fromCharCode(65 + index)}`}
                className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFillInBlankEditor = (q: FillInQuestion) => (
    <div className="space-y-4">
      <div>
        <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.stem')}</Label>
        <Textarea
          value={q.content}
          onChange={(e) => {
            const content = e.target.value;
            // 提取填空答案
            const blanks = (content.match(/\[\[(.*?)\]\]/g) || [])
              .map(match => match.slice(2, -2));
            updateEditedQuestion({
              ...q,
              content,
              blanks
            } as FillInQuestion);
          }}
          placeholder={t('ai.fields.fillInPlaceholder')}
          className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
        />
      </div>
      <div>
        <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.blanks')}</Label>
        <div className="mt-2 space-y-2">
          {q.blanks.map((blank: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-20">{t('ai.fields.blank')} {index + 1}：</span>
              <Input
                value={blank}
                onChange={(e) => {
                  const newBlanks = [...q.blanks];
                  newBlanks[index] = e.target.value;
                  updateEditedQuestion({
                    ...q,
                    blanks: newBlanks
                  } as FillInQuestion);
                }}
                className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                placeholder={t('ai.fields.blankPlaceholder', { number: index + 1 })}
              />
            </div>
          ))}
          {q.blanks.length === 0 && (
            <div className="text-sm text-gray-500">
              {t('ai.fields.fillInInstruction')}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderShortAnswerEditor = (q: ShortAnswerQuestion) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('ai.fields.stem')}</label>
        <Textarea
          value={q.content}
          onChange={(e) => updateEditedQuestion({ ...q, content: e.target.value } as ShortAnswerQuestion)}
          placeholder={t('ai.fields.stem')}
          className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('ai.fields.answer')}</label>
        <Textarea
          value={q.answer}
          onChange={(e) => updateEditedQuestion({ ...q, answer: e.target.value } as ShortAnswerQuestion)}
          placeholder={t('ai.fields.answer')}
          className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
        />
      </div>
    </div>
  );

  const renderReadingTestEditor = (q: ReadingQuestion) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('ai.fields.article')}</label>
        <Textarea
          value={q.article}
          onChange={(e) => updateEditedQuestion({ ...q, article: e.target.value } as ReadingQuestion)}
          placeholder={t('ai.fields.article')}
          rows={5}
          className="bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('ai.fields.subQuestions')}</label>
        <div className="space-y-4">
          {q.questions.map((subQ, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
              <div>
                <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.question')} {index + 1}</Label>
                <Textarea
                  value={subQ.content}
                  onChange={(e) => {
                    const newQuestions = [...q.questions];
                    newQuestions[index] = { ...subQ, content: e.target.value };
                    updateEditedQuestion({
                      ...q,
                      questions: newQuestions
                    } as ReadingQuestion);
                  }}
                  className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                {subQ.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <RadioGroup
                      value={subQ.answer}
                      onValueChange={(value) => {
                        const newQuestions = [...q.questions];
                        newQuestions[index] = { ...subQ, answer: value };
                        updateEditedQuestion({
                          ...q,
                          questions: newQuestions
                        } as ReadingQuestion);
                      }}
                    >
                      <RadioGroupItem value={option} />
                    </RadioGroup>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newQuestions = [...q.questions];
                        const newOptions = [...subQ.options];
                        newOptions[optIndex] = e.target.value;
                        newQuestions[index] = { ...subQ, options: newOptions };
                        updateEditedQuestion({
                          ...q,
                          questions: newQuestions
                        } as ReadingQuestion);
                      }}
                      className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Select
                  value={subQ.answer}
                  onValueChange={(value) => {
                    const newQuestions = [...q.questions];
                    newQuestions[index] = { ...subQ, answer: value };
                    updateEditedQuestion({ ...q, questions: newQuestions } as ReadingQuestion);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('ai.fields.answer')} />
                  </SelectTrigger>
                  <SelectContent>
                    {subQ.options.map((_, optIndex) => (
                      <SelectItem key={optIndex} value={String.fromCharCode(65 + optIndex)}>
                        {String.fromCharCode(65 + optIndex)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClozeTestEditor = (q: ClozeQuestion) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('ai.fields.clozeInstruction')}</label>
        <Textarea
          value={q.content}
          onChange={(e) => {
            const content = e.target.value;
            // 支援多種空格標記格式
            const blanks = (content.match(/(?:\[\[(\d+)\]\])|(?:【(\d+)】)|(?:__(\d+)__)/g) || []);
            const currentQuestions = [...q.questions];
            
            // 根據空格數量調整子題目
            while (currentQuestions.length < blanks.length) {
              currentQuestions.push({
                options: ['', '', '', ''],
                answer: 0
              });
            }
            
            updateEditedQuestion({
              ...q,
              content,
              questions: currentQuestions.slice(0, blanks.length)
            } as ClozeQuestion);
          }}
          placeholder={t('ai.fields.clozePlaceholder')}
          rows={5}
          className="bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">{t('ai.fields.options')}</label>
        <div className="space-y-4">
          {q.questions.map((subQ, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="mb-2">
                <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.blank')} {index + 1}</Label>
              </div>
              <div className="space-y-2">
                {subQ.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <RadioGroup
                      value={subQ.answer.toString()}
                      onValueChange={(value) => {
                        const newQuestions = [...q.questions];
                        newQuestions[index] = {
                          ...subQ,
                          answer: parseInt(value)
                        };
                        updateEditedQuestion({
                          ...q,
                          questions: newQuestions
                        } as ClozeQuestion);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={optIndex.toString()} />
                        <Label className="w-6">{String.fromCharCode(65 + optIndex)}</Label>
                      </div>
                    </RadioGroup>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newQuestions = [...q.questions];
                        const newOptions = [...subQ.options];
                        newOptions[optIndex] = e.target.value;
                        newQuestions[index] = {
                          ...subQ,
                          options: newOptions
                        };
                        updateEditedQuestion({
                          ...q,
                          questions: newQuestions
                        } as ClozeQuestion);
                      }}
                      className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                      placeholder={`${t('ai.fields.options')} ${String.fromCharCode(65 + optIndex)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEditorByType = () => {
    switch (editedQuestion.type) {
      case '單選題':
        return renderSingleChoiceEditor(editedQuestion as SingleChoiceQuestion);
      case '多選題':
        return renderMultipleChoiceEditor(editedQuestion as MultipleChoiceQuestion);
      case '填空題':
        return renderFillInBlankEditor(editedQuestion as FillInQuestion);
      case '簡答題':
        return renderShortAnswerEditor(editedQuestion as ShortAnswerQuestion);
      case '閱讀測驗':
        return renderReadingTestEditor(editedQuestion as ReadingQuestion);
      case '克漏字':
        return renderClozeTestEditor(editedQuestion as ClozeQuestion);
      default:
        return <div className="text-red-500">⚠️ 無法辨識的題型</div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center py-1 mb-1 flex-shrink-0 dark:border-gray-600">
        <h3 className="font-medium mb-2 text-gray-800 dark:text-mainBg">{t('ai.convert.previewAndEdit')}</h3>
        <div className="flex items-center space-x-4">
          <Select value={editedQuestion.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[140px] h-8 bg-mainBg dark:bg-default text-gray-700 dark:text-mainBg border-gray-200 dark:border-gray-600">
              <SelectValue placeholder={t('ai.convert.questionType')} />
            </SelectTrigger>
            <SelectContent className="bg-mainBg dark:bg-default text-gray-700 dark:text-mainBg border-gray-200 dark:border-gray-600">
              {QUESTION_TYPES.map(type => (
                <SelectItem 
                  key={type.value} 
                  value={type.value}
                  className="text-gray-700 dark:text-mainBg hover:bg-gray-100 dark:hover:bg-gray-400"
                >
                  {t(type.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>{t('ai.convert.questionCount', { current: currentIndex + 1, total: totalQuestions })}</span>
          </div>
        </div>
      </div>

      <Card className="flex-1 bg-mainBg dark:bg-default border border-gray-300 dark:border-gray-600 overflow-hidden">
        <CardContent className="h-full lg:h-[calc(90vh-12rem)] overflow-y-auto p-6">
          <div className="space-y-6">
            {editedQuestion.type === '閱讀測驗' && (
              <div className="space-y-4">
                <Textarea
                  value={editedQuestion.article}
                  onChange={(e) => updateEditedQuestion({ ...editedQuestion, article: e.target.value } as ReadingQuestion)}
                  placeholder="請輸入文章內容..."
                  rows={5}
                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                />
                <div>
                  <label className="block text-sm font-medium mb-2">子題目</label>
                  <div className="space-y-4">
                    {(editedQuestion as ReadingQuestion).questions.map((subQ, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                        <div>
                          <Label className="text-gray-700 dark:text-mainBg">題目 {index + 1}</Label>
                          <Textarea
                            value={subQ.content}
                            onChange={(e) => {
                              const newQuestions = [...(editedQuestion as ReadingQuestion).questions];
                              newQuestions[index] = { ...subQ, content: e.target.value };
                              updateEditedQuestion({
                                ...editedQuestion,
                                questions: newQuestions
                              } as ReadingQuestion);
                            }}
                            className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          {subQ.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <RadioGroup
                                value={subQ.answer}
                                onValueChange={(value) => {
                                  const newQuestions = [...(editedQuestion as ReadingQuestion).questions];
                                  newQuestions[index] = { ...subQ, answer: value };
                                  updateEditedQuestion({
                                    ...editedQuestion,
                                    questions: newQuestions
                                  } as ReadingQuestion);
                                }}
                              >
                                <RadioGroupItem value={option} />
                              </RadioGroup>
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newQuestions = [...(editedQuestion as ReadingQuestion).questions];
                                  const newOptions = [...subQ.options];
                                  newOptions[optIndex] = e.target.value;
                                  newQuestions[index] = { ...subQ, options: newOptions };
                                  updateEditedQuestion({
                                    ...editedQuestion,
                                    questions: newQuestions
                                  } as ReadingQuestion);
                                }}
                                className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-mainBg">選項</Label>
                          <div className="space-y-2 mt-2">
                            {subQ.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <RadioGroup
                                  value={subQ.answer}
                                  onValueChange={(value) => {
                                    const newQuestions = [...(editedQuestion as ReadingQuestion).questions];
                                    newQuestions[index] = { ...subQ, answer: value };
                                    updateEditedQuestion({
                                      ...editedQuestion,
                                      questions: newQuestions
                                    } as ReadingQuestion);
                                  }}
                                >
                                  <RadioGroupItem value={option} />
                                </RadioGroup>
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newQuestions = [...(editedQuestion as ReadingQuestion).questions];
                                    const newOptions = [...subQ.options];
                                    newOptions[optIndex] = e.target.value;
                                    newQuestions[index] = { ...subQ, options: newOptions };
                                    updateEditedQuestion({
                                      ...editedQuestion,
                                      questions: newQuestions
                                    } as ReadingQuestion);
                                  }}
                                  className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-mainBg">解釋</Label>
                          <Textarea
                            value={subQ.explanation}
                            onChange={(e) => {
                              const newQuestions = [...(editedQuestion as ReadingQuestion).questions];
                              newQuestions[index] = { ...subQ, explanation: e.target.value };
                              updateEditedQuestion({
                                ...editedQuestion,
                                questions: newQuestions
                              } as ReadingQuestion);
                            }}
                            className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {editedQuestion.type === '克漏字' && (
              <div className="space-y-4">
                <Textarea
                  value={editedQuestion.content}
                  onChange={(e) => {
                    const content = e.target.value;
                    // 支援多種空格標記格式
                    const blanks = (content.match(/(?:\[\[(\d+)\]\])|(?:【(\d+)】)|(?:__(\d+)__)/g) || []);
                    const currentQuestions = [...(editedQuestion as ClozeQuestion).questions];
                    
                    // 根據空格數量調整子題目
                    while (currentQuestions.length < blanks.length) {
                      currentQuestions.push({
                        options: ['', '', '', ''],
                        answer: 0
                      });
                    }
                    
                    updateEditedQuestion({
                      ...editedQuestion,
                      content,
                      questions: currentQuestions.slice(0, blanks.length)
                    } as ClozeQuestion);
                  }}
                  placeholder="請輸入文章內容，使用【1】、[[1]]或__1__等格式標記空格..."
                  rows={5}
                  className="bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                />
                <div>
                  <label className="block text-sm font-medium mb-2">空格選項</label>
                  <div className="space-y-4">
                    {(editedQuestion as ClozeQuestion).questions.map((subQ, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
                        <div>
                          <Label className="text-gray-700 dark:text-mainBg">空格 {index + 1}</Label>
                          <div className="space-y-2 mt-2">
                            {subQ.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <RadioGroup
                                  value={subQ.answer.toString()}
                                  onValueChange={(value) => {
                                    const newQuestions = [...(editedQuestion as ClozeQuestion).questions];
                                    newQuestions[index] = {
                                      ...subQ,
                                      answer: parseInt(value)
                                    };
                                    updateEditedQuestion({
                                      ...editedQuestion,
                                      questions: newQuestions
                                    } as ClozeQuestion);
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={optIndex.toString()} />
                                    <Label className="w-6">{String.fromCharCode(65 + optIndex)}</Label>
                                  </div>
                                </RadioGroup>
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newQuestions = [...(editedQuestion as ClozeQuestion).questions];
                                    const newOptions = [...subQ.options];
                                    newOptions[optIndex] = e.target.value;
                                    newQuestions[index] = {
                                      ...subQ,
                                      options: newOptions
                                    };
                                    updateEditedQuestion({
                                      ...editedQuestion,
                                      questions: newQuestions
                                    } as ClozeQuestion);
                                  }}
                                  className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                                  placeholder={`選項 ${String.fromCharCode(65 + optIndex)}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {editedQuestion.type === '單選題' && (
              <div>
                <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.stem')}</Label>
                <Textarea
                  value={editedQuestion.content}
                  onChange={(e) =>
                    updateEditedQuestion({
                      ...editedQuestion,
                      content: e.target.value
                    } as SingleChoiceQuestion)
                  }
                  placeholder={t('ai.fields.question')}
                  className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                />
                <Label className="text-gray-700 dark:text-mainBg mt-4 block">{t('ai.fields.options')}</Label>
                <RadioGroup
                  value={String((editedQuestion as SingleChoiceQuestion).answer)}
                  onValueChange={(value) =>
                    updateEditedQuestion({
                      ...editedQuestion,
                      answer: parseInt(value)
                    } as SingleChoiceQuestion)
                  }
                  className="mt-2 space-y-2"
                >
                  {(editedQuestion as SingleChoiceQuestion).options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(index)} id={`option-${index}`} />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(editedQuestion as SingleChoiceQuestion).options];
                          newOptions[index] = e.target.value;
                          updateEditedQuestion({
                            ...editedQuestion,
                            options: newOptions
                          } as SingleChoiceQuestion);
                        }}
                        className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                      />
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {editedQuestion.type === '多選題' && (
              <div>
                <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.stem')}</Label>
                <Textarea
                  value={editedQuestion.content}
                  onChange={(e) =>
                    updateEditedQuestion({
                      ...editedQuestion,
                      content: e.target.value
                    } as MultipleChoiceQuestion)
                  }
                  placeholder={t('ai.fields.question')}
                  className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                />
                <Label className="text-gray-700 dark:text-mainBg mt-4 block">{t('ai.fields.options')}</Label>
                <div className="mt-2 space-y-2">
                  {(editedQuestion as MultipleChoiceQuestion).options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        checked={(editedQuestion as MultipleChoiceQuestion).answers.includes(index)}
                        onCheckedChange={(checked) => {
                          const newAnswers = checked
                            ? [...(editedQuestion as MultipleChoiceQuestion).answers, index].sort()
                            : (editedQuestion as MultipleChoiceQuestion).answers.filter(a => a !== index);
                          updateEditedQuestion({
                            ...editedQuestion,
                            answers: newAnswers
                          } as MultipleChoiceQuestion);
                        }}
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(editedQuestion as MultipleChoiceQuestion).options];
                          newOptions[index] = e.target.value;
                          updateEditedQuestion({
                            ...editedQuestion,
                            options: newOptions
                          } as MultipleChoiceQuestion);
                        }}
                        className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editedQuestion.type === '填空題' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.stem')}</Label>
                  <Textarea
                    value={editedQuestion.content}
                    onChange={(e) => {
                      const content = e.target.value;
                      // 提取填空答案
                      const blanks = (content.match(/\[\[(.*?)\]\]/g) || [])
                        .map(match => match.slice(2, -2));
                      updateEditedQuestion({
                        ...editedQuestion,
                        content,
                        blanks
                      } as FillInQuestion);
                    }}
                    placeholder={t('ai.fields.fillInInstruction')}
                    className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.blanks')}</Label>
                  <div className="mt-2 space-y-2">
                    {(editedQuestion as FillInQuestion).blanks.map((blank: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 w-20">填空 {index + 1}：</span>
                        <Input
                          value={blank}
                          onChange={(e) => {
                            const newBlanks = [...(editedQuestion as FillInQuestion).blanks];
                            newBlanks[index] = e.target.value;
                            updateEditedQuestion({
                              ...editedQuestion,
                              blanks: newBlanks
                            } as FillInQuestion);
                          }}
                          className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                          placeholder={t('ai.fields.blankPlaceholder', { number: index + 1 })}
                        />
                      </div>
                    ))}
                    {(editedQuestion as FillInQuestion).blanks.length === 0 && (
                      <div className="text-sm text-gray-500">
                        {t('ai.fields.fillInInstruction')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {editedQuestion.type === '簡答題' && (
              <div>
                <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.answer')}</Label>
                <Textarea
                  value={(editedQuestion as ShortAnswerQuestion).answer}
                  onChange={(e) =>
                    updateEditedQuestion({
                      ...editedQuestion,
                      answer: e.target.value
                    } as ShortAnswerQuestion)
                  }
                  className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>
            )}

            <div>
              <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.explanation')}</Label>
              <Textarea
                value={editedQuestion.explanation}
                onChange={(e) =>
                  updateEditedQuestion({
                    ...editedQuestion,
                    explanation: e.target.value
                  })
                }
                className="mt-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-mainBg border-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.tags')}</Label>
              <div className="mt-2">
                <TagSelector
                  value={selectedTags}
                  onChange={setSelectedTags}
                  allTags={availableTags}
                  className="dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-4 space-x-2 flex-shrink-0">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="bg-mainBg hover:bg-primary/80 text-gray-700 dark:text-mainBg border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-100"
          >
            ←
          </Button>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={currentIndex === totalQuestions - 1}
            className="bg-mainBg hover:bg-primary/80 text-gray-700 dark:text-mainBg border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-100"
          >
            →
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          {showError && validateTags() && (
            <span className="text-red-500 animate-fadeIn text-sm">
              ⚠️ {validateTags()}
            </span>
          )}
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const tagError = validateTags();
              if (tagError) {
                setShowError(true);
                setTimeout(() => setShowError(false), 3000);
                return;
              }
              handleImportClick();
            }}
            className={`bg-primary hover:bg-primary/80 text-white transition ${validateTags() ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {t('ai.convert.save')}
          </Button>
        </div>
      </div>
    </div>
  );
} 