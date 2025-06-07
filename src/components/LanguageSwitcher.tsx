import { useTranslation } from "react-i18next";

type Props = {
  labelClass?: string; // 接收外部樣式
};

export default function LanguageSwitcher({ labelClass = "text-gray-700" }: Props) {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <label htmlFor="language" className={`text-sm ${labelClass}`}>
        語言
      </label>
      <select
        id="language"
        value={i18n.language}
        onChange={handleChange}
        className="text-sm border rounded px-2 py-1"
      >
        <option value="en">English</option>
        <option value="zh">中文</option>
      </select>
    </div>
  );
}
