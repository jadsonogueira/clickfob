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

const DEFAULT_SERVICES = [
  { id: "fob-lf", name: "Fob Low Frequency (LF)", price: 35, enabled: true, sortOrder: 1 },
  { id: "fob-hf", name: "Fob High Frequency (HF)", price: 60, enabled: true, sortOrder: 2 },
  { id: "garage-remote", name: "Garage Remote", price: 80, enabled: true, sortOrder: 3 },
];

function toDTO(s: any): ServiceDTO {
  return {
    id: s.id, // ✅ aqui é o campo correto do Prisma model
    name: s.name,
    price: s.price,
    active: s.enabled,
    sortOrder: s.sortOrder,
  };
}

export async function GET() {
  try {
    let rows = await prisma.serviceCatalog.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    // ✅ Se não tem nada no banco, cria o catálogo padrão (seed)
    if (!rows || rows.length === 0) {
      try {
        await prisma.serviceCatalog.createMany({
          data: DEFAULT_SERVICES.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            enabled: s.enabled,
            sortOrder: s.sortOrder,
          })),
          // se já existir algum id repetido, não quebra
          skipDuplicates: true,
        });

        // refaz o fetch
        rows = await prisma.serviceCatalog.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        });
      } catch (seedErr) {
        console.error("ServiceCatalog seed error:", seedErr);

        // fallback: não deixa o front quebrar
        return NextResponse.json({
          success: true,
          services: DEFAULT_SERVICES.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            active: s.enabled,
            sortOrder: s.sortOrder,
          })),
        });
      }
    }

    const services: ServiceDTO[] = rows.map(toDTO);

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