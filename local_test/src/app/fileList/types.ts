export interface FileData {
  id: number;
  fileName: string;
  lastModified: string;
  fileContent: ArrayBuffer;
  parentId: number | null;
  isFolder: boolean;
  path: string;
  features?: any;
  preferredParameters?: {
    numbers: Record<string, number>;
    strings: Record<string, string>;
  };
}

export interface Display_1Props {
  isMultiSelect: boolean;
  selectedFiles: Set<number>;
  onMultiSelect: (fileId: number) => void;
}

export interface DisplayRef {
  handleBatchDelete: (fileIds: number[]) => Promise<void>;
  handleCreateFolder: (folderName: string) => Promise<void>;
}