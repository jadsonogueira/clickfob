// app/api/services/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServiceDTO = {
  id: string;       // "fob-lf" (vem do serviceId no banco)
  name: string;
  price: number;
  active: boolean;  // compat com seu front atual
  sortOrder?: number;
};

const DEFAULT_SERVICES: Array<{
  serviceId: string;
  name: string;
  price: number;
  enabled: boolean;
  sortOrder: number;
}> = [
  { serviceId: "fob-lf", name: "Fob Low Frequency (LF)", price: 35, enabled: true, sortOrder: 1 },
  { serviceId: "fob-hf", name: "Fob High Frequency (HF)", price: 60, enabled: true, sortOrder: 2 },
  { serviceId: "garage-remote", name: "Garage Remote", price: 80, enabled: true, sortOrder: 3 },
];

export async function GET() {
  try {
    let rows = await prisma.serviceCatalog.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    // ✅ Seed automático se estiver vazio
    if (!rows || rows.length === 0) {
      try {
        await prisma.serviceCatalog.createMany({
          data: DEFAULT_SERVICES, // ✅ agora bate com o schema
          skipDuplicates: true,
        });

        rows = await prisma.serviceCatalog.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
      } catch (seedErr) {
        console.error("ServiceCatalog seed error:", seedErr);

        // fallback não quebra o front
        return NextResponse.json({
          success: true,
          services: DEFAULT_SERVICES.map((s) => ({
            id: s.serviceId,
            name: s.name,
            price: s.price,
            active: s.enabled,
            sortOrder: s.sortOrder,
          })),
        });
      }
    }

    const services: ServiceDTO[] = rows.map((s) => ({
      id: s.serviceId,      // ✅ id do front = serviceId do banco
      name: s.name,
      price: s.price,
      active: s.enabled,
      sortOrder: s.sortOrder,
    }));

    return NextResponse.json({ success: true, services });
  } catch (err) {
    console.error("GET /api/services error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load services" },
      { status: 500 }
    );
  }
}