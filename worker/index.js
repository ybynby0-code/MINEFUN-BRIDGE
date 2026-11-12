const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, MCP-Protocol-Version"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === "/health") {
      return json({ ok: true, service: "MINEFUN-BRIDGE", configured: Boolean(env.MINEFUN_MCP_URL && env.MINEFUN_MCP_TOKEN) });
    }

    if (url.pathname !== "/mcp") return json({ error: "Not found" }, 404);

    if (!env.BRIDGE_ACCESS_KEY || !env.MINEFUN_MCP_TOKEN || !env.MINEFUN_MCP_URL) {
      return json({ error: "Worker secrets are not configured" }, 503 });
    }

    const suppliedKey = request.headers.get("Authorization") || "";
    if (suppliedKey !== `Bearer ${env.BRIDGE_ACCESS_KEY}`) {
      return json({ error: "Unauthorized" }, 401);
    }

    if (!["GET", "POST", "DELETE"].includes(request.method)) {
      return json({ error: "Method not allowed" }, 405);
    }

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${env.MINEFUN_MCP_TOKEN}`);
    for (const name of ["content-type", "accept", "mcp-session-id", "mcp-protocol-version", "last-event-id"]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    if (!headers.has("accept")) headers.set("Accept", "application/json, text/event-stream");

    try {
      const upstream = await fetch(env.MINEFUN_MCP_URL, {
        method: request.method,
        headers,
        body: request.method === "POST" ? await request.arrayBuffer() : undefined,
        redirect: "manual"
      });

      const responseHeaders = new Headers(corsHeaders);
      for (const name of ["content-type", "mcp-session-id", "mcp-protocol-version", "cache-control", "last-event-id"]) {
        const value = upstream.headers.get(name);
        if (value) responseHeaders.set(name, value);
      }
      return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
    } catch {
      return json({ error: "Could not reach Minefun MCP endpoint" }, 502);
    }
  }
};