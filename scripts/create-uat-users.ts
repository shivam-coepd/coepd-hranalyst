import crypto from "node:crypto";

import {
  createClient,
} from "@supabase/supabase-js";

import type {
  Database,
} from "../src/types/database";


const url =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL;

const serviceRole =
  process.env
    .SUPABASE_SERVICE_ROLE_KEY;

const password =
  process.env
    .UAT_USER_PASSWORD;


if (
  !url ||
  !serviceRole
) {
  throw new Error(
    "Supabase configuration missing"
  );
}


if (
  !password ||
  password.length < 16
) {
  throw new Error(
    "UAT_USER_PASSWORD must be at least 16 characters"
  );
}


if (
  process.env.NODE_ENV ===
  "production"
) {
  throw new Error(
    "UAT user seeding is not permitted on production"
  );
}


const supabase =
  createClient<Database>(
    url,
    serviceRole,
    {
      auth: {
        persistSession:
          false,

        autoRefreshToken:
          false,
      },
    }
  );


const users = [

  {
    key:
      "admin",

    email:
      "uat-admin@example.invalid",

    role:
      "admin",

    firstName:
      "UAT",

    lastName:
      "Admin",
  },

  {
    key:
      "placement",

    email:
      "uat-placement@example.invalid",

    role:
      "placement_hr",

    firstName:
      "UAT",

    lastName:
      "Placement",
  },

  {
    key:
      "client",

    email:
      "uat-client@example.invalid",

    role:
      "client_hr",

    firstName:
      "UAT",

    lastName:
      "Client HR",
  },

  {
    key:
      "student",

    email:
      "uat-student@example.invalid",

    role:
      "student",

    firstName:
      "UAT",

    lastName:
      "Student",
  },

] as const;


async function getRoleId(
  role:
    string
) {

  const {
    data,
    error,
  } =
    await supabase
      .from("roles")
      .select("id")
      .eq(
        "name",
        role
      )
      .single();

  if (
    error ||
    !data
  ) {
    throw new Error(
      `Role ${role} not found`
    );
  }

  return data.id;
}


async function main() {

  const result:
    Record<
      string,
      string
    > =
    {};


  for (
    const definition
    of users
  ) {

    const {
      data:
        existing,
    } =
      await supabase
        .from("profiles")
        .select("id")
        .eq(
          "email",
          definition.email
        )
        .maybeSingle();


    let userId =
      existing?.id;


    if (!userId) {

      const {
        data,
        error,
      } =
        await supabase
          .auth
          .admin
          .createUser({

            email:
              definition.email,

            password,

            email_confirm:
              true,

            user_metadata: {

              first_name:
                definition.firstName,

              last_name:
                definition.lastName,

              uat:
                true,

              marker:
                crypto
                  .randomUUID(),
            },
          });


      if (
        error ||
        !data.user
      ) {
        throw new Error(
          error?.message ??
          "Unable to create UAT user"
        );
      }


      userId =
        data.user.id;
    }


    const {
      error:
        profileError,
    } =
      await supabase
        .from("profiles")
        .update({

          account_status:
            "approved",

        })
        .eq(
          "id",
          userId
        );


    if (
      profileError
    ) {
      throw new Error(
        profileError.message
      );
    }


    const roleId =
      await getRoleId(
        definition.role
      );


    const {
      error:
        roleError,
    } =
      await supabase
        .from("user_roles")
        .upsert(
          {

            user_id:
              userId,

            role_id:
              roleId,

            assigned_by:
              userId,

          },
          {

            onConflict:
              "user_id,role_id",

          }
        );


    if (
      roleError
    ) {
      throw new Error(
        roleError.message
      );
    }


    result[
      definition.key
    ] =
      userId;
  }


  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );
}


main()
  .catch(
    error => {

      console.error(
        error
      );

      process.exit(1);
    }
  );