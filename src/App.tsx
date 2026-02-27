import { useState, useEffect, useMemo } from 'react';
import LoginPage from './components/LoginPage';
import { useCompany } from './contexts/CompanyContext';
import { MainLayout } from './components/layout/MainLayout';
import { Sidebar, type TabId } from './components/layout/Sidebar';
import { MapContainer } from './components/features/map/MapContainer';
import { CapabilitiesView } from './components/features/panel/CapabilitiesView';
import { DemographicsView } from './components/features/panel/DemographicsView';
import { MarketIndexView } from './components/features/panel/MarketIndexView';
import { OverviewView } from './components/features/panel/OverviewView';
import { StrategyView } from './components/features/panel/StrategyView';
import { dataService } from './services/dataService';


function App() {
  // Kullanıcı ve proje bilgileri contextten alınır
  const { user, adaParsel, login, authReady } = useCompany();
  const [activeTab, setActiveTab] = useState<TabId>('capabilities');

  // Data State
  const [poiData, setPoiData] = useState<any[]>([]);
  const [boundaryData, setBoundaryData] = useState<any>(null);
  const [parcelData, setParcelData] = useState<any>(null);
  const [neighborhoodData, setNeighborhoodData] = useState<any>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Tüm veriler yüklendi mi?

  // Filter State
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all');
  const [walkingDistance, setWalkingDistance] = useState<number | null>(null); // 5, 10, 15 or null
  const [allServiceAreaData, setAllServiceAreaData] = useState<any>(null); // Tüm poligonlar

  // Load Data (adaParsel değişince)
  useEffect(() => {
    if (!adaParsel) return;
    
    setIsDataLoaded(false); // Yükleme başladı
    
    // Tüm verileri paralel yükle
    Promise.all([
      dataService.getMapBoundary(),
      dataService.getProjectParcel(adaParsel),
      dataService.getAllPois(adaParsel),
      dataService.getServiceArea(adaParsel),
      dataService.getNeighborhoodBoundaries()
    ]).then(([boundary, parcel, pois, serviceArea, neighborhoods]) => {
      setBoundaryData(boundary);
      setParcelData(parcel);
      setPoiData(pois);
      setAllServiceAreaData(serviceArea);
      setNeighborhoodData(neighborhoods);
      
      // Kısa bir gecikme ile haritayı göster (titreme önleme)
      setTimeout(() => setIsDataLoaded(true), 50);
    }).catch(console.error);
  }, [adaParsel]);

  // Service Area filtreleme (walkingDistance'a göre client-side)
  const filteredServiceArea = useMemo(() => {
    if (!allServiceAreaData?.features) return null;
    
    // walkingDistance null ise tüm poligonları göster
    if (walkingDistance === null) {
      return allServiceAreaData;
    }
    
    // Seçilen dakikaya göre filtrele (AA_MINS = 5, 10 veya 15)
    const filtered = allServiceAreaData.features.filter(
      (f: any) => f.properties?.AA_MINS === walkingDistance
    );
    
    return {
      ...allServiceAreaData,
      features: filtered
    };
  }, [allServiceAreaData, walkingDistance]);

  // Filter Logic
  const filteredData = useMemo(() => {
    // 1. Filter by Main Category (unless 'all' is selected)
    let catFiltered = activeCategory === 'all' 
      ? poiData 
      : poiData.filter(f => f.properties?._category === activeCategory);

    // 2. Filter by Walking Distance (if selected)
    if (walkingDistance !== null) {
      const minuteKey = `minute${walkingDistance}`;
      catFiltered = catFiltered.filter(f => f.properties?.[minuteKey] === 1);
    }

    // 3. Filter by Sub Category (if not 'all')
    if (activeSubCategory !== 'all') {
      catFiltered = catFiltered.filter(f => {
        const subCat = f.properties?.alt_kategori || f.properties?.kategori_app || f.properties?.kategori_a || '';
        return subCat === activeSubCategory;
      });
    }

    // 4. Always sort by distance (closest first)
    catFiltered.sort((a, b) => {
      const distA = Number(a.properties?.parsel_uzaklik || 0);
      const distB = Number(b.properties?.parsel_uzaklik || 0);
      return distA - distB;
    });

    return catFiltered;

  }, [poiData, activeCategory, activeSubCategory, walkingDistance]);

  // Extract Sub Categories for current Main Category
  const subCategories = useMemo(() => {
    const catFiltered = poiData.filter(f => f.properties?._category === activeCategory);
    const subs = new Set(catFiltered.map(f => f.properties?.alt_kategori || f.properties?.kategori_app || f.properties?.kategori_a).filter(Boolean));
    return Array.from(subs) as string[];
  }, [poiData, activeCategory]);

  // Handler for Category Change (reset sub-category)
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setActiveSubCategory('all');
  };



  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'capabilities':
        return (
          <CapabilitiesView
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            activeSubCategory={activeSubCategory}
            onSubCategoryChange={setActiveSubCategory}
            subCategories={subCategories}
            poiList={filteredData}
            walkingDistance={walkingDistance}
            onWalkingDistanceChange={setWalkingDistance}
          />
        );
      case 'demographics':
        return <DemographicsView />;
      case 'market':
        return <MarketIndexView />;
      case 'strategy':
        return <StrategyView />;
      default:
        return null;
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <MainLayout
      sidebar={
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} parcelData={parcelData}>
          {/* Proje bilgisi üstte gösterilir - Firma adı parsel360.geojson'dan gelir */}
          <div className="px-4 py-2 text-center border-b border-blue-100 dark:border-gray-700 mb-2">
            <div className="text-blue-700 dark:text-blue-300 font-semibold">
              {parcelData?.features?.[0]?.properties?.firma_adi?.toString().trim() || user.firmaAdi || 'Proje'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Ada/Parsel: {user.adaParsel?.replace('_', '/')}</div>
          </div>
          {renderContent()}
        </Sidebar>
      }
      map={
        isDataLoaded ? (
          <MapContainer
            data={filteredData}
            boundary={boundaryData}
            projectParcel={parcelData}
            serviceArea={filteredServiceArea}
            neighborhoods={neighborhoodData}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Harita yükleniyor...</p>
            </div>
          </div>
        )
      }
    />
  );
}

export default App;
