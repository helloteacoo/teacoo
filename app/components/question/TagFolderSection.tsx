import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ChevronDown, ChevronRight, Folder, X, Plus, GripVertical, Pencil } from 'lucide-react';
import type { TagFolder, TagsState } from '../../types/tag';
import type { FilterKey } from './sidebar';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase/firebase';

interface TagFolderSectionProps {
  isPremium: boolean;
  tagsState: TagsState;
  setTagsState: (state: TagsState | ((prev: TagsState) => TagsState)) => void;
  filters: Record<FilterKey, boolean>;
  toggleFilter: (key: FilterKey) => void;
  onDeleteTag?: (tag: string) => void;
  onRenameTag?: (oldTag: string, newTag: string) => void;
  onTagClick?: (tag: string) => void;
}

// 可拖曳的標籤組件
function DraggableTag({ 
  tag, 
  isSelected, 
  onToggle, 
  onDelete,
  onRename,
}: { 
  tag: string; 
  isSelected: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  onRename?: (newName: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tag);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSubmit = () => {
    if (editValue.trim() && editValue !== tag) {
      onRename?.(editValue.trim());
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-6 px-2 py-0 text-xs w-24 text-gray-700 dark:text-gray-700"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            } else if (e.key === 'Escape') {
              setIsEditing(false);
              setEditValue(tag);
            }
          }}
          onBlur={handleSubmit}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
        isSelected
          ? 'bg-primary text-white'
          : 'bg-blue-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-200 dark:hover:bg-gray-700'
      }`}
    >
      <div 
        className="flex items-center cursor-move" 
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="h-3 w-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
      <div 
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {tag}
      </div>
      {onRename && (
        <button
          className="text-gray-400 dark:text-gray-400 hover:text-mainBg dark:hover:text-mainBg ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export default function TagFolderSection({
  isPremium,
  tagsState,
  setTagsState,
  filters,
  toggleFilter,
  onDeleteTag,
  onRenameTag,
  onTagClick
}: TagFolderSectionProps) {
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, folderId?: string) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    if (folderId) {
      // 資料夾內的標籤排序
      setTagsState((prev: TagsState) => {
        const folder = prev.folders.find(f => f.id === folderId);
        if (!folder) return prev;

        const oldIndex = folder.tags.indexOf(active.id as string);
        const newIndex = folder.tags.indexOf(over.id as string);

        return {
          ...prev,
          folders: prev.folders.map((f: TagFolder) => {
            if (f.id === folderId) {
              return {
                ...f,
                tags: arrayMove(f.tags, oldIndex, newIndex)
              };
            }
            return f;
          })
        };
      });
    } else {
      // 未分類標籤排序
      setTagsState((prev: TagsState) => ({
        ...prev,
        unorganizedTags: arrayMove(
          prev.unorganizedTags,
          prev.unorganizedTags.indexOf(active.id as string),
          prev.unorganizedTags.indexOf(over.id as string)
        )
      }));
    }
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

  const handleRenameTag = async (oldTag: string, newTag: string) => {
    if (!newTag || oldTag === newTag) return;
    
    // 檢查新標籤名稱是否已存在
    const allTags = [
      ...tagsState.unorganizedTags,
      ...tagsState.folders.flatMap(f => f.tags)
    ];
    
    if (allTags.includes(newTag)) {
      toast.error('標籤名稱已存在');
      return;
    }

    try {
      // 更新所有題目中的標籤
      const questionsRef = collection(db, 'questions');
      const querySnapshot = await getDocs(questionsRef);
      const updatePromises = querySnapshot.docs.map(async (doc) => {
        const question = doc.data();
        if (question.tags && question.tags.includes(oldTag)) {
          const newTags = question.tags.map((tag: string) => 
            tag === oldTag ? newTag : tag
          );
          await updateDoc(doc.ref, { tags: newTags });
        }
      });
      await Promise.all(updatePromises);

      // 更新狀態
      setTagsState((prev: TagsState) => {
        const newState = {
          folders: prev.folders.map(folder => ({
            ...folder,
            tags: folder.tags.map(t => t === oldTag ? newTag : t)
          })),
          unorganizedTags: prev.unorganizedTags.map(t => t === oldTag ? newTag : t)
        };
        return newState;
      });

      // 呼叫外部的重新命名處理函數
      onRenameTag?.(oldTag, newTag);
      toast.success(`已將標籤「${oldTag}」重新命名為「${newTag}」`);
    } catch (error) {
      console.error('更新標籤失敗:', error);
      toast.error('更新標籤失敗，請稍後再試');
    }
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
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">標籤</h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event)}
          >
            <SortableContext
              items={tagsState.unorganizedTags}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2">
                {tagsState.unorganizedTags.map(tag => (
                  <DraggableTag
                    key={tag}
                    tag={tag}
                    isSelected={filters[tag]}
                    onToggle={() => toggleFilter(tag)}
                    onRename={(newName) => handleRenameTag(tag, newName)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
          >
            <div className="flex items-center justify-between p-2">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => toggleFolder(folder.id)}
              >
                {folder.isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Folder className="w-4 h-4" />
                <span className="text-xs">{folder.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => deleteFolder(folder.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {folder.isOpen && (
              <div className="p-2 pt-0">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => handleDragEnd(event, folder.id)}
                >
                  <SortableContext
                    items={folder.tags}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-wrap gap-2">
                      {folder.tags.map(tag => (
                        <DraggableTag
                          key={tag}
                          tag={tag}
                          isSelected={filters[tag]}
                          onToggle={() => toggleFilter(tag)}
                          onRename={(newName) => handleRenameTag(tag, newName)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 未分類標籤 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">未分類標籤</h4>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleDragEnd(event)}
        >
          <SortableContext
            items={tagsState.unorganizedTags}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-2">
              {tagsState.unorganizedTags.map(tag => (
                <DraggableTag
                  key={tag}
                  tag={tag}
                  isSelected={filters[tag]}
                  onToggle={() => toggleFilter(tag)}
                  onRename={(newName) => handleRenameTag(tag, newName)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
} 