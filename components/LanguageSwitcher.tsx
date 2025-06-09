import { useState } from 'react';

interface LanguageSwitcherProps {
  labelClass?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ labelClass = '' }) => {
  const [language, setLanguage] = useState('zh-TW');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    // TODO: 實作語言切換邏輯
  };

  return (
    <div className="absolute top-4 right-4">
      <select
        value={language}
        onChange={handleLanguageChange}
        className={`bg-transparent border-none outline-none cursor-pointer ${labelClass}`}
      >
        <option value="zh-TW">繁體中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
