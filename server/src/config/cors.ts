const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "https://amdernpropertiessmclimited.com",
  "https://www.amdernpropertiessmclimited.com",
];

function parseOrigins(value?: string): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/\/$/, ""));
}

export function getAllowedOrigins(): string[] {
  const envOrigins = parseOrigins(process.env.CLIENT_URL || process.env.FRONTEND_URL);
  const localhostPattern = /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+|http:\/\/[::1]:\d+)$/;

  const dynamicLocalOrigins = envOrigins.filter((origin) => localhostPattern.test(origin));

  return Array.from(
    new Set([...envOrigins, ...dynamicLocalOrigins, ...DEFAULT_ALLOWED_ORIGINS]),
  );
}

export function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, "");

  if (/^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+|http:\/\/[::1]:\d+)$/.test(normalizedOrigin)) {
    return true;
  }

  return getAllowedOrigins().includes(normalizedOrigin);
}
