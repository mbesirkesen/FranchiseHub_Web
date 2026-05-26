import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <main className="glass-card w-full max-w-4xl rounded-3xl p-8 md:p-12">
        <p className="script-title text-4xl text-accent md:text-5xl">FranchiseHub</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">
          Franchise dunyasina wow etkisiyle giris.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-slate-300 md:text-lg">
          Cesur renkler, premium arayuz dili ve rol bazli guclu akislariyla kullaniciyi siteye
          ceken yeni deneyim. Buradan tek tikla giris yapip panellere gecis saglayabilirsin.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
          >
            Giris Yap ve Basla
          </Link>
          <Link
            href="/buyer"
            className="rounded-xl border border-slate-400/40 bg-slate-900/30 px-4 py-3 text-sm text-slate-100 transition hover:border-cyan-300/70"
          >
            Buyer
          </Link>
          <Link
            href="/franchise-owner"
            className="rounded-xl border border-slate-400/40 bg-slate-900/30 px-4 py-3 text-sm text-slate-100 transition hover:border-cyan-300/70"
          >
            Franchise Owner
          </Link>
          <Link
            href="/admin"
            className="rounded-xl border border-slate-400/40 bg-slate-900/30 px-4 py-3 text-sm text-slate-100 transition hover:border-cyan-300/70"
          >
            Admin
          </Link>
        </div>
      </main>
    </div>
  );
}
