const GOONG_API_BASE_URL = "https://rsapi.goong.io";

export async function GET(request) {
  const apiKey = process.env.GOONG_API_KEY;
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin")?.trim();
  const destination = searchParams.get("destination")?.trim();
  const waypoints = searchParams.get("waypoints")?.trim();
  const vehicle = searchParams.get("vehicle")?.trim() || "bike";
  const roundtrip = searchParams.get("roundtrip")?.trim() || "false";

  if (!apiKey) {
    return Response.json(
      { error: "GOONG_API_KEY is not configured.", trips: [] },
      { status: 500 },
    );
  }

  if (!origin || !destination) {
    return Response.json(
      { error: "Origin and destination are required.", trips: [] },
      { status: 400 },
    );
  }

  const url = new URL("/v2/trip", GOONG_API_BASE_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("vehicle", vehicle);

  if (waypoints) {
    url.searchParams.set("waypoints", waypoints);
  }
  if (roundtrip) {
    url.searchParams.set("roundtrip", roundtrip);
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json();
    return Response.json(payload, {
      status: response.ok ? 200 : response.status,
    });
  } catch (err) {
    return Response.json(
      { error: "Unable to retrieve trip route.", trips: [] },
      { status: 502 },
    );
  }
}
