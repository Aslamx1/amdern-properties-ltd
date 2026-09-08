import test from "node:test";
import assert from "node:assert/strict";

import { getAllowedOrigins } from "./cors";

test("includes common local dev origins for admin login requests", () => {
  const origins = getAllowedOrigins();

  assert.ok(origins.includes("http://localhost:3000"));
  assert.ok(origins.includes("http://127.0.0.1:3000"));
  assert.ok(origins.includes("http://localhost:5173"));
  assert.ok(origins.includes("http://127.0.0.1:5173"));
});
