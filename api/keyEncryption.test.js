import test from "node:test";
import assert from "node:assert/strict";
import { encrypt, decrypt } from "./keyEncryption.js";

process.env.GROQ_KEY_ENCRYPTION_SECRET = "a".repeat(64); // 32-byte test secret

test("encrypt and decrypt round-trips correctly", () => {
  const original = "gsk_testkey1234567890abcdef";
  const stored = encrypt(original);
  assert.strictEqual(decrypt(stored), original);
});

test("encrypt produces different ciphertext each time (random IV)", () => {
  const key = "gsk_testkey1234567890abcdef";
  assert.notStrictEqual(encrypt(key), encrypt(key));
});

test("decrypt throws on tampered ciphertext", () => {
  const stored = encrypt("gsk_testkey1234567890abcdef");
  const parts = stored.split(":");
  parts[2] = parts[2].slice(0, -2) + "ff"; // corrupt last byte
  assert.throws(() => decrypt(parts.join(":")));
});

test("decrypt throws on malformed stored value", () => {
  assert.throws(() => decrypt("notvalid"));
});

test("encrypt throws when GROQ_KEY_ENCRYPTION_SECRET is missing", () => {
  const saved = process.env.GROQ_KEY_ENCRYPTION_SECRET;
  delete process.env.GROQ_KEY_ENCRYPTION_SECRET;
  assert.throws(() => encrypt("gsk_test"));
  process.env.GROQ_KEY_ENCRYPTION_SECRET = saved;
});
