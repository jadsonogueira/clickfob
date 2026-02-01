export function normalizeImageUrl(input?: string | null) {
  if (!input) return "";

  const value = String(input).trim();

  // Cloudinary (ou qualquer URL absoluta)
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  // Se por algum motivo vierem coisas assim: "/https://res.cloudinary..."
  if (value.startsWith("/http://") || value.startsWith("/https://")) {
    return value.slice(1);
  }

  // Fallback para legado (paths relativos)
  // Se você NÃO quer mais suportar legado, pode só retornar `"/" + ...`
  const base = process.env.NEXT_PUBLIC_ASSETS_BASE_URL?.replace(/\/+$/, "");
  const path = value.replace(/^\/+/, "");

  // Se você definir NEXT_PUBLIC_ASSETS_BASE_URL, ele usa. Se não, usa relativo.
  return base ? `${base}/${path}` : `/${path}`;
}
