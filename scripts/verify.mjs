import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const root = read("index.html");
const study = read("study/index.html");
const teacher = read("teacher/index.html");

assert.equal(read("CNAME").trim(), "app.jysenglish.com");
assert.match(root, /href="\.\/study\/"/);
assert.match(root, /href="\.\/teacher\/"/);
assert.match(study, /https:\/\/share1352\.github\.io\/jys-study-hub\//);
assert.match(teacher, /https:\/\/share1352\.github\.io\/jys-writing-trainer-static\/teacher-dashboard\.html/);

for (const [name, html] of [["study", study], ["teacher", teacher]]) {
  assert.match(html, /app\.jysenglish\.com/,
    `${name} must recover from the default Pages hostname`);
  assert.match(html, /frame-src https:\/\/share1352\.github\.io/,
    `${name} must restrict iframe sources`);
  assert.doesNotMatch(html, /teacher-standalone\.html/,
    `${name} must use the guarded embedded app, not a standalone recovery copy`);
}

console.log("Gateway routes and security contracts passed.");

// finance/: every shipped script must be reachable, and no filename cache-busting.
const financeDir = new URL("../finance/", import.meta.url);
const financeFiles = fs.readdirSync(financeDir);
const financeScripts = financeFiles.filter((f) => f.endsWith(".js"));
const financeSources = financeFiles
  .filter((f) => f.endsWith(".html") || f.endsWith(".js") || f.endsWith(".webmanifest"))
  .map((f) => [f, fs.readFileSync(new URL(f, financeDir), "utf8")]);

for (const script of financeScripts) {
  const referenced = financeSources.some(([name, body]) => name !== script && body.includes(script));
  assert.ok(referenced, `finance/${script} is shipped publicly but nothing references it — delete it`);
  assert.doesNotMatch(script, /-v\d+\.js$/,
    `finance/${script} cache-busts by filename — use a ?v= query string instead`);
}

console.log(`Finance bundle passed: ${financeScripts.length} scripts, all referenced.`);
