import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

const MAX_CHARS = 1500;

interface TextareaInputPanelProps {
  onConvert: (text: string) => Promise<void>;
  isConverting: boolean;
  value?: string;
  onChange?: (value: string) => void;
  isOpen?: boolean;
}

export function TextareaInputPanel({
  onConvert,
  isConverting,
  value,
  onChange,
  isOpen = true,
}: TextareaInputPanelProps) {
  const { t } = useTranslation();
  const [localText, setLocalText] = useState(value || '');

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLocalText('');
      onChange?.('');
    }
  }, [isOpen, onChange]);

  const handleConvert = async () => {
    if (!localText.trim()) return;
    await onConvert(localText);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalText(newValue);
    onChange?.(newValue);
  };

  const charCount = (value ?? localText).replace(/\s/g, '').length;
  const isValid = charCount > 0 && charCount <= MAX_CHARS;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="flex flex-col gap-3 h-full">
      <h3 className="font-medium text-gray-800 dark:text-mainBg">{t('ai.convert.originalText')}</h3>
      
      <Textarea
        value={value ?? localText}
        onChange={handleChange}
        placeholder={t('ai.convert.inputPlaceholder')}
        className="flex-1 min-h-[150px] resize-none border border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-md shadow-sm"
      />

      <div className="flex justify-between items-center mt-auto">
        <span className={isOverLimit ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
          {charCount} / {MAX_CHARS}
        </span>
        <Button
          onClick={handleConvert}
          disabled={isConverting || !isValid}
          className={`min-w-[100px] transition-all ${
            !isValid
              ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
              : isConverting
                ? 'bg-primary text-white animate-pulse dark:bg-primary dark:text-white'
              : 'bg-primary text-white hover:bg-primary/80 dark:bg-primary dark:text-white'
          }`}
        >
          {isConverting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('ai.convert.converting')}
            </>
          ) : (
            t('ai.convert.convert')
          )}
        </Button>
      </div>
    </div>
  );
} 