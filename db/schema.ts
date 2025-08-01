import { randomUUID } from "crypto";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const files = sqliteTable("files", {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    fileName: text("fileName").notNull(),
    filePath: text("filePath") .notNull(),
    contentType: text("contentType").notNull(),
    expiresAt: text("expiresAt").notNull(),
    createdAt: text("createdAt").notNull().$defaultFn(() => new Date().toISOString())
});