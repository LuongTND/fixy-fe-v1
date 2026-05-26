const FPT_ID_RECOGNITION_URL = 'https://api.fpt.ai/vision/idr/vnm/';

export async function POST(request) {
  try {
    const apiKey = process.env.FPT_AI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          errorCode: 1,
          errorMessage: 'Thiếu FPT_AI_API_KEY trên server.',
          data: [],
        },
        { status: 500 }
      );
    }

    const incomingFormData = await request.formData();
    const image = incomingFormData.get('image');

    if (!image) {
      return Response.json(
        {
          errorCode: 1,
          errorMessage: 'Vui lòng gửi ảnh CCCD.',
          data: [],
        },
        { status: 400 }
      );
    }

    if (!image.type?.startsWith('image/')) {
      return Response.json(
        {
          errorCode: 7,
          errorMessage: 'File gửi lên phải là ảnh.',
          data: [],
        },
        { status: 400 }
      );
    }

    if (image.size > 5 * 1024 * 1024) {
      return Response.json(
        {
          errorCode: 1,
          errorMessage: 'Ảnh CCCD không được vượt quá 5MB.',
          data: [],
        },
        { status: 400 }
      );
    }

    const fptFormData = new FormData();
    fptFormData.append('image', image);

    const response = await fetch(FPT_ID_RECOGNITION_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
      },
      body: fptFormData,
    });
    const payload = await response.json();

    return Response.json(payload, { status: response.ok ? 200 : response.status });
  } catch (error) {
    return Response.json(
      {
        errorCode: 1,
        errorMessage: error.message || 'Không thể quét CCCD bằng FPT AI Vision.',
        data: [],
      },
      { status: 500 }
    );
  }
}
