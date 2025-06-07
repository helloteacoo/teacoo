import React, { useRef, useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  CellClickedEvent,
  GridReadyEvent,
  ColDef,
  ColumnResizedEvent,
  Column,
  RangeSelectionChangedEvent,
  PasteStartEvent,
  PasteEndEvent,
  GridApi
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../styles/agGridCustom.css';
import { columnDefs as importedColumnDefs } from '../data/columns';
import Navigation from '../components/Navigation';




type QuestionRow = {
  id: number;
  content: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  article: string;
  answer: string;
  tag1: string;
  tag2: string;
  tag3: string;
};

export default function LibraryPage() {
  const gridRef = useRef<AgGridReact<QuestionRow>>(null);
  const [cellValue, setCellValue] = useState<string>('');
  const [originalValue, setOriginalValue] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null);

  const rowData: QuestionRow[] = useMemo(() => Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    content: `題目${i + 1}`,
    option1: '選項A',
    option2: '選項B',
    option3: '選項C',
    option4: '選項D',
    article: `文章內容${i + 1}`,
    answer: ['A', 'B', 'C', 'D'][i % 4],
    tag1: '標籤1',
    tag2: '標籤2',
    tag3: '標籤3',
  })), []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    
    sortable: true,
    editable: true,
    // 啟用範圍選擇
    enableRangeSelection: true,
    // 啟用填充操作（拖曳複製）
    enableFillHandle: true,
    // 啟用複製貼上
    enableCellTextSelection: true,
  }), []);

  // 設定範圍選擇處理函數
  const handleRangeSelectionChanged = useCallback((event: RangeSelectionChangedEvent) => {
    const ranges = event.api.getCellRanges();
    if (!ranges || ranges.length === 0) {
      return;
    }

    // 如果有選擇範圍，更新輸入框顯示第一個選中的儲存格值
    const firstRange = ranges[0];
    const firstCell = firstRange.startRow;
    const firstCol = firstRange.columns[0];
    if (firstCell && firstCol) {
      const rowNode = event.api.getDisplayedRowAtIndex(firstCell.rowIndex);
      if (rowNode) {
        const value = rowNode.data[firstCol.getColId()];
        setCellValue(value?.toString() ?? '');
        setOriginalValue(value?.toString() ?? '');
      }
    }
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    const gridApi = params.api;
    if (gridApi) {
      gridApi.sizeColumnsToFit();
      
      const observer = new ResizeObserver(() => {
        setTimeout(() => {
          gridApi.sizeColumnsToFit();
        }, 0);
      });
      
      const gridElement = document.querySelector('.ag-theme-alpine');
      if (gridElement) {
        observer.observe(gridElement);
      }
    }
  }, []);

  const handleColumnResized = useCallback((event: ColumnResizedEvent) => {
    if (!gridRef.current?.api) return;
    gridRef.current.api.sizeColumnsToFit();
  }, []);

  const onCellClicked = (event: CellClickedEvent) => {
    if (event.rowIndex === null) return;
    
    const value = event.value?.toString() ?? '';
    setCellValue(value);
    setOriginalValue(value);
    setSelectedCell({
      row: event.rowIndex,
      col: event.column.getColId()
    });
  };

  const handleConfirm = () => {
    if (selectedCell && gridRef.current) {
      const api = gridRef.current.api;
      const rowNode = api.getDisplayedRowAtIndex(selectedCell.row);
      if (rowNode) {
        rowNode.setDataValue(selectedCell.col, cellValue);
      }
    }
  };
  const gridOptions = useMemo(() => ({
    enableRangeSelection: true,
    clipboardRangeSelection: true, // ✅ 支援複製多格
  }), []);
  
  const handleCancel = () => {
    setCellValue(originalValue);
  };

  // 處理點擊空白處
  const handleContainerClick = (event: React.MouseEvent) => {
    // 檢查點擊目標是否在表格或輸入區域外
    const target = event.target as HTMLElement;
    const isOutsideGrid = !target.closest('.ag-theme-alpine');
    const isOutsideInput = !target.closest('.input-area');
    
    if (isOutsideGrid && isOutsideInput) {
      // 清除表格選擇
      gridRef.current?.api.deselectAll();
      // 重置輸入框
      setCellValue('');
      setOriginalValue('');
      setSelectedCell(null);
    }
  };

  // 處理貼上開始事件
  const handlePasteStart = useCallback((event: PasteStartEvent) => {
    console.log('開始貼上操作');
  }, []);

  // 處理貼上結束事件
  const handlePasteEnd = useCallback((event: PasteEndEvent) => {
    console.log('貼上操作完成');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" onClick={handleContainerClick}>
      <Navigation />

      {/* 功能按鈕區 */}
      <div className="max-w-[1800px] mx-auto py-2 sm:px-6 lg:px-8">
        <div className="px-4 py-2 sm:px-0">
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#215F97] hover:bg-[#1b4f7e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#215F97]">
              新增題目
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#215F97] hover:bg-[#1b4f7e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#215F97]">
              編輯
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#215F97] hover:bg-[#1b4f7e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#215F97]">
              儲存
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#215F97] hover:bg-[#1b4f7e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#215F97]">
              匯出Word
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#215F97] hover:bg-[#1b4f7e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#215F97]">
              派發題目
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#215F97] hover:bg-[#1b4f7e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#215F97]">
              自我練習
            </button>
          </div>
        </div>
      </div>

      {/* 表格區域 */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-2">
          <div className="flex items-start gap-2 input-area">
            <textarea
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[42px] resize-y"
              value={cellValue}
              onChange={(e) => setCellValue(e.target.value)}
              placeholder="選取儲存格後，這裡會顯示內容"
              rows={1}
            />
            <button
              onClick={handleConfirm}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4ade80] hover:bg-[#22c55e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ade80]"
              title="確認"
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#f87171] hover:bg-[#ef4444] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f87171]"
              title="取消"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="mt-4 bg-white shadow">
          <div 
            className="ag-theme-alpine w-full" 
            style={{ 
              height: 600,
              width: '100%',
              overflow: 'auto'
            }}
          >
            <AgGridReact
  ref={gridRef}
  rowData={rowData}
  columnDefs={importedColumnDefs}
  defaultColDef={defaultColDef}
  gridOptions={gridOptions}
  pagination={true}
  paginationPageSize={20}
  onGridReady={onGridReady}
  onCellClicked={onCellClicked}
  onColumnResized={handleColumnResized}
  onRangeSelectionChanged={handleRangeSelectionChanged}
  onPasteStart={handlePasteStart}
  onPasteEnd={handlePasteEnd}
  rowHeight={48}
  headerHeight={48}
  animateRows={true}
  enableRangeSelection={true}  // 社群版支援
  enableCellTextSelection={true} // 社群版支援
  rowClass="custom-row"
  suppressColumnVirtualisation={true}
  suppressHorizontalScroll={true}
  domLayout="normal"
/>



          </div>
        </div>
      </div>
    </div>
  );
}
