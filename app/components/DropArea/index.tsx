import type { DropzoneState } from "react-dropzone";

type DropAreaProps = {
    getRootProps: DropzoneState["getRootProps"];
    getInputProps: DropzoneState["getInputProps"];
    isDragActive: boolean;
    canAddFiles: boolean;
}

export default function DropArea({getRootProps, getInputProps, isDragActive, canAddFiles}: DropAreaProps) {
  return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-500 text-white"
            : "border-gray-300 hover:border-gray-400 text-gray-600"
        } ${canAddFiles ? "cursor-pointer" : "cursor-not-allowed"}`}
      >
        <input
          {...getInputProps({ disabled: !canAddFiles })}
          aria-labelledby="dropzone-label"
        />
        <p
          id="dropzone-label"
          className={`flex flex-col items-center justify-center h-32 ${
            canAddFiles ? "cursor-pointer" : "cursor-not-allowed"
          }`}
        >
          <span className="">
            ここにファイルをドラッグ＆ドロップ
            <br />
            またはクリック、タップで追加
          </span>
        </p>
      </div>
  );
}
