# Parsel360+ Teknik Döküman

> Bu döküman, uygulamanın teknik altyapısını, kullanılan teknolojileri ve yazılım geliştirme süreçlerini açıklar.

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Teknoloji Stack'i](#teknoloji-stacki)
3. [Mimari Yapı](#mimari-yapı)
4. [Yazılım Geliştirme Temelleri](#yazılım-geliştirme-temelleri)
5. [Deployment (Yayına Alma)](#deployment-yayına-alma)
6. [Güvenlik](#güvenlik)
7. [Performans](#performans)
8. [Sözlük](#sözlük)

---

## Genel Bakış

**Parsel360+**, gayrimenkul yatırım analizi için geliştirilmiş bir **Single Page Application (SPA)**'dır.

### Uygulama Ne Yapar?
- 🗺️ Harita üzerinde parsel ve POI (Point of Interest) görselleştirme
- 📊 Demografik ve pazar verileri analizi
- 🤖 AI destekli yatırım stratejisi önerileri
- 📈 Mahalle bazlı endeks ve senaryo kartları

### Teknik Özet
| Özellik | Değer |
|---------|-------|
| Uygulama Tipi | Single Page Application (SPA) |
| Frontend Framework | React 19 |
| Build Tool | Vite 7 |
| Dil | TypeScript |
| Styling | Tailwind CSS |
| Harita | Leaflet + React-Leaflet |
| Grafikler | Recharts |

---

## Teknoloji Stack'i

### 🔷 React (v19.2.0)
**Ne İşe Yarar:** Kullanıcı arayüzü (UI) oluşturmak için kullanılan JavaScript kütüphanesi.

**Neden Tercih Edildi:**
- **Component-based:** Her UI parçası bağımsız bir "component" olarak yazılır. Örneğin `MapContainer`, `Sidebar`, `DemographicsView` hepsi ayrı component'lar.
- **Virtual DOM:** Sayfa değişikliklerini akıllıca hesaplar, sadece değişen kısımları günceller → hızlı performans.
- **Devasa ekosistem:** Binlerce hazır kütüphane, geniş topluluk desteği.
- **Meta (Facebook) tarafından geliştirilir:** Uzun vadeli destek garantisi.

**Temel Kavramlar:**
```
Component → UI'ın bir parçası (buton, kart, panel)
Props → Component'e dışarıdan gelen veriler
State → Component'in kendi içinde tuttuğu veriler
Hook → useState, useEffect gibi özel fonksiyonlar
```

**Projede Kullanım Örneği:**
```tsx
// Sidebar.tsx - Bir React component örneği
export const Sidebar: FC<SidebarProps> = ({ activeTab, onTabChange }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    // ...
};
```

---

### 🔷 TypeScript (v5.9.3)
**Ne İşe Yarar:** JavaScript'e "tip güvenliği" ekleyen bir üst-dil (superset).

**Neden Tercih Edildi:**
- **Hata önleme:** Kod yazarken hataları yakalar, production'da bug'ları azaltır.
- **Otomatik tamamlama:** IDE'de akıllı öneriler sunar.
- **Dokümantasyon:** Kod kendini açıklar, tip tanımları sayesinde.
- **Büyük projeler için şart:** Kod büyüdükçe yönetim kolaylaşır.

**JavaScript vs TypeScript:**
```javascript
// JavaScript - Hata çalışma zamanında ortaya çıkar
function toplam(a, b) {
    return a + b;
}
toplam("5", 3); // "53" - Beklenmeyen sonuç!

// TypeScript - Hata derleme zamanında yakalanır
function toplam(a: number, b: number): number {
    return a + b;
}
toplam("5", 3); // ❌ Hata: string number'a atanamaz
```

---

### 🔷 Vite (v7.2.4)
**Ne İşe Yarar:** Modern JavaScript uygulamaları için build tool ve development server.

**Neden Tercih Edildi:**
- **Hız:** Geleneksel araçlardan (Webpack) 10-100x daha hızlı.
- **Hot Module Replacement (HMR):** Kod değişikliği anında tarayıcıda görünür.
- **Zero-config:** Minimal ayar gerektirir.
- **Modern:** ES Modules kullanır, tarayıcı native desteğinden faydalanır.

**Nasıl Çalışır:**
```
Development (npm run dev):
├── Kaynak kodları doğrudan tarayıcıya sunar
├── Değişiklikler anında güncellenir (HMR)
└── http://localhost:5173 üzerinde çalışır

Production (npm run build):
├── Tüm kodu optimize eder ve sıkıştırır
├── dist/ klasörüne çıktı verir
└── Sunucuya yüklenecek dosyaları oluşturur
```

---

### 🔷 Tailwind CSS (v3.4.17)
**Ne İşe Yarar:** Utility-first CSS framework'ü.

**Neden Tercih Edildi:**
- **Hız:** Hazır class'lar ile hızlı stil yazımı.
- **Tutarlılık:** Tasarım sistemi içinde kalmanızı sağlar.
- **Purging:** Kullanılmayan stiller otomatik temizlenir → küçük dosya boyutu.
- **Responsive:** `sm:`, `md:`, `lg:` prefix'leri ile kolay responsive tasarım.

**Geleneksel CSS vs Tailwind:**
```html
<!-- Geleneksel CSS -->
<div class="card">...</div>
<style>
.card {
    padding: 1rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
</style>

<!-- Tailwind CSS -->
<div class="p-4 bg-white rounded-lg shadow-md">...</div>
```

---

### 🔷 Leaflet + React-Leaflet (v1.9.4 / v5.0.0)
**Ne İşe Yarar:** İnteraktif harita oluşturma kütüphanesi.

**Neden Tercih Edildi:**
- **Açık kaynak:** Ücretsiz, Google Maps gibi lisans ücreti yok.
- **Hafif:** ~40KB, Google Maps'in 1/10'u.
- **GeoJSON desteği:** GIS verileri doğrudan yüklenebilir.
- **Özelleştirilebilir:** Marker, polygon, popup her şey custom yapılabilir.

**Projede Kullanım:**
```tsx
<MapContainer center={[41.004, 29.05]} zoom={14}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <GeoJSON data={parselData} />
    <Marker position={[41.004, 29.05]}>
        <Popup>Proje Konumu</Popup>
    </Marker>
</MapContainer>
```

---

### 🔷 Recharts (v3.6.0)
**Ne İşe Yarar:** React için grafik kütüphanesi.

**Neden Tercih Edildi:**
- **React-native:** React component'ları olarak çalışır.
- **Responsive:** Otomatik boyutlandırma.
- **SVG tabanlı:** Kaliteli, vektörel grafikler.
- **Kolay kullanım:** Deklaratif API.

**Projede Kullanım:**
```tsx
<ResponsiveContainer width="100%" height={200}>
    <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Bar dataKey="value" fill="#8884d8" />
    </BarChart>
</ResponsiveContainer>
```

---

### 🔷 Framer Motion (v12.26.1)
**Ne İşe Yarar:** React için animasyon kütüphanesi.

**Neden Tercih Edildi:**
- **Basit API:** `animate`, `initial`, `exit` prop'ları ile kolay animasyon.
- **Performanslı:** GPU-accelerated animasyonlar.
- **Gesture desteği:** Drag, tap, hover gibi etkileşimler.

---

### 🔷 Lucide React (v0.562.0)
**Ne İşe Yarar:** SVG icon kütüphanesi.

**Neden Tercih Edildi:**
- **Hafif:** Sadece kullanılan ikonlar bundle'a dahil edilir.
- **Özelleştirilebilir:** Renk, boyut kolayca değiştirilebilir.
- **1000+ ikon:** Geniş ikon seti.

---

## Mimari Yapı

### Klasör Yapısı
```
src/
├── components/           # UI bileşenleri
│   ├── common/          # Paylaşılan bileşenler
│   ├── features/        # Özellik bazlı bileşenler
│   │   ├── map/        # Harita bileşenleri
│   │   ├── panel/      # Panel bileşenleri
│   │   └── profile/    # Profil bileşenleri
│   └── layout/          # Sayfa düzeni bileşenleri
├── contexts/            # React Context'ler (global state)
├── services/            # API ve veri servisleri
├── constants/           # Sabit değerler
├── lib/                 # Yardımcı fonksiyonlar
└── assets/              # Statik dosyalar (görseller)

public/
└── data/                # GeoJSON ve diğer veriler
    ├── mahalle/        # Mahalle verileri
    ├── proje/          # Proje verileri
    └── rapor/          # Raporlar
```

### Veri Akışı
```
                    ┌─────────────────┐
                    │   GeoJSON       │
                    │   Dosyaları     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  dataService.ts │  ← Veri katmanı
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    App.tsx      │  ← Ana uygulama
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────────┐
        │ Sidebar  │  │   Map    │  │ Panels       │
        └──────────┘  └──────────┘  └──────────────┘
```

---

## Yazılım Geliştirme Temelleri

### 🔹 Frontend vs Backend

```
┌─────────────────────────────────────────────────────────┐
│                        FRONTEND                          │
│  (Tarayıcıda çalışır - kullanıcının gördüğü kısım)     │
│                                                          │
│  • HTML, CSS, JavaScript                                │
│  • React, Vue, Angular gibi framework'ler               │
│  • Parsel360+ tamamen frontend uygulamasıdır            │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP İstekleri
                           ▼
┌─────────────────────────────────────────────────────────┐
│                        BACKEND                           │
│  (Sunucuda çalışır - veri işleme, güvenlik)            │
│                                                          │
│  • Node.js, Python, Java, C# gibi diller                │
│  • Veritabanı bağlantıları                              │
│  • API'ler (REST, GraphQL)                              │
│  • Şu an Parsel360+ backend kullanmıyor (statik veri)  │
└─────────────────────────────────────────────────────────┘
```

### 🔹 SPA (Single Page Application) Nedir?

**Geleneksel Web Sitesi:**
```
Sayfa 1 → Tıkla → Sunucu yeni HTML gönderir → Sayfa 2
(Her tıklamada sayfa yeniden yüklenir)
```

**SPA (Parsel360+ gibi):**
```
Uygulama yüklenir → Tıkla → JavaScript içeriği değiştirir
(Sayfa hiç yenilenmez, sadece içerik değişir)
```

**Avantajları:**
- Daha hızlı kullanıcı deneyimi
- Native uygulama hissi
- Daha az sunucu yükü

**Dezavantajları:**
- İlk yükleme daha uzun sürebilir
- SEO için ek çalışma gerekir

### 🔹 npm (Node Package Manager)

**Ne İşe Yarar:** JavaScript paketlerini yönetir.

**Temel Komutlar:**
```bash
npm install          # package.json'daki tüm paketleri yükler
npm run dev          # Geliştirme sunucusunu başlatır
npm run build        # Production build oluşturur
npm run lint         # Kod kalitesi kontrolü yapar
npm run preview      # Build edilmiş uygulamayı önizler
```

**package.json:**
```json
{
  "dependencies": {     // Production'da gereken paketler
      "react": "^19.2.0"
  },
  "devDependencies": {  // Sadece geliştirmede gereken paketler
      "typescript": "^5.9.3"
  }
}
```

### 🔹 Git & Version Control

**Ne İşe Yarar:** Kod değişikliklerini takip eder, ekip çalışmasını sağlar.

**Temel Kavramlar:**
```
Repository (Repo)  → Projenin tüm dosyaları ve geçmişi
Commit             → Bir "kaydetme noktası"
Branch             → Paralel geliştirme dalı
Merge              → Dalları birleştirme
Pull Request (PR)  → Kod inceleme talebi
```

### 🔹 Environment (Ortamlar)

```
Development (Geliştirme)
├── Yerel bilgisayarda çalışır
├── Hot reload aktif
├── Debug araçları açık
└── npm run dev

Staging (Test)
├── Production benzeri ortam
├── Test amaçlı
└── Gerçek kullanıcılar görmez

Production (Canlı)
├── Gerçek kullanıcıların eriştiği ortam
├── Optimize edilmiş kod
├── Hata logları aktif
└── npm run build → sunucuya yükle
```

---

## Deployment (Yayına Alma)

### Build Süreci

```bash
npm run build
```

Bu komut şunları yapar:
1. TypeScript → JavaScript derleme
2. Tüm modülleri tek dosyada birleştirme (bundling)
3. Kodu sıkıştırma (minification)
4. Kullanılmayan kodu temizleme (tree-shaking)
5. `dist/` klasörüne çıktı verme

### Çıktı Yapısı

```
dist/
├── index.html           # Ana HTML dosyası
├── assets/
│   ├── index-xxx.js     # Tüm JavaScript (sıkıştırılmış)
│   └── index-xxx.css    # Tüm CSS (sıkıştırılmış)
└── data/                # GeoJSON dosyaları (kopyalanır)
```

### Sunucu Gereksinimleri

**Minimum:**
- Statik dosya sunabilen herhangi bir web sunucusu
- HTTPS desteği (güvenlik için şart)
- Gzip sıkıştırma desteği

**Önerilen Platformlar:**
| Platform | Avantaj | Dezavantaj |
|----------|---------|------------|
| Vercel | Ücretsiz, kolay | Ticari kullanımda limit |
| Netlify | Ücretsiz, CI/CD | Ticari kullanımda limit |
| AWS S3 + CloudFront | Ölçeklenebilir | Kurulum karmaşık |
| Nginx (kendi sunucu) | Tam kontrol | Yönetim gerektirir |

### Nginx Örnek Konfigürasyonu

```nginx
server {
    listen 80;
    server_name parsel360.example.com;
    root /var/www/parsel360/dist;
    index index.html;

    # Gzip sıkıştırma
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # SPA için tüm route'ları index.html'e yönlendir
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Statik dosyalar için cache
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Güvenlik

### ✅ Mevcut Güvenlik Önlemleri

1. **Statik Uygulama:** Backend olmadığı için SQL injection, authentication bypass gibi riskler yok.
2. **HTTPS:** Tüm iletişim şifreli (sunucu konfigürasyonunda ayarlanmalı).
3. **No Sensitive Data:** Kullanıcı verileri, şifreler saklanmıyor.

### ⚠️ Dikkat Edilmesi Gerekenler

1. **GeoJSON Dosyaları:** Public erişime açık, hassas veri içermemeli.
2. **CORS:** API kullanılacaksa doğru ayarlanmalı.
3. **Content Security Policy:** XSS saldırılarına karşı koruma.

### Önerilen HTTP Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
```

---

## Performans

### Mevcut Metrikler

| Metrik | Değer | Açıklama |
|--------|-------|----------|
| JS Bundle | ~1.26 MB | Tüm JavaScript kodu |
| CSS Bundle | ~91 KB | Tüm stiller |
| Gzip JS | ~380 KB | Sıkıştırılmış JS |
| Gzip CSS | ~18 KB | Sıkıştırılmış CSS |
| GeoJSON Toplam | ~4 MB | Harita verileri |

### Performans İyileştirme Önerileri

1. **Lazy Loading:** Büyük component'ları ihtiyaç halinde yükle
2. **Code Splitting:** Her sekme için ayrı bundle
3. **Image Optimization:** Görselleri WebP formatına çevir
4. **GeoJSON Simplification:** Poligonları sadeleştir

---

## Sözlük

| Terim | Açıklama |
|-------|----------|
| **API** | Application Programming Interface - Yazılımlar arası iletişim arayüzü |
| **Bundle** | Birden fazla dosyanın tek dosyada birleştirilmesi |
| **CI/CD** | Continuous Integration/Deployment - Otomatik test ve yayınlama |
| **Component** | Yeniden kullanılabilir UI parçası |
| **DOM** | Document Object Model - HTML'in programatik temsili |
| **Framework** | Yazılım geliştirme için temel yapı sağlayan kütüphane |
| **GeoJSON** | Coğrafi verileri temsil eden JSON formatı |
| **Hook** | React'ta state ve lifecycle yönetimi için fonksiyonlar |
| **IDE** | Integrated Development Environment - VS Code gibi kod editörleri |
| **Minification** | Kodun sıkıştırılarak küçültülmesi |
| **POI** | Point of Interest - İlgi noktası |
| **Props** | Component'lere dışarıdan geçirilen veriler |
| **REST** | REpresentational State Transfer - API tasarım stili |
| **SPA** | Single Page Application - Tek sayfa uygulaması |
| **State** | Component'in anlık durumu |
| **Tree-shaking** | Kullanılmayan kodun build'den çıkarılması |

---

## Versiyon Geçmişi

| Tarih | Versiyon | Değişiklikler |
|-------|----------|---------------|
| Şubat 2026 | 1.0.0 | İlk production-ready sürüm |

---

*Bu döküman Parsel360+ geliştirme sürecinde oluşturulmuştur.*
