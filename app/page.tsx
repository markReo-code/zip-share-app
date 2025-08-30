"use client";

import JSZip from "jszip";
import type { UploadResult, ExpirationOption, FileRow } from "@/types/upload";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { formatSize } from "@/lib/formatBytes";
import ErrorAlert from "./components/ErrorAlert";
import UploadResultCard from "./components/UploadResultCard";
import FileList from "./components/FileList";
import UploadActions from "./components/UploadActions";
import DropArea from "./components/DropArea";

const MAX_UPLOAD_LABEL = formatSize(MAX_UPLOAD_BYTES);

export default function Home() {
  //状態管理
  const [files, setFiles] = useState<FileRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [expiration, setExpiration] = useState<ExpirationOption>(7);
  const [notice, setNotice] = useState<string | null>(null);

  // 合計サイズ　（変わるたびに再計算）
  const totalBytes = files.reduce((accu, { file }) => accu + file.size, 0);
  const over = totalBytes > MAX_UPLOAD_BYTES;

  // エラー中とアップロード中は不可
  const canAddFiles = !uploading && !over && !notice;
  // 送信できるか
  const canUploadFiles = files.length > 0 && canAddFiles;

  const handleCloseAlert = () => {
    setNotice(null);
    // 失敗の uploadResult だけクリア（成功カードは残す）
    setUploadResult(prev => (prev && !prev.success ? null : prev));
  };

  const errorMessage: string | null = notice ?? (uploadResult?.success === false ? (uploadResult.message ?? null) : null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setFiles((prev) => {
      // すでに選択済みの合計バイト
      const prevTotalBytes = prev.reduce(
        (accu, curr) => accu + curr.file.size,
        0
      ); 

      // 今回追加分の合計バイト
      const addedTotalBytes = acceptedFiles.reduce(
        (accu, file) => accu + file.size,
        0
      );

      // 追加後の合計
      const nextTotalBytes = prevTotalBytes + addedTotalBytes;

      if (nextTotalBytes > MAX_UPLOAD_BYTES) {
        setNotice(`合計サイズが上限(${MAX_UPLOAD_LABEL})を超えます。追加できませんでした。`);
        return prev; 
      }

      setNotice(null);

      return [
        ...prev,
        ...acceptedFiles.map((acceptedFile) => ({
          id: crypto.randomUUID(),
          file: acceptedFile,
        })),
      ];
    });
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
        files.forEach(({ file }) => {
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
        setFiles([]); 
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

  const handleRemove = useCallback((id: string) => {
     setFiles((prev) => {
      const nextFiles = prev.filter((item) => item.id !== id);
      const nextTotalBytes = nextFiles.reduce((accu, curr) => accu + curr.file.size, 0);
      if (nextTotalBytes <= MAX_UPLOAD_BYTES) setNotice(null);
      return nextFiles;
    })
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: MAX_UPLOAD_BYTES,
    disabled: !canAddFiles,
    onDropRejected: (rejections) => {
      // ファイル超過したファイル名だけを集める
      const tooLarge = rejections
        .filter((rej) =>
          rej.errors.some((err) => err.code === "file-too-large")
        )
        .map((rej) => rej.file.name);

      // 1件でもあれば通知
      if (tooLarge.length) {
        setNotice(`上限（${MAX_UPLOAD_LABEL}）を超えたファイル: ${tooLarge.join(", ")}`);
      }
    },
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
          最大500MBまでアップロード可能。
          <br className="block sm:hidden" />
          無料・有効期限つきで安全に送信できます。
        </p>
      </div>

      {/* --- ドロップゾーン --- */}
      {!uploadResult && (
         <DropArea getRootProps={getRootProps} getInputProps={getInputProps} isDragActive={isDragActive} canAddFiles={canAddFiles}/>
      )}

      {/* --- エラー時のUI --- */}
      {errorMessage && (
        <ErrorAlert message={errorMessage} onClose={handleCloseAlert} />
      )}

      {/* --- ファイルリスト + アップロードボタン --- */}
      {!uploadResult && files.length > 0 && (
        <div className="">
          <FileList
            files={files}
            totalBytesLabel={formatSize(totalBytes)}
            maxLabel={MAX_UPLOAD_LABEL}
            onRemove={handleRemove}
          />

          <UploadActions 
            onUpload={handleUpload} 
            onPickFiles={open}
            onChangeExpiration={setExpiration}
            expiration={expiration} 
            canAddFiles={canAddFiles} 
            canUploadFiles={canUploadFiles}
            uploading={uploading}
          />
        </div>
      )}

      {/* --- アップロード結果（共有URL） --- */}
      {uploadResult && uploadResult.success && uploadResult.url && (
        <UploadResultCard expiration={expiration} uploadResult={uploadResult} />
      )}
    </div>
  );
}
