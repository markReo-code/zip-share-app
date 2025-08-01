"use client";

import Link from "next/link";

function FileDownloadClient({ fileId }: { fileId: string }) {
  const handleDownload = async () => {
    window.location.href = `/api/download/${fileId}`;
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">
        ファイルをダウンロード
      </h1>
      <div className="p-4 bg-green-50 border border-green-200 rounded mb-6">
        <button
          onClick={handleDownload}
          className="block w-full bg-blue-500 text-white text-center py-2 px-4 rounded hover:bg-blue-600"
          type="button"
        >
          ファイルをダウンロード
        </button>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>このファイルは指定された期間後に自動的に期限切れになります。</p>
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
