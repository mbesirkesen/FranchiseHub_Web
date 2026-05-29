import axios from "axios";

const FIELD_LABELS: Record<string, string> = {
  email: "E-posta",
  password: "Şifre",
  first_name: "Ad",
  last_name: "Soyad",
  phone: "Telefon",
  city: "Şehir",
  preferred_sector: "Sektör",
  investment_budget: "Yatırım bütçesi",
  experience_years: "Deneyim yılı",
  identity_number: "T.C. kimlik no",
  tax_number: "Vergi numarası",
  company_name: "Şirket adı",
  body: "Form",
};

function translateValidationMessage(msg: string): string {
  const lower = msg.toLowerCase();

  if (lower.includes("valid email") || lower.includes("email address")) {
    return "Geçerli bir e-posta adresi girin.";
  }
  if (lower.includes("at least 8") || lower.includes("minimum 8")) {
    return "Şifre en az 8 karakter olmalı.";
  }
  if (lower.includes("at least 6") || lower.includes("minimum 6")) {
    return "Şifre en az 6 karakter olmalı.";
  }
  if (lower.includes("password") && (lower.includes("weak") || lower.includes("strength"))) {
    return "Şifre güvenlik standartlarına uymuyor. Harf ve rakam içermeli.";
  }
  if (lower.includes("already exists") || lower.includes("already registered")) {
    return "Bu e-posta adresi zaten kayıtlı.";
  }
  if (lower.includes("invalid credentials") || lower.includes("incorrect password")) {
    return "E-posta veya şifre hatalı.";
  }
  if (lower.includes("not found")) {
    return "Kayıt bulunamadı.";
  }
  if (lower.includes("string should have at least")) {
    const match = msg.match(/at least (\d+)/i);
    const n = match?.[1] ?? "1";
    return `En az ${n} karakter olmalı.`;
  }
  if (lower.includes("string_too_short") || lower.includes("too short")) {
    return "Girilen değer çok kısa.";
  }
  if (lower.includes("string_too_long") || lower.includes("too long")) {
    return "Girilen değer çok uzun.";
  }
  if (lower.includes("value is not a valid integer") || lower.includes("valid integer")) {
    return "Geçerli bir tam sayı girin.";
  }
  if (lower.includes("value is not a valid float") || lower.includes("valid number")) {
    return "Geçerli bir sayı girin.";
  }
  if (lower.includes("field required") || lower.includes("missing")) {
    return "Bu alan zorunludur.";
  }
  if (lower.includes("identity") || lower.includes("tc")) {
    return "Geçerli bir T.C. kimlik numarası girin.";
  }
  if (lower.includes("phone")) {
    return "Geçerli bir cep telefonu numarası girin (5XX XXX XX XX).";
  }
  if (lower.includes("422") || lower.includes("unprocessable")) {
    return "Girdiğiniz bilgileri kontrol edin.";
  }
  if (lower.includes("401") || lower.includes("unauthorized")) {
    return "Giriş bilgileri hatalı.";
  }
  if (lower.includes("400") || lower.includes("bad request")) {
    return "İstek geçersiz — alanları kontrol edin.";
  }
  if (lower.includes("500") || lower.includes("internal server")) {
    return "Sunucu hatası. Biraz sonra tekrar deneyin.";
  }
  if (lower.includes("network error") || lower.includes("timeout")) {
    return "Bağlantı kurulamadı. İnternetinizi kontrol edin.";
  }

  return msg;
}

function fieldLabel(loc: string): string {
  const key = loc.split(".").pop() ?? loc;
  return FIELD_LABELS[key] ?? key;
}

function translateDetailItem(item: { loc?: unknown; msg?: unknown; type?: unknown }): string {
  const locRaw = Array.isArray(item?.loc) ? item.loc.filter((p) => p !== "body") : [];
  const field = locRaw.length > 0 ? fieldLabel(String(locRaw[locRaw.length - 1])) : "Alan";
  const msg = typeof item?.msg === "string" ? translateValidationMessage(item.msg) : "Geçersiz değer.";
  return `${field}: ${msg}`;
}

/** Backend hata metnini Türkçe ve anlaşılır hale getirir. */
export function getBackendErrorMessage(error: unknown): string | null {
  if (!error || !axios.isAxiosError(error)) {
    return null;
  }

  const status = error.response?.status;
  const data = error.response?.data as { detail?: unknown; message?: unknown } | undefined;
  const detail = data?.detail;
  const message = data?.message;

  if (typeof message === "string" && message.trim()) {
    return translateValidationMessage(message);
  }

  if (typeof detail === "string") {
    return translateValidationMessage(detail);
  }

  if (Array.isArray(detail)) {
    const lines = detail.map((item) =>
      typeof item === "object" && item !== null ? translateDetailItem(item as { loc?: unknown; msg?: unknown }) : String(item),
    );
    return lines.join(" ");
  }

  if (status === 401) return "E-posta veya şifre hatalı.";
  if (status === 422) return "Girdiğiniz bilgileri kontrol edin.";
  if (status === 409) return "Bu e-posta adresi zaten kayıtlı.";
  if (status === 400) return "Geçersiz bilgi gönderildi. Alanları kontrol edin.";

  return null;
}

/** Kayıt / giriş formları için kullanıcıya gösterilecek tam mesaj */
export function getUserFacingError(error: unknown, fallback: string): string {
  return getBackendErrorMessage(error) ?? fallback;
}
