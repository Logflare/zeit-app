const { parse } = require("url");
const { HOST, LOGFLARE_HOST } = require("../lib/env");
const getAccessToken = require("../lib/get-access-token");
const getLogflareAccessToken = require("../lib/get-logflare-access-token");
const getLogflareAccount = require("../lib/get-logflare-account");
const setMetadata = require("../lib/set-metadata");
const { stringify } = require("querystring");

module.exports = async (req, res) => {
  const {
    query: { code, configurationId, teamId, next }
  } = parse(req.url, true);
  if (!code) {
    res.statusCode = 400;
    res.end("missing query parameter: code");
    return;
  }

  console.log("Got codes");

  function redirectUri() {
    if (teamId) {
      const query = stringify({
        next
      });
      return `${HOST}/api/callback?code=${code[1]}&teamId=${teamId}&configurationId=${configurationId}&${query}`;
    } else {
      const query = stringify({
        next
      });
      return `${HOST}/api/callback?code=${code[1]}&configurationId=${configurationId}&${query}`;
    }
  }

  console.log(code)

  console.log("Getting gettingLogflareAccessToken");
  console.log(redirectUri())
  console.log(code[0])

  const logflareToken = await getLogflareAccessToken({
    code: code[0],
    redirectUri: redirectUri()
  });

  console.log("Getting accessToken");
  const token = await getAccessToken({
    code: code[1],
    redirectUri: `${LOGFLARE_HOST}/install/vercel`
  });

  console.log("Getting logflareAccount");
  const logflareAccount = await getLogflareAccount({
    logflareToken
  });

  console.log("Storing accessToken to metadata");
  await setMetadata(
    {
      configurationId,
      token,
      teamId
    },
    {
      token,
      logflareToken,
      logflareAccount
    }
  );

  res.statusCode = 302;
  res.setHeader("Location", next);
  res.end();
};
