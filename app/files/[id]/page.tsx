import FileDownloadClient from "./client";

export type FileInfo = {
    id: string;
    fileName: string;
    filePath: string;
    contentType: string;
    expiresAt: string;
    createdAt: string;
}

async function getFileInfo(id: string) {
    const baseUrl = process.env.BASE_URL || "http://127.0.0.1:8787";
    const response = await fetch(`${baseUrl}/api/files/${id}`);
    return (await response.json()) as FileInfo | null;
}

export default async function Page({params}: {params: Promise<{id: string}>}) {
    const { id } = await params;
    const fileInfo = await getFileInfo(id);

    if (!fileInfo) {
        return <div>ファイルが見つかりませんでした。</div>
    }

    const now = new Date();
    const expiresAt = new Date(fileInfo.expiresAt);
    const isExpired = expiresAt < now;

    if (isExpired) {
        return <div>ファイルの有効期限が切れました。</div>
    }

    return <FileDownloadClient fileId={fileInfo.id}/>
}