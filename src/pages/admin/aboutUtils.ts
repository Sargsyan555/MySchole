export function aboutBlockHasText(b: { title: string; subtitle: string; body: string }) {
  return !!(b.title?.trim() || b.subtitle?.trim() || b.body?.trim());
}

export function splitBodyPreview(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const byDoubleNl = trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return byDoubleNl.length > 0 ? byDoubleNl : [trimmed];
}
