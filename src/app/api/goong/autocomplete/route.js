const GOONG_API_BASE_URL = 'https://rsapi.goong.io';

export async function GET(request) {
  const apiKey = process.env.GOONG_API_KEY;
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input')?.trim();

  if (!apiKey) {
    return Response.json({ error: 'GOONG_API_KEY is not configured.', predictions: [] }, { status: 500 });
  }

  if (!input || input.length < 2) {
    return Response.json({ predictions: [] });
  }

  const url = new URL('/v2/place/autocomplete', GOONG_API_BASE_URL);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('input', input);

  const location = searchParams.get('location');
  const radius = searchParams.get('radius');
  const limit = searchParams.get('limit');
  const moreCompound = searchParams.get('more_compound');
  const origin = searchParams.get('origin');
  const hasDeprecatedAdministrativeUnit = searchParams.get('has_deprecated_administrative_unit');

  if (location) {
    url.searchParams.set('location', location);
  }

  if (radius) {
    url.searchParams.set('radius', radius);
  }

  if (limit) {
    url.searchParams.set('limit', limit);
  }

  if (moreCompound) {
    url.searchParams.set('more_compound', moreCompound);
  }

  if (origin) {
    url.searchParams.set('origin', origin);
  }

  if (hasDeprecatedAdministrativeUnit) {
    url.searchParams.set('has_deprecated_administrative_unit', hasDeprecatedAdministrativeUnit);
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const payload = await response.json();

    return Response.json(payload, { status: response.ok ? 200 : response.status });
  } catch {
    return Response.json({ error: 'Unable to fetch Goong autocomplete suggestions.', predictions: [] }, { status: 502 });
  }
}
