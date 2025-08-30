import type { UploadResult, ExpirationOption } from "@/types/upload";
import { useState } from "react";

type UploadResultCardProps = {
  uploadResult: UploadResult;
  expiration: ExpirationOption;
};

export default function UploadResultCard({
  uploadResult,
  expiration,
}: UploadResultCardProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  return (
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
  );
}
