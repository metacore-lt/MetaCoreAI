# Security Model

MetaCore DELTA Lab is a black-box verification surface.

## Publicly allowed

- bounded test inputs through a published gateway when enabled;
- public schemas, methodology, test packs and local validation tools;
- sanitized baseline and MetaCore outputs when policy permits;
- public metric results and limitations;
- opaque run metadata and verifiable DELTA receipts.

## Not published

- system prompts or hidden evaluator prompts;
- private routing traces or module inventories;
- private operating-core source or topology;
- internal hosts, filesystem paths, ports or service identifiers;
- credentials or private keys;
- stack traces and verbose internal failures;
- private corpus fragments or private user/tenant state.

## Directionality

Curated publication and live test requests are separate channels. Repository content is never treated as executable input for private systems. Public pull requests, issue text and repository code do not gain private command execution.

A future live gateway accepts schema-bound asynchronous jobs only. It does not expose shell execution, filesystem browsing, arbitrary network callbacks, internal route selection or credential forwarding. Public errors are reduced to sanitized error classes.

`BRING_YOUR_AI` initially accepts user-supplied baseline output. Arbitrary remote endpoints and user-provided service credentials are outside the first public gateway scope.
## Anonymous Context Lab static boundary

The anonymous `/context-lab/` surface is deliberately static and read-only:

- only HTTP `GET` and `HEAD` are accepted; other methods return `405`;
- CSP is enforced as an HTTP response header, including `connect-src 'none'`, `form-action 'none'` and `frame-ancestors 'self'`;
- the surface forces no-cookie behavior and disables camera, microphone, geolocation, payment, USB and serial capabilities through response policy;
- HTML/JSON use short revalidation caching; JS/CSS use a five-minute revalidation cache;
- `catalog.json` contains a content-addressed release fingerprint covering every public playground asset plus the hash of the published `CONTEXT_LAB_HTTP_POLICY.conf`; live deployment maps that policy to `.htaccess`.

This static boundary is separate from any future live gateway. Browser-local API-shaped `POST` examples are illustrative operations only; the public web server itself does not accept anonymous POST jobs.
