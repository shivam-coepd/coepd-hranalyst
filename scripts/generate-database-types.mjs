import fs from "node:fs";

// Derive the client contract from PostgreSQL catalogs, never from migration text.
export async function generateDatabaseTypes(db) {
  const { rows: relations } = await db.query(
    `select c.oid,c.relname,c.relkind from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','v','m') order by c.relname`,
  );
  const tsType = (t) =>
    t.endsWith("[]")
      ? `(${tsType(t.slice(0, -2))})[]`
      : /^(json|jsonb)$/.test(t)
        ? "Json"
        : /^(smallint|integer|bigint|numeric|real|double precision|decimal|oid)/.test(
              t,
            )
          ? "number"
          : t === "boolean"
            ? "boolean"
            : t === "void"
              ? "undefined"
              : "string";
  const q = JSON.stringify;
  const relationTypes = new Map(
    relations.map((r) => [
      r.relname,
      `Database["public"]["${r.relkind === "r" ? "Tables" : "Views"}"][${q(r.relname)}]["Row"]`,
    ]),
  );
  let tables = "",
    views = "";
  for (const r of relations) {
    const { rows: cols } = await db.query(
      `select a.attname,format_type(a.atttypid,a.atttypmod) as type,a.attnotnull,a.attidentity,a.attgenerated,(d.oid is not null) as has_default from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid=$1 and a.attnum>0 and not a.attisdropped order by a.attnum`,
      [r.oid],
    );
    const fields = (mode) =>
      cols
        .map(
          (c) =>
            `${q(c.attname)}${mode === "Update" || (mode === "Insert" && (!c.attnotnull || c.has_default || c.attidentity)) ? "?" : ""}: ${mode !== "Row" && (c.attidentity === "a" || c.attgenerated) ? "never" : tsType(c.type)}${!c.attnotnull ? " | null" : ""}`,
        )
        .join(";\n");
    const { rows: fks } = await db.query(
      `select con.conname,ft.relname as referenced_relation,array(select attname from unnest(con.conkey) with ordinality k(attnum,n) join pg_attribute a on a.attrelid=con.conrelid and a.attnum=k.attnum order by k.n) as columns,array(select attname from unnest(con.confkey) with ordinality k(attnum,n) join pg_attribute a on a.attrelid=con.confrelid and a.attnum=k.attnum order by k.n) as referenced_columns from pg_constraint con join pg_class ft on ft.oid=con.confrelid where con.conrelid=$1 and con.contype='f'`,
      [r.oid],
    );
    const relationships = fks
      .map(
        (f) =>
          `{foreignKeyName:${q(f.conname)};columns:${q(f.columns)};isOneToOne:false;referencedRelation:${q(f.referenced_relation)};referencedColumns:${q(f.referenced_columns)}}`,
      )
      .join(",");
    const body = `${q(r.relname)}:{Row:{${fields("Row")}};${r.relkind === "r" ? `Insert:{${fields("Insert")}};Update:{${fields("Update")}};` : ""}Relationships:[${relationships}]};\n`;
    if (r.relkind === "r") tables += body;
    else views += body;
  }
  const { rows: funcs } = await db.query(
    `select p.proname,p.proargnames,p.proargmodes,p.pronargdefaults,p.proretset,t.typname as return_type,format_type(p.prorettype,null) as return_format,array(select format_type(x,null) from unnest(coalesce(p.proallargtypes,p.proargtypes::oid[])) x) as argtypes from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_type t on t.oid=p.prorettype where n.nspname='public' and p.prokind='f' order by p.proname`,
  );
  const functions = new Map();
  for (const f of funcs) {
    const args = f.argtypes.map((t, i) => ({
      type: t,
      name: f.proargnames?.[i] ?? `arg${i}`,
      mode: f.proargmodes?.[i] ?? "i",
    }));
    const inputs = args.filter((a) => a.mode === "i" || a.mode === "b");
    const outputs = args.filter(
      (a) => a.mode === "t" || a.mode === "o" || a.mode === "b",
    );
    const argShape = inputs.length
      ? `{${inputs.map((a, i) => `${q(a.name)}${i >= inputs.length - f.pronargdefaults ? "?" : ""}:${tsType(a.type)} | null`).join(";")}}`
      : "Record<PropertyKey, never>";
    const ret = outputs.length
      ? `{${outputs.map((a) => `${q(a.name)}:${tsType(a.type)} | null`).join(";")}}`
      : (relationTypes.get(f.return_type) ?? tsType(f.return_format));
    const entry = functions.get(f.proname) ?? { args: [], returns: [] };
    entry.args.push(argShape);
    entry.returns.push(`${ret}${f.proretset ? "[]" : ""}`);
    functions.set(f.proname, entry);
  }
  const functionText = [...functions]
    .map(
      ([name, f]) =>
        `${q(name)}:{Args:${[...new Set(f.args)].join("|")};Returns:${[...new Set(f.returns)].join("|")}}`,
    )
    .join(";\n");
  const text = `// Generated from the migrated PostgreSQL catalogs by scripts/generate-database-types.mjs.\nexport type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\nexport type Database={public:{Tables:{${tables}};Views:{${views}};Functions:{${functionText}};Enums:Record<string,never>;CompositeTypes:Record<string,never>}};\n`;
  fs.writeFileSync("src/types/database.ts", text);
  console.log(
    `Generated database types: ${relations.length} relations, ${functions.size} functions`,
  );
}
