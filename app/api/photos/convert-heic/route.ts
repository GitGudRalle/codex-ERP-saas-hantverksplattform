import convert from "heic-convert";

const maxPhotoSizeBytes = 10 * 1024 * 1024;

function isHeicLike(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  return (
    extension === "heic" ||
    extension === "heif" ||
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.type === "application/octet-stream"
  );
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Ingen bildfil skickades." }, { status: 400 });
  }

  if (file.size > maxPhotoSizeBytes) {
    return Response.json(
      { error: "Fotot är för stort. Maxstorlek är 10 MB." },
      { status: 413 },
    );
  }

  if (!isHeicLike(file)) {
    return Response.json(
      { error: "Bara HEIC/HEIF kan konverteras här." },
      { status: 415 },
    );
  }

  try {
    const input = new Uint8Array(await file.arrayBuffer());
    const jpeg = await convert({
      buffer: input,
      format: "JPEG",
      quality: 0.86,
    });
    const body = new ArrayBuffer(jpeg.byteLength);
    new Uint8Array(body).set(jpeg);

    return new Response(body, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "image/jpeg",
      },
    });
  } catch {
    return Response.json(
      { error: "Kunde inte konvertera HEIC-fotot." },
      { status: 422 },
    );
  }
}
