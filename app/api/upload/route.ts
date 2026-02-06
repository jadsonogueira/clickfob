import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isImageFile(file: File) {
  return !!file?.type && file.type.startsWith("image/");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const frontFile = formData.get("front") as File | null;
    const backFile = formData.get("back") as File | null;

    if (!frontFile || !backFile) {
      return NextResponse.json(
        { success: false, error: "Both photos are required" },
        { status: 400 }
      );
    }

    if (!isImageFile(frontFile) || !isImageFile(backFile)) {
      return NextResponse.json(
        { success: false, error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // ✅ Upload paralelo
    const [frontUrl, backUrl] = await Promise.all([
      uploadImage(frontFile, "clickfob/front"),
      uploadImage(backFile, "clickfob/back"),
    ]);

    return NextResponse.json({
      success: true,
      frontPath: frontUrl,
      backPath: backUrl,
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);

    const message =
      process.env.NODE_ENV !== "production"
        ? error?.message || String(error)
        : "Failed to upload images";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
