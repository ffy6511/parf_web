// fileStorage.ts
type StoredFile = {
    id: number;
    content: string;
    path: string;
    isFolder: boolean;
  };
  
  const fileStorage = new Map<number, StoredFile>();
  
  export default fileStorage;
  export type { StoredFile };
  