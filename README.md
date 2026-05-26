# FranchiseHub Web

FranchiseHub backend'i ile calisan rol bazli web frontend projesi.

## Teknoloji

- Next.js (App Router) + TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- Axios

## Baslangic

```bash
npm install
cp .env.example .env.local
npm run dev
```

Windows PowerShell icin:

```powershell
Copy-Item .env.example .env.local
```

Ardindan `http://localhost:3000` adresini acin.

## Ortam Degiskenleri

`.env.local`:

```env
BACKEND_API_BASE_URL=http://127.0.0.1:8000
```

Frontend istekleri tarayicidan dogrudan backend'e gitmez; Next.js `/api/proxy/*` uzerinden
proxy eder. Bu sayede local gelisimde CORS sorunu yasamazsiniz.

## Ilk Sayfalar

- `/` -> proje giris sayfasi
- `/login` -> backend `/auth/login` ile JWT girisi
- `/buyer`
- `/franchise-owner`
- `/admin`

## Notlar

- Login cevabindaki `access_token` decode edilip `role` claim'i otomatik okunur.
- Desteklenen roller: `buyer`, `franchise_owner`, `admin`.
- Role sayfalari ilk sprint iskeletidir; endpoint baglantilari parcali olarak eklenecek.
