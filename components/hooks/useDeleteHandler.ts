// useDeleteHandler.ts
import { useEffect } from 'react';
import { GridApi } from 'ag-grid-community';

type GridApiRef = {
  current: GridApi | null;
};

export const useDeleteHandler = (gridApiRef: GridApiRef) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && gridApiRef.current) {
        const selectedRows = gridApiRef.current.getSelectedRows();
        if (selectedRows.length > 0) {
          gridApiRef.current.applyTransaction({
            remove: selectedRows
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gridApiRef]);
};
