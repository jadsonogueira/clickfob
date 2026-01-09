import { NextResponse } from "next/server";
import { generatePresignedUploadUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";

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

    // Generate presigned URLs for both files
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

    // Upload front file
    const frontBuffer = await frontFile.arrayBuffer();
    const frontUploadHeaders: Record<string, string> = {
      "Content-Type": frontFile.type,
    };
    if (frontResult.uploadUrl.includes("content-disposition")) {
      frontUploadHeaders["Content-Disposition"] = "attachment";
    }
    const frontUploadRes = await fetch(frontResult.uploadUrl, {
      method: "PUT",
      body: Buffer.from(frontBuffer),
      headers: frontUploadHeaders,
    });

    if (!frontUploadRes.ok) {
      throw new Error("Failed to upload front photo");
    }

    // Upload back file
    const backBuffer = await backFile.arrayBuffer();
    const backUploadHeaders: Record<string, string> = {
      "Content-Type": backFile.type,
    };
    if (backResult.uploadUrl.includes("content-disposition")) {
      backUploadHeaders["Content-Disposition"] = "attachment";
    }
    const backUploadRes = await fetch(backResult.uploadUrl, {
      method: "PUT",
      body: Buffer.from(backBuffer),
      headers: backUploadHeaders,
    });

    if (!backUploadRes.ok) {
      throw new Error("Failed to upload back photo");
    }

    return NextResponse.json({
      success: true,
      frontPath: frontResult.cloud_storage_path,
      backPath: backResult.cloud_storage_path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
