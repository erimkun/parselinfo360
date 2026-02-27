/**
 * Parsel360+ Centralized Data Service
 * 
 * Bu servis tüm veri çekme işlemlerini yönetir.
 * Production ortamında bu metodlar gerçek API endpoint'lerini çağıracak.
 * 
 * ============================================================================
 * VERİ MİMARİSİ
 * ============================================================================
 * 
 * Veri İlişkileri:
 * ┌─────────────────┐
 * │  PARSEL         │ ← Ana tablo (ada_parsel primary key)
 * │  (proje bilgisi)│   Proje künye bilgileri, firma adı, mahalle adı içerir
 * └────────┬────────┘
 *          │ ada_parsel
 *          ▼
 * ┌─────────────────┐     ┌─────────────────┐
 * │  POI (Olanaklar)│     │  SERVICE AREA   │
 * │  (noktalar)     │     │  (poligonlar)   │
 * └─────────────────┘     └─────────────────┘
 *          │                       │
 *          └───────────┬───────────┘
 *                      │ ada_parsel ile filtrelenir
 *                      ▼
 * ┌─────────────────────────────────────────┐
 * │  MAHALLE VERİLERİ                       │
 * │  (demografi, endeks, senaryo kartları)  │
 * │  → mahalle adı veya UAVT ile ilişkili   │
 * └─────────────────────────────────────────┘
 * 
 * Filtreleme Mantığı:
 * 1. Kullanıcı giriş yapar → ada_parsel belirlenir
 * 2. Parsel verisi ada_parsel ile filtrelenir
 * 3. POI ve Service Area verileri ada_parsel ile filtrelenir
 * 4. Mahalle verileri parseldeki mahalle adı ile ilişkilendirilir
 * 
 * ============================================================================
 */

// --- Types ---

// GeoJSON Feature için basit tip tanımı
interface GeoJSONFeature {
    type: 'Feature';
    properties: Record<string, unknown>;
    geometry: {
        type: string;
        coordinates: unknown;
    };
}

interface GeoJSONCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}

export interface ProjectOverview {
    id: string;
    name: string;
    address: string;
    coordinates: [number, number];
    type: string;
    deliveryDate: string;
    totalUnits: string;
    landArea: string;
    description: string;
    tags: string[];
    parcelInfo: {
        adaParsel: string;
        tapuAlani: string;
        imarDurumu: string;
    };
    image?: string;
    firmaAdi?: string;
}

export interface DemographicsData {
    population: string;
    avgHousehold: string;
    sesGroup: string;
    ageDistribution: { name: string; value: number }[];
    genderDistribution: { name: string; value: number }[];
}

export interface MarketData {
    avgSalesPrice: string;
    salesGrowth: string;
    avgRentPrice: string;
    rentGrowth: string;
    priceTrends: { year: string; sales: number; rent: number }[];
    inventory: { type: string; sale: number; rent: number }[];
}

// --- Mock Data ---

// MOCK verisi kaldırıldı - artık parsel360.geojson'dan dinamik olarak alınıyor

const MOCK_DEMOGRAPHICS: DemographicsData = {
    population: '15.420',
    avgHousehold: '2.8',
    sesGroup: 'A/B',
    ageDistribution: [
        { name: '0-14', value: 18 },
        { name: '15-24', value: 14 },
        { name: '25-44', value: 35 },
        { name: '45-64', value: 22 },
        { name: '65+', value: 11 },
    ],
    genderDistribution: [
        { name: 'Kadın', value: 52 },
        { name: 'Erkek', value: 48 },
    ]
};

const MOCK_MARKET: MarketData = {
    avgSalesPrice: '110.000 ₺',
    salesGrowth: '%29.4',
    avgRentPrice: '800 ₺',
    rentGrowth: '%77.8',
    priceTrends: [
        { year: '2019', sales: 45000, rent: 180 },
        { year: '2020', sales: 52000, rent: 210 },
        { year: '2021', sales: 68000, rent: 290 },
        { year: '2022', sales: 85000, rent: 450 },
        { year: '2023', sales: 110000, rent: 800 },
    ],
    inventory: [
        { type: '1+1', sale: 24, rent: 45 },
        { type: '2+1', sale: 18, rent: 32 },
        { type: '3+1', sale: 12, rent: 15 },
        { type: '4+1', sale: 5, rent: 8 },
    ]
};

