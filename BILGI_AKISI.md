# Parselinfo360 - Sistem Bilgi Akışı

## 1. Genel Mimari

Parselinfo360, **frontend-only (sadece istemci tarafı)** bir React SPA uygulamasıdır. Şu anda herhangi bir backend sunucu veya veritabanı bulunmamaktadır. Tüm veriler **statik GeoJSON dosyalarından** okunmaktadır.

```
┌─────────────────────────────────────────────────────────┐
│                   KULLANICI (Tarayıcı)                  │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ LoginPage│→ │ CompanyContext│→ │     App.tsx      │  │
│  │          │  │ (adaParsel)  │  │  (Veri Yükleme)  │  │
│  └──────────┘  └──────────────┘  └────────┬─────────┘  │
│                                           │             │
│                    ┌──────────────────────┤             │
│                    ▼                      ▼             │
│          ┌─────────────────┐   ┌──────────────────┐    │
│          │    Sidebar       │   │  MapContainer    │    │
│          │  (5 Panel Tab)   │   │  (Leaflet Harita)│    │
│          └─────────────────┘   └──────────────────┘    │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              STATİK GeoJSON DOSYALARI                   │
│                                                         │
│  public/data/proje/         public/data/mahalle/        │
│  ├─ parsel360.geojson       ├─ mahalle_demografi.geojson│
│  ├─ olanaklar_poi_*.geojson ├─ mahalle_endeks.geojson   │
│  └─ service_area_*.geojson  ├─ mahalle_senaryo_*.geojson│
│                             └─ uskudar_sinir.geojson    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Veri Kaynakları

Sistemdeki tüm veriler **statik GeoJSON dosyalarından** okunur. Herhangi bir harici API veya veritabanı bağlantısı yoktur.

### 2.1 Proje/Parsel Verileri (`public/data/proje/`)

| Dosya | İçerik | Kullanım |
|-------|--------|----------|
| `parsel360.geojson` | Ana parsel/proje kaydı | Tüm parsellerin bilgileri, geometrileri |
| `olanaklar_poi_{ada_parsel}.geojson` | Yakın çevre ilgi noktaları (POI) | Ulaşım, sağlık, eğitim, yaşam, sosyal noktalar |
| `service_area_{ada_parsel}.geojson` | Yürüme mesafesi alanları | 5, 10, 15 dakikalık yürüme mesafeleri |

### 2.2 Mahalle Verileri (`public/data/mahalle/`)

| Dosya | İçerik | Kullanım |
|-------|--------|----------|
| `uskudar_sinir.geojson` | Üsküdar ilçe sınırı | Harita sınır çizimi |
| `mahalle_demografi.geojson` | Nüfus, yaş, cinsiyet, eğitim | Demografi paneli |
| `mahalle_endeks.geojson` | Yatırım endeksleri, fiyat verileri | Pazar analizi paneli |
| `mahalle_senaryo_kartlari.geojson` | Senaryo ve persona verileri | Strateji paneli |

### 2.3 Kullanıcı Verileri (`src/config/users.ts`)

Kullanıcı bilgileri sabit kodlanmış (hardcoded) olarak tutulur:

```typescript
{
  id: '1',
  firmaAdi: '1101_8',         // Giriş kullanıcı adı
  sifre: 'parsel360',         // Giriş şifresi
  adaParsel: '1101_8',        // Bağlı parsel kodu
  projeAdi: 'Proje Adı',
  aktif: true
}
```

---

## 3. Parsellerin Sisteme Eklenme Süreci

> **Not:** Şu anda UI üzerinden parsel ekleme özelliği yoktur. Tüm ekleme işlemleri dosya düzenlemesiyle yapılmaktadır.

### Adım 1: Parsel Kaydını Oluştur

`public/data/proje/parsel360.geojson` dosyasına yeni bir Feature ekleyin:

```json
{
  "type": "Feature",
  "properties": {
    "ada_parsel": "XXXX_YY",        // Benzersiz tanımlayıcı (Ada_Parsel formatı)
    "Ada": "XXXX",
    "parsel": "YY",
    "Mahalle": "Mahalle Adı",
    "ilce": "İlçe Adı",
    "Alan": "605,59",
    "Nitelik": "Bahçeli Kargir Ev",
    "firma_adi": "Firma Adı",
    "proje_tipi": "Konut",
    "teslim_tarihi": "2026",
    "toplam_konut": "48",
    "proje_nitelik": "Proje açıklaması",
    "Name": "Proje Adı"
  },
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [ /* parsel koordinatları */ ]
  }
}
```

### Adım 2: POI (İlgi Noktası) Verisini Ekle

`public/data/proje/olanaklar_poi_{ada_parsel}.geojson` adında yeni bir dosya oluşturun:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "ada_parsel": "XXXX_YY",
        "kategori": "Ulaşım",
        "alt_kategori": "Metro",
        "parsel_uzaklik": 450,
        "minute5": true,
        "minute10": true,
        "minute15": true
      },
      "geometry": { "type": "Point", "coordinates": [lon, lat] }
    }
  ]
}
```

