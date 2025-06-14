import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ChevronDown, ChevronRight, Folder, X, Plus } from 'lucide-react';
import type { TagFolder, TagsState } from '../../types/tag';
import type { FilterKey } from './sidebar';

interface TagFolderSectionProps {
  isPremium: boolean;
  tagsState: TagsState;
  setTagsState: (state: TagsState) => void;
  filters: Record<FilterKey, boolean>;
  toggleFilter: (key: FilterKey) => void;
}

export default function TagFolderSection({
  isPremium,
  tagsState,
  setTagsState,
  filters,
  toggleFilter
}: TagFolderSectionProps) {
  const [draggedTag, setDraggedTag] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const handleDragStart = (tag: string) => {
    setDraggedTag(tag);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (folderId: string) => {
    if (!draggedTag) return;

    setTagsState({
      ...tagsState,
      folders: tagsState.folders.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            tags: [...folder.tags, draggedTag]
          };
        }
        return folder;
      }),
      unorganizedTags: tagsState.unorganizedTags.filter(tag => tag !== draggedTag)
    });

    setDraggedTag(null);
  };

  const removeTagFromFolder = (folderId: string, tag: string) => {
    setTagsState({
      ...tagsState,
      folders: tagsState.folders.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            tags: folder.tags.filter(t => t !== tag)
          };
        }
        return folder;
      }),
      unorganizedTags: [...tagsState.unorganizedTags, tag]
    });
  };

  const toggleFolder = (folderId: string) => {
    setTagsState({
      ...tagsState,
      folders: tagsState.folders.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            isOpen: !folder.isOpen
          };
        }
        return folder;
      })
    });
  };

  const createNewFolder = () => {
    if (!newFolderName.trim()) return;

    setTagsState({
      ...tagsState,
      folders: [
        ...tagsState.folders,
        {
          id: Math.random().toString(36).substring(7),
          name: newFolderName.trim(),
          tags: [],
          isOpen: true
        }
      ]
    });

    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const deleteFolder = (folderId: string) => {
    const folder = tagsState.folders.find(f => f.id === folderId);
    if (!folder) return;

    setTagsState({
      ...tagsState,
      folders: tagsState.folders.filter(f => f.id !== folderId),
      unorganizedTags: [...tagsState.unorganizedTags, ...folder.tags]
    });
  };

  if (!isPremium) {
    return (
      <div className="space-y-4">
        <div className="mb-4 p-3 bg-blue-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            👑 升級至付費版即可使用標籤資料夾功能！
          </p>
        </div>
        
        {/* 免費版的標籤顯示 */}
        <div className="flex flex-wrap gap-2">
          {tagsState.unorganizedTags.map(tag => (
            <div
              key={tag}
              className={`group flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                filters[tag]
                  ? 'bg-primary text-white'
                  : 'bg-blue-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => toggleFilter(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 新增資料夾按鈕 */}
      {isCreatingFolder ? (
        <div className="flex items-center gap-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="資料夾名稱..."
            className="flex-1 dark:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                createNewFolder();
              } else if (e.key === 'Escape') {
                setIsCreatingFolder(false);
                setNewFolderName('');
              }
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={createNewFolder}
          >
            建立
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsCreatingFolder(false);
              setNewFolderName('');
            }}
          >
            取消
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setIsCreatingFolder(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          新增資料夾
        </Button>
      )}

      {/* 資料夾列表 */}
      <div className="space-y-2">
        {tagsState.folders.map(folder => (
          <div
            key={folder.id}
            className="rounded-lg border dark:border-gray-700"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(folder.id)}
          >
            <div
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg"
              onClick={() => toggleFolder(folder.id)}
            >
              <div className="flex items-center gap-2">
                {folder.isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Folder className="w-4 h-4" />
                <span className="text-sm font-medium">{folder.name}</span>
                <span className="text-xs text-gray-500">({folder.tags.length})</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder.id);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {folder.isOpen && (
              <div className="p-2 space-y-1 border-t dark:border-gray-700">
                {folder.tags.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    將標籤拖曳至此
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {folder.tags.map(tag => (
                      <div
                        key={tag}
                        className={`group flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                          filters[tag]
                            ? 'bg-primary text-white'
                            : 'bg-blue-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span
                          onClick={() => toggleFilter(tag)}
                          className="cursor-pointer"
                        >
                          {tag}
                        </span>
                        <button
                          onClick={() => removeTagFromFolder(folder.id, tag)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 未分類標籤 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">未分類標籤</h4>
        <div className="flex flex-wrap gap-2">
          {tagsState.unorganizedTags.map(tag => (
            <div
              key={tag}
              draggable
              onDragStart={() => handleDragStart(tag)}
              className={`group flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors cursor-move ${
                filters[tag]
                  ? 'bg-primary text-white'
                  : 'bg-blue-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => toggleFilter(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 