// app/api/services/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServiceDTO = {
  id: string;       // ex: "fob-lf"
  name: string;
  price: number;
  active: boolean;  // compat com seu front atual
  sortOrder?: number;
};

export async function GET() {
  try {
    const rows = await prisma.serviceCatalog.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    const services: ServiceDTO[] = rows.map((s) => ({
      id: s.serviceId,
      name: s.name,
      price: s.price,
      active: s.enabled,
      sortOrder: s.sortOrder,
    }));

    return NextResponse.json({
      success: true,
      services,
    });
  } catch (err) {
    console.error("GET /api/services error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load services" },
      { status: 500 }
    );
  }
}