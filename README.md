A cloudflare worker based REST API for your R2 bucket.

Usage:

- Change the `bucket_name` and `preview_bucket_name` in `wrangler.toml` if you want.
- Set `ENCRYPT_SECRET` (>= 32 chars) in the worker secrets using Wrangler CLI. (for production only)

Endpoints:

- GET `/:key`: Public access
- POST `/`: Require `authorization: Bearer TOKEN` header, where `TOKEN` is an encrypted JWT using `@proselog/jwt` and `ENCRYPT_SECRET`. The request content type should be `multipart/form-data` with following fields:
  - `file`: `File` file to upload

The object key is generated from `$prefix/` + `uuid()` + `file.extension`

To generate a token using `@proselog/jwt`:

```ts
import { getDerivedKey, encrypt } from "@proselog/jwt"

const key = await getDerivedKey("ENCRYPT_SECRET")
const token = await encrypt({ prefix: "dev/" }, key, { expiresIn: "1h" })
```

For development for you can `node gen-token.mjs` and use the output to upload files.
