import FileDownloadClient from "./client";
import { files } from "@/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

export type FileInfo = {
  id: string;
  fileName: string;
  filePath: string;
  contentType: string;
  expiresAt: string;
  createdAt: string;
};

async function getFileInfo(id: string) {
  const { env } = getCloudflareContext();
  const db = drizzle((env as unknown as CloudflareBindings).DB);

  const file = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return file[0] ?? null;
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fileInfo = await getFileInfo(id);

  if (!fileInfo) {
    return <div>ファイルが見つかりませんでした。</div>;
  }

  const now = new Date();
  const expiresAt = new Date(fileInfo.expiresAt);
  const isExpired = expiresAt < now;

  if (isExpired) {
    return <div>ファイルの有効期限が切れました。</div>;
  }

  return <FileDownloadClient fileId={fileInfo.id} />;
}
