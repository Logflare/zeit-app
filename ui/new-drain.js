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
          <H2>Logflare Source ID</H2>
          <Input label="" name="logflareSourceId" value=${logflareSourceId} maxWidth="500px" width="100%" />
        </FsContent>
        <FsFooter>
          <P>After you create a source in Logflare find the source ID on <Link href="https://logflare.app/dashboard" target="_blank">your dashboard</Link></P>
        </FsFooter>
      </Fieldset>

      <Fieldset>
          <FsContent>
          <H2>Logflare Ingest API Key</H2>
          <Input label="" name="logflareApiKey" value=${logflareApiKey} maxWidth="500px" width="100%" />
        </FsContent>
        <FsFooter>
          <P>Copy the Logflare ingest API key from <Link href="https://logflare.app/dashboard" target="_blank">your Logflare dashboard</Link></P>
        </FsFooter>
      </Fieldset>

      <Fieldset>
          <FsContent>
          <H2>Logflare Ingest Endpoint</H2>
          <Input label="" name="url" value=${url} maxWidth="500px" width="100%"/>
        </FsContent>
        <FsFooter>
          <P>Don't edit this or your logs won't go anywhere</P>
        </FsFooter>
      </Fieldset>

      <Fieldset>
          <FsContent>
          <H2>Log Event Format</H2>
          <Select label="" name="type" value=${type}>
            <Option value="json" caption="json" />
          </Select>
        </FsContent>
        <FsFooter>
          <P>Should always be JSON</P>
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
