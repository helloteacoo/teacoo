"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from './ui/button';
import { cn } from '../lib/utils';

type TagSelectorProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  defaultTags?: string[];
  allTags: string[];
  maxTags?: number;
  minTags?: number;
  disabled?: boolean;
  className?: string;
};

export default function TagSelector({
  value,
  onChange,
  defaultTags = [],
  allTags,
  maxTags = 4,
  minTags = 1,
  disabled = false,
  className = '',
}: TagSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedTag: string) => {
    console.log('🏷️ 標籤選擇事件觸發:', selectedTag);

    if (value.includes(selectedTag)) {
      // 如果已經選擇了這個標籤，就移除它
      console.log('⛔ 移除標籤:', selectedTag);
      const newTags = value.filter(tag => tag !== selectedTag);
      if (newTags.length < minTags) {
        console.log('❌ 標籤數量不足，無法移除');
        alert(t('tagSelector.errors.minTags', { count: minTags }));
        return;
      }
      console.log('✅ 成功移除標籤，新標籤列表:', newTags);
      onChange(newTags);
    } else {
      // 如果還沒選擇這個標籤，就添加它
      if (value.length >= maxTags) {
        console.log('❌ 已達到最大標籤數量:', maxTags);
        alert(t('tagSelector.errors.maxTags', { count: maxTags }));
        return;
      }
      const newTags = [...value, selectedTag];
      console.log('✅ 成功添加標籤，新標籤列表:', newTags);
      onChange(newTags);
    }
    setOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* 已選擇的標籤 */}
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <div
            key={tag}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-mainBg dark:bg-gray-700 text-secondary-foreground rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleSelect(tag)}
              disabled={disabled}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* 標籤選擇器 */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-mainBg dark:bg-gray-800 text-gray-400 dark:text-gray-400 border-gray-200 dark:border-gray-600"
            disabled={disabled || value.length >= maxTags}
          >
            {value.length === 0 
              ? t('tagSelector.selectTags')
              : value.length >= maxTags 
                ? t('tagSelector.selectedTagsMax', { count: value.length })
                : t('tagSelector.selectedTags', { count: value.length })
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white dark:bg-gray-800 text-gray-400 dark:text-mainBg">
          <Command className="w-full dark:bg-gray-800">
            <CommandInput 
              placeholder={t('tagSelector.searchPlaceholder')}
              className="border-none focus:ring-0 text-gray-400 dark:text-gray-400 dark:bg-gray-800"
            />
            
            <CommandGroup className="max-h-[200px] overflow-auto dark:bg-gray-800">
              {allTags
                .filter(tag => !value.includes(tag))
                .map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelect(tag)}
                    className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-gray-800 dark:text-mainBg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value.includes(tag) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {tag}
                  </button>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 