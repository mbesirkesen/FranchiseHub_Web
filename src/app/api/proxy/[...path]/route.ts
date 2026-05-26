import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function getBackendBase(): string {
  const raw =
    process.env.BACKEND_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://127.0.0.1:8000";
  return raw.replace(/\/$/, "");
}

function forwardHeaders(from: Headers): Headers {
  const to = new Headers();
  from.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) {
      return;
    }
    to.append(key, value);
  });
  return to;
}

async function proxy(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const targetUrl = `${getBackendBase()}/${path}${request.nextUrl.search}`;

  const headers = forwardHeaders(request.headers);
  // İstemci Authorization gönderdiyse backend'e aynen ilet (GET ile birlikte kaybolma ihtimaline karşı açıkça).
  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: body && body.byteLength > 0 ? body : hasBody ? body : undefined,
    cache: "no-store",
  });

  const outHeaders = forwardHeaders(backendResponse.headers);

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: outHeaders,
  });
}

type RouteCtx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function HEAD(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function OPTIONS(request: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