**POI Kategorileri:**
- **Ulaşım** — Otobüs, Metro, Deniz, Taksi vb.
- **Sağlık** — Hastane, Eczane, Klinik vb.
- **Eğitim** — Okul, Üniversite, Kreş vb.
- **Yaşam** — AVM, Market, Park vb.
- **Sosyal&Kültürel** — Kafe, Restoran, Müze vb.

### Adım 3: Yürüme Mesafesi Alanlarını Ekle

`public/data/proje/service_area_{ada_parsel}.geojson` dosyasını oluşturun:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "ada_parsel": "XXXX_YY",
        "AA_MINS": 5
      },
      "geometry": { "type": "Polygon", "coordinates": [ /* ... */ ] }
    },
    {
      "type": "Feature",
      "properties": {
        "ada_parsel": "XXXX_YY",
        "AA_MINS": 10
      },
      "geometry": { "type": "Polygon", "coordinates": [ /* ... */ ] }
    },
    {
      "type": "Feature",
      "properties": {
        "ada_parsel": "XXXX_YY",
        "AA_MINS": 15
      },
      "geometry": { "type": "Polygon", "coordinates": [ /* ... */ ] }
    }
  ]
}
```

### Adım 4: Kullanıcı Tanımı Ekle

`src/config/users.ts` dosyasına yeni kullanıcı ekleyin:

```typescript
{
  id: '2',
  firmaAdi: 'yeni_kullanici',
  sifre: 'sifre123',
  adaParsel: 'XXXX_YY',       // parsel360.geojson'daki ada_parsel ile eşleşmeli
  projeAdi: 'Yeni Proje',
  aktif: true
}
```

### Adım 5 (Opsiyonel): Proje Görseli Ekle

`public/data/project_pics/{ada_parsel}.png` dosyası eklenebilir.

---

## 4. Veri İlişki Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                    parsel360.geojson                         │
│                  (Ana Parsel Kaydı)                          │
│                                                             │
│  ada_parsel ─── BIRINCIL ANAHTAR (örn: "1101_8")          │
│  Mahalle    ─── Mahalle verileriyle bağlantı               │
│  firma_adi  ─── Firma bilgisi                              │
│  geometry   ─── Parsel geometrisi (MultiPolygon)           │
└───────────┬─────────────────┬───────────────────────────────┘
            │                 │
     ada_parsel ile      Mahalle adı ile
      filtrelenir         eşleştirilir
            │                 │
            ▼                 ▼
┌───────────────────┐  ┌─────────────────────────────────────┐
│  POI Dosyaları    │  │       Mahalle Dosyaları              │
│                   │  │                                     │
│  olanaklar_poi_   │  │  mahalle_demografi.geojson          │
│  {ada_parsel}     │  │  ├─ Nüfus, Yaş Dağılımı            │
│  .geojson         │  │  ├─ Cinsiyet, Eğitim               │
│                   │  │  └─ Hanehalkı, Yoğunluk             │
│  ┌─ kategori      │  │                                     │
│  ├─ alt_kategori  │  │  mahalle_endeks.geojson             │
│  ├─ parsel_uzaklik│  │  ├─ Satış/Kira Fiyatları           │
│  └─ minute5/10/15 │  │  ├─ İlan Envanteri                 │
│                   │  │  └─ İşlem Hacimleri                 │
└───────────────────┘  │                                     │
                       │  mahalle_senaryo_kartlari.geojson   │
┌───────────────────┐  │  ├─ Senaryo Kartları                │
│  Service Area     │  │  └─ Persona Analizleri              │
│                   │  └─────────────────────────────────────┘
│  service_area_    │
│  {ada_parsel}     │
│  .geojson         │
│                   │
│  ┌─ AA_MINS (5)   │
│  ├─ AA_MINS (10)  │
│  └─ AA_MINS (15)  │
└───────────────────┘
```

