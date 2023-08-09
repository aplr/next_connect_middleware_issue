# next_connect_middleware_issue

This repo contains the code to reproduce the issue [#]() in [bufbuild/connect-es](https://github.com/bufbuild/connect-es).

I try to use `connect-web` in the Next.js middleware as node APIs are not available.

In short, the next edge middleware seems to have issues with the `AbortController`. I did not dig deeper yet.

## Reproduction

It's as simple as

```bash
npm run dev
```

and visiting http://localhost:3000.

Then, view the logs in the terminal.

## Implementation

This project was bootstrapped as a Next.js project with the command `npx create-next-app buf-nextjs --use-npm --ts` and all suggested defaults.

The only things modified was adding the connect dependencies, and adding the `middleware.ts`:

<details>
<summary>middleware.ts</summary>

```ts
import { NextResponse } from "next/server";

import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-web";

import { ElizaService } from "@buf/connectrpc_eliza.bufbuild_connect-es/connectrpc/eliza/v1/eliza_connect";

const transport = createConnectTransport({
  baseUrl: "https://demo.connectrpc.com",
});

const client = createPromiseClient(ElizaService, transport);

export const middleware = async () => {
  const { sentence } = await client.say({ sentence: "Howdy!" });

  return NextResponse.json({ sentence });
};
```

</details>

## Expected behavior

I **expect** the middleware to send the request using `connect-web`'s connect transport, which uses the `fetch` api. Therefore I expect it to work also in Next.js middleware, which is based on V8.

## Actual behavior

The following error is thrown:

```
- error Error [TypeError]: Cannot read properties of undefined (reading 'flags')
    at setRemoved (file:///app/node_modules/next/dist/compiled/edge-runtime/index.js:1:970334)
    at removeListenerAt (file:///app/node_modules/next/dist/compiled/edge-runtime/index.js:1:970334)
    at EventTarget.dispatchEvent (file:///app/node_modules/next/dist/compiled/edge-runtime/index.js:1:970334)
    at abortSignalAbort (file:///app/node_modules/next/dist/compiled/edge-runtime/index.js:1:970334)
    at AbortController.abort (file:///app/node_modules/next/dist/compiled/edge-runtime/index.js:1:970334)
    at done (webpack-internal:///(middleware)/./node_modules/@bufbuild/connect/dist/esm/protocol/run-call.js:103:24)
    at eval (webpack-internal:///(middleware)/./node_modules/@bufbuild/connect/dist/esm/protocol/run-call.js:33:9)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Object.unary (webpack-internal:///(middleware)/./node_modules/@bufbuild/connect-web/dist/esm/connect-transport.js:89:20)
    at async Object.eval [as say] (webpack-internal:///(middleware)/./node_modules/@bufbuild/connect/dist/esm/promise-client.js:132:26)
    at async Object.middleware [as handler] (webpack-internal:///(middleware)/./middleware.ts:18:26)
    at async adapter (webpack-internal:///(middleware)/./node_modules/next/dist/esm/server/web/adapter.js:170:20)
    at async runWithTaggedErrors (file:///app/node_modules/next/dist/server/web/sandbox/sandbox.js:98:24)
    at async DevServer.runMiddleware (file:///app/node_modules/next/dist/server/next-server.js:1013:24)
    at async DevServer.runMiddleware (file:///app/node_modules/next/dist/server/dev/next-dev-server.js:247:28)
    at async DevServer.handleCatchallMiddlewareRequest (file:///app/node_modules/next/dist/server/next-server.js:1096:22)
    at async DevServer.handleRequestImpl (file:///app/node_modules/next/dist/server/base-server.js:647:32) {
  digest: undefined
}
```
