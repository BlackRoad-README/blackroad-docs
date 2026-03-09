/**
 * BlackRoad Docs Status Worker
 * Serves a health/status JSON endpoint for the documentation hub.
 * Deployed via Cloudflare Workers for always-on availability.
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/status' || url.pathname === '/') {
      return Response.json({
        status: 'ok',
        service: 'blackroad-docs',
        timestamp: new Date().toISOString(),
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
