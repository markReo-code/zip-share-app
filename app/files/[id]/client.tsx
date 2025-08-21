"use client";

import Link from "next/link";
import {ArrowDownTrayIcon } from "@heroicons/react/24/outline";

function FileDownloadClient({ fileId }: { fileId: string }) {
  const handleDownload = async () => {
    window.location.href = `/api/download/${fileId}`;
  };

  return (
    <div className=" max-w-lg mx-auto px-5 pt-12 pb-12">
      <h1 className="text-2xl font-bold text-center mb-7">
        ファイルをダウンロード
      </h1>
      <div className="p-4 bg-green-50 border border-green-200 rounded mb-6">
        <button
          onClick={handleDownload}
          className="inline-flex justify-center items-center gap-3  w-full bg-blue-500 font-medium text-white text-center py-2 px-4 rounded hover:bg-blue-600"
          type="button"
        >
          <ArrowDownTrayIcon className="w-5 h-5"/>
          ファイルをダウンロード
        </button>
      </div>

      <div className="text-center text-sm text-gray-dark">
        <p>このファイルは指定された期間後に<br className="block ms:hidden"/>自動的に期限切れになります。</p>
        <div className="mt-6">
          <Link href="/" className="text-blue-500 hover:underline">
            新しいファイルをアップロード
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FileDownloadClient;
