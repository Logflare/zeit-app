const { htm } = require("@zeit/integration-utils");
const getProjects = require("../lib/get-projects");

module.exports = async (arg, { state }) => {
  const { payload } = arg;
  const { clientState, teamId, token } = payload;
  const { name = "", projectId = "", type = "json", url = "https://logflare.app/logs/zeit", logflareSourceId = "", logflareApiKey = "" } = clientState;
  const { errorMessage } = state;

  const projects = await getProjects({ token, teamId });

  return htm`
    <Page>
      <P><Link action="list-drains">Back to list</Link></P>
      <Box marginBottom="50px">
        <Input label="Name" name="name" value=${name} maxWidth="500px" width="100%" />
        <Input label="Logflare Source ID" name="logflareSourceId" value=${logflareSourceId} maxWidth="500px" width="100%" />
        <Input label="Logflare Ingest API Key" name="logflareApiKey" value=${logflareApiKey} maxWidth="500px" width="100%" />
        <Select label="Type" name="type" value=${type} >
          <Option value="json" caption="json" />
        </Select>
        <Input label="URL" name="url" value=${url} maxWidth="500px" width="100%" />
        <Select label="Project (Optional)" name="projectId" value=${projectId}>
          <Option value="" caption="Select a project" />
          ${projects.map(p => htm`<Option value=${p.id} caption=${p.name} />`)}
        </Select>
      </Box>
      ${errorMessage ? htm`<Notice type="error">${errorMessage}</Notice>` : ""}
      <Box display="flex" justifyContent="flex-end">
        <Button action="create-drain">Create</Button>
      </Box>
    </Page>
  `;
};
