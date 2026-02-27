import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { MapContainer as PacketMapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, DivIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import projectMarkerSvg from '../../../project-marker.svg?raw';
import {
    Bus, Train, Ship, School, Hospital, Leaf, ShoppingBag,
    Coffee, Music, Theater, Home, MapPin, Building2, Layers, Footprints
} from 'lucide-react';
import { MapTools } from './MapTools';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Neon glow animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .service-area-glow {
    filter: drop-shadow(0 0 8px rgba(0, 255, 65, 0.6)) drop-shadow(0 0 12px rgba(0, 255, 65, 0.4));
    animation: neonPulse 2s ease-in-out infinite;
    animation-delay: 0.5s; /* İlk yüklemede gecikme */
  }
  
  @keyframes neonPulse {
    0%, 100% {
      stroke-opacity: 0.8;
      filter: drop-shadow(0 0 8px rgba(0, 255, 65, 0.6)) drop-shadow(0 0 12px rgba(0, 255, 65, 0.4));
    }
    50% {
      stroke-opacity: 1;
      filter: drop-shadow(0 0 15px rgba(0, 255, 65, 0.8)) drop-shadow(0 0 25px rgba(0, 255, 65, 0.6));
    }
  }

    .mahalle-label {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        color: #9CA3AF !important;
        font-size: 10px !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        padding: 0 !important;
    }

    .leaflet-tooltip.mahalle-label:before {
        border: none !important;
    }
    
    /* İlk yüklemede Leaflet animasyonlarını devre dışı bırak */
    .leaflet-fade-anim .leaflet-tile,
    .leaflet-zoom-anim .leaflet-zoom-animated {
        will-change: auto !important;
    }
    
    .leaflet-container {
        background: transparent;
    }
`;
document.head.appendChild(styleSheet);

// Fix for default marker icon in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface MapContainerProps {
    data: any[];
    boundary?: any;
    projectParcel?: any;
    serviceArea?: any;
    neighborhoods?: any;
}

// Icon Mapping Strategy (Smaller Icons)
const getIconForFeature = (feature: any) => {
    // Combine all potential category fields for robust matching
    // The new data uses 'kategori' and 'alt_kategori', while old data used 'kategori_a'/'kategori_app'
    const props = feature.properties || {};
    const category = [
        props.kategori,
        props.alt_kategori,
        props.kategori_a,
        props.kategori_app
    ].filter(Boolean).join(' ');

    let IconComponent = MapPin;
    let colorClass = 'bg-gray-500';
    let glowColor = 'rgba(107, 114, 128, 0.6)';

    // Determine Icon and Color based on category string analysis
    if (category) {
        const catLower = category.toLowerCase();

        if (catLower.includes('deniz') || catLower.includes('vapur')) {
            IconComponent = Ship;
            colorClass = 'bg-blue-500';
            glowColor = 'rgba(59, 130, 246, 0.6)';
        } else if (catLower.includes('otobüs') || catLower.includes('iett')) {
            IconComponent = Bus;
            colorClass = 'bg-orange-500';
            glowColor = 'rgba(249, 115, 22, 0.6)';
        } else if (catLower.includes('metro') || catLower.includes('raylı') || catLower.includes('marmaray')) {
            IconComponent = Train;
            colorClass = 'bg-purple-600';
            glowColor = 'rgba(147, 51, 234, 0.6)';
        } else if (catLower.includes('okul') || catLower.includes('eğitim') || catLower.includes('lise')) {
            IconComponent = School;
            colorClass = 'bg-yellow-500';
            glowColor = 'rgba(234, 179, 8, 0.6)';
        } else if (catLower.includes('hastane') || catLower.includes('sağlık') || catLower.includes('eczane')) {
            IconComponent = Hospital;
            colorClass = 'bg-red-500';
            glowColor = 'rgba(239, 68, 68, 0.6)';
        } else if (catLower.includes('park') || catLower.includes('bahçe') || catLower.includes('yeşil')) {
            IconComponent = Leaf;
            colorClass = 'bg-green-500';
            glowColor = 'rgba(34, 197, 94, 0.6)';
        } else if (catLower.includes('avm') || catLower.includes('market') || catLower.includes('alışveriş')) {
            IconComponent = ShoppingBag;
            colorClass = 'bg-pink-500';
            glowColor = 'rgba(236, 72, 153, 0.6)';
        } else if (catLower.includes('kafe') || catLower.includes('restoran')) {
            IconComponent = Coffee;
            colorClass = 'bg-amber-700';
            glowColor = 'rgba(180, 83, 9, 0.6)';
        } else if (catLower.includes('kültür') || catLower.includes('sanat') || catLower.includes('tiyatro')) {
            IconComponent = Theater;
            colorClass = 'bg-indigo-500';
            glowColor = 'rgba(99, 102, 241, 0.6)';
        } else if (catLower.includes('müzik') || catLower.includes('konser')) {
            IconComponent = Music;
            colorClass = 'bg-indigo-500';
            glowColor = 'rgba(99, 102, 241, 0.6)';
        } else if (catLower.includes('konut') || catLower.includes('site')) {
            IconComponent = Home;
            colorClass = 'bg-teal-500';
            glowColor = 'rgba(20, 184, 166, 0.6)';
        }
    }

    // Small size: w-4 h-4 and icon size 8
    const iconHtml = renderToStaticMarkup(
        <div className={`relative flex items-center justify-center`}>
            <div className={`w-4 h-4 rounded-full ${colorClass} text-white flex items-center justify-center shadow-[0_0_4px_${glowColor}] border border-white/80`}>
                <IconComponent size={8} strokeWidth={2.5} />
            </div>
            {/* Pulse Effect */}
            <div className={`absolute -inset-0.5 rounded-full ${colorClass} opacity-25 animate-pulse`}></div>
        </div>
    );

    return new DivIcon({
        className: 'bg-transparent',
        html: iconHtml,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10]
    });
};

// Helper component to control map focus
const MapFocusController = ({ center, trigger }: { center: [number, number], trigger: number }) => {
    const map = useMap();
    React.useEffect(() => {
        if (trigger > 0) {
            map.flyTo(center, 16, { animate: true, duration: 1.5 });
        }
    }, [trigger, center, map]);
    return null;
};

// Initial fit to project parcel bounds
const MapInitialFit = ({ projectParcel }: { projectParcel?: any }) => {
    const map = useMap();
    const hasFit = React.useRef(false);

    React.useEffect(() => {
        if (!hasFit.current && projectParcel) {
            try {
                const bounds = L.geoJSON(projectParcel).getBounds();
                if (bounds.isValid()) {
                    // animate: false - ilk yüklemede titreme olmasın
                    map.fitBounds(bounds, { padding: [40, 40], animate: false });
                    hasFit.current = true;
                }
            } catch (error) {
                console.error('Map initial fit failed:', error);
            }
        }
    }, [projectParcel, map]);

    return null;
};

export const MapContainer = ({ data, boundary, projectParcel, serviceArea, neighborhoods }: MapContainerProps) => {
    // Standard default center
    const defaultCenter: [number, number] = [41.025, 29.015];
    
    // İlk render kontrolü - animasyonları geciktir
    const [isReady, setIsReady] = React.useState(false);
    React.useEffect(() => {
        // İlk render sonrası animasyonları etkinleştir
        const timer = setTimeout(() => setIsReady(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Dynamically calculate center if projectParcel is available
    const center = React.useMemo(() => {
        if (projectParcel && projectParcel.features && projectParcel.features.length > 0) {
            const firstFeature = projectParcel.features[0];
            if (firstFeature.geometry.type === 'Point') {
                const [lng, lat] = firstFeature.geometry.coordinates;
                return [lat, lng] as [number, number];
            } else if (firstFeature.geometry.type === 'Polygon' || firstFeature.geometry.type === 'MultiPolygon') {
                // Simplified center calculation for polygon
                const coords = firstFeature.geometry.type === 'Polygon'
                    ? firstFeature.geometry.coordinates[0]
                    : firstFeature.geometry.coordinates[0][0];

                let sumLat = 0, sumLng = 0;
                coords.forEach((c: any) => { sumLng += c[0]; sumLat += c[1]; });
                return [sumLat / coords.length, sumLng / coords.length] as [number, number];
            }
        }
        return defaultCenter;
    }, [projectParcel]);
    const [legendOpen, setLegendOpen] = React.useState(false);
    const [serviceAreaVisible, setServiceAreaVisible] = React.useState(true);
    const [activeTool, setActiveTool] = React.useState<string | null>(null);
    const [measurePoints, setMeasurePoints] = React.useState<[number, number][]>([]);
    const [focusTrigger, setFocusTrigger] = React.useState(0);
    const { theme } = useTheme();

    // Debug service area loading
    React.useEffect(() => {
        console.log('Service Area Data:', serviceArea);
    }, [serviceArea]);

    const MeasureLayer = () => {
        useMapEvents({
            click(e) {
                if (activeTool === 'measure' || activeTool === 'area') {
                    setMeasurePoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
                }
            },
        });

        if (measurePoints.length === 0) return null;

        return (
            <>
                {measurePoints.map((pos, i) => (
                    <Marker
                        key={i}
                        position={pos}
                        icon={new L.DivIcon({
                            className: 'bg-white border-2 border-blue-600 w-2 h-2 rounded-full',
                            iconSize: [8, 8],
                            iconAnchor: [4, 4]
                        })}
                    />
                ))}
                {activeTool === 'measure' && measurePoints.length > 1 && (
                    <GeoJSON
                        key={`line-${measurePoints.length}`}
                        data={{
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: measurePoints.map(p => [p[1], p[0]])
                            },
                            properties: {}
                        } as GeoJSON.Feature<GeoJSON.Geometry>}
                        style={{ color: '#2563EB', weight: 4, dashArray: '5, 5' }}
                    />
                )}
                {activeTool === 'area' && measurePoints.length > 2 && (
                    <GeoJSON
                        key={`poly-${measurePoints.length}`}
                        data={{
                            type: 'Feature',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [[...measurePoints.map(p => [p[1], p[0]]), [measurePoints[0][1], measurePoints[0][0]]]]
                            },
                            properties: {}
                        } as GeoJSON.Feature<GeoJSON.Geometry>}
                        style={{ color: '#2563EB', weight: 2, fillColor: '#3B82F6', fillOpacity: 0.2 }}
                    />
                )}

                {/* Measurement Overlay */}
                {measurePoints.length > 1 && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-xl shadow-2xl border border-blue-500/30 text-xs font-bold pointer-events-auto">
                            <span className="text-blue-600 dark:text-blue-400">
                                {activeTool === 'measure' ? 'Mesafe: ' : 'Yaklaşık Alan: '}
                                {activeTool === 'measure'
                                    ? `${measurePoints.reduce((acc, p, i) => i === 0 ? 0 : acc + L.latLng(p).distanceTo(L.latLng(measurePoints[i - 1])), 0).toFixed(0)} m`
                                    : `${(L.latLng(measurePoints[0]).distanceTo(L.latLng(measurePoints[1])) * 2).toFixed(0)} m²`
                                }
                            </span>
                        </div>
                    </div>
                )}
            </>
        );
    };

    const handleClear = () => {
        setMeasurePoints([]);
        setActiveTool(null);
    };

    return (
        <div className="absolute inset-0 z-0 bg-gray-100 dark:bg-gray-800 light:bg-gray-100">
            <PacketMapContainer
                center={center}
                zoom={14}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
                zoomControl={false}
                fadeAnimation={false}
                zoomAnimation={false}
                markerZoomAnimation={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={theme === 'dark'
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    }
                />

                <MapFocusController center={center} trigger={focusTrigger} />
                <MapInitialFit projectParcel={projectParcel} />

                {/* Boundary Layer */}
                {boundary && (
                    <GeoJSON
                        data={boundary}
                        style={{
                            color: '#F59E0B', // Colorful outline (Amber-500)
                            weight: 3,
                            fillOpacity: 0,
                            fillColor: 'transparent',
                            dashArray: '5, 5'
                        }}
                    />
                )}

                {/* Neighborhood Boundaries */}
                {neighborhoods && (
                    <GeoJSON
                        data={neighborhoods}
                        style={{
                            color: '#9CA3AF',
                            weight: 1,
                            fillOpacity: 0,
                            fillColor: 'transparent'
                        }}
                        onEachFeature={(feature, layer) => {
                            const name = feature?.properties?.MAHALLEADI || feature?.properties?.Mahalle || feature?.properties?.NAME;
                            if (name && layer instanceof L.Path) {
                                layer.bindTooltip(String(name), {
                                    permanent: true,
                                    direction: 'center',
                                    className: 'mahalle-label',
                                    opacity: 0.9
                                });
                            }
                        }}
                    />
                )}

                {/* Project Parcel Layer */}
                {projectParcel && (
                    <GeoJSON
                        data={projectParcel}
                        style={{
                            color: '#3B82F6', // Primary Blue
                            weight: 3,
                            fillOpacity: 0.4,
                            fillColor: '#3B82F6',
                        }}
                    >
                        <Popup><span className="font-bold">Proje Parseli</span></Popup>
                    </GeoJSON>
                )}

                {/* Service Area Layers (5, 10, 15 min walking) */}
                {serviceAreaVisible && serviceArea && serviceArea.features && (
                    <React.Fragment key={`service-area-group-${serviceArea.features.map((f: any) => f.properties?.AA_MINS).join('-')}`}>
                        {serviceArea.features.map((feature: any, idx: number) => {
                            const mins = feature.properties?.AA_MINS || 15;
                            // Neon yeşil (LED gibi parlak) - 5'e doğru gittikçe daha doygun, 15'e doğru gittikçe daha soluk
                            let color = '#39FF14'; // Neon yeşil soluk
                            let fillOpacity = 0.12;

                            if (mins === 5) {
                                color = '#00FF41'; // En parlak neon yeşil
                                fillOpacity = 0.25;
                            } else if (mins === 10) {
                                color = '#2FFF00'; // Orta neon yeşil
                                fillOpacity = 0.18;
                            } else if (mins === 15) {
                                color = '#39FF14'; // Soluk neon yeşil
                                fillOpacity = 0.12;
                            }

                            return (
                                <GeoJSON
                                    key={`service-area-${mins}-${idx}`}
                                    data={feature}
                                    style={{
                                        color: color,
                                        weight: 3,
                                        fillColor: color,
                                        fillOpacity: fillOpacity,
                                        dashArray: 'none',
                                        lineCap: 'round',
                                        lineJoin: 'round'
                                    }}
                                    /* onEachFeature may be passed as a separate prop rather than inside eventHandlers */
                                    onEachFeature={(feature: any, layer: any) => {
                                        // Animasyonlu glow efekti için custom class ekle
                                        if (layer instanceof L.Path) {
                                            layer.setStyle({
                                                className: `service-area-glow service-area-glow-${mins}`
                                            });
                                        }
                                    }}
                                >
                                    <Popup>
                                        <span className="font-bold text-sm">{mins} Dakika Yürüme Mesafesi</span>
                                    </Popup>
                                </GeoJSON>
                            );
                        })}
                    </React.Fragment>
                )}

                {/* Visual Highlight for Project Area (Fixed position or parcel center) */}
                <Marker
                    position={center}
                    icon={new DivIcon({
                        className: 'bg-transparent',
                        html: projectMarkerSvg,
                        iconSize: [38, 38],
                        iconAnchor: [19, 32],
                        popupAnchor: [0, -32]
                    })}
                >
                    <Popup><span className="font-bold">Proje Alanı</span></Popup>
                </Marker>

                {/* Render Filtered POIs */}
                {data.map((feature, idx) => {
                    // Check for valid coordinates (Point type)
                    if (feature.geometry?.type !== 'Point' || !feature.geometry.coordinates) return null;
                    const [lng, lat] = feature.geometry.coordinates;

                    return (
                        <Marker
                            key={idx}
                            position={[lat, lng]}
                            icon={getIconForFeature(feature)}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h5 className="font-semibold text-xs mb-1">{feature.properties?.adi || feature.properties?.ad || 'Bilinmeyen Nokta'}</h5>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                        {feature.properties?.kategori || feature.properties?.alt_kategori || feature.properties?.kategori_a || feature.properties?.kategori_app || 'Genel'}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                <MeasureLayer />

            </PacketMapContainer>

            {/* Map Tools */}
            <MapTools
                activeTool={activeTool}
                onToolSelect={setActiveTool}
                onClear={handleClear}
                onFocus={() => setFocusTrigger(prev => prev + 1)}
            />

            {/* Service Area Toggle Button - Top Left */}
            <div className="absolute top-6 left-6 z-[1000]">
                <button
                    onClick={() => setServiceAreaVisible(!serviceAreaVisible)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl shadow-2xl border transition-all backdrop-blur-xl ${
                        serviceAreaVisible
                            ? 'bg-[#13f287]/90 text-black border-[#13f287]'
                            : 'bg-white/80 dark:bg-slate-900/70 text-gray-700 dark:text-white border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-900/80'
                    }`}
                >
                    <Footprints size={28} />
                    <span className="text-[10px] font-bold">Yürüme Mesafesi</span>
                </button>
            </div>

            {/* Collapsible Legend - Toggle Button */}
            <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
                <div className="pointer-events-auto">
                    {/* Toggle Button */}
                    {!legendOpen && (
                        <button
                            onClick={() => setLegendOpen(true)}
                            className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl px-4 py-3 rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-900/80 transition-all text-gray-700 dark:text-white font-semibold text-sm"
                        >
                            <Layers size={18} />
                            Lejant
                        </button>
                    )}

                    {/* Legend Panel */}
                    {legendOpen && (
                        <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-xs w-64">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-white/10 pb-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Harita Lejantı</h4>
                                <button
                                    onClick={() => setLegendOpen(false)}
                                    className="text-gray-400 dark:text-white/60 hover:text-gray-600 dark:hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 p-1.5 rounded-lg transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md border border-white/20">
                                        <Building2 size={12} />
                                    </div>
                                    <span className="text-gray-700 dark:text-white font-medium">Proje Alanı</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-orange-500/10 p-1.5 rounded-lg transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md border border-orange-400/30">
                                        <Bus size={12} />
                                    </div>
                                    <span className="text-white">Toplu Taşıma</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-blue-500/10 p-1.5 rounded-lg transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md border border-blue-400/30">
                                        <Ship size={12} />
                                    </div>
                                    <span className="text-white">Deniz Ulaşımı</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-yellow-500/10 p-1.5 rounded-lg transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-md border border-yellow-400/30">
                                        <School size={12} />
                                    </div>
                                    <span className="text-white">Eğitim</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md border border-red-400/30">
                                        <Hospital size={12} />
                                    </div>
                                    <span className="text-white">Sağlık</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-indigo-500/10 p-1.5 rounded-lg transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md border border-indigo-400/30">
                                        <Theater size={12} />
                                    </div>
                                    <span className="text-white">Sosyal</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-teal-500/10 p-1.5 rounded-lg transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-md border border-teal-400/30">
                                        <Home size={12} />
                                    </div>
                                    <span className="text-gray-600 dark:text-white">Yaşam/Konut</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-green-500/10 p-1.5 rounded-lg transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow-md border border-green-400/30">
                                        <Leaf size={12} />
                                    </div>
                                    <span className="text-gray-600 dark:text-white">Yeşil Alan</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};
