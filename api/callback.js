const {
  parse
} = require("url");
const { HOST, LOGFLARE_HOST } = require("../lib/env");
const getAccessToken = require("../lib/get-access-token");
const getLogflareAccessToken = require("../lib/get-logflare-access-token");
const setMetadata = require("../lib/set-metadata");
const {
  stringify
} = require("querystring");

module.exports = async (req, res) => {
  const {
    query: {
      code,
      configurationId,
      teamId,
      next
    }
  } = parse(req.url, true);
  if (!code) {
    res.statusCode = 400;
    res.end("missing query parameter: code");
    return;
  }

  console.log("Got codes");
  console.log(code)

  function redirectUri() {
    if (teamId) {
      const query = stringify({
        next
      });
      return `${HOST}/api/callback?code=${code[1]}&teamId=${teamId}&configurationId=${configurationId}&${query}`
    } else {
      const query = stringify({
        next,
      });
      return `${HOST}/api/callback?code=${code[1]}&configurationId=${configurationId}&${query}`
    }
  }

  console.log("Getting gettingLogflareAccessToken");
  const logflareToken = await getLogflareAccessToken({
    code: code[0],
    redirectUri: redirectUri()
  });

  console.log("Getting accessToken");
  const token = await getAccessToken({
    code: code[1],
    redirectUri: `${LOGFLARE_HOST}/install/zeit`
  });

  console.log("Storing accessToken to metadata");
  await setMetadata({
    configurationId,
    token,
    teamId
  }, {
    token,
    logflareToken
  });

  /* console.log(`Got ingest_api_key: ${ingest_api_key}`)
  await setMetadata({ configurationId, token, teamId }, { ingest_api_key }); */

  res.statusCode = 302;
  res.setHeader("Location", next);
  res.end();
};