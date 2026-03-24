import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Deck, MapView } from '@deck.gl/core';
import { TripsLayer } from '@deck.gl/geo-layers';
import { ScatterplotLayer, PathLayer, TextLayer } from '@deck.gl/layers';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCompany } from '../../../contexts/CompanyContext';
import { cn } from '../../../lib/utils';

interface Route {
    id: number;
    name: string;
    path: [number, number][];
    color: [number, number, number];
    is_far: boolean;
    distance_km: number;
    duration_min: number;
}

interface TripLayerOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const START_POINT: [number, number] = [29.050130242117007, 41.00414011897135];

// Convert Leaflet zoom to Deck.gl zoom (Leaflet is 1 level higher)
const leafletToDeckZoom = (leafletZoom: number) => leafletZoom - 1;

export const TripLayerOverlay: React.FC<TripLayerOverlayProps> = ({ isOpen, onClose }) => {
    const map = useMap();
    const { theme } = useTheme();
    const { adaParsel } = useCompany();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deckRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);

    const [routes, setRoutes] = useState<Route[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isZooming, setIsZooming] = useState(false);

    // Load routes data based on active ada_parsel
    useEffect(() => {
        if (isOpen && adaParsel) {
            const formattedAdaParsel = adaParsel.replace('_', '-');

            fetch('/data/proje/trip_layers.json')
                .then(res => res.json())
                .then(data => {
                    const parcelData = data?.parsels?.[formattedAdaParsel];
                    if (parcelData && parcelData.trips) {
                        setRoutes(parcelData.trips);
                    } else {
                        console.warn(`No trip routes found for ada_parsel: ${formattedAdaParsel}`);
                        setRoutes([]);
                    }
                })
                .catch(console.error);
        }
        // Re-enable scroll wheel zoom when panel closes
        return () => {
            map.scrollWheelZoom.enable();
        };
    }, [isOpen, map, adaParsel]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getViewState = useCallback(() => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        return {
            longitude: center.lng,
            latitude: center.lat,
            zoom: leafletToDeckZoom(zoom),
            pitch: 0,
            bearing: 0
        };
    }, [map]);

    // Sync Deck.gl with Leaflet map - direct update without requestAnimationFrame
    const syncDeckWithLeaflet = useCallback(() => {
        if (!deckRef.current) return;
        deckRef.current.setProps({ viewState: getViewState() });
    }, [getViewState]);

    // Initialize Deck.gl
    useEffect(() => {
        if (!isOpen || !containerRef.current) return;

        const container = containerRef.current;

        deckRef.current = new Deck({
            parent: container,
            views: new MapView({ repeat: true }),
            initialViewState: getViewState(),
            controller: false,
            layers: [],
            style: { position: 'absolute', top: '0', left: '0' },
            useDevicePixels: true,
            _animate: false
        });

        // Zoom start - hide deck.gl to prevent jitter
        const onZoomStart = () => {
            setIsZooming(true);
        };

        // Zoom end - show deck.gl and sync
        const onZoomEnd = () => {
            setIsZooming(false);
            syncDeckWithLeaflet();
        };

        // Listen to move events for continuous sync
        map.on('move', syncDeckWithLeaflet);
        map.on('moveend', syncDeckWithLeaflet);
        map.on('zoomstart', onZoomStart);
        map.on('zoomend', onZoomEnd);
        map.on('viewreset', syncDeckWithLeaflet);

        // Initial sync
        syncDeckWithLeaflet();

        return () => {
            map.off('move', syncDeckWithLeaflet);
            map.off('moveend', syncDeckWithLeaflet);
            map.off('zoomstart', onZoomStart);
            map.off('zoomend', onZoomEnd);
            map.off('viewreset', syncDeckWithLeaflet);
            if (deckRef.current) {
                deckRef.current.finalize();
                deckRef.current = null;
            }
        };
    }, [isOpen, map, getViewState, syncDeckWithLeaflet]);

    // Animation loop - 60fps like original HTML
    useEffect(() => {
        if (!isPlaying || selectedRoute === null) return;

        const animate = () => {
            setTime(t => t + 16); // ~60fps (16ms per frame)
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, selectedRoute]);

    // Update Deck.gl layers
    useEffect(() => {
        if (!deckRef.current || routes.length === 0) return;

        const LINE_WIDTH = 6;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const layers: any[] = [];

        // Start point
        layers.push(new ScatterplotLayer({
            id: 'start-point',
            data: [{ position: START_POINT }],
            getPosition: (d: any) => d.position,
            getFillColor: [102, 126, 234], // Original color
            getRadius: 200,
            radiusMinPixels: 10,
            radiusMaxPixels: 20
        }));

        // Start point label - "Proje Alanı"
        layers.push(new TextLayer({
            id: 'start-point-label',
            data: [{ position: START_POINT }],
            getPosition: (d: any) => d.position,
            getText: () => 'Proje Alanı',
            getSize: 13,
            getColor: [255, 255, 255, 255],
            getAngle: 0,
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'top',
            getPixelOffset: [0, 14],
            fontFamily: 'Arial, Segoe UI, Helvetica, sans-serif',
            fontWeight: 'bold',
            characterSet: 'auto',
            outlineColor: [30, 30, 50, 220],
            outlineWidth: 3,
            billboard: true
        }));

        // All routes paths (dimmed static)
        routes.forEach((route, i) => {
            const isSelected = selectedRoute === i;
            layers.push(new PathLayer({
                id: `route-path-${i}`,
                data: [{ path: route.path }],
                getPath: (d: any) => d.path,
                getColor: isSelected ? [...route.color, 100] : [...route.color, 40],
                getWidth: isSelected ? LINE_WIDTH : LINE_WIDTH * 0.6,
                widthMinPixels: isSelected ? 4 : 2,
                capRounded: true,
                jointRounded: true
            }));
        });

        // Trip animation for selected route
        if (selectedRoute !== null) {
            const route = routes[selectedRoute];
            const duration = route.is_far ? 6000 : 4500; // Milliseconds per loop (faster)
            const loopTime = time % duration;

            // Calculate timestamps - evenly distributed along the route
            const timestamps = route.path.map((_: any, i: number) =>
                (i / (route.path.length - 1)) * duration
            );

            layers.push(new TripsLayer({
                id: 'trip-animation',
                data: [{
                    path: route.path,
                    timestamps: timestamps,
                    color: route.color
                }],
                getPath: (d: any) => d.path,
                getTimestamps: (d: any) => d.timestamps,
                getColor: (d: any) => d.color,
                opacity: 1,
                widthMinPixels: 10, // Thick animated line
                trailLength: route.is_far ? 2000 : 800, // Longer trail for far routes
                currentTime: loopTime,
                shadowEnabled: false
            }));

            // End point marker for selected route - Modern pin marker
            const endPoint = route.path[route.path.length - 1];

            // Pin marker icon using emoji
            layers.push(new TextLayer({
                id: 'end-point-marker',
                data: [{ position: endPoint }],
                getPosition: (d: any) => d.position,
                getText: () => '📍',
                getSize: 36,
                getColor: route.color,
                getAngle: 0,
                getTextAnchor: 'middle',
                getAlignmentBaseline: 'center',
                getPixelOffset: [0, -14],
                characterSet: 'auto',
                billboard: true
            }));

            // Destination label with Turkish font support
            layers.push(new TextLayer({
                id: 'end-point-label',
                data: [{ position: endPoint, name: route.name }],
                getPosition: (d: any) => d.position,
                getText: (d: any) => d.name,
                getSize: 13,
                getColor: [255, 255, 255, 255],
                getAngle: 0,
                getTextAnchor: 'middle',
                getAlignmentBaseline: 'top',
                getPixelOffset: [0, 8],
                fontFamily: 'Arial, Segoe UI, Helvetica, sans-serif',
                fontWeight: 'bold',
                characterSet: 'auto',
                outlineColor: [30, 30, 50, 220],
                outlineWidth: 3,
                billboard: true
            }));

            // Distance and duration label for selected route - ABOVE the marker
            layers.push(new TextLayer({
                id: 'end-point-info',
                data: [{ position: endPoint, info: `${route.distance_km} km • ${route.duration_min} dk` }],
                getPosition: (d: any) => d.position,
                getText: (d: any) => d.info,
                getSize: 13,
                getColor: [255, 255, 255, 255],
                getAngle: 0,
                getTextAnchor: 'middle',
                getAlignmentBaseline: 'bottom',
                getPixelOffset: [0, -36],
                fontFamily: 'Arial, Segoe UI, Helvetica, sans-serif',
                fontWeight: 'bold',
                characterSet: 'auto',
                outlineColor: [30, 30, 50, 220],
                outlineWidth: 3,
                billboard: true
            }));
        }

        // End points for all routes (modern markers)
        routes.forEach((route, i) => {
            if (selectedRoute !== i) {
                const endPoint = route.path[route.path.length - 1];

                // Small pin marker
                layers.push(new TextLayer({
                    id: `end-marker-${i}`,
                    data: [{ position: endPoint }],
                    getPosition: (d: any) => d.position,
                    getText: () => '📍',
                    getSize: 24,
                    getColor: [...route.color, 180] as [number, number, number, number],
                    getAngle: 0,
                    getTextAnchor: 'middle',
                    getAlignmentBaseline: 'center',
                    getPixelOffset: [0, -10],
                    characterSet: 'auto',
                    billboard: true
                }));

                // Small label with Turkish font support
                layers.push(new TextLayer({
                    id: `end-label-${i}`,
                    data: [{ position: endPoint, name: route.name }],
                    getPosition: (d: any) => d.position,
                    getText: (d: any) => d.name,
                    getSize: 10,
                    getColor: [200, 200, 200, 180],
                    getAngle: 0,
                    getTextAnchor: 'middle',
                    getAlignmentBaseline: 'top',
                    getPixelOffset: [0, 4],
                    fontFamily: 'Arial, Segoe UI, Helvetica, sans-serif',
                    fontWeight: 'normal',
                    characterSet: 'auto',
                    outlineColor: [20, 20, 40, 150],
                    outlineWidth: 2,
                    billboard: true
                }));

                // Distance and duration info for non-selected routes - ABOVE the marker
                layers.push(new TextLayer({
                    id: `end-info-${i}`,
                    data: [{ position: endPoint, info: `${route.distance_km} km • ${route.duration_min} dk` }],
                    getPosition: (d: any) => d.position,
                    getText: (d: any) => d.info,
                    getSize: 11,
                    getColor: [220, 220, 220, 200],
                    getAngle: 0,
                    getTextAnchor: 'middle',
                    getAlignmentBaseline: 'bottom',
                    getPixelOffset: [0, -26],
                    fontFamily: 'Arial, Segoe UI, Helvetica, sans-serif',
                    fontWeight: 'bold',
                    characterSet: 'auto',
                    outlineColor: [20, 20, 40, 180],
                    outlineWidth: 2,
                    billboard: true
                }));
            }
        });

        deckRef.current.setProps({ layers });
        syncDeckWithLeaflet();
    }, [routes, selectedRoute, time, syncDeckWithLeaflet]);

    const handleSelectRoute = (id: number) => {
        setSelectedRoute(id);
        setTime(0);
        setIsPlaying(true);

        // Smooth zoom out to show entire route from start to end
        const route = routes[id];
        if (route && map) {
            // Get all points including start point
            const allPoints: [number, number][] = [START_POINT, ...route.path];

            // Calculate bounds to fit entire route
            const lats = allPoints.map(p => p[1]);
            const lngs = allPoints.map(p => p[0]);
            const bounds: [[number, number], [number, number]] = [
                [Math.min(...lats), Math.min(...lngs)],
                [Math.max(...lats), Math.max(...lngs)]
            ];

            // Smooth fly to bounds showing entire route
            map.flyToBounds(bounds, {
                padding: [50, 50],
                duration: 0.9,
                easeLinearity: 0.3
            });
        }
    };

    const handleReset = () => {
        setSelectedRoute(null);
        setTime(0);
        setIsPlaying(false);
        // Smooth fly back to start point
        map.flyTo([START_POINT[1], START_POINT[0]], 14, { duration: 0.8, easeLinearity: 0.3 });
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Deck.gl Container Overlay - hidden during zoom to prevent jitter */}
            <div
                ref={containerRef}
                className="absolute inset-0 z-[500] pointer-events-none"
                style={{
                    width: '100%',
                    height: '100%',
                    opacity: isZooming ? 0 : 1,
                    transition: 'opacity 0.15s ease-out'
                }}
            />

            {/* Control Panel */}
            <div className={cn(
                "absolute top-20 left-4 right-4 sm:left-auto sm:right-6 z-[1001] transition-all duration-500 ease-in-out",
                selectedRoute !== null && isPlaying ? "top-6 sm:top-20" : "top-20"
            )}>
                <div className={cn(
                    "bg-white/20 dark:bg-slate-900/25 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-white/15 shadow-xl transition-all duration-500",
                    "w-full sm:w-80",
                    selectedRoute !== null && isPlaying ? "max-h-24 overflow-hidden" : "max-h-[calc(100vh-160px)]"
                )}>

                    {/* Ambient Glow - Sidebar ile aynı */}
                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-blue-500/5 dark:from-white/5 to-transparent pointer-events-none rounded-t-2xl" />
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[60px] pointer-events-none rounded-full" />

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-white/10 relative z-10 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M9 3L5 7l4 4M15 3l4 4-4 4" />
                                    <path d="M5 17c0-4 3-6 7-6s7 2 7 6" />
                                    <circle cx="12" cy="19" r="2" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-gray-900 dark:text-white font-bold text-sm tracking-tight truncate">
                                    {selectedRoute !== null && isPlaying ? routes[selectedRoute]?.name : 'Nasıl Giderim?'}
                                </h3>
                                <p className="text-gray-500 dark:text-blue-200/80 text-[10px] font-medium mt-0.5 uppercase tracking-wide">
                                    {selectedRoute !== null && isPlaying ? 'Rota İzleniyor' : 'Rota Seçin'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedRoute !== null && isPlaying && (
                                <button
                                    onClick={() => setIsPlaying(false)}
                                    className="p-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg lg:hidden"
                                >
                                    <Pause size={14} />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-600 dark:text-white/80 border border-gray-200 dark:border-white/5 transition-all shadow-sm"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Routes List - Hidden during playback to maximize map */}
                    <div
                        className={cn(
                            "p-3 overflow-y-auto space-y-2 relative z-10 custom-scrollbar transition-all duration-500",
                            selectedRoute !== null && isPlaying ? "opacity-0 pointer-events-none h-0 p-0" : "opacity-100 max-h-[400px]"
                        )}
                        onMouseEnter={() => map.scrollWheelZoom.disable()}
                        onMouseLeave={() => map.scrollWheelZoom.enable()}
                        onWheel={(event) => event.stopPropagation()}
                    >
                        {routes.map((route, i) => (
                            <button
                                key={route.id}
                                onClick={() => handleSelectRoute(i)}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${selectedRoute === i
                                    ? 'bg-indigo-500/15 dark:bg-indigo-500/20 border-indigo-400/50 dark:border-indigo-400/40 shadow-sm'
                                    : 'bg-gray-50/80 dark:bg-white/5 border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/15'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-1.5 h-10 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: `rgb(${route.color.join(',')})` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-semibold text-sm truncate ${selectedRoute === i
                                            ? 'text-indigo-700 dark:text-indigo-300'
                                            : 'text-gray-800 dark:text-white'
                                            }`}>{route.name}</div>
                                        <div className="flex gap-3 text-xs mt-1">
                                            <span className="text-gray-500 dark:text-gray-400">{route.distance_km} km</span>
                                            <span className="text-gray-500 dark:text-gray-400">{route.duration_min} dk</span>
                                        </div>
                                    </div>
                                    {selectedRoute === i && (
                                        <div className="w-7 h-7 rounded-full bg-indigo-500 dark:bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                            <Play size={12} className="text-white ml-0.5" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Controls Footer */}
                    <div className={cn(
                        "px-4 py-3 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-slate-900/40 flex items-center justify-between relative z-10 backdrop-blur-md rounded-b-2xl transition-all duration-500",
                        selectedRoute !== null && isPlaying ? "opacity-0 h-0 p-0 overflow-hidden" : "opacity-100"
                    )}>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                            {selectedRoute !== null ? routes[selectedRoute]?.name : 'Rota seçin'}
                        </div>
                        <div className="flex gap-2">
                            {selectedRoute !== null && (
                                <button
                                    onClick={handleReset}
                                    className="p-2 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-white transition-all shadow-sm"
                                >
                                    <RotateCcw size={15} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Start Point Info - Mobilde daha yukarıda ya da gizli */}
            <div className={cn(
                "fixed bottom-24 left-6 sm:left-[calc(40%+1.5rem)] z-[1001] bg-white/20 dark:bg-slate-900/25 backdrop-blur-2xl px-4 py-3 rounded-xl border border-white/30 dark:border-white/15 shadow-lg transition-all duration-500",
                selectedRoute !== null && isPlaying ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
            )}>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-white/70 font-bold">Başlangıç</div>
                <div className="text-gray-900 dark:text-white font-semibold text-sm">Proje Konumu</div>
            </div>
        </>
    );
};