---

## 5. Uygulama Bilgi Akışı (Detaylı)

### 5.1 Giriş Akışı

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   LoginPage  │────▶│ authenticateUser│────▶│ CompanyContext    │
│              │     │ (users.ts'den   │     │                  │
│ firmaAdi +   │     │  doğrulama)     │     │ user = { ... }   │
│ sifre girilir│     │                 │     │ adaParsel = "X"  │
└──────────────┘     └─────────────────┘     └────────┬─────────┘
                                                      │
                                                      ▼
                                              App.tsx yeniden
                                              render edilir
```

**Dosyalar:** `LoginPage.tsx` → `config/users.ts` → `contexts/CompanyContext.tsx`

### 5.2 Veri Yükleme Akışı

```
┌──────────────────────────────────────────────────────────────────┐
│                     App.tsx - useEffect                          │
│                                                                  │
│  adaParsel değiştiğinde tetiklenir                              │
│                                                                  │
│  Promise.all([                                                   │
│    dataService.getMapBoundary(),            ─── uskudar_sinir   │
│    dataService.getProjectParcel(adaParsel), ─── parsel360       │
│    dataService.getAllPois(adaParsel),        ─── olanaklar_poi   │
│    dataService.getServiceArea(adaParsel),    ─── service_area   │
│    dataService.getNeighborhoodBoundaries()   ─── mahalle_demo   │
│  ])                                                              │
│                                                                  │
│  Paralel olarak tüm GeoJSON dosyaları yüklenir                 │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                  İSTEMCİ TARAFLI FİLTRELEME                     │
│                                                                  │
│  • Parsel verisi → ada_parsel ile filtrelenir                   │
│  • POI verisi    → ada_parsel ile filtrelenir                   │
│  • Service area  → ada_parsel ile filtrelenir                   │
│  • Mahalle verisi → Mahalle adı ile eşleştirilir                │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     STATE GÜNCELLEMESİ                          │
│                                                                  │
│  App.tsx state değişkenleri:                                     │
│  ├─ parcelData       → Filtrelenmiş parsel GeoJSON              │
│  ├─ poiData          → Filtrelenmiş POI listesi                 │
│  ├─ boundaryData     → İlçe sınırı                              │
│  ├─ neighborhoodData → Mahalle sınırları                        │
│  ├─ allServiceAreaData → Yürüme mesafesi poligonları            │
│  └─ isDataLoaded     → Yükleme durumu                           │
└──────────────────────────────────────────────────────────────────┘
```

**Dosyalar:** `App.tsx` → `services/dataService.ts` → `public/data/**/*.geojson`

### 5.3 Panel Görüntüleme Akışı

```
App.tsx (state)
    │
    ├──▶ Sidebar
    │     ├── activeTab = "overview"
    │     │    └──▶ OverviewView
    │     │         └── parselData → Proje bilgileri, istatistikler
    │     │
    │     ├── activeTab = "capabilities"
    │     │    └──▶ CapabilitiesView
    │     │         ├── poiData → kategori/alt_kategori ile filtreleme
    │     │         ├── activeCategory → seçili kategori
    │     │         └── walkingDistance → 5'/10'/15' filtresi
    │     │
    │     ├── activeTab = "demographics"
    │     │    └──▶ DemographicsView
    │     │         └── Mahalle demografi verisi → Grafikler
    │     │
    │     ├── activeTab = "market"
    │     │    └──▶ MarketIndexView
    │     │         └── Mahalle endeks verisi → Fiyat/pazar grafikleri
    │     │
    │     └── activeTab = "strategy"
    │          └──▶ StrategyView
    │               └── Senaryo kartları → AI önerileri
    │
    └──▶ MapContainer
          ├── boundaryData     → İlçe sınır çizgisi
          ├── neighborhoodData → Mahalle sınırları + etiketler
          ├── parcelData       → Parsel poligonu (mavi)
          ├── serviceAreaData  → Yürüme alanları (yeşil, animasyonlu)
          └── poiData          → POI işaretçileri (kategoriye göre ikon)
