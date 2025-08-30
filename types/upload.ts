 export type UploadResult = {
  success: boolean;
  message?: string;
  url?: string;
  expiresAt?: string;
};

export type ExpirationOption = 1 | 3 | 5 | 7;

export type FileRow = { id: string; file: File };