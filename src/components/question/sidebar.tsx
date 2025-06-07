import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';

export type FilterKey =
  | '單題'
  | '單選題'
  | '多選題'
  | '填空題'
  | '簡答題'
  | '題組'
  | '閱讀測驗'
  | '克漏字'
  | '國文'
  | '自然'
  | '國小'
  | '國中';

type Props = {
  filters: Record<FilterKey, boolean>;
  toggleFilter: (key: FilterKey) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;
  selectedQuestions: string[];
  setSelectedQuestions: (v: string[]) => void;
  setQuestions: React.Dispatch<React.SetStateAction<any>>;
};

export default function Sidebar({
  filters,
  toggleFilter,
  showDeleteConfirm,
  setShowDeleteConfirm,
  selectedQuestions,
  setSelectedQuestions,
  setQuestions,
}: Props) {
  return (
    <aside className="w-64 p-4 bg-stone-100 z-20 sticky top-[0px] h-[calc(100vh-0px)] overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">篩選</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 text-gray-700">題型</h3>
            <div className="space-y-2">
              {/* 單題區 */}
              <div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Checkbox checked={filters.單題} onChange={() => toggleFilter('單題')} />
                  <span className="font-medium">單題</span>
                </div>
                <div className="ml-6 space-y-1 mt-1">
                  {['單選題', '多選題', '填空題', '簡答題'].map((key) => (
                    <div key={key} className="flex items-center space-x-2 text-gray-700">
                      <Checkbox
                        checked={filters[key as FilterKey]}
                        onChange={() => toggleFilter(key as FilterKey)}
                      />
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 題組區 */}
              <div>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Checkbox checked={filters.題組} onChange={() => toggleFilter('題組')} />
                  <span className="font-medium">題組</span>
                </div>
                <div className="ml-6 space-y-1 mt-1">
                  {['閱讀測驗', '克漏字'].map((key) => (
                    <div key={key} className="flex items-center space-x-2 text-gray-700">
                      <Checkbox
                        checked={filters[key as FilterKey]}
                        onChange={() => toggleFilter(key as FilterKey)}
                      />
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 標籤區 */}
          <div>
            <h3 className="font-medium mb-2 text-gray-700">標籤</h3>
            <div className="flex flex-wrap gap-2">
              {['國文', '自然', '國小', '國中'].map((key) => (
                <Button
                  key={key}
                  onClick={() => toggleFilter(key as FilterKey)}
                  className={`px-3 py-1 rounded-full transition-colors border-none focus:outline-none ${
                    filters[key as FilterKey]
                      ? 'bg-primary text-white'
                      : 'bg-blue-100 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <ConfirmDeleteModal
          open={showDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setQuestions((prev: any[]) =>
              prev.filter(
                (q) =>
                  !selectedQuestions.includes(q.id) &&
                  (q.type !== '閱讀測驗' ||
                    !q.questions.some((sub: any) => selectedQuestions.includes(sub.id)))
              )
            );
            setSelectedQuestions([]);
            setShowDeleteConfirm(false);
          }}
        />
      </div>
    </aside>
  );
}
