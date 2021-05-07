const fetch = require("node-fetch");
const { stringify } = require("querystring");
const {
  LOGFLARE_CLIENT_ID,
  LOGFLARE_CLIENT_SECRET,
  LOGFLARE_HOST
} = require("./env");
const responseError = require("./response-error");

module.exports = async ({ code, redirectUri }) => {
  const res = await fetch(`${LOGFLARE_HOST}/oauth/token/vercel`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST",
    body: stringify({
      client_id: LOGFLARE_CLIENT_ID,
      client_secret: LOGFLARE_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!res.ok) {
    throw await responseError(res);
  }

  const body = await res.json();
  return body.access_token;
};
