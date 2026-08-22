const ORIGIN = (process.env.JYS_GATEWAY_URL || "https://app.jysenglish.com").replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.HEALTH_TIMEOUT_MS || 20_000);

async function fetchHtml(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${ORIGIN}${path}`, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "jys-platform-gateway-health" }
    });
    const body = await response.text();
    if (response.status !== 200) throw new Error(`${path} returned HTTP ${response.status}`);
    return { url: response.url, body };
  } finally {
    clearTimeout(timer);
  }
}

const checks = [
  ["/", "JYS Learning Platforms"],
  ["/study/", "https://share1352.github.io/jys-study-hub/"],
  ["/teacher/", "https://share1352.github.io/jys-writing-trainer-static/teacher-dashboard.html"]
];

let failed = 0;
for (const [path, marker] of checks) {
  try {
    const result = await fetchHtml(path);
    if (!result.body.includes(marker)) throw new Error(`${path} is missing its route marker`);
    console.log(`PASS ${path}: ${result.url}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${path}: ${error.message}`);
  }
}

if (failed) process.exit(1);
console.log("All gateway routes passed.");
