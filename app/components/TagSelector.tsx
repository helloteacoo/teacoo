"use client";

import { useState, useEffect, useCallback } from 'react';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { X } from 'lucide-react';

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  defaultTags?: string[];
  className?: string;
  maxTags?: number;
}

export default function TagSelector({ value, onChange, defaultTags = [], className = '', maxTags = 5 }: TagSelectorProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    if (defaultTags.length > 0 && value.length === 0) {
      onChange(defaultTags.slice(0, maxTags));
    }
  }, [defaultTags, value.length, onChange, maxTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);

    if (newInput.startsWith('#')) {
      const searchTerm = newInput.slice(1).toLowerCase();
      const filtered = allTags.filter(tag => 
        tag.toLowerCase().includes(searchTerm) && 
        !value.includes(tag)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tagText: string) => {
    let newTag = tagText.startsWith('#') ? tagText.slice(1).trim() : tagText.trim();
    
    if (newTag && !value.includes(newTag) && value.length < maxTags) {
      const newTags = [...value, newTag];
      onChange(newTags);
      if (!allTags.includes(newTag)) {
        setAllTags([...allTags, newTag]);
      }
    } else if (value.length >= maxTags) {
      alert(`每題最多只能添加 ${maxTags} 個標籤`);
    }
    setInput('');
    setSuggestions([]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && input.trim()) {
      e.preventDefault();
      if (input.startsWith('#')) {
        addTag(input);
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  const addSuggestion = (tag: string) => {
    if (!value.includes(tag) && value.length < maxTags) {
      onChange([...value, tag]);
    } else if (value.length >= maxTags) {
      alert(`每題最多只能添加 ${maxTags} 個標籤`);
    }
    setInput('');
    setSuggestions([]);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <button
            key={tag}
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 cursor-pointer"
            onClick={() => removeTag(tag)}
          >
            {tag}
            <X size={14} className="text-gray-500" />
          </button>
        ))}
      </div>
      
      <div className="relative">
        <Input
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={value.length >= maxTags ? `已達到標籤上限 (${maxTags})` : "輸入 # 開始新增標籤..."}
          className="w-full placeholder:text-gray-400"
          disabled={value.length >= maxTags}
        />
        
        {suggestions.length > 0 && value.length < maxTags && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
            {suggestions.map(tag => (
              <button
                key={tag}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => addSuggestion(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 