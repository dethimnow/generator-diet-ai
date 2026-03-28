import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const content = fs.readFileSync(
  path.join(__dirname, "../supabase/functions/diet-generate/index.ts"),
  "utf8"
);
const body = {
  project_id: "zzvkmrhvezsyrmwcntgh",
  name: "diet-generate",
  entrypoint_path: "index.ts",
  verify_jwt: false,
  files: [{ name: "index.ts", content }],
};
fs.writeFileSync(path.join(__dirname, "../_mcp_edge_deploy.json"), JSON.stringify(body), "utf8");
console.log("written", content.length);
