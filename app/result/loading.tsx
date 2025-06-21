export default function ResultLoading() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* 頁面標題骨架 */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse" />
      
      {/* 結果列表骨架 */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg bg-card dark:bg-gray-800 animate-pulse"
          >
            <div className="flex items-center justify-between">
              {/* 測驗標題骨架 */}
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
              
              {/* 統計資訊骨架 */}
              <div className="flex gap-4">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 