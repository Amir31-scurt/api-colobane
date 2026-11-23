// Strict Senegalese phone number validation (ARTP Senegal)
// Mobile prefixes: 70, 71, 75, 76, 77, 78 | Landline prefixes: 30, 33

const SENEGAL_LOCAL_REGEX = /^(?:7[015678]|3[03])\d{7}$/;

export const SENEGAL_PHONE_ERROR_MESSAGE =
  "Numéro invalide. Seuls les numéros du Sénégal (+221, ex: 77 123 45 67) sont acceptés.";

export interface SenegalPhoneResult {
  valid: boolean;
  local?: string;      // 9 digits: "771234567"
  normalized?: string; // 12 digits: "221771234567"
  e164?: string;       // "+221771234567"
  error?: string;
}

export function parseSenegalPhone(raw?: string | null): SenegalPhoneResult {
  if (!raw || typeof raw !== "string") {
    return { valid: false, error: SENEGAL_PHONE_ERROR_MESSAGE };
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: SENEGAL_PHONE_ERROR_MESSAGE };
  }

  // Strip spaces, dashes, dots, parentheses
  const cleaned = trimmed.replace(/[\s\-().]/g, "");

  // Reject any foreign international prefix explicitly (+XX or 00XX where XX !== 221)
  if (cleaned.startsWith("+")) {
    if (!cleaned.startsWith("+221")) {
      return {
        valid: false,
        error: "Seuls les numéros du Sénégal (+221) sont acceptés.",
      };
    }
    const local = cleaned.slice(4);
    if (!SENEGAL_LOCAL_REGEX.test(local)) {
      return { valid: false, error: SENEGAL_PHONE_ERROR_MESSAGE };
    }
    return { valid: true, local, normalized: `221${local}`, e164: `+221${local}` };
  }

  if (cleaned.startsWith("00")) {
    if (!cleaned.startsWith("00221")) {
      return {
        valid: false,
        error: "Seuls les numéros du Sénégal (+221) sont acceptés.",
      };
    }
    const local = cleaned.slice(5);
    if (!SENEGAL_LOCAL_REGEX.test(local)) {
      return { valid: false, error: SENEGAL_PHONE_ERROR_MESSAGE };
    }
    return { valid: true, local, normalized: `221${local}`, e164: `+221${local}` };
  }

  // Only digits allowed from here
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: SENEGAL_PHONE_ERROR_MESSAGE };
  }

  // 12 digits starting with 221
  if (cleaned.length === 12 && cleaned.startsWith("221")) {
    const local = cleaned.slice(3);
    if (!SENEGAL_LOCAL_REGEX.test(local)) {
      return { valid: false, error: SENEGAL_PHONE_ERROR_MESSAGE };
    }
    return { valid: true, local, normalized: `221${local}`, e164: `+221${local}` };
  }

  // Local 9-digit Senegalese number
  if (SENEGAL_LOCAL_REGEX.test(cleaned)) {
    return {
      valid: true,
      local: cleaned,
      normalized: `221${cleaned}`,
      e164: `+221${cleaned}`,
    };
  }

  return { valid: false, error: SENEGAL_PHONE_ERROR_MESSAGE };
}

export function isValidSenegalPhone(raw?: string | null): boolean {
  return parseSenegalPhone(raw).valid;
}
