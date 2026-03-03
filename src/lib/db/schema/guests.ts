import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
