import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
  const response = await fetch(url);
  const json = await response.json();
  
  const rpcPaths = Object.keys(json.paths).filter(p => p.startsWith("/rpc/"));
  console.log("All RPCs:", rpcPaths);
}
main();
