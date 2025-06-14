import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { ChangeEvent } from 'react';

interface TextareaInputPanelProps {
  onConvert: (text: string) => Promise<void>;
  isConverting: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export function TextareaInputPanel({
  onConvert,
  isConverting,
  value,
  onChange,
}: TextareaInputPanelProps) {
  const [localText, setLocalText] = useState(value || '');

  const handleConvert = async () => {
    if (!localText.trim()) return;
    await onConvert(localText);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalText(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <Textarea
          value={value ?? localText}
          onChange={handleChange}
          placeholder="請貼上原始題目文字..."
          className="h-full min-h-[500px] resize-none"
        />
      </div>
      <div className="mt-4">
        <Button
          onClick={handleConvert}
          disabled={isConverting || !(value ?? localText).trim()}
          className="w-full"
        >
          {isConverting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              轉換中...
            </>
          ) : (
            '🔁 轉換'
          )}
        </Button>
      </div>
    </div>
  );
} 