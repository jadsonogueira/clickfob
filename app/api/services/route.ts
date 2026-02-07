// app/api/services/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServiceDTO = {
  id: string; // ex: "fob-lf"
  name: string;
  price: number;
  active: boolean; // compat com seu front atual
  sortOrder?: number;
};

/**
 * Defaults: NÃO inclui `id`.
 * Em Mongo/Prisma, `id` é ObjectId auto.
 * `serviceId` é a chave fixa/única.
 */
const DEFAULT_SERVICES: Array<{
  serviceId: string;
  name: string;
  price: number;
  enabled: boolean;
  sortOrder: number;
}> = [
  { serviceId: "fob-lf", name: "Low Frequency (LF) Fob", price: 35, enabled: true, sortOrder: 10 },
  { serviceId: "fob-hf", name: "High Frequency (HF) Fob", price: 45, enabled: true, sortOrder: 20 },
  { serviceId: "fob-hf-enc", name: "HF Encrypted / Secure", price: 55, enabled: true, sortOrder: 30 },
  { serviceId: "remote-garage", name: "Garage Remote Copy", price: 60, enabled: true, sortOrder: 40 },
  { serviceId: "key-cut", name: "Key Cutting", price: 25, enabled: true, sortOrder: 50 },
];

export async function GET() {
  try {
    let rows = await prisma.serviceCatalog.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    // ✅ Seed automático quando a collection estiver vazia
    if (!rows || rows.length === 0) {
      await prisma.serviceCatalog.createMany({
        data: DEFAULT_SERVICES,
        // ❌ NÃO usar skipDuplicates no Mongo (gera o erro "boolean -> never")
      });

      rows = await prisma.serviceCatalog.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
    }

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
