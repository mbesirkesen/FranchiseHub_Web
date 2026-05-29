/** Türkiye illeri (alfabetik) */
export const TR_CITIES = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Aksaray",
  "Amasya",
  "Ankara",
  "Antalya",
  "Ardahan",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bartın",
  "Batman",
  "Bayburt",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Düzce",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Iğdır",
  "Isparta",
  "İstanbul",
  "İzmir",
  "Kahramanmaraş",
  "Karabük",
  "Karaman",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırıkkale",
  "Kırklareli",
  "Kırşehir",
  "Kilis",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Mardin",
  "Mersin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Osmaniye",
  "Rize",
  "Sakarya",
  "Samsun",
  "Şanlıurfa",
  "Siirt",
  "Sinop",
  "Sivas",
  "Şırnak",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Uşak",
  "Van",
  "Yalova",
  "Yozgat",
  "Zonguldak",
] as const;

export const FRANCHISE_SECTORS = [
  "Gıda & Restoran",
  "Kahve & İçecek",
  "Güzellik & Kişisel Bakım",
  "Spor & Fitness",
  "Perakende",
  "Otomotiv",
  "Eğitim",
  "Sağlık",
  "Teknoloji",
  "Diğer",
] as const;

export const SECTOR_OTHER = "Diğer";

/** Sadece rakamları alır, en fazla 10 hane (5 ile başlar) */
export function normalizeTrMobilePhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("90")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

/** (5XX) XXX XX XX görünümü */
export function formatTrMobilePhone(input: string): string {
  const d = normalizeTrMobilePhone(input);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  if (d.length <= 8) return `(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
}

export function isValidTrMobilePhone(input: string): boolean {
  const d = normalizeTrMobilePhone(input);
  return /^5[0-9]{9}$/.test(d);
}

/** API'ye gönderilecek format: 05XXXXXXXXX */
export function toTrMobilePhonePayload(input: string): string {
  const d = normalizeTrMobilePhone(input);
  return d.length === 10 ? `0${d}` : d;
}

export function normalizeTcKimlik(input: string): string {
  return input.replace(/\D/g, "").slice(0, 11);
}

/** T.C. kimlik numarası algoritması */
export function isValidTcKimlik(input: string): boolean {
  const tc = normalizeTcKimlik(input);
  if (!/^[1-9][0-9]{10}$/.test(tc)) return false;
  const digits = tc.split("").map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = (oddSum * 7 - evenSum) % 10;
  if (digit10 !== digits[9]) return false;
  const digit11 = digits.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return digit11 === digits[10];
}

export function formatTcKimlik(input: string): string {
  const d = normalizeTcKimlik(input);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
}

/** Vergi kimlik no (VKN) — 10 hane */
export function normalizeTaxNumber(input: string): string {
  return input.replace(/\D/g, "").slice(0, 10);
}

export function formatTaxNumber(input: string): string {
  const d = normalizeTaxNumber(input);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 8) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
}

export function isValidTaxNumber(input: string): boolean {
  return /^[0-9]{10}$/.test(normalizeTaxNumber(input));
}

export const TR_COUNTRIES = ["Türkiye"] as const;
