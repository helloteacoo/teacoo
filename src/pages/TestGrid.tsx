import { AgGridReact } from 'ag-grid-react';
import { useMemo, useRef } from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function TestGrid() {
  const gridRef = useRef<AgGridReact>(null);

  const rowData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      value1: `A${i + 1}`,
      value2: `B${i + 1}`,
    }));
  }, []);

  const columnDefs = useMemo(() => [
    { field: 'id', editable: true },
    { field: 'value1', editable: true },
    { field: 'value2', editable: true },
  ], []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    editable: true,
    enableRangeSelection: true,
    enableFillHandle: true,
  }), []);

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        enableRangeSelection={true}
        enableRangeHandle={true}
        rowSelection="multiple"
      />
    </div>
  );
}
