CREATE TABLE IF NOT EXISTS "request_rate_limits" (
  "namespace" text NOT NULL,
  "subject_key" text NOT NULL,
  "request_count" integer DEFAULT 1 NOT NULL,
  "window_started_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "request_rate_limits_pk" PRIMARY KEY ("namespace", "subject_key")
);
