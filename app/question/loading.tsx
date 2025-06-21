export default function QuestionLoading() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* 頁面標題骨架 */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-48 animate-pulse" />
      
      {/* 問題卡片骨架 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg bg-card dark:bg-gray-800 space-y-4 animate-pulse"
          >
            {/* 問題標題骨架 */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            
            {/* 問題內容骨架 */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
            
            {/* 標籤骨架 */}
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 