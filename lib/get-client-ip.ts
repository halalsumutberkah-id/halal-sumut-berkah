interface RequestLike {
  headers: { get(name: string): string | null };
}

export function getClientIp(req: RequestLike) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}
