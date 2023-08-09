import { NextRequest, NextResponse } from "next/server";

import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-web";

import { ElizaService } from "@buf/connectrpc_eliza.bufbuild_connect-es/connectrpc/eliza/v1/eliza_connect";

const transport = createConnectTransport({
  baseUrl: "https://demo.connectrpc.com",
});

const client = createPromiseClient(ElizaService, transport);

export const middleware = async (req: NextRequest) => {
  const { sentence } = await client.say({
    sentence: "How are you today?",
  });

  return NextResponse.json({
    sentence,
  });
};
