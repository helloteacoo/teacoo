import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { ChangeEvent } from 'react';

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
    <div className="flex flex-col h-full">
      <h3 className="font-medium mb-2 text-gray-800 dark:text-mainBg">原始文字</h3>
      <div className="flex-1 flex flex-col min-h-0">
        <Textarea
          value={value ?? localText}
          onChange={handleChange}
          placeholder="請貼上或輸入題目文字..."
          className="flex-1 resize-none overflow-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-md shadow-sm"
        />
        <div className="mt-2 flex justify-between items-center">
          <div>
            <span className={isOverLimit ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
              {charCount}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {' / '}{MAX_CHARS}
            </span>
          </div>
          <Button
            onClick={handleConvert}
            disabled={isConverting || !isValid}
            className={`min-w-[100px] transition-all ${
              !isValid
                ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                : isConverting
                  ? 'bg-primary text-white animate-pulse dark:bg-primary dark:text-white'
                : 'bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white'
            }`}
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                轉換中...
              </>
            ) : (
              '🚀 轉換'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 