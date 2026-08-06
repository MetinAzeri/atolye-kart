import assert from "node:assert";
import { isValidChatInput } from "./chat.js";

// geçerli mesaj
assert.strictEqual(isValidChatInput("Merhaba, siparişim ne zaman gelir?"), true);

// boş / sadece boşluk
assert.strictEqual(isValidChatInput(""), false);
assert.strictEqual(isValidChatInput("   "), false);

// string olmayan değerler
assert.strictEqual(isValidChatInput(undefined), false);
assert.strictEqual(isValidChatInput(null), false);
assert.strictEqual(isValidChatInput(123), false);

// uzunluk sınırı
assert.strictEqual(isValidChatInput("a".repeat(2000)), true);
assert.strictEqual(isValidChatInput("a".repeat(2001)), false);

console.log("Tüm chat testleri geçti ✓");
