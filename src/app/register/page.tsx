import Link from "next/link";
import { AuthLayout } from "@/components/ui/auth-layout";

const roles = [
  {
    href: "/register/buyer",
    title: "Franchise arıyorum",
    description: "Marka arayın ve başvurun. Onaydan sonra bayi olarak devam edersiniz.",
    icon: "AR",
  },
  {
    href: "/register/franchise-owner",
    title: "Marka sahibiyim",
    description: "Franchise veren marka hesabı — başvurular ve günlük operasyon.",
    icon: "MS",
  },
];

export default function RegisterHubPage() {
  return (
    <AuthLayout
      title="Hesap oluşturun"
      subtitle="Size uygun hesap türünü seçin — birkaç dakika sürer."
      footer={
        <>
          <p className="auth-footer-register">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="auth-footer-link-primary">
              Giriş yapın
            </Link>
          </p>
          <Link href="/" className="auth-footer-home">
            Ana sayfa
          </Link>
        </>
      }
    >
      <ul className="auth-role-list">
        {roles.map((role) => (
          <li key={role.href}>
            <Link href={role.href} className="auth-role-card">
              <span className="auth-role-icon">{role.icon}</span>
              <span>
                <span className="auth-role-title">{role.title}</span>
                <span className="auth-role-desc">{role.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AuthLayout>
  );
}
