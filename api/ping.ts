export default async function handler(req: Request): Promise<Response> {
  return Response.json({ ok: true, method: req.method, ts: Date.now() });
}
