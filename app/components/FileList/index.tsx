"use client";

import type { FileRow } from "@/types/upload";
import { formatSize } from "@/lib/formatBytes"
import { DocumentCheckIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";

type FileListProps = {
  files: FileRow[];
  totalBytesLabel: string;
  maxLabel: string;
  onRemove: (id: string) => void;
};

export default function FileList({
  files,
  totalBytesLabel,
  maxLabel,
  onRemove
}: FileListProps) {
  return (
    <div>
      <div className="w-full flex justify-between items-center pb-4 border-b border-gray-light">
        <p className=" text-gray-dark font-semibold ">{files.length}ファイル</p>
        <div className="text-xs text-gray-dark ">
          <span>{totalBytesLabel}</span>
          <span className="inline mx-2">/</span>
          <span>{maxLabel}</span>
        </div>
      </div>

      <ul className="mt-3 mb-4">
        {files.map(({ id, file }) => (
          <li
            key={id}
            className="flex justify-between items-center text-sm text-gray-dark px-3 py-3"
          >
            <div className="flex items-center gap-x-2 flex-1 min-w-0">
              <DocumentCheckIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="xs:max-w-[80%] truncate">{file.name}</span>
            </div>

            <div className="flex gap-x-2">
              <div>{formatSize(file.size)}</div>
              <button
                onClick={() => onRemove(id)}
                className="text-sm text-gray-dark leading-none cursor-pointer"
                aria-label={`「${file.name}」を削除`}
                type="button"
              >
                <XMarkIcon className="w-4 h-4"></XMarkIcon>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
