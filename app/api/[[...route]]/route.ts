import { files } from "@/db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");

app.get("/files", async (c) => {
  const { env } = getCloudflareContext();
  const db = drizzle((env as unknown as CloudflareBindings).DB);
  const fileResponse = await db.select().from(files);
  return c.json(fileResponse);
});

// 追加１
app.post("/upload", async (c) => {
  const { env } = getCloudflareContext();
  const formData = await c.req.formData();
  const fileData = formData.get("file");
  const expirationDays = formData.get("expiration");

  if (!fileData) {
    return c.json({ success: false, message: "ファイルがありません" }, 400);
  }

  const file = fileData as File;
  const fileName = file.name;
  const filePath = `upload/${Date.now()}-${fileName}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Number(expirationDays));

  try {
    const r2 = (env as unknown as CloudflareBindings).R2;
    await r2.put(filePath, file);
  } catch (r2Error) {
    return c.json(
      { success: false, message: `File upload failed: ${r2Error}` },
      500
    );
  }

  const db = drizzle((env as unknown as CloudflareBindings).DB);

  // レコードを作る部分（保存はしていない。この段階では）　start
  try {
    await db.insert(files).values({
      fileName,
      filePath,
      contentType: file.type,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("DB Insert Error:", error);
    return c.json(
      { success: false, message: "ファイルの保存に失敗しました" },
      500
    );
  }
  // レコードを作る部分　end

  const insertRecord = await db
    .select()
    .from(files)
    .orderBy(desc(files.createdAt))
    .limit(1);

  return c.json({
    success: true,
    message: "ファイルを保存しました",
    url: `${process.env.BASE_URL}/files/${insertRecord[0].id}`,
    expiresAt: expiresAt.toISOString(),
  });
});

// 追加２
app.get("/files/:id", async (c) => {
  const id = c.req.param("id");
  const { env } = getCloudflareContext();
  const db = drizzle((env as unknown as CloudflareBindings).DB);

  const file = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return c.json(file[0]);
});

// 追加３
app.get("/download/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { env } = getCloudflareContext();
    const db = drizzle((env as unknown as CloudflareBindings).DB);

    // データベースから最新のデータを１件取得する
    const fileResult = await db.select().from(files).where(eq(files.id, id)).limit(1);

    if (fileResult.length === 0) {
        return c.json({error: "ファイルが見つかりませんでした。"},404);
    }

    const fileInfo = fileResult[0];

    // 有効期限が切れていたら
    if (new Date() > new Date(fileInfo.expiresAt)) {
        return c.json({ error: "ファイルの有効期限が切れました。"}, 403);
    }

    const r2 = (env as unknown as CloudflareBindings).R2; //R2にアクセスし
    const file = await r2.get(fileInfo.filePath); //R2からファイルのデータを取ってくる。保存先のファイルパスを設定してあげる

    if (file === null) {
        return c.json({ error: "ストレージにファイルが見つかりませんでした"}, 400);
    }

    // ダウンロードのロジック
    const arrayBuffer = await file.arrayBuffer();
    c.header(
        "Content-Disposition",
        `attachment; fileName=${fileInfo.fileName}`
    )
    c.header(
        "Content-Type",
        fileInfo.contentType || "application/octet-stream"
    )
    c.header("Content-Length", String(arrayBuffer.byteLength));
    return c.body(arrayBuffer);

  } catch {
    return c.json({ error: "ファイルダウンロード中にエラーが発生しました"}, 500);

  }

});

export const GET = handle(app);
export const POST = handle(app);
