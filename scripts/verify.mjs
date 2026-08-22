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
