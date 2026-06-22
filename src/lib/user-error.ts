import { translate, type Locale, type TranslationKey } from "@/lib/i18n/translations";
import type { ApiError } from "@/lib/types";

const TECHNICAL_PATTERN =
  /supabase|expo go|expo:\/\/|sqlite|oauth_callback|redirect url|redirect urls|metro|localhost|127\.0\.0\.1|enotfound|invalid_response|network request failed|syntaxerror|typeerror|jwt|fetch failed|status code|http \d{3}|\.co\/|anon key|authentication →|providers\)/i;

const CODE_MESSAGES: Partial<Record<string, TranslationKey>> = {
  unauthorized: "error.notSignedIn",
  network: "error.connectionFailed",
  invalid_response: "error.serverInvalidResponse",
  subscription_required: "cloud.needPro",
  school_readonly: "school.readonlyTitle",
};

export function isTechnicalUserMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (TECHNICAL_PATTERN.test(trimmed)) return true;
  if (trimmed.startsWith("OAUTH_")) return true;
  if (trimmed.startsWith("OAUTH_CALLBACK_FAILED:")) return true;
  return trimmed.length > 200;
}

export function sanitizeUserMessage(
  message: string,
  locale: Locale,
  fallbackKey: TranslationKey = "error.generic",
): string {
  const trimmed = message.trim();
  if (!trimmed || isTechnicalUserMessage(trimmed)) {
    return translate(locale, fallbackKey);
  }
  return trimmed;
}

export function formatApiErrorMessage(
  error: ApiError,
  locale: Locale,
  fallbackKey: TranslationKey = "error.generic",
): string {
  const mapped = error.code ? CODE_MESSAGES[error.code] : undefined;
  if (mapped) return translate(locale, mapped);
  return sanitizeUserMessage(error.message, locale, fallbackKey);
}
