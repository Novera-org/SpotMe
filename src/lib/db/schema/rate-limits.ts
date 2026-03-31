import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const requestRateLimits = pgTable(
  "request_rate_limits",
  {
    namespace: text("namespace").notNull(),
    subjectKey: text("subject_key").notNull(),
    requestCount: integer("request_count").notNull().default(1),
    windowStartedAt: timestamp("window_started_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.namespace, table.subjectKey],
      name: "request_rate_limits_pk",
    }),
  ],
);
