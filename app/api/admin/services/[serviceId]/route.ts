// app/api/admin/services/[serviceId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const found = parts.find((p) => p.startsWith(`${name}=`));
  if (!found) return null;
  return found.slice(name.length + 1);
}

// ✅ aceita cookie simples (igual à env) OU token assinado (modelo novo)
function isAdminAuthorized(cookieHeader: string | null) {
  const token = getCookieValue(cookieHeader, ADMIN_COOKIE_NAME);
  const expected = String(process.env.ADMIN_DASHBOARD_KEY || "").trim();

  // modo antigo (backup): cookie == ADMIN_DASHBOARD_KEY
  if (expected && token && token === expected) return true;

  // modo novo: cookie é token assinado
  if (verifyAdminSessionToken(token).ok) return true;

  return false;
}

type PatchBody = Partial<{
  enabled: boolean;
  name: string;
  price: number;
  sortOrder: number;
}>;

export async function PATCH(
  req: Request,
  { params }: { params: { serviceId: string } }
) {
  const cookieHeader = req.headers.get("cookie");

  if (!isAdminAuthorized(cookieHeader)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const serviceId = decodeURIComponent(params.serviceId || "").trim();
  if (!serviceId) {
    return NextResponse.json(
      { ok: false, error: "Missing serviceId" },
      { status: 400 }
    );
  }

  let body: PatchBody = {};
  try {
    body = (await req.json()) || {};
  } catch {
    body = {};
  }

  const data: Record<string, any> = {};

  if (typeof body.enabled === "boolean") data.enabled = body.enabled;
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.price === "number" && Number.isFinite(body.price)) data.price = body.price;
  if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder))
    data.sortOrder = Math.trunc(body.sortOrder);

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { ok: false, error: "No valid fields to update" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.serviceCatalog.update({
      where: { serviceId },
      data,
    });

    return NextResponse.json({
      ok: true,
      service: {
        id: updated.serviceId,
        name: updated.name,
        price: updated.price,
        enabled: updated.enabled,
        sortOrder: updated.sortOrder,
        updatedAt: updated.updatedAt?.toISOString?.() ?? undefined,
      },
    });
  } catch (err: any) {
    // Prisma "Record to update not found"
    const msg = String(err?.message || "");
    if (msg.toLowerCase().includes("record") && msg.toLowerCase().includes("not found")) {
      return NextResponse.json({ ok: false, error: "Service not found" }, { status: 404 });
    }

    console.error("PATCH /api/admin/services/[serviceId] error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update service" },
      { status: 500 }
    );
  }
}