// --- Service ---

export const dataService = {
    // Current Project - Parsel360 katmanından dinamik olarak alınır
    getProjectOverview: async (adaParsel: string): Promise<ProjectOverview | null> => {
        try {
            const res = await fetch('/data/proje/parsel360.geojson');
            const data = await res.json() as GeoJSONCollection;
            
            // ada_parsel ile feature bul
            const feature = data.features.find((f: GeoJSONFeature) => 
                f.properties.ada_parsel === adaParsel || 
                f.properties.ADA_PARSEL === adaParsel
            );
            
            if (!feature) {
                console.error('Parsel bulunamadı:', adaParsel);
                return null;
            }
            
            const props = feature.properties;
            
            // GeoJSON verilerinden ProjectOverview oluştur
            return {
                id: String(props.ada_parsel || `${props.Ada}_${props.parsel}`),
                name: String(props.Name || `${props.Mahalle} Mahallesi ${props.Ada}-ada-${props.parsel}-parsel`),
                address: `${props.Mahalle}, ${props.ilce}`,
                coordinates: [41.004, 29.050], // Geometri merkezinden hesaplanabilir
                type: String(props.proje_tipi || props.Nitelik || 'Konut'),
                deliveryDate: String(props.teslim_tarihi || 'Belirtilmemiş'),
                totalUnits: String(props.toplam_konut || 'Belirtilmemiş'),
                landArea: `${props.Alan} m²`,
                description: String(props.proje_nitelik || `${props.Mahalle} Mahallesi'nde ${props.Alan} m² arsa alanına sahip ${props.Nitelik} nitelikli parsel.`),
                tags: props.proje_nitelik ? String(props.proje_nitelik).split(',').map(s => s.trim()) : ['Konut'],
                parcelInfo: {
                    adaParsel: `${props.Ada} / ${props.parsel}`,
                    tapuAlani: `${props.Alan} m²`,
                    imarDurumu: String(props.Nitelik || 'Konut')
                },
                image: `/data/project_pics/${props.ada_parsel}.png`,
                // Ek firma bilgisi
                firmaAdi: String(props.firma_adi || '').trim()
            };
        } catch (error) {
            console.error('Error fetching project overview:', error);
            return null;
        }
    },

    // Demographics
    getDemographics: async (): Promise<DemographicsData> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_DEMOGRAPHICS), 600);
        });
    },

    // Market Info
    getMarketData: async (): Promise<MarketData> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_MARKET), 700);
        });
    },

    getInvestmentData: async () => {
        try {
            const res = await fetch('/data/mahalle/mahalle_endeks.geojson');
            const data = await res.json();
            return data.features;
        } catch (error) {
            console.error('Error fetching investment data:', error);
            return [];
        }
    },

    getScenarioCardData: async () => {
        try {
            const res = await fetch('/data/mahalle/mahalle_senaryo_kartlari.geojson');
            const data = await res.json();
            return data.features;
        } catch (error) {
            console.error('Error fetching scenario card data:', error);
            return [];
        }
    },

    // Spatial Data
    getMapBoundary: async () => {
        const res = await fetch('/data/mahalle/uskudar_sinir.geojson');
        return res.json();
    },

    // Kullanıcıya özel: ada_parsel parametresi ile parsel360 katmanından al
    // Parsel verisi: ada_parsel ile tek tablodan çekilir
    getProjectParcel: async (adaParsel: string) => {
        try {
            const res = await fetch('/data/proje/parsel360.geojson');
            const data = await res.json() as GeoJSONCollection;
            // ada_parsel ile filtreleme
            const feature = data.features.find((f: GeoJSONFeature) => 
                f.properties.ada_parsel === adaParsel || 
                f.properties.ADA_PARSEL === adaParsel
            );
            return feature ? { type: 'FeatureCollection', features: [feature] } : data;
        } catch (error) {
            console.error('Error fetching parcel data:', error);
            return { type: 'FeatureCollection', features: [] };
        }
    },

    getPoisByCategory: async (category: string) => {
        // Map internal category names (English) to the GeoJSON 'kategori' property (Turkish)
        const categoryMap: Record<string, string> = {
            transport: 'Ulaşım',
            health: 'Sağlık',
            education: 'Eğitim',
            life: 'Yaşam',
            social: 'Sosyal&Kültürel'
        };

        const targetCategory = categoryMap[category];
        if (!targetCategory) return { type: 'FeatureCollection', features: [] };

        try {
            const res = await fetch('/data/proje/olanaklar_poi_1101_8.geojson');
            const data = await res.json() as GeoJSONCollection;

            // Filter features by the matched Turkish category name
            const filteredFeatures = data.features.filter((f: GeoJSONFeature) =>
                f.properties.kategori === targetCategory
            );

            return {
                ...data,
                features: filteredFeatures
            };
        } catch (error) {
            console.error('Error fetching POI data:', error);
            return { type: 'FeatureCollection', features: [] };
        }
    },

    // Olanaklar: ada_parsel ile tek tablodan çekilir
    // Veri içinde ada_parsel alanı varsa filtrelenir
    getAllPois: async (adaParsel: string) => {
        try {
            const res = await fetch('/data/proje/olanaklar_poi_1101_8.geojson');
            const data = await res.json() as GeoJSONCollection;

            // Map the Turkish 'kategori' back to our internal English IDs for coloring/logic
            const reverseMap: Record<string, string> = {
                'Ulaşım': 'transport',
                'Sağlık': 'health',
                'Eğitim': 'education',
                'Yaşam': 'life',
                'Sosyal&Kültürel': 'social'
            };

            // ada_parsel ile filtrele (veri içinde ada_parsel alanı varsa)
            let filteredFeatures = data.features;
            if (adaParsel && data.features.some((f: GeoJSONFeature) => f.properties.ada_parsel)) {
                filteredFeatures = data.features.filter((f: GeoJSONFeature) => 
                    f.properties.ada_parsel === adaParsel || 
                    f.properties.ADA_PARSEL === adaParsel
                );
            }

            const features = filteredFeatures.map((f: GeoJSONFeature) => {
                const turkCat = f.properties.kategori as string;
                const engCat = reverseMap[turkCat] || 'other';
                return {
                    ...f,
                    properties: { ...f.properties, _category: engCat }
                };
            });

            return features;
        } catch (error) {
            console.error('Error fetching all POIs:', error);
            return [];
        }
    },

    getDemographicsData: async () => {
        try {
            const res = await fetch('/data/mahalle/mahalle_demografi.geojson');
            const data = await res.json();
            return data.features;
        } catch (error) {
            console.error('Error fetching demographics data:', error);
            return [];
        }
    },

    getNeighborhoodBoundaries: async () => {
        try {
            const res = await fetch('/data/mahalle/mahalle_demografi.geojson');
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching neighborhood boundaries:', error);
            return { type: 'FeatureCollection', features: [] };
        }
    },

    // Service area: ada_parsel ile filtrelenir
    // Veri içinde ada_parsel alanı varsa filtrelenir
    getServiceArea: async (adaParsel: string, aaMins?: number) => {
        try {
            const res = await fetch('/data/proje/service_area_1101_8.geojson');
            if (!res.ok) {
                console.error('Service area fetch failed:', res.status, res.statusText);
                return { type: 'FeatureCollection', features: [] };
            }
            const data = await res.json() as GeoJSONCollection;
            
            // ada_parsel ile filtrele (veri içinde ada_parsel alanı varsa)
            let filteredFeatures = data.features;
            if (adaParsel && data.features.some((f: GeoJSONFeature) => f.properties.ada_parsel)) {
                filteredFeatures = data.features.filter((f: GeoJSONFeature) => 
                    f.properties.ada_parsel === adaParsel || 
                    f.properties.ADA_PARSEL === adaParsel
                );
            }
            
            // aa_mins parametresi varsa ek filtre uygula
            if (aaMins !== undefined) {
                filteredFeatures = filteredFeatures.filter((f: GeoJSONFeature) => 
                    f.properties.AA_MINS === aaMins
                );
            }
            
            console.log('Service area loaded:', filteredFeatures.length, 'features');
            return { ...data, features: filteredFeatures };
        } catch (error) {
            console.error('Error fetching service area data:', error);
            return { type: 'FeatureCollection', features: [] };
        }
    }
};
