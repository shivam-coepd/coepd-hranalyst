import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { generateDatabaseTypes } from "./generate-database-types.mjs";

// SQL-only fallback. Supabase Auth/Storage HTTP behavior requires the full local stack.
const db = new PGlite();
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create schema storage;
  create schema extensions;
  create publication supabase_realtime;
  create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as
    $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
  create function auth.role() returns text language sql stable as
    $$select coalesce(nullif(current_setting('request.jwt.claim.role',true),''),current_user)$$;
  create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid, owner_id text, metadata jsonb);
  alter table storage.objects enable row level security;
  create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
  grant usage on schema public,auth,storage to anon,authenticated,service_role;
`);
try {
  for (const file of fs
    .readdirSync("supabase/migrations")
    .filter((x) => x.endsWith(".sql"))
    .sort()) {
    let sql = fs.readFileSync(`supabase/migrations/${file}`, "utf8");
    // PostgreSQL core provides gen_random_uuid; no cryptographic tests are faked.
    sql = sql.replace(/create extension if not exists pgcrypto;/gi, "");
    try {
      await db.exec(sql);
      console.log(`PASS ${file}`);
    } catch (e) {
      console.error(`FAIL ${file}: ${e.message}`);
      process.exitCode = 1;
      break;
    }
  }
  if (!process.exitCode) {
    if (process.argv.includes("--generate-types"))
      await generateDatabaseTypes(db);
    const embeddedOnlyExclusions = new Map([
      [
        "slow_queries.sql",
        "requires the pg_stat_statements extension from the full Supabase stack",
      ],
    ]);
    for (const file of fs
      .readdirSync("supabase/tests")
      .filter((x) => x.endsWith(".sql"))
      .sort()) {
      if (embeddedOnlyExclusions.has(file)) {
        console.log(`SKIP test ${file}: ${embeddedOnlyExclusions.get(file)}`);
        continue;
      }
      try {
        await db.exec(fs.readFileSync(`supabase/tests/${file}`, "utf8"));
        console.log(`PASS test ${file}`);
      } catch (e) {
        console.error(`FAIL test ${file}: ${e.message}`);
        process.exitCode = 1;
        try {
          await db.exec("rollback");
        } catch {}
      }
    }
  }
} finally {
  await db.close();
}
