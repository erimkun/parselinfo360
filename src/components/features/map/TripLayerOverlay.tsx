import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Deck, MapView } from '@deck.gl/core';
import { TripsLayer } from '@deck.gl/geo-layers';
import { ScatterplotLayer, PathLayer, TextLayer } from '@deck.gl/layers';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

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
    const deckRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    
    const [routes, setRoutes] = useState<Route[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isZooming, setIsZooming] = useState(false);

    // Load routes data
    useEffect(() => {
        if (isOpen) {
            fetch('/data/proje/trip_routes.json')
                .then(res => res.json())
                .then(data => setRoutes(data))
                .catch(console.error);
        }
        // Re-enable scroll wheel zoom when panel closes
        return () => {
            map.scrollWheelZoom.enable();
        };
    }, [isOpen, map]);

    // Get current view state from Leaflet
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
                padding: [100, 100],
                maxZoom: 14,
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
            <div className="absolute top-16 right-4 lg:top-20 lg:right-6 z-[1001] transition-all duration-300">
                <div className="bg-slate-900/20 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-white/15 shadow-xl w-64 sm:w-72 lg:w-80 max-h-[calc(100vh-180px)] lg:max-h-[calc(100vh-160px)] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 lg:px-4 lg:py-3 border-b border-white/15">
                        <div className="flex items-center gap-2 lg:gap-3">
                            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M9 3L5 7l4 4M15 3l4 4-4 4"/>
                                    <path d="M5 17c0-4 3-6 7-6s7 2 7 6"/>
                                    <circle cx="12" cy="19" r="2"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-xs lg:text-sm">Nasıl Giderim?</h3>
                                <p className="text-gray-400 text-[10px] lg:text-xs">Rota seçin</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 lg:p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                        >
                            <X size={16} className="lg:w-[18px] lg:h-[18px]" />
                        </button>
                    </div>

                    {/* Routes List */}
                    <div 
                        className="p-2 lg:p-3 overflow-y-auto max-h-[300px] lg:max-h-[400px] space-y-2 trip-scrollbar"
                        onMouseEnter={() => map.scrollWheelZoom.disable()}
                        onMouseLeave={() => map.scrollWheelZoom.enable()}
                        onWheel={(e) => e.stopPropagation()}
                    >
                        {routes.map((route, i) => (
                            <button
                                key={route.id}
                                onClick={() => handleSelectRoute(i)}
                                className={`w-full text-left p-3 rounded-xl border transition-all ${
                                    selectedRoute === i
                                        ? 'bg-indigo-500/25 border-indigo-400/40'
                                        : 'bg-white/5 border-white/5 hover:bg-white/15 hover:border-white/15'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-1.5 h-10 rounded-full"
                                        style={{ backgroundColor: `rgb(${route.color.join(',')})` }}
                                    />
                                    <div className="flex-1">
                                        <div className="text-white font-medium text-sm">{route.name}</div>
                                        <div className="flex gap-4 text-gray-400 text-xs mt-1">
                                            <span>{route.distance_km} km</span>
                                            <span>{route.duration_min} dk</span>
                                        </div>
                                    </div>
                                    {selectedRoute === i && (
                                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                            <Play size={14} className="text-white ml-0.5" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="px-4 py-3 border-t border-white/15 flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                            {selectedRoute !== null ? routes[selectedRoute]?.name : 'Rota seçin'}
                        </div>
                        <div className="flex gap-2">
                            {selectedRoute !== null && (
                                <>
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
                                    >
                                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Start Point Info */}
            <div className="absolute bottom-24 left-6 z-[1001] bg-slate-900/20 backdrop-blur-xl px-4 py-3 rounded-xl border border-white/15 shadow-lg">
                <div className="text-[10px] uppercase tracking-wider text-white/70 font-bold">Başlangıç</div>
                <div className="text-white font-semibold text-sm">Proje Konumu</div>
            </div>
        </>
    );
};
