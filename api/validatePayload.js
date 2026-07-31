const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]{10,11}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const SCHEMAS = {
  place_order: {
    required: ["name", "productId", "productName", "quantity"],
    optional: ["phone", "email"],
  },
  request_stock_notification: {
    required: ["name", "productId", "productName", "email"],
    optional: [],
  },
  workshop_registration: {
    required: ["name", "phone", "email", "participantCount", "workshopDate", "workshopType"],
    optional: [],
  },
};

function isNonEmptyString(value, maxLength) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isValidInteger(value, min, max) {
  return Number.isInteger(value) && value >= min && value <= max;
}

const FIELD_VALIDATORS = {
  name: (value) => isNonEmptyString(value, 100),
  productId: (value) => isNonEmptyString(value, 100),
  productName: (value) => isNonEmptyString(value, 200),
  phone: (value) => typeof value === "string" && PHONE_PATTERN.test(value),
  email: (value) => typeof value === "string" && EMAIL_PATTERN.test(value),
  quantity: (value) => isValidInteger(value, 1, 20),
  participantCount: (value) => isValidInteger(value, 1, 20),
  workshopDate: (value) => typeof value === "string" && DATE_PATTERN.test(value),
  workshopType: (value) => isNonEmptyString(value, 50),
};

export function validatePayload(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Payload bir obje olmalı" };
  }

  const schema = SCHEMAS[body.event];
  if (!schema) {
    return { valid: false, error: "Bilinmeyen event tipi" };
  }

  const allowedKeys = new Set(["event", "source", ...schema.required, ...schema.optional]);
  const extraKey = Object.keys(body).find((key) => !allowedKeys.has(key));
  if (extraKey) {
    return { valid: false, error: `Beklenmeyen alan: ${extraKey}` };
  }

  for (const field of schema.required) {
    if (body[field] === undefined) {
      return { valid: false, error: `Eksik alan: ${field}` };
    }
    if (!FIELD_VALIDATORS[field](body[field])) {
      return { valid: false, error: `Geçersiz alan: ${field}` };
    }
  }

  for (const field of schema.optional) {
    if (body[field] !== undefined && !FIELD_VALIDATORS[field](body[field])) {
      return { valid: false, error: `Geçersiz alan: ${field}` };
    }
  }

  const payload = { event: body.event, source: "atolyekart" };
  for (const field of [...schema.required, ...schema.optional]) {
    if (body[field] !== undefined) {
      payload[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  }

  return { valid: true, payload };
}
