const { htm } = require("@zeit/integration-utils");
const ms = require("ms");
const { stringify } = require("querystring");
const getLogDrains = require("../lib/get-log-drains");
const getIntegration = require("../lib/get-integration");
const getProject = require("../lib/get-project");

module.exports = async (arg, { state }) => {
  const { payload } = arg;
  const { integrationId, team, teamId, token, user } = payload;
  const { errorMessage } = state;
  const drains = await getLogDrains({ teamId, token });
  drains.sort((a, b) => b.createdAt - a.createdAt);

  const otherIntergraionIds = new Set(
    drains.filter(d => d.clientId !== integrationId).map(d => d.clientId)
  );

  let otherIntergraionsMap;
  if (otherIntergraionIds.size) {
    const otherIntegrations = await Promise.all(
      [...otherIntergraionIds].map(id =>
        getIntegration({ teamId, token }, { id })
      )
    );
    otherIntergraionsMap = new Map(otherIntegrations.map(i => [i.id, i]));
  }

  const projectIds = new Set(drains.map(d => d.projectId).filter(Boolean));
  const projectMap = new Map(
    await Promise.all(
      [...projectIds].map(async id => {
        let project = null;
        try {
          project = await getProject({ teamId, token }, id);
        } catch (err) {
          if (!err.res || err.res.status !== 404) {
            throw err;
          }
        }
        return [id, project];
      })
    )
  );

  return htm`
    <Page>
      <Fieldset>
          <FsContent>
            <H2>Create Your Logflare Account</H2>
            <P>Visit <Link href="https://logflare.app" target="_blank">Logflare</Link> and create an account</P>
          </FsContent>
          <FsFooter>
            <P>If you already have an account <Link href="https://logflare.app/dashboard" target="_blank">go to your Logflare dashboard</Link></P>
          </FsFooter>
        </Fieldset>
        <Box display="flex" justifyContent="flex-end">
          <Button action="new-drain">Create drain</Button>
        </Box>
      <H1>Log Drains</H1>
      ${errorMessage ? htm`<Notice type="error">${errorMessage}</Notice>` : ""}
      ${
        drains.length
          ? drains.map(drain => {
              const project = drain.projectId
                ? projectMap.get(drain.projectId)
                : null;
              return htm`
            <Fieldset>
              <FsContent>
                    <H2>${drain.name}</H2>
                    <P><B>Type:</B> ${drain.type}</P>
                    <P><B>URL:</B> ${drain.url}</P>
                    ${
                      project
                        ? htm`<P><B>Project:</B> <Link href=${`https://zeit.co/${encodeURIComponent(
                            team ? team.slug : user.username
                          )}/${encodeURIComponent(project.name)}`}>${
                            project.name
                          }</Link></P>`
                        : drain.projectId
                        ? htm`<Box color="red"><P>The project subscribing is already deleted (ID: ${drain.projectId})</P></Box>`
                        : ""
                    }
                    </FsContent>
                  <FsFooter>
                    ${
                      drain.clientId === integrationId
                        ? htm`<Button action=${`delete-drain?${stringify({
                            id: drain.id
                          })}`} small type="error">DELETE</Button>`
                        : htm`
                          <P>
                            Created by <Link href=${`https://zeit.co/dashboard/integrations/${encodeURIComponent(
                              drain.configurationId
                            )}`}>${
                            otherIntergraionsMap.get(drain.clientId).name
                          }</Link>
                          </P>
                        `
                    }

                  </FsFooter>
            </Fieldset>
          `;
            })
          : htm`
          <Box alignItems="center" display="flex" height="300px" justifyContent="center">
            <P>No drain found!</P>
          </Box>
        `
      }
      <AutoRefresh timeout="60000" />
    </Page>
  `;
};
