"use client";

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Button } from './ui/button';
import { cn } from '../lib/utils';

type TagSelectorProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  defaultTags?: string[];
  className?: string;
  maxTags?: number;
  minTags?: number;
  allTags: string[];
  disabled?: boolean;
};

export default function TagSelector({ 
  value, 
  onChange, 
  defaultTags = [], 
  className = '', 
  maxTags = 4,
  minTags = 1,
  allTags,
  disabled = false
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);

  // 只在組件初始化時設置預設標籤
  useEffect(() => {
    if (defaultTags.length > 0 && value.length === 0) {
      const validDefaultTags = defaultTags.filter(tag => allTags.includes(tag)).slice(0, maxTags);
      if (validDefaultTags.length > 0) {
        onChange(validDefaultTags);
      }
    }
  }, []); // 空依賴陣列，只在初始化時執行

  const toggleTag = (tag: string) => {
    if (value.includes(tag)) {
      // 移除標籤
      const newTags = value.filter(t => t !== tag);
      if (newTags.length < minTags) {
        alert(`每題至少需要 ${minTags} 個標籤`);
        return;
      }
      onChange(newTags);
    } else {
      // 新增標籤
      if (value.length >= maxTags) {
        alert(`每題最多只能添加 ${maxTags} 個標籤`);
        return;
      }
      onChange([...value, tag]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <div
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-secondary text-secondary-foreground rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => toggleTag(tag)}
              disabled={disabled}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || value.length >= maxTags}
          >
            {value.length === 0 
              ? "選擇標籤..." 
              : value.length >= maxTags 
                ? `已選擇 ${value.length} 個標籤 (上限)`
                : `已選擇 ${value.length} 個標籤`
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white dark:bg-gray-800 shadow-md dark:text-mainBg">
          <Command className="bg-transparent">
            <CommandInput placeholder="搜尋標籤..." className="bg-transparent dark:text-mainBg" />
            <CommandEmpty className="dark:text-mainBg">找不到標籤</CommandEmpty>
            <CommandGroup>
              {allTags
                .filter(tag => !value.includes(tag))
                .map(tag => (
                  <CommandItem
                    key={tag}
                    onSelect={() => {
                      toggleTag(tag);
                      setOpen(false);
                    }}
                    className="dark:text-mainBg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(tag) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {tag}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 