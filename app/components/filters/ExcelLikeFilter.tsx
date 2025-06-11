import React, { useState, useEffect, useRef } from 'react';
import { IFilterParams, IDoesFilterPassParams } from 'ag-grid-community';

export default function ExcelLikeFilter(props: IFilterParams) {
  const [filterText, setFilterText] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    props.filterChangedCallback();
  }, [filterText]);

  const doesFilterPass = (params: IDoesFilterPassParams) => {
    const field = props.colDef.field; // 取得欄位名稱
    if (!field) return false;

    const value = params.data[field]; // 從資料列取值
    return value?.toString().toLowerCase().includes(filterText.toLowerCase());
  };

  const isFilterActive = () => filterText !== '';

  const getModel = () => (filterText ? { value: filterText } : null);

  const setModel = (model: any) => {
    setFilterText(model?.value || '');
  };

  return (
    <div className="custom-excel-filter" style={{ padding: '12px', width: '200px' }}>
      <div style={{ fontWeight: 'bold' }}>Excel篩選器</div>
      <input
        ref={inputRef}
        type="text"
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
        placeholder="輸入篩選內容"
        className="placeholder:text-gray-400"
        style={{ width: '100%', marginTop: '8px' }}
      />
    </div>
  );
}
