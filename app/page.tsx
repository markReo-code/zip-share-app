"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type UploadResult = {
  success: boolean;
  message?: string;
  url?: string;
  expiresAt?: string;
}

type ExpirationOption = 1 | 3 | 5 | 7;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [expiration, setExpiration] = useState<ExpirationOption>(7);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const dropedFile = acceptedFiles[0];
      setFile(dropedFile);
      setFileName(dropedFile.name);
    }

  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("expiration", expiration.toString());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        )
      }

      const result = (await response.json()) as UploadResult;
      setUploadResult(result);

      if (result.success) {
        setFile(null);
        setFileName("");
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : "ファイルのアップロードに失敗しました。"
      });
    } finally {
      setUploading(false);
    }

  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold text-center mb-4">ファイル共有アプリ</h1>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-500"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-cenrter h-32">
          <p className="text-gray-600">
            {file ? fileName : "ここにファイルをドラッグ＆ドロップ"}
          </p>
        </div>
      </div>

      {file && (
        <div className="">
          <p className="">ファイル名: {fileName}</p>
          <div className="my-4">
            <label className="block mb-2">
              有効期限:
              <select value={expiration} onChange={(e) => setExpiration(Number(e.target.value) as ExpirationOption)} className="ml-2 p-1 border rounded">
                <option value={1}>1日</option>
                <option value={3}>3日</option>
                <option value={5}>5日</option>
                <option value={7}>7日</option>
              </select>
            </label>
          </div>
          <button onClick={handleUpload} disabled={uploading} className="bg-[#2ecc71] text-white px-4 py-1 text-sm rounded cursor-pointer" type="button">
            {uploading ? "アップロード中..." : "アップロード" }
          </button>
        </div>
      )}

      {uploadResult && uploadResult.success && uploadResult.url && (
        <div>
          <h3 className="text-sm font-medium mb-2">共有URL:</h3>
          <input 
            type="text" 
            readOnly 
            value={uploadResult.url} 
            onClick={(e) => (e.target as HTMLInputElement).select()}
            className="flex-1 border border-gray-300 px-2 py-1 text-sm"
            />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(uploadResult.url!);
              setCopyStatus("copied");
              setTimeout(() => setCopyStatus("idle"), 2000);
            }}
            className={`ml-2 ${
              copyStatus === "copied" ? "bg-[#2ecc71]" : "bg-[#3498db]"
            } text-white text-sm px-3 py-1 rounded transition-colors duration-300`}
            type="button"
          >
             {copyStatus === "copied" ? "コピーしました" : "コピー"}
          </button>

          {uploadResult.expiresAt && (
            <p className="mt-2 text-sm text-gray-500">有効期限: {new Date(uploadResult.expiresAt).toLocaleString()}</p>
          )}
        </div>
      )}

    </div>
  );
}
