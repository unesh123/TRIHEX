/**
 * SUPER_ADMIN bootstrap via Supabase Auth Admin API.
 *
 * Env:
 *   ADMIN_BOOTSTRAP_EMAIL (required)
 *   ADMIN_BOOTSTRAP_PASSWORD (optional) — if set, creates/updates user with that
 *     password for direct login (no reset email). NEVER printed.
 *   SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL, DATABASE_URL
 *
 * Usage: npx tsx scripts/bootstrap-admin.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { normalizeEnvAliases } from "../src/lib/env/normalize-aliases";
normalizeEnvAliases();

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

function maskEmail(email: string): string {
  const [u, d] = email.split("@");
  if (!u || !d) return "***";
  return `${u.slice(0, 2)}***@${d}`;
}

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (!email) {
    console.error(
      "STOP: ADMIN_BOOTSTRAP_EMAIL is not set.\n" +
        "Add ADMIN_BOOTSTRAP_EMAIL (+ optional ADMIN_BOOTSTRAP_PASSWORD) to .env.local",
    );
    process.exit(1);
  }

  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() || "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!url || !serviceKey) {
    console.error("STOP: Supabase URL + service role key required.");
    process.exit(1);
  }
  if (!dbUrl) {
    console.error("STOP: DATABASE_URL required.");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const list = await admin.auth.admin.listUsers({ perPage: 200 });
  let user = list.data.users.find((u) => u.email?.toLowerCase() === email);

  if (password) {
    // Direct password setup — no email reset (owner-controlled via env).
    if (!user) {
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "SUPER_ADMIN", bootstrap: true },
        app_metadata: {
          role: "SUPER_ADMIN",
          must_reset_password: false,
          mfa_enabled: false,
        },
      });
      if (created.error || !created.data.user) {
        console.error("createUser failed:", created.error?.message);
        process.exit(1);
      }
      user = created.data.user;
      console.log("AUTH_USER_CREATED_WITH_PASSWORD", maskEmail(email));
    } else {
      await admin.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
        app_metadata: {
          ...user.app_metadata,
          role: "SUPER_ADMIN",
          must_reset_password: false,
        },
        user_metadata: {
          ...user.user_metadata,
          role: "SUPER_ADMIN",
        },
      });
      console.log("AUTH_USER_PASSWORD_UPDATED", maskEmail(email));
    }
  } else if (!user) {
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { role: "SUPER_ADMIN", must_reset_password: true },
      app_metadata: { role: "SUPER_ADMIN", must_reset_password: true },
    });
    if (created.error || !created.data.user) {
      console.error("createUser failed:", created.error?.message);
      process.exit(1);
    }
    user = created.data.user;
    console.log("AUTH_USER_CREATED", maskEmail(email));
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://trihex-digital.vercel.app"}/admin/login?reset=1`;
    await admin.auth.resetPasswordForEmail(email, { redirectTo });
    console.log("PASSWORD_RESET_EMAIL_SENT", maskEmail(email));
  } else {
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        role: "SUPER_ADMIN",
      },
    });
    console.log("AUTH_USER_EXISTS", maskEmail(email));
  }

  const client = postgres(dbUrl, { prepare: false, max: 1 });
  const db = drizzle(client, { schema });

  const existing = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.authUserId, user!.id))
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.profiles)
      .set({
        role: "SUPER_ADMIN",
        email,
        fullName: process.env.ADMIN_BOOTSTRAP_NAME ?? "TRIHEX Owner",
        accountStatus: "ACTIVE",
        mfaEnabled: false,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, existing[0].id));
    console.log("PROFILE_UPDATED SUPER_ADMIN");
  } else {
    await db.insert(schema.profiles).values({
      authUserId: user!.id,
      email,
      role: "SUPER_ADMIN",
      fullName: process.env.ADMIN_BOOTSTRAP_NAME ?? "TRIHEX Owner",
      accountStatus: "ACTIVE",
      mfaEnabled: false,
    });
    console.log("PROFILE_CREATED SUPER_ADMIN");
  }

  console.log("\nADMIN_READY");
  console.log("Login URL: https://trihex-digital.vercel.app/admin/login");
  console.log("Email:", maskEmail(email));
  console.log(
    password
      ? "Password: set from ADMIN_BOOTSTRAP_PASSWORD (not printed — see your .env.local)"
      : "Password: use reset email / Supabase Auth console",
  );
  console.log("Change the password in Supabase Auth when you can.");

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
