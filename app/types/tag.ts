export interface TagFolder {
  id: string;
  name: string;
  tags: string[];
  isOpen?: boolean;
}

export interface TagsState {
  folders: TagFolder[];
  unorganizedTags: string[];
} 