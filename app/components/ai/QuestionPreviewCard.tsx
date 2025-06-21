import type { Question } from '@/app/types/question';
import { Card, CardContent, CardFooter, CardHeader } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ChevronLeft, ChevronRight, Check, SkipForward } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface QuestionPreviewCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onImport: () => void;
  onSkip: () => void;
  importDisabled?: boolean;
}

export function QuestionPreviewCard({
  question,
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onImport,
  onSkip,
  importDisabled = false,
}: QuestionPreviewCardProps) {
  const { t } = useTranslation();

  const renderQuestionContent = () => {
    switch (question.type) {
      case '單選題':
        return (
          <div>
            <div className="font-medium mb-2">{t('questionPreview.options')}</div>
            <ul className="list-none space-y-1">
              {question.options.map((option, index) => (
                <li key={index} className={index === question.answer ? 'text-green-600' : ''}>
                  ({String.fromCharCode(65 + index)}) {option}
                </li>
              ))}
            </ul>
          </div>
        );
      case '多選題':
        return (
          <div>
            <div className="font-medium mb-2">{t('questionPreview.options')}</div>
            <ul className="list-none space-y-1">
              {question.options.map((option, index) => (
                <li key={index} className={question.answers.includes(index) ? 'text-green-600' : ''}>
                  ({String.fromCharCode(65 + index)}) {option}
                </li>
              ))}
            </ul>
          </div>
        );
      case '填空題':
        return (
          <div>
            <div className="font-medium mb-2">{t('questionPreview.answer')}</div>
            <div>{question.blanks.join('、')}</div>
          </div>
        );
      case '簡答題':
        return (
          <div>
            <div className="font-medium mb-2">{t('questionPreview.answer')}</div>
            <div>{question.answer}</div>
          </div>
        );
      case '閱讀測驗':
        return (
          <div>
            <div className="font-medium mb-2">{t('questionPreview.subQuestions')}</div>
            {question.questions.map((subQ, index) => (
              <div key={index} className="mb-4">
                <div className="mb-2">{index + 1}. {subQ.content}</div>
                <ul className="list-none space-y-1">
                  {subQ.options.map((option, optIndex) => (
                    <li key={optIndex} className={option === subQ.answer ? 'text-green-600' : ''}>
                      ({String.fromCharCode(65 + optIndex)}) {option}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            {t('questionPreview.question', { current: currentIndex + 1, total: totalQuestions })}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">📘 {question.type}</Badge>
            {question.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">#{tag}</Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-lg">{question.content}</div>
        {renderQuestionContent()}
      </CardContent>
      {question.explanation && (
        <div className="px-6 pb-4">
          <div className="p-3 bg-gray-50 rounded-md">
            <span className="font-medium">🧾 {t('questionPreview.explanation')} </span>
            {question.explanation}
          </div>
        </div>
      )}
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('questionPreview.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={currentIndex === totalQuestions - 1}
          >
            {t('questionPreview.next')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSkip}>
            <SkipForward className="h-4 w-4 mr-1" />
            {t('questionPreview.skip')}
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onImport}
            disabled={importDisabled}
            title={importDisabled ? t('questionPreview.importDisabled') : undefined}
          >
            <Check className="h-4 w-4 mr-1" />
            {t('questionPreview.import')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 