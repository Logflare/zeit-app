const fetch = require("node-fetch");
const responseError = require("./response-error");
const { LOGFLARE_HOST } = require("./env");

module.exports = async ({ logflareToken }) => {
  const res = await fetch(`${LOGFLARE_HOST}/api/account`, {
    headers: {
      "Content-Type": `application/json`,
      Authorization: `Bearer ${logflareToken}`
    }
  });

  if (!res.ok) {
    throw await responseError(res);
  }

  return res.json();
};
