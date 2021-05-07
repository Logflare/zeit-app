const REQUIRED = [
  "CLIENT_ID",
  "CLIENT_SECRET",
  "HOST",
  "LOGFLARE_HOST",
  "LOGFLARE_CLIENT_ID",
  "LOGFLARE_CLIENT_SECRET"
];

for (const name of REQUIRED) {
  if (!process.env[name]) {
    throw new Error(`Missing environment variables: ${name}`);
  }
}

module.exports = process.env;
