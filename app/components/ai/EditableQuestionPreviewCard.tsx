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
import { QUESTION_TYPES, sanitizeQuestion } from './QuestionUtils';
import {
  SingleChoiceEditor,
  MultipleChoiceEditor,
  FillInBlankEditor,
  ShortAnswerEditor,
  ReadingTestEditor,
  ClozeTestEditor
} from './QuestionTypeEditors';
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

  const renderEditorByType = () => {
    switch (editedQuestion.type) {
      case '單選題':
        return <SingleChoiceEditor question={editedQuestion} updateEditedQuestion={updateEditedQuestion} />;
      case '多選題':
        return <MultipleChoiceEditor question={editedQuestion} updateEditedQuestion={updateEditedQuestion} />;
      case '填空題':
        return <FillInBlankEditor question={editedQuestion} updateEditedQuestion={updateEditedQuestion} />;
      case '簡答題':
        return <ShortAnswerEditor question={editedQuestion} updateEditedQuestion={updateEditedQuestion} />;
      case '閱讀測驗':
        return <ReadingTestEditor question={editedQuestion} updateEditedQuestion={updateEditedQuestion} />;
      case '克漏字':
        return <ClozeTestEditor question={editedQuestion} updateEditedQuestion={updateEditedQuestion} />;
      default:
        return <div className="text-red-500">⚠️ {t('ai.convert.errors.unknownType')}</div>;
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
                  {type.label}
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
            {renderEditorByType()}

            {editedQuestion.type !== '閱讀測驗' && editedQuestion.type !== '克漏字' && (
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
            )}

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
            className="bg-primary hover:bg-primary/90 text-mainBg dark:text-mainBg dark:hover:bg-primary/80 border-gray-200 dark:border-transparent dark:border-transparent"
          >
            ←
          </Button>
          <Button
            variant="outline"
            onClick={onNext}
            disabled={currentIndex === totalQuestions - 1}
            className="bg-primary hover:bg-primary/90 text-mainBg dark:text-mainBg dark:hover:bg-primary/80 border-gray-200 dark:border-transparent dark:border-transparent"
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