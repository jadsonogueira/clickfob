import { prisma } from "./db";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateOrderNumber(): string {
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return `OS-${result}`;
}

export async function generateUniqueOrderNumber(): Promise<string> {
  let orderNumber = generateOrderNumber();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await prisma.booking.findUnique({
      where: { orderNumber },
    });
    if (!existing) {
      return orderNumber;
    }
    orderNumber = generateOrderNumber();
    attempts++;
  }

  throw new Error("Failed to generate unique order number");
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
