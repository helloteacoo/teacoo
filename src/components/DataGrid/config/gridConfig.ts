import { GridOptions } from 'ag-grid-community';

export const defaultGridOptions: Partial<GridOptions> = {
  defaultColDef: {
    resizable: true,
    sortable: true,
    editable: true,
    flex: 1,
    minWidth: 100,
    cellStyle: { display: 'flex', alignItems: 'center' },
    filter: true,
    floatingFilter: false
  },
  rowSelection: 'multiple',
  pagination: true,
  paginationPageSizeSelector: [10, 20, 50, 100],
  paginationPageSize: 10,
  animateRows: true,
  enableRangeSelection: true
};

// 表格主題配置
export const gridThemeConfig = {
  background: '#ffffff',
  headerBackground: '#f3f4f6',
  oddRowBackground: '#f8f9fa',
  evenRowBackground: '#ffffff',
  borderColor: '#e5e7eb',
  textColor: '#111827',
  headerTextColor: '#374151'
}; 