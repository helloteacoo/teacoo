import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LanguageSwitcherProps {
  labelClass?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ labelClass = '' }) => {
  const [language, setLanguage] = useState('zh-TW');

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    // TODO: 實作語言切換邏輯
  };

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`w-[120px] bg-mainBg shadow-none hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent ${labelClass}`}>
        <SelectValue>
          {language === 'zh-TW' ? '繁體中文' : 'English'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-mainBg border border-input dark:border-gray-700">
        <SelectItem value="zh-TW">繁體中文</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
