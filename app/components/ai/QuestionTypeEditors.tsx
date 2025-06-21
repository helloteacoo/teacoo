import { Question, SingleChoiceQuestion, MultipleChoiceQuestion, FillInQuestion, ShortAnswerQuestion, ReadingQuestion, ClozeQuestion } from '@/app/types/question';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { useTranslation } from 'react-i18next';

interface EditorProps {
  question: Question;
  updateEditedQuestion: (question: Question) => void;
}

export function SingleChoiceEditor({ question, updateEditedQuestion }: EditorProps) {
  const { t } = useTranslation();
  const q = question as SingleChoiceQuestion;
  return (
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
            <SelectValue placeholder={t('ai.convert.errors.selectAnswer')} />
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
}

export function MultipleChoiceEditor({ question, updateEditedQuestion }: EditorProps) {
  const { t } = useTranslation();
  const q = question as MultipleChoiceQuestion;
  return (
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
}

export function FillInBlankEditor({ question, updateEditedQuestion }: EditorProps) {
  const { t } = useTranslation();
  const q = question as FillInQuestion;
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.stem')}</Label>
        <Textarea
          value={q.content}
          onChange={(e) => {
            const content = e.target.value;
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
}

export function ShortAnswerEditor({ question, updateEditedQuestion }: EditorProps) {
  const { t } = useTranslation();
  const q = question as ShortAnswerQuestion;
  return (
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
}

export function ReadingTestEditor({ question, updateEditedQuestion }: EditorProps) {
  const { t } = useTranslation();
  const q = question as ReadingQuestion;
  return (
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
              <div>
                <Label className="text-gray-700 dark:text-mainBg">{t('ai.fields.explanation')}</Label>
                <Textarea
                  value={subQ.explanation}
                  onChange={(e) => {
                    const newQuestions = [...q.questions];
                    newQuestions[index] = { ...subQ, explanation: e.target.value };
                    updateEditedQuestion({
                      ...q,
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
  );
}

export function ClozeTestEditor({ question, updateEditedQuestion }: EditorProps) {
  const { t } = useTranslation();
  const q = question as ClozeQuestion;
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('ai.fields.clozeInstruction')}</label>
        <Textarea
          value={q.content}
          onChange={(e) => {
            const content = e.target.value;
            const blanks = (content.match(/(?:\[\[(\d+)\]\])|(?:【(\d+)】)|(?:__(\d+)__)/g) || []);
            const currentQuestions = [...q.questions];
            
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
} 