```

### 5.4 Kullanıcı Etkileşim Akışı

```
┌──────────────────────────────────────────────────────────────────┐
│                    KULLANICI ETKİLEŞİMLERİ                       │
│                                                                  │
│  1. Kategori Seçimi (Capabilities Tab):                         │
│     Kullanıcı tıklar → activeCategory güncellenir               │
│     → useMemo ile poiData filtrelenir → UI güncellenir          │
│     → Haritada ilgili POI'ler gösterilir                        │
│                                                                  │
│  2. Yürüme Mesafesi Filtresi:                                   │
│     5'/10'/15' butonuna tıklanır → walkingDistance güncellenir   │
│     → POI'ler minute5/10/15 değerine göre filtrelenir           │
│     → Service area poligonları AA_MINS ile filtrelenir           │
│                                                                  │
│  3. Tab Değiştirme:                                             │
│     Sidebar'da tab tıklanır → activeTab güncellenir             │
│     → renderContent() ilgili paneli gösterir                    │
│                                                                  │
│  4. Harita Araçları:                                            │
│     Mesafe ölçme / Alan ölçme / Koordinat gösterme              │
│     → MapTools bileşeni yönetir                                 │
│                                                                  │
│  5. Rapor İndirme:                                              │
│     "Rapor İndir" butonuna tıklanır                             │
│     → /data/rapor/{adaParsel}.pdf dosyası indirilir             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Anahtar Dosyalar ve Görevleri

### Uygulama Çekirdeği

| Dosya | Görev |
|-------|-------|
| `src/App.tsx` | Ana uygulama bileşeni, veri yükleme, filtreleme, tab yönlendirme |
| `src/main.tsx` | Giriş noktası, provider'lar |
| `src/services/dataService.ts` | Tüm GeoJSON dosyalarını yükleyen merkezi servis |
| `src/contexts/CompanyContext.tsx` | Kullanıcı/firma bilgisi, adaParsel yönetimi |
| `src/contexts/ThemeContext.tsx` | Koyu/açık tema yönetimi (localStorage'da saklanır) |
| `src/config/users.ts` | Statik kullanıcı listesi (kimlik doğrulama) |

### Bileşenler

| Dosya | Görev |
|-------|-------|
| `src/components/LoginPage.tsx` | Giriş formu ve doğrulama |
| `src/components/layout/MainLayout.tsx` | Ana sayfa düzeni (sidebar + harita) |
| `src/components/layout/Sidebar.tsx` | Yan panel, tab menü, başlık |
| `src/components/features/map/MapContainer.tsx` | Leaflet harita, katmanlar, işaretçiler |
| `src/components/features/map/MapTools.tsx` | Harita araçları (ölçme, odaklama) |
| `src/components/features/panel/OverviewView.tsx` | Proje genel bakış paneli |
| `src/components/features/panel/CapabilitiesView.tsx` | POI/olanaklar paneli |
| `src/components/features/panel/DemographicsView.tsx` | Demografi grafikleri |
| `src/components/features/panel/MarketIndexView.tsx` | Pazar analizi grafikleri |
| `src/components/features/panel/StrategyView.tsx` | AI strateji önerileri |
| `src/components/features/profile/ProfilePage.tsx` | Proje bilgilerini düzenleme (lokal) |

### Veri Dosyaları

| Dosya | Görev |
|-------|-------|
| `public/data/proje/parsel360.geojson` | **Ana parsel/proje kaydı** |
| `public/data/proje/olanaklar_poi_*.geojson` | İlgi noktaları (POI) |
| `public/data/proje/service_area_*.geojson` | Yürüme mesafesi poligonları |
| `public/data/mahalle/mahalle_demografi.geojson` | Mahalle nüfus verileri |
| `public/data/mahalle/mahalle_endeks.geojson` | Pazar endeks verileri |
| `public/data/mahalle/mahalle_senaryo_kartlari.geojson` | Senaryo kartları |
| `public/data/mahalle/uskudar_sinir.geojson` | İlçe sınır geometrisi |

---

## 7. Veri Akış Özeti (Uçtan Uca)

```
 ┌─────────┐       ┌──────────┐       ┌─────────────┐
 │ Statik  │       │  Data    │       │   App.tsx   │
 │ GeoJSON │──────▶│ Service  │──────▶│   (State)   │
 │ Dosyalar│ fetch │ .ts      │ parse │             │
 └─────────┘       └──────────┘       └──────┬──────┘
                                             │
                            ┌────────────────┼────────────────┐
                            │                │                │
                            ▼                ▼                ▼
                     ┌────────────┐   ┌────────────┐   ┌──────────┐
                     │  Sidebar   │   │    Map     │   │  Profile │
                     │  Paneller  │   │  Container │   │   Page   │
                     │            │   │            │   │          │
                     │ • Overview │   │ • Parsel   │   │ • Proje  │
                     │ • Olanaklar│   │ • POI'ler  │   │   bilgi  │
                     │ • Demografi│   │ • Alanlar  │   │   düzen. │
                     │ • Pazar    │   │ • Mahalle  │   │          │
                     │ • Strateji │   │ • Araçlar  │   │          │
                     └────────────┘   └────────────┘   └──────────┘
```

---

## 8. Mevcut Kısıtlamalar ve Gelecek Planları

### Mevcut Kısıtlamalar

| Kısıtlama | Açıklama |
|-----------|----------|
| Backend yok | Tüm veriler statik dosyalarda, API sunucusu bulunmuyor |
| Manuel parsel ekleme | Yeni parsel eklemek için GeoJSON dosyalarını elle düzenlemek gerekiyor |
| Veri kalıcılığı yok | ProfilePage üzerindeki düzenlemeler kaydedilmiyor |
| Tek proje odağı | Her kullanıcı oturumunda yalnızca bir `ada_parsel` görüntülenebilir |
| Sabit kullanıcı listesi | Kimlik doğrulama istemci tarafında, `users.ts` dosyasında tanımlı |

### Gelecek Geliştirme Alanları

- Backend API entegrasyonu (veri okuma/yazma)
- Veritabanı (parsel/proje depolama)
- Gerçek kimlik doğrulama sistemi
- UI üzerinden parsel ekleme formu
- Proje düzenlemelerinin kalıcı olarak kaydedilmesi
- Çoklu proje görüntüleme desteği

---

## 9. Yeni Bir Parsel Ekleme Kontrol Listesi

- [ ] `parsel360.geojson` dosyasına yeni Feature ekle
- [ ] `ada_parsel` alanının benzersiz olduğundan emin ol (format: `Ada_Parsel`)
- [ ] Parsel geometrisini (MultiPolygon koordinatları) doğru gir
- [ ] `olanaklar_poi_{ada_parsel}.geojson` dosyasını oluştur
- [ ] `service_area_{ada_parsel}.geojson` dosyasını oluştur (5/10/15 dk)
- [ ] `src/config/users.ts` dosyasına yeni kullanıcı tanımı ekle
- [ ] (Opsiyonel) Proje görseli ekle: `public/data/project_pics/{ada_parsel}.png`
- [ ] Uygulamayı yeniden derle: `npm run build`
- [ ] Tüm panellerde verinin doğru göründüğünü kontrol et
