# nisslar.com

Miami merkezli lüks araç kiralama sitesi.

## Stack
- **SSG:** Eleventy 3
- **CSS:** Tailwind CSS 3 (CDN, build step yok)
- **Deploy:** Vercel
- **CMS:** Custom admin panel + Vercel Blob storage + serverless API routes
- **Fonts:** Fraunces (serif display), Inter (body), JetBrains Mono (labels)

## Renk Paleti
- `#FFFFFF` — ink (beyaz arka plan)
- `#1E293B` — cream (koyu metin)
- `#7AADDB` — gold (pastel mavi, butonlar)
- `#E8854A` — accent (turuncu, dekoratif detaylar)

## Dil
- Türkçe (varsayılan) + İngilizce
- Client-side i18n, `data-i18n` attribute sistemi
- Türkçe karakter kuralları: İ/i vs I/ı doğru kullanılmalı

## Proje Yapısı
```
src/           → Eleventy kaynak dosyaları
src/_data/     → JSON veri dosyaları (cars, content, faq)
src/_includes/ → Nunjucks layout/partial'ları
src/admin/     → CMS admin paneli (SPA)
src/assets/    → Logo, favicon, görseller
api/           → Vercel serverless functions (CMS CRUD)
```

## Komutlar
```bash
npm run dev    # Eleventy dev server (port 8080)
npm run build  # Production build
```

## CMS
- `/admin` yolundan erişilir
- Araç CRUD (ekle/düzenle/sil)
- Site içerik düzenleme (hero, trust, about, faq)
- Auth: basit şifre koruması (ADMIN_PASSWORD env var)
- Data: Vercel Blob storage (prod), JSON dosyaları (dev)

## Notlar
- Responsive: mobile-first
- Smooth scroll + fixed header offset (88px)
- IntersectionObserver reveal animasyonları
- Editorial tasarım: sert köşeler, N° indeksleme, monospace etiketler
