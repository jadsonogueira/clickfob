// app/api/services/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lista única de serviços (fonte central)
// Depois a gente conecta isso com a área admin pra ativar/desativar.
const SERVICES = [
  { id: "fob-lf", name: "Fob Low Frequency (LF)", price: 35, active: true },
  { id: "fob-hf", name: "Fob High Frequency (HF)", price: 60, active: true },
  { id: "garage-remote", name: "Garage Remote", price: 80, active: true },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    services: SERVICES,
  });
}
