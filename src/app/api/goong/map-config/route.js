export async function GET() {
  const maptilesKey = process.env.GOONG_MAPTILES_API_KEY;

  if (!maptilesKey) {
    return Response.json({ error: 'GOONG_MAPTILES_API_KEY is not configured.' }, { status: 500 });
  }

  return Response.json({ maptilesKey });
}
