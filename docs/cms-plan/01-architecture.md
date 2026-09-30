# Architecture

Visitors only ever load static files from Cloudflare. Neon is read by the build, and written only by the CMS and the contact form.

```mermaid
flowchart LR
  visitor["Website visitor<br/><small>any browser</small>"]
  tnl["TNL, CMS user<br/><small>direct link /admin</small>"]
  github["GitHub<br/><small>main + pull requests</small>"]

  subgraph cf["Cloudflare"]
    assets["<b>Static assets</b><br/>Prerendered pages, WebP images<br/>_redirects, _headers"]
    routes["<b>Worker routes</b><br/>/admin/* behind Basic gate + login<br/>/api/submit for the contact form<br/>/api/publish, daily media sweep"]
    builds["<b>Workers Builds</b><br/>build-images, prerender, verify<br/>reads Neon with a read-only role<br/>wrangler deploy, mark-live"]
  end

  brevo["<b>Brevo</b><br/>login codes, new-message mail"]

  subgraph neon["Neon, Frankfurt"]
    pg["<b>Postgres</b><br/>content, auth, messages,<br/>builds, via Drizzle"]
    os["<b>Object Storage</b><br/>bucket media (private)<br/>image originals"]
  end

  visitor -- pages --> assets
  visitor -- form --> routes
  tnl -- /admin --> routes
  github -- push --> builds
  routes -- deploy hook --> builds
  routes --> brevo
  routes --> pg
  routes --> os
  builds --> neon
```

A save in the CMS writes to Postgres and Object Storage and leaves the live site unchanged. **Publiceren** calls the deploy hook; Workers Builds reads Neon, prerenders every page, copies the images and deploys new static assets. The only moving parts at request time are the Worker routes behind `/admin` and `/api`.
