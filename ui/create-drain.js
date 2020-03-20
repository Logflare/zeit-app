const createLogDrain = require("../lib/create-log-drain");
const getMetadata = require("../lib/get-metadata");
const route = require("../lib/route");

module.exports = async arg => {
  const { payload } = arg;
  const { clientState, configurationId, teamId, token } = payload;
  var { projectId, name, type = "json", url = "https://api.logflare.app/logs/zeit", logflareSourceId, logflareApiKey } = clientState;

  console.log("getting metadata");
  const metadata = await getMetadata({ configurationId, token, teamId });

  url = url + `?api_key=${metadata.logflareAccount.api_key}&source_id=${logflareSourceId}`

  console.log("creating a new log drain");

  try {
    await createLogDrain({
      token: metadata.token,
      teamId
    }, {
      name,
      projectId,
      type,
      url
    });
  } catch (err) {
    if (err.body && err.body.error) {
      return route(arg, "new-drain", {
        errorMessage: err.body.error.message
      });
    } else {
      throw err;
    }
  }

  return route(arg, "list-drains");
};
