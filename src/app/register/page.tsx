import Link from "next/link";
import { MarketingHeader } from "@/components/ui/marketing-header";

const roles = [
  {
    href: "/register/buyer",
    title: "Franchise arıyorum",
    description: "Marka arayın ve başvurun. Onaydan sonra bayi olarak devam edersiniz.",
  },
  {
    href: "/register/franchise-owner",
    title: "Marka sahibiyim",
    description: "Franchise veren marka hesabı — başvurular ve günlük operasyon.",
  },
];

export default function RegisterHubPage() {
  return (
    <div className="page-shell min-h-screen">
      <MarketingHeader />
      <main className="page-container py-16">
        <div className="mx-auto max-w-xl">
          <p className="eyebrow">Kayıt</p>
          <h1 className="display-title mt-3 text-3xl text-[var(--foreground)] md:text-4xl">
            Hesap oluşturun
          </h1>
          <p className="page-desc">Size uygun hesap türünü seçin.</p>

          <ul className="mt-8 space-y-3">
            {roles.map((role) => (
              <li key={role.href}>
                <Link
                  href={role.href}
                  className="card-muted block p-5 transition hover:border-[rgba(201,162,39,0.3)] hover:bg-[var(--card-hover)]"
                >
                  <p className="font-semibold text-[var(--foreground)]">{role.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{role.description}</p>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-[var(--muted-foreground)]">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="text-[var(--primary-hover)] hover:underline">
              Giriş yapın
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
