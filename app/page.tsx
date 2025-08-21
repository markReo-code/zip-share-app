"use client";

import JSZip from "jszip";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import {
  PaperClipIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

type UploadResult = {
  success: boolean;
  message?: string;
  url?: string;
  expiresAt?: string;
};

type ExpirationOption = 1 | 3 | 5 | 7;

type FileRow = {id: string, file: File }


export default function Home() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [expiration, setExpiration] = useState<ExpirationOption>(7);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setFiles((prev) => [
      ...prev,
      ...acceptedFiles.map((acceptedFile) => ({
        id: crypto.randomUUID(),
        file: acceptedFile
      })),
    ]);
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      const formData = new FormData();

      if (files.length === 1) {
        // 単一ファイル → そのまま送信
        formData.append("file", files[0].file);
      } else {
        // 複数 → ZIP化
        const zip = new JSZip();
        files.forEach(({file}) => {
          zip.file(file.name, file);
        });
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const zipFile = new File([zipBlob], "zip-share-app.zip", {
          type: "application/zip",
        });
        formData.append("file", zipFile);
      }

      formData.append("expiration", expiration.toString());
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const result = (await response.json()) as UploadResult;
      setUploadResult(result);

      if (result.success) {
        setFiles([]); // 全クリア
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ファイルのアップロードに失敗しました。",
      });
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    // noClick: true
  });

  return (
    <div className="container mx-auto max-w-3xl px-5 pt-12 pb-12">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-2xl font-bold text-center">
          登録不要で、
          <br className="block sm:hidden" />
          すぐにファイルを共有。
        </h1>
        <p className="text-sm sm:text-base font-semibold text-center mt-[12px]">
          最大1GBまでアップロード可能。
          <br className="block sm:hidden" />
          選べる有効期限で安全に送信できます。
        </p>
      </div>

      {/* --- Dropzone --- */}
      {!uploadResult && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-500 text-white"
              : "border-gray-300 hover:border-gray-400 text-gray-600"
          }`}
        >
          <input {...getInputProps({id: "file-input"})}/>
          <label htmlFor="file-input" className="flex flex-col items-center justify-center h-32">
            <span className="">ここにファイルをドラッグ＆ドロップ<br />またはクリック、タップで追加</span>
          </label>
        </div>
      )}
      
      {/* --- ファイルリスト + アップロードボタン --- */}
      {!uploadResult && files.length > 0 && (
        <div className="">
          <p className=" text-gray-dark font-semibold pb-4 border-b border-gray-light">
            {files.length}ファイル
          </p>
          <div className="mt-3">
            <ul className="mb-4">
              {files.map(({ id, file}) => (
                <li
                  key={id}
                  className="flex justify-between items-center text-sm text-gray-dark px-3 py-3"
                >
                  <div className="flex items-center gap-x-2 flex-1 min-w-0">
                    <DocumentCheckIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <span className="xs:max-w-[80%] truncate">{file.name}</span>
                  </div>

                  <button
                    onClick={() =>
                      setFiles((prev) => prev.filter((item) => item.id !== id))
                    }
                    className="text-sm text-gray-dark border-b border-gray-dark leading-none cursor-pointer "
                    type="button"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center py-6 mb-12 border-t border-b border-gray-light">
            <label htmlFor="expires" className="text-sm sm:text-base text-gray-dark">
              ファイルの有効期限
            </label>

            <select
              id="expires"
              value={expiration}
              onChange={(e) =>
                setExpiration(Number(e.target.value) as ExpirationOption)
              }
              className="w-[156px] text-gray-dark border border-gray-light rounded px-4 py-2.5 text-sm appearance-none bg-[url('/arrow.svg')] bg-no-repeat bg-[position:calc(100%-14px)_center] bg-[length:14px_14px]"
            >
              <option value={1}>1日</option>
              <option value={3}>3日</option>
              <option value={5}>5日</option>
              <option value={7}>7日</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 ms:flex-row ms:justify-between">
            <button
              onClick={open}
              className="inline-flex items-center justify-center gap-2 text-base leading-6 font-medium text-blue-500 hover:bg-blue-100 py-2.5 px-4 text-center border border-blue-500 rounded-md cursor-pointer"
              type="button"
            >
              <PaperClipIcon className="w-5 h-5" />
              <span className="text-sm sm:text-base">ファイルの追加</span>
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 bg-blue-500 text-base leading-6 font-medium text-white py-2.5 px-4 text-center rounded-md hover:bg-blue-700 cursor-pointer"
              type="button"
            >
              {uploading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span className="text-sm sm:text-base">
                    アップロード中...
                  </span>
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  <span className="text-sm sm:text-base">アップロード</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- アップロード結果（共有URL） --- */}
      {uploadResult && uploadResult.success && uploadResult.url && (
        <div className="border border-[#dee2e6] rounded-lg pt-5 px-5 pb-7 sm:pb-10">
          <h3 className="sm:text-xl xs:text-[18px] font-medium pb-4 border-b border-[#dee2e6]">
            ファイルを転送しました。
          </h3>

          <p className="text-sm leading-relaxed my-6 sm:my-10">
            ダウンロードページにアクセスするか、ダウンロードリンクをコピーしてください。
            <br />
            あなたのファイルは{expiration}日間有効です。
          </p>
          <h3 className="text-sm font-medium mb-2">共有URL:</h3>

          <div className="w-full flex gap-4 flex-col sm:flex-row">
            <input
              type="text"
              readOnly
              value={uploadResult.url}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-[3] border border-gray-light px-5 py-3.5 text-sm rounded-sm"
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(uploadResult.url!);
                setCopyStatus("copied");
                setTimeout(() => setCopyStatus("idle"), 2000);
              }}
              className={`flex-[1] max-w-[170px] ${
                copyStatus === "copied" ? "bg-[#2ecc71]" : "bg-blue-500"
              } text-white text-sm px-5 py-3.5 rounded transition duration-300`}
              type="button"
            >
              {copyStatus === "copied" ? "コピーしました" : "コピー"}
            </button>
          </div>

          {uploadResult.expiresAt && (
            <p className="mt-3 text-sm">
              有効期限: {new Date(uploadResult.expiresAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
