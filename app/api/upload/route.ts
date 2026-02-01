import { NextResponse } from "next/server";
import { generatePresignedUploadUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    const frontResult = await generatePresignedUploadUrl(
      `fob-front-${frontFile.name}`,
      frontFile.type,
      true
    );

    const backResult = await generatePresignedUploadUrl(
      `fob-back-${backFile.name}`,
      backFile.type,
      true
    );

    // Upload front
    const frontBuffer = await frontFile.arrayBuffer();
    const frontUploadRes = await fetch(frontResult.uploadUrl, {
      method: "PUT",
      body: new Uint8Array(frontBuffer),
      headers: {
        "Content-Type": frontFile.type,
        "Content-Disposition": "attachment",
      },
    });

    if (!frontUploadRes.ok) {
      const text = await frontUploadRes.text().catch(() => "");
      throw new Error(
        `Failed to upload front photo (status ${frontUploadRes.status}) ${text}`
      );
    }

    // Upload back
    const backBuffer = await backFile.arrayBuffer();
    const backUploadRes = await fetch(backResult.uploadUrl, {
      method: "PUT",
      body: new Uint8Array(backBuffer),
      headers: {
        "Content-Type": backFile.type,
        "Content-Disposition": "attachment",
      },
    });

    if (!backUploadRes.ok) {
      const text = await backUploadRes.text().catch(() => "");
      throw new Error(
        `Failed to upload back photo (status ${backUploadRes.status}) ${text}`
      );
    }

    return NextResponse.json({
      success: true,
      frontPath: frontResult.cloud_storage_path,
      backPath: backResult.cloud_storage_path,
    });
  } catch (error: any) {
    console.error("Upload error:", error);

    // Em dev: devolve o motivo real
    const message =
      process.env.NODE_ENV !== "production"
        ? error?.message || String(error)
        : "Failed to upload files";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
