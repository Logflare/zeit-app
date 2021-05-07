const { withUiHook } = require("@vercel/integration-utils");
const route = require("../lib/route");

module.exports = withUiHook(async arg => {
  let {
    payload: { action }
  } = arg;
  if (action === "view") {
    action = "list-drains";
  }
  return route(arg, action);
});
