const { htm } = require("@zeit/integration-utils");
const getProjects = require("../lib/get-projects");
const getMetadata = require("../lib/get-metadata");
const getLogflareSources = require("../lib/get-logflare-sources");

module.exports = async (arg, { state }) => {
  const { payload } = arg;
  const { clientState, teamId, token, configurationId } = payload;
  const { name = "", projectId = "", type = "json", url = "https://api.logflare.app/logs/zeit", logflareSourceId = "", logflareApiKey = "" } = clientState;
  const { errorMessage } = state;

  console.log("Getting metadata");
  const metadata = await getMetadata({
    configurationId,
    token,
    teamId
  });

  console.log("Getting projects");
  const projects = await getProjects({
    token,
    teamId
  });

  const logflareToken = metadata.logflareToken

  console.log("Getting Logflare sources");
  const logflareSources = await getLogflareSources({ logflareToken });

  return htm `
    <Page>
      <P><Link action="list-drains">Back to list</Link></P>
      <Box marginBottom="50px">
      <Fieldset>
          <FsContent>
          <H2>Project (optional)</H2>
          <Select label="" name="projectId" value=${projectId}>
            <Option value="" caption="Select a project" />
            ${projects.map(p => htm`<Option value=${p.id} caption=${p.name} />`)}
          </Select>
        </FsContent>
        <FsFooter>
          <P>We suggest you set a project or all logs for all projects will go to one Logflare source</P>
        </FsFooter>
      </Fieldset>

      <Fieldset>
          <FsContent>
          <H2>Name</H2>
          <Input label="" name="name" value=${name} maxWidth="500px" width="100%" />
        </FsContent>
        <FsFooter>
          <P>This is the name of your new log drain</P>
        </FsFooter>
      </Fieldset>

      <Fieldset>
          <FsContent>
          <H2>Logflare Source</H2>
          <Select label="" name="logflareSourceId" value=${logflareSourceId}>
            <Option value="" caption="Select a source" />
            ${logflareSources.map(s => htm`<Option value=${s.token} caption=${s.name} />`)}
          </Select>
        </FsContent>
        <FsFooter>
          <P>Pick a Logflare source to send logs to</P>
        </FsFooter>
      </Fieldset>

      </Box>
      ${errorMessage ? htm`<Notice type="error">${errorMessage}</Notice>` : ""}
      <Box display="flex" justifyContent="flex-end">
        <Button action="create-drain">Create</Button>
      </Box>
    </Page>
  `;
};