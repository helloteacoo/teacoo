import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LanguageSwitcherProps {
  labelClass?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ labelClass = '' }) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`w-[120px] bg-transparent dark:bg-transparent shadow-none border-transparent ${labelClass}`}>
        <SelectValue>
          {t('common.language')}
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
