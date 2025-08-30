"use client";

import {
  PaperClipIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { ExpirationOption } from "@/types/upload";

type UploadActionsProps = {
  onUpload: () => void;
  onPickFiles: () => void;
  onChangeExpiration: (value: ExpirationOption) => void;
  canAddFiles: boolean;
  canUploadFiles: boolean;
  uploading: boolean;
  expiration: ExpirationOption;
};

export default function UploadActions({
  onUpload,
  onPickFiles,
  onChangeExpiration,
  canAddFiles,
  canUploadFiles,
  expiration,
  uploading,
}: UploadActionsProps) {
  return (
    <>
      <div className="flex justify-between items-center py-6 mb-12 border-t border-b border-gray-light">
        <label
          htmlFor="expires"
          className="text-sm sm:text-base text-gray-dark"
        >
          ファイルの有効期限
        </label>

        <select
          id="expires"
          value={expiration}
          onChange={(e) =>
            onChangeExpiration(Number(e.target.value) as ExpirationOption)
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
          onClick={onPickFiles}
          disabled={!canAddFiles}
          className={`inline-flex items-center justify-center gap-2 text-base font-medium leading-6 py-2.5 px-4 border rounded-md text-blue-500 border-blue-500 hover:bg-blue-100 cursor-pointer disabled:text-gray-400 disabled:border-gray-300 disabled:bg-transparent disabled:hover:bg-transparent disabled:cursor-not-allowed`}
          type="button"
        >
          <PaperClipIcon className="w-5 h-5" />
          <span className="text-sm sm:text-base">ファイルの追加</span>
        </button>
        <button
          onClick={onUpload}
          disabled={!canUploadFiles}
          className={`inline-flex items-center justify-center gap-2 text-base leading-6 py-2.5 px-4 rounded-md text-white bg-blue-500 hover:bg-blue-700 cursor-pointer ${
            uploading ? "cursor-wait" : ""
          } disabled:bg-blue-300 disabled:hover:bg-blue-300 disabled:opacity-60 disabled:cursor-not-allowed`}
          type="button"
        >
          {uploading ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span className="text-sm sm:text-base">アップロード中...</span>
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="w-5 h-5" />
              <span className="text-sm sm:text-base">アップロード</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
