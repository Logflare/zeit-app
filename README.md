# Logflare Zeit App
Install the Logflare Ziet app at: https://zeit.co/integrations/logflare

## Setup for Dev
While in your project root directory:

```
npm install
```

```
echo "CLIENT_ID=THE_LOGFLARE_APP_CLIENT_ID
CLIENT_SECRET=THE_LOGFLARE_APP_CLIENT_SECRET
HOST=http://localhost:5005"
> .env
```

```
now dev --listen 5005
```

## Setup EVNs for Deployment
While in your project root directory:

```
now secrets add host LOGFLARE_ZEIT_APP_HOST_DOMAIN
now secrets add client_id LOGFLARE_ZIET_APP_CLIENT_ID
now secrets add client_secret LOGFLARE_ZIET_APP_SECRET

now secrets add logflare_host LOGFLARE_ZIET_APP_SECRET
now secrets add logflare_client_id LOGFLARE_ZIET_APP_SECRET
now secrets add logflare_client_secret LOGFLARE_ZIET_APP_SECRET
```
