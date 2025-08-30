"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

type ErrorAlertProps = {
  message?: string | null;
  onClose: () => void;
};

export default function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div
      className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex justify-between"
      role="alert"
    >
      <p>{message}</p>

      <button
        type="button"
        onClick={onClose}
        className=""
        aria-label="このエラー通知を閉じる"
      >
        <XMarkIcon className="w-5 h-5"></XMarkIcon>
      </button>
    </div>
  );
}
