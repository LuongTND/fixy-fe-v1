const GOONG_API_BASE_URL = "https://rsapi.goong.io";

export async function GET(request) {
  const apiKey = process.env.GOONG_API_KEY;
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim();
  const latlng = searchParams.get("latlng")?.trim();
  const limit = searchParams.get("limit");
  const hasDeprecatedAdministrativeUnit = searchParams.get(
    "has_deprecated_administrative_unit",
  );
  const hasVnid = searchParams.get("has_vnid");

  if (!apiKey) {
    return Response.json(
      { error: "GOONG_API_KEY is not configured.", results: [] },
      { status: 500 },
    );
  }

  if (!address && !latlng) {
    return Response.json(
      { error: "Address or latlng is required.", results: [] },
      { status: 400 },
    );
  }

  const url = new URL("/v2/geocode", GOONG_API_BASE_URL);
  url.searchParams.set("api_key", apiKey);

  if (address) {
    url.searchParams.set("address", address);
  }

  if (latlng) {
    url.searchParams.set("latlng", latlng);
  }

  if (limit) {
    url.searchParams.set("limit", limit);
  }

  if (hasDeprecatedAdministrativeUnit) {
    url.searchParams.set(
      "has_deprecated_administrative_unit",
      hasDeprecatedAdministrativeUnit,
    );
  }

  if (hasVnid) {
    url.searchParams.set("has_vnid", hasVnid);
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
  } catch {
    return Response.json(
      { error: "Unable to geocode the selected address.", results: [] },
      { status: 502 },
    );
  }
}
