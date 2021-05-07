const { htm } = require("@vercel/integration-utils");
const ms = require("ms");
const { stringify } = require("querystring");
const getLogDrains = require("../lib/get-log-drains");
const getProject = require("../lib/get-project");
const getMetadata = require("../lib/get-metadata");
const getLogflareSources = require("../lib/get-logflare-sources");
const { URLSearchParams } = require("url");

module.exports = async (arg, { state }) => {
  const { payload } = arg;
  const { integrationId, team, teamId, token, user, configurationId } = payload;
  const { errorMessage } = state;

  console.log("Logging map");
  let myMap = new Map();
  let keyString = "a string";
  let keyObj = {};
  let keyFunc = function () { };
  myMap.set(keyString, "value associated with 'a string'");
  myMap.set(keyObj, "value associated with keyObj");
  myMap.set(keyFunc, "value associated with keyFunc");
  console.log(myMap);

  console.log("Getting metadata");
  const metadata = await getMetadata({
    configurationId,
    token,
    teamId
  });

  const logflareToken = metadata.logflareToken;

  const logflareSources = await getLogflareSources({ logflareToken });

  console.log("Getting drains");

  const drains = await getLogDrains({ teamId, token });

  drains.sort((a, b) => b.createdAt - a.createdAt);

  drains.map(d => {
    d.url = new URL(d.url)
    d.url.searchParams.set('api_key', 'YOUR_INGEST_API_KEY')

    let url = d.url
    let sourceId = url.searchParams.get('source_id');
    let source = logflareSources.find(({ token }) => {
      return token === sourceId
    });

    d.sourceId = sourceId
    d.logflareSource = source

    console.log(source)

    d.logflareUrlForErrors = new URL(`https://logflare.app/sources/${source.id}/search?tailing=true`);
    d.logflareUrlForErrors.searchParams.append('querystring', 'm.proxy.statusCode:>499 c:count(*) c:group_by(t::hour)');

    d.logflareUrlForSlows = new URL(`https://logflare.app/sources/${source.id}/search?tailing=true`);
    d.logflareUrlForSlows.searchParams.append('querystring', 'm.parsedLambdaMessage.report.duration_ms:>2500 c:count(*) c:group_by(t::hour)');

    d.logflareUrlForLambdas = new URL(`https://logflare.app/sources/${source.id}/search?tailing=true`);
    d.logflareUrlForLambdas.searchParams.append('querystring', 'm.souce:"lambda" c:count(*) c:group_by(t::hour)');

    d.logflareUrlForStatics = new URL(`https://logflare.app/sources/${source.id}/search?tailing=true`);
    d.logflareUrlForStatics.searchParams.append('querystring', 'm.souce:"static" c:count(*) c:group_by(t::hour)');

    d.logflareUrlForConsoles = new URL(`https://logflare.app/sources/${source.id}/search?tailing=true`);
    d.logflareUrlForConsoles.searchParams.append('querystring', '-m.parsedLambdaMessage.lines.level:NULL c:count(*) c:group_by(t::hour)');

    d.logflareUrlForGoogleBots = new URL(`https://logflare.app/sources/${source.id}/search?tailing=true`);
    d.logflareUrlForGoogleBots.searchParams.append('querystring', 'm.proxy.userAgent:~"Google" c:count(*) c:group_by(t::hour)');


  });

  const projectIds = new Set(drains.map(d => d.projectId).filter(Boolean));
  const projectMap = new Map(
    await Promise.all(
      [...projectIds].map(async id => {
        let project = null;
        try {
          project = await getProject(
            {
              teamId,
              token
            },
            id
          );
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
            <H2>Connect Your Logflare Account</H2>
            ${metadata.logflareToken
      ? htm`<P>🥳 You've successfully authenticated with Logflare.</P>`
      : htm`<P>Something is wrong here. Please reinstall the <Link href="https://vercel.com/integrations/logflare">Logflare Vercel</Link> app.</P>`
    }
          </FsContent>
          <FsFooter>
            <P>To 🌊stream, 🔎 search and 📈dashboard structured logs visit <Link href="https://logflare.app/dashboard" target="_blank">your Logflare dashboard</Link></P>
          </FsFooter>
        </Fieldset>
        ${metadata.logflareToken
      ? htm`
        <Box display="flex" justifyContent="flex-end">
          <Button action="new-drain">Create drain</Button>
        </Box>`
      : htm`<Box display="flex" justifyContent="flex-end">
           <Button disabled action="new-drain">Create drain</Button>
         </Box>`
    }
      <H1>🚰 Log Drains</H1>
      ${errorMessage ? htm`<Notice type="error">${errorMessage}</Notice>` : ""}
      ${drains.length
      ? drains.map(drain => {
        const project = drain.projectId
          ? projectMap.get(drain.projectId)
          : null;
        return htm`
            <Fieldset>
              <FsContent>
                    <H2>${drain.name}</H2>
                    <P><B>Sending logs to:</B> ${drain.url}</P>
                    <P><B>Stream these logs in Logflare:</B> <Link href=${`https://logflare.app/sources/${drain.logflareSource.id}`} target='_blank'>${`https://logflare.app/sources/${drain.logflareSource.id}`}</Link></P>
                    
                    ${project
            ? htm`<P><B>Project:</B> <Link href=${`https://vercel.com/${encodeURIComponent(
              team ? team.slug : user.username
            )}/${encodeURIComponent(project.name)}`}>${project.name
              }</Link></P>`
            : drain.projectId
              ? htm`<Box color="red"><P>The project subscribing is already deleted (ID: ${drain.projectId})</P></Box>`
              : ""
          }
        
          <P>👇 👀 Use these links to quickly search your logs with Logflare</P>
          
                    </FsContent>
                  <FsFooter>
                  <Link href=${drain.logflareUrlForErrors}><Button small style="margin-right:10px">5XX status codes</Button></Link>
                  <Link href=${drain.logflareUrlForLambdas}><Button small style="margin-right:10px">Lambdas</Button></Link>
                  <Link href=${drain.logflareUrlForSlows}><Button small style="margin-right:10px">Slow requests</Button></Link>
                  <Link href=${drain.logflareUrlForStatics}><Button small style="margin-right:10px">Statics</Button></Link>
                  <Link href=${drain.logflareUrlForConsoles}><Button small style="margin-right:10px">All Console Logs</Button></Link>
                  <Link href=${drain.logflareUrlForGoogleBots}><Button small style="margin-right:10px">Googlebots</Button></Link>
                    ${drain.clientId === integrationId
            ? htm`<Button action=${`delete-drain?${stringify({
              id: drain.id
            })}`} small type="error">Delete Drain</Button>`
            : htm`
                          <P>
                            Created by <Link href=${`https://vercel.com/dashboard/integrations/${encodeURIComponent(
              drain.configurationId
            )}`}>another integration</Link>
                          </P>
                        `
          }

                  </FsFooter>
            </Fieldset>
          `;
      })
      : htm`
        No drains found!
    `
    }
      <AutoRefresh timeout="60000" />
    </Page>
  `;
};
