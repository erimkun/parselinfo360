import React, { useEffect, useState, useMemo } from 'react';
import {
    ComposedChart, Line, Area, Bar, BarChart, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
    ScatterChart, Scatter, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell, ReferenceArea
} from 'recharts';
import { TrendingUp, GitCompare, Shield, Zap, Scale, ArrowDownToLine, ClipboardList, Info, Layers, Home } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { useTheme } from '../../../contexts/ThemeContext';
import { ScoreInfoTooltip } from '../../common/ScoreInfoTooltip';
import { scoreExplanations } from '../../../constants/scoreExplanations';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// --- Helper Components (defined outside render for performance) ---

interface CardProps {
    children: ReactNode;
    title: ReactNode;
    icon: LucideIcon;
    cols?: string;
}

const Card = ({ children, title, icon: Icon, cols = "col-span-1" }: CardProps) => (
    <div className={`bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-sm backdrop-blur-sm ${cols}`}>
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-2">
            <Icon size={16} className="text-indigo-500" />
            {title}
        </h3>
        {children}
    </div>
);

interface AnalysisBoxProps {
    text: string;
}

const AnalysisBox = ({ text }: AnalysisBoxProps) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mt-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium leading-relaxed">{text}</p>
    </div>
);

interface ToggleProps {
    active: 'left' | 'right';
    leftLabel: string;
    rightLabel: string;
    onToggle: (side: 'left' | 'right') => void;
}

const Toggle = ({ active, leftLabel, rightLabel, onToggle }: ToggleProps) => (
    <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 relative mb-4 w-fit">
        <div
            className={`absolute top-1 bottom-1 w-1/2 bg-white dark:bg-slate-600 rounded shadow-sm transition-all duration-300 ${active === 'left' ? 'left-1' : 'left-[calc(50%-4px)] translate-x-full'}`}
        ></div>
        <button
            onClick={() => onToggle('left')}
            className={`flex-1 px-4 py-1 text-xs font-bold z-10 transition-colors ${active === 'left' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
        >
            {leftLabel}
        </button>
        <button
            onClick={() => onToggle('right')}
            className={`flex-1 px-4 py-1 text-xs font-bold z-10 transition-colors ${active === 'right' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
        >
            {rightLabel}
        </button>
    </div>
);

// --- Helpers ---

// Ortak sayı dönüştürücü:
// "1.435 (-5%)" -> 1435, 1375.0 -> 1375, null/undefined -> 0
const toNumber = (raw: any): number => {
    if (raw == null) return 0;
    if (typeof raw === 'number') return raw;

    const match = String(raw).match(/[\d.,]+/);
    if (!match) return 0;

    const numeric = match[0].replace(/\./g, '').replace(',', '.');
    const n = Number(numeric);
    return Number.isFinite(n) ? n : 0;
};

// --- Skor Lejantı Helper ---
const getScoreLegend = (score: number | undefined): { label: string; color: string; desc: string } => {
    const val = Number(score || 0);
    if (val >= 80) return { label: 'Çok Güçlü', color: 'text-emerald-600 dark:text-emerald-400', desc: 'Belirleyici avantaj' };
    if (val >= 60) return { label: 'İyi', color: 'text-blue-600 dark:text-blue-400', desc: 'Güçlü katkı sağlar' };
    if (val >= 40) return { label: 'Orta', color: 'text-amber-600 dark:text-amber-400', desc: 'Nötr / dengeleyici' };
    if (val >= 20) return { label: 'Zayıf', color: 'text-orange-600 dark:text-orange-400', desc: 'Destekleyici değil' };
    return { label: 'Çok Zayıf', color: 'text-red-600 dark:text-red-400', desc: 'Yapısal eksiklik var' };
};

// --- Custom Tooltip (Interpretative Only) ---
const InterpretativeTooltip = ({ active, payload, label, text }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-slate-800/95 p-3 rounded-lg shadow-xl border-none backdrop-blur-sm max-w-[200px]">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-snug">
                    {text}
                </p>
            </div>
        );
    }
    return null;
};

export const MarketIndexView: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [loading, setLoading] = useState(true);
    const [features, setFeatures] = useState<any[]>([]);

    // Toggles
    // Toggles
    const [priceMode, setPriceMode] = useState<'sales' | 'rental'>('sales');
    const [listingMode, setListingMode] = useState<'sales' | 'rental'>('sales');
    const [transactionMode, setTransactionMode] = useState<'units' | 'density'>('units');
    const [slideIndex, setSlideIndex] = useState(0);

    // Default selection
    const selectedNeighborhoodName = 'ACIBADEM';

    useEffect(() => {
        dataService.getInvestmentData().then(data => {
            setFeatures(data);
            setLoading(false);
        });
    }, []);

    const data = useMemo(() => {
        if (!features.length) return null;
        const feature = features.find(f => f.properties.MAHALLEADI === selectedNeighborhoodName) || features[0];
        if (!feature) return null;
        const p = feature.properties;

        // --- 1. FİYATIN HİKÂYESİ ---
        const salesMonths = [
            'temmuz_2023', 'agustos_2023', 'eylul_2023', 'ekim_2023', 'kasim_2023', 'aralik_2023',
            'ocak_2024', 'subat_2024', 'mart_2024', 'nisan_2024', 'mayis_2024', 'haziran_2024',
            'temmuz_2024', 'agustos_2024', 'eylul_2024', 'ekim_2024', 'kasim_2024', 'aralik_2024',
            'ocak_2025', 'subat_2025', 'mart_2025', 'nisan_2025', 'mayis_2025', 'haziran_2025',
            'temmuz_2025', 'agustos_2025', 'eylul_2025', 'ekim_2025', 'kasim_2025', 'aralik_2025'
        ];
        // Rental series: Dec 2022 to Dec 2025
        const rentalMonths = [
            'aralik_2022',
            'ocak_2023', 'subat_2023', 'mart_2023', 'nisan_2023', 'mayis_2023', 'haziran_2023',
            'temmuz_2023', 'agustos_2023', 'eylul_2023', 'ekim_2023', 'kasim_2023', 'aralik_2023',
            'ocak_2024', 'subat_2024', 'mart_2024', 'nisan_2024', 'mayis_2024', 'haziran_2024',
            'temmuz_2024', 'agustos_2024', 'eylul_2024', 'ekim_2024', 'kasim_2024', 'aralik_2024',
            'ocak_2025', 'subat_2025', 'mart_2025', 'nisan_2025', 'mayis_2025', 'haziran_2025',
            'temmuz_2025', 'agustos_2025', 'eylul_2025', 'ekim_2025', 'kasim_2025', 'aralik_2025'
        ];

        const priceData = priceMode === 'sales'
            ? salesMonths.map(m => ({
                name: m.replace('satm2_', '').replace('_', ' '),
                value: p[`satm2_${m}`] || 0,
                context: p.fiyat_momentum || 50
            }))
            : rentalMonths.map(m => ({
                name: m.replace('_', ' '),
                value: p[`kirm2_${m}`] || 0,
                context: p.F1_yillik_degisim_kiralik || 0
            }));

        const section1 = {
            data: priceData,
            avg: p.satilikm2_ort || 0,
            mode: priceMode,
            interpretation: priceMode === 'sales'
                ? getPriceStoryText(priceData, p.satilikm2_ort)
                : "Kiralık piyasası tarihsel trendler ve 2025 projeksiyonları ile analiz edilmektedir."
        };

        // --- 2. KISA vs UZUN VADE ---
        const section2 = {
            momentum: { val: p.fiyat_momentum || 0, color: '#8B5CF6' },
            longTerm: { val: p.s3_uzunvade_artis_skor || 0, color: '#3B82F6' },
            deviation: { val: p.uzun_vade_sapma || 0, color: '#F59E0B' },
            interpretation: getDivergenceText(p.fiyat_momentum, p.s3_uzunvade_artis_skor),
            momentumText: getMomentumText(p.fiyat_momentum || 0),
            longTermText: getLongTermText(p.s3_uzunvade_artis_skor || 0),
            deviationText: getDeviationText(p.uzun_vade_sapma || 0),
            summaryText: getVadeSummaryText(
                p.fiyat_momentum || 0,
                p.s3_uzunvade_artis_skor || 0,
                p.uzun_vade_sapma || 0
            )
        };

        // --- 3. RİSK ÜÇGENİ ---
        const section3 = {
            data: [
                { subject: 'Risk', A: Math.min((p.std_aylik_degisim || 0) * 100, 100), fullMark: 100 },
                { subject: 'Stabilite', A: p.piyasa_istikrar || 0, fullMark: 100 },
                { subject: 'Oynaklık', A: p.daglanma_skor || 0, fullMark: 100 },
            ],
            interpretation: getRiskText(p.piyasa_istikrar, p.std_aylik_degisim)
        };

        // --- 4. PİYASA CANLILIĞI ---
        const section4 = {
            continuity: { val: p.islem_sureklilligi || 0, color: '#10B981' },
            volume: { val: (p.alim_satim_ort || 0), color: '#3B82F6' },
            raw: { mean: p.alim_satim_ort, std: p.alim_satim_std },
            interpretation: getVitalityText(p.alim_satim_ort, p.islem_sureklilligi)
        };

        // --- 5. KİRALIK – SATILIK ---
        const section5 = {
            rentTrend: p.trend_2025 || 0,
            salesMomentum: (p.fiyat_momentum || 0),
            rentAvg: p.ort_kira_2025,
            interpretation: getBalanceText(p.trend_2025, p.fiyat_momentum)
        };

        // --- 6. ARZ BASKISI (Scatter) ---
        const section6 = {
            data: [{ x: p.ilan_baski || 0, y: p.fiyat_momentum || 0 }],
            interpretation: getPressureText(p.ilan_baski, p.fiyat_momentum)
        };

        // --- 8. CAROUSEL DATA (Refactored) ---
        const yearsRange = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];

        // Slide 2: Listings (Satılık / Kiralık İlan)
        const listingSalesData = yearsRange.map(y => ({
            name: y,
            value: toNumber(p[`sat_ilan_${y}`])
        }));

        const listingRentData = yearsRange.map(y => ({
            name: y,
            value: toNumber(p[`kir_ilan_${y}`])
        }));

        // Slide 3: Transactions / Units (Bağımsız / İşlem Derinliği)
        const yearsShort = ['2019', '2020', '2021', '2022', '2023', '2024'];

        const unitData = yearsShort.map(y => ({
            name: y,
            value: toNumber(p[`bagimsizb_${y}`])
        }));

        // GeoJSON'da alan adı "alim_satim_yog2019" şeklinde (alt çizgi yok)
        const transactionData = yearsShort.map(y => ({
            name: y,
            value: toNumber(p[`alim_satim_yog${y}`])
        }));

        const section8 = {
            listingSalesData,
            listingRentData,
            listingSalesTotal: listingSalesData[listingSalesData.length - 2]?.value || 0, // 2024
            listingRentTotal: listingRentData[listingRentData.length - 2]?.value || 0, // 2024
            unitData,
            transactionData,
            unitTotal: unitData.reduce((a, b) => a + b.value, 0),
            transactionTotal: transactionData.reduce((a, b) => a + b.value, 0),
        };

        // --- 7. SUMMARY ---
        const section7 = {
            data: [
                { subject: 'Momentum', A: p.fiyat_momentum || 0, fullMark: 100 },
                { subject: 'İstikrar', A: p.piyasa_istikrar || 0, fullMark: 100 },
                { subject: 'Süreklilik', A: p.islem_sureklilligi || 0, fullMark: 100 },
                { subject: 'Arz Dengesi', A: 100 - (p.ilan_baski || 0), fullMark: 100 },
                { subject: 'Uzun Vade', A: p.s3_uzunvade_artis_skor || 0, fullMark: 100 }
            ],
            text: getSummaryText(p)
        };

        return {
            name: feature.properties.MAHALLEADI,
            section1, section2, section3, section4, section5, section6, section7, section8
        };
    }, [features, priceMode, listingMode, transactionMode]);

    if (loading || !data) return <div className="p-8 text-center text-gray-500">Hazırlanıyor...</div>;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6 pb-24">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-blue-600" />
                    {data.name} Piyasa Analizi
                </h1>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full font-bold">
                    Gelişmiş Görsel Analiz
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. MARKET CAROUSEL (3 SLIDES) */}
                <Card title={
                    <div className="flex items-center justify-center gap-1">
                        {slideIndex === 0 ? "1. Fiyatın Hikâyesi" :
                            slideIndex === 1 ? "2. İlan Arzı ve Stok" :
                                "3. İşlem ve Satış Derinliği"}
                        {slideIndex === 0 && (
                            <ScoreInfoTooltip
                                title={scoreExplanations.priceHistory.title}
                                description={scoreExplanations.priceHistory.description}
                                formula={scoreExplanations.priceHistory.formula}
                                position="bottom"
                            />
                        )}
                        {slideIndex === 1 && (
                            <ScoreInfoTooltip
                                title={scoreExplanations.listingSupply.title}
                                description={scoreExplanations.listingSupply.description}
                                formula={scoreExplanations.listingSupply.formula}
                                position="bottom"
                            />
                        )}
                        {slideIndex === 2 && (
                            <ScoreInfoTooltip
                                title={scoreExplanations.transactionDepth.title}
                                description={scoreExplanations.transactionDepth.description}
                                formula={scoreExplanations.transactionDepth.formula}
                                position="bottom"
                            />
                        )}
                    </div>
                } icon={TrendingUp} cols="col-span-1 lg:col-span-2">

                    {/* KPI Header - Simplified */}
                    <div className="flex justify-between items-start mb-6">
                        {/* Toggle Specific to Current View */}
                        <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 relative w-fit">
                            <div
                                className={`absolute top-1 bottom-1 w-1/2 bg-white dark:bg-slate-600 rounded shadow-sm transition-all duration-300 ${(slideIndex === 0 && priceMode === 'sales') || (slideIndex === 1 && listingMode === 'sales') || (slideIndex === 2 && transactionMode === 'units')
                                        ? 'left-1' : 'left-[calc(50%-4px)] translate-x-full'
                                    }`}
                            ></div>

                            {slideIndex === 0 && (
                                <>
                                    <button onClick={() => setPriceMode('sales')} className={`flex-1 px-4 py-1 text-xs font-bold z-10 transition-colors ${priceMode === 'sales' ? 'text-indigo-600' : 'text-gray-500'}`}>Satılık</button>
                                    <button onClick={() => setPriceMode('rental')} className={`flex-1 px-4 py-1 text-xs font-bold z-10 transition-colors ${priceMode === 'rental' ? 'text-indigo-600' : 'text-gray-500'}`}>Kiralık</button>
                                </>
                            )}
                            {slideIndex === 1 && (
                                <>
                                    <button onClick={() => setListingMode('sales')} className={`flex-1 px-4 py-1 text-xs font-bold z-10 transition-colors ${listingMode === 'sales' ? 'text-indigo-600' : 'text-gray-500'}`}>Satılık İlan</button>
                                    <button onClick={() => setListingMode('rental')} className={`flex-1 px-4 py-1 text-xs font-bold z-10 transition-colors ${listingMode === 'rental' ? 'text-indigo-600' : 'text-gray-500'}`}>Kiralık İlan</button>
                                </>
                            )}
                            {slideIndex === 2 && (
                                <>
                                    <button onClick={() => setTransactionMode('units')} className={`flex-1 px-4 py-1 text-xs font-bold z-10 transition-colors ${transactionMode === 'units' ? 'text-indigo-600' : 'text-gray-500'}`}>Bağımsız</button>
                                    <button onClick={() => setTransactionMode('density')} className={`flex-1 px-4 py-1 text-xs font-bold z-10 transition-colors ${transactionMode === 'density' ? 'text-indigo-600' : 'text-gray-500'}`}>İşlem</button>
                                </>
                            )}
                        </div>

                        <div className="text-right">
                            <div className="text-3xl font-black text-gray-900 dark:text-white">
                                {slideIndex === 0 && (priceMode === 'sales' ? `₺${Number(data.section1.avg).toLocaleString()}` : `₺${Number(data.section5.rentAvg || 0).toLocaleString()}`)}
                                {slideIndex === 1 && (listingMode === 'sales' ? Number(data.section8.listingSalesTotal).toLocaleString() : Number(data.section8.listingRentTotal).toLocaleString())}
                                {slideIndex === 2 && (transactionMode === 'units' ? Number(data.section8.unitTotal).toLocaleString() : Number(data.section8.transactionTotal).toLocaleString())}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-gray-500">
                                {slideIndex === 0 && (priceMode === 'sales' ? 'Ortalama m²' : 'Ortalama Kira')}
                                {slideIndex === 1 && (listingMode === 'sales' ? 'Toplam İlan' : 'Toplam Kira İlanı')}
                                {slideIndex === 2 && (transactionMode === 'units' ? 'Bağımsız Bölüm' : 'İşlem Hacmi')}
                            </div>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="h-72 w-full mb-6 relative z-0">
                        <ResponsiveContainer>
                            <AreaChart data={
                                slideIndex === 0 ? data.section1.data :
                                    slideIndex === 1 ? (listingMode === 'sales' ? data.section8.listingSalesData : data.section8.listingRentData) :
                                        (transactionMode === 'units' ? data.section8.unitData : data.section8.transactionData)
                            }>
                                <defs>
                                    <linearGradient id="colorMainBlue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMainOrange" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E42" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E42" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMainGreen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} minTickGap={30} />
                                <YAxis tickFormatter={v => v > 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v} width={40} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                <Tooltip content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const year = payload[0].payload?.name;
                                        const value = Number(payload[0].value).toLocaleString();
                                        return (
                                            <div className="bg-slate-900/90 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl backdrop-blur-sm border border-white/10 z-50">
                                                <div>{year}</div>
                                                <div>{value}</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                                {/* Kategoriye göre renk seçimi */}
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={slideIndex === 0 ? "#4F46E5" : slideIndex === 1 ? "#F59E42" : "#10B981"}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill={slideIndex === 0 ? "url(#colorMainBlue)" : slideIndex === 1 ? "url(#colorMainOrange)" : "url(#colorMainGreen)"}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bottom Navigation (Segmented Control) */}
                    <div className="flex justify-center border-t border-gray-100 dark:border-gray-800 pt-4">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setSlideIndex(0)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${slideIndex === 0
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                            >
                                1. Fiyat
                            </button>
                            <button
                                onClick={() => setSlideIndex(1)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${slideIndex === 1
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                            >
                                2. İlan
                            </button>
                            <button
                                onClick={() => setSlideIndex(2)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${slideIndex === 2
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                            >
                                3. Derinlik
                            </button>
                        </div>
                    </div>
                </Card>

                {/* 2. KISA vs UZUN (SKOR PANELLERİ) */}
                <Card title="2. Uzun Vade Analizi" icon={GitCompare} cols="col-span-1 lg:col-span-2">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Momentum */}
                            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                                <div className={`text-3xl font-black ${getScoreLegend(data.section2.momentum.val).color} mb-1`}>
                                    {getScoreLegend(data.section2.momentum.val).label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                    Skor: {data.section2.momentum.val.toFixed(0)}
                                </div>
                                <div className="text-xs font-bold uppercase text-purple-700 dark:text-purple-200 tracking-wide flex items-center justify-center gap-1 mt-2">
                                    Kısa Vade Momentum
                                    <ScoreInfoTooltip
                                        title={scoreExplanations.shortTermMomentum.title}
                                        description={scoreExplanations.shortTermMomentum.description}
                                        formula={scoreExplanations.shortTermMomentum.formula}
                                        position="top"
                                    />
                                </div>
                                <p className="text-[11px] text-center text-purple-900/80 dark:text-purple-100 leading-snug mt-1">
                                    {data.section2.momentumText}
                                </p>
                                <div className="text-[9px] text-purple-600 dark:text-purple-300 font-medium mt-1">
                                    {getScoreLegend(data.section2.momentum.val).desc}
                                </div>
                            </div>

                            {/* Uzun Vade */}
                            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                                <div className={`text-3xl font-black ${getScoreLegend(data.section2.longTerm.val).color} mb-1`}>
                                    {getScoreLegend(data.section2.longTerm.val).label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                    Skor: {data.section2.longTerm.val.toFixed(0)}
                                </div>
                                <div className="text-xs font-bold uppercase text-blue-700 dark:text-blue-200 tracking-wide flex items-center justify-center gap-1 mt-2">
                                    Uzun Vade Potansiyel
                                    <ScoreInfoTooltip
                                        title={scoreExplanations.longTermPotential.title}
                                        description={scoreExplanations.longTermPotential.description}
                                        formula={scoreExplanations.longTermPotential.formula}
                                        position="top"
                                    />
                                </div>
                                <p className="text-[11px] text-center text-blue-900/80 dark:text-blue-100 leading-snug mt-1">
                                    {data.section2.longTermText}
                                </p>
                                <div className="text-[9px] text-blue-600 dark:text-blue-300 font-medium mt-1">
                                    {getScoreLegend(data.section2.longTerm.val).desc}
                                </div>
                            </div>

                            {/* Sapma */}
                            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800">
                                <div className={`text-3xl font-black ${getScoreLegend(data.section2.deviation.val).color} mb-1`}>
                                    {getScoreLegend(data.section2.deviation.val).label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                    Skor: %{data.section2.deviation.val.toFixed(0)}
                                </div>
                                <div className="text-xs font-bold uppercase text-amber-700 dark:text-amber-200 tracking-wide flex items-center justify-center gap-1 mt-2">
                                    Uzun Vade Sapma
                                    <ScoreInfoTooltip
                                        title={scoreExplanations.longTermDeviation.title}
                                        description={scoreExplanations.longTermDeviation.description}
                                        formula={scoreExplanations.longTermDeviation.formula}
                                        position="top"
                                    />
                                </div>
                                <p className="text-[11px] text-center text-amber-900/80 dark:text-amber-100 leading-snug mt-1">
                                    {data.section2.deviationText}
                                </p>
                                <div className="text-[9px] text-amber-600 dark:text-amber-300 font-medium mt-1">
                                    {getScoreLegend(data.section2.deviation.val).desc}
                                </div>
                            </div>
                        </div>

                        <AnalysisBox text={data.section2.summaryText} />
                    </div>
                </Card>

                {/* 3. RİSK ÜÇGENİ */}
                <Card title="3. Risk ve İstikrar Analizi" icon={Shield} cols="col-span-1 lg:col-span-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sol: Radar Grafiği */}
                        <div className="lg:col-span-2 h-72">
                            <ResponsiveContainer>
                                <RadarChart outerRadius={90} data={data.section3.data}>
                                    <PolarGrid stroke={isDark ? "#ffffff20" : "#e5e7eb"} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} strokeWidth={2} />
                                    <Tooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white/95 dark:bg-slate-800/95 p-3 rounded-lg shadow-xl border border-purple-200 dark:border-purple-800 backdrop-blur-sm">
                                                        <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                                                            {payload[0].payload.subject}
                                                        </p>
                                                        <p className="text-lg font-black text-gray-900 dark:text-white">
                                                            {Number(payload[0].value).toFixed(1)}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Sağ: Açıklamalar */}
                        <div className="space-y-3 flex flex-col justify-center">
                            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase mb-1.5 flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    Risk
                                    <ScoreInfoTooltip
                                        title={scoreExplanations.riskScore.title}
                                        description={scoreExplanations.riskScore.description}
                                        formula={scoreExplanations.riskScore.formula}
                                        position="left"
                                    />
                                </h4>
                                <p className="text-[10px] text-purple-900/80 dark:text-purple-100 leading-relaxed">
                                    Aylık fiyat değişimlerinin standart sapması. Yüksek değer, fiyatların öngörülemez dalgalanmalar gösterdiğini işaret eder.
                                </p>
                            </div>

                            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase mb-1.5 flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    Stabilite
                                    <ScoreInfoTooltip
                                        title={scoreExplanations.stabilityScore.title}
                                        description={scoreExplanations.stabilityScore.description}
                                        formula={scoreExplanations.stabilityScore.formula}
                                        position="left"
                                    />
                                </h4>
                                <p className="text-[10px] text-indigo-900/80 dark:text-indigo-100 leading-relaxed">
                                    Piyasanın istikrar seviyesi. Yüksek skor, piyasanın düzenli ve sürdürülebilir bir yapıya sahip olduğunu gösterir.
                                </p>
                            </div>

                            <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase mb-1.5 flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                                    Oynaklık
                                    <ScoreInfoTooltip
                                        title={scoreExplanations.volatilityScore.title}
                                        description={scoreExplanations.volatilityScore.description}
                                        formula={scoreExplanations.volatilityScore.formula}
                                        position="left"
                                    />
                                </h4>
                                <p className="text-[10px] text-violet-900/80 dark:text-violet-100 leading-relaxed">
                                    Fiyat dağılımının homojenliği. Düşük oynaklık, bölge genelinde benzer fiyatlama profili olduğunu yansıtır.
                                </p>
                            </div>
                        </div>
                    </div>
                    <AnalysisBox text={data.section3.interpretation} />
                </Card>

                {/* 4. PİYASA CANLILIĞI */}
                <Card title="4. Piyasa Aktivitesi ve Canlılık" icon={Zap}>
                    <div className="grid grid-cols-2 gap-4 items-stretch">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 flex flex-col items-center justify-center border border-emerald-100 dark:border-emerald-800 min-h-[260px] h-full flex-1">
                            <div className={`text-3xl font-black ${getScoreLegend(data.section4.continuity.val).color} mb-2`}>
                                {getScoreLegend(data.section4.continuity.val).label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-3">
                                Skor: {data.section4.continuity.val.toFixed(0)}
                            </div>
                            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1">
                                İşlem Sürekliliği
                                <ScoreInfoTooltip
                                    title={scoreExplanations.transactionContinuity.title}
                                    description={scoreExplanations.transactionContinuity.description}
                                    formula={scoreExplanations.transactionContinuity.formula}
                                    position="left"
                                />
                            </div>
                            <p className="text-[10px] text-center text-emerald-900/80 dark:text-emerald-100 leading-relaxed mb-2">
                                Bölgede sürekli ve düzenli işlem yapılma oranı. Yüksek skor, piyasanın aktif ve likit olduğunu gösterir.
                            </p>
                            <div className="text-[9px] text-emerald-600 dark:text-emerald-300 font-medium">
                                {getScoreLegend(data.section4.continuity.val).desc}
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 flex flex-col items-center justify-center border border-blue-100 dark:border-blue-800 min-h-[260px] h-full flex-1">
                            <div className={`text-3xl font-black ${getScoreLegend(data.section4.volume.val / 10).color} mb-2`}>
                                {getScoreLegend(data.section4.volume.val / 10).label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-3">
                                Skor: {data.section4.volume.val.toLocaleString()}
                            </div>
                            <div className="text-xs font-bold text-blue-800 dark:text-blue-200 uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1">
                                Ort. İşlem Hacmi
                                <ScoreInfoTooltip
                                    title={scoreExplanations.averageTransactionVolume.title}
                                    description={scoreExplanations.averageTransactionVolume.description}
                                    formula={scoreExplanations.averageTransactionVolume.formula}
                                    position="top"
                                />
                            </div>
                            <p className="text-[10px] text-center text-blue-900/80 dark:text-blue-100 leading-relaxed mb-2">
                                Aylık ortalama alım-satım işlem sayısı. Piyasanın derinliğini ve canlılığını gösterir.
                            </p>
                            <div className="text-[9px] text-blue-600 dark:text-blue-300 font-medium">
                                {getScoreLegend(data.section4.volume.val / 10).desc}
                            </div>
                        </div>
                    </div>
                    <AnalysisBox text={data.section4.interpretation} />
                </Card>

                {/* 5. KİRA - SATILIK */}
                <Card title="5. Kira ve Satılık Dengesi" icon={Scale}>
                    <div className="grid grid-cols-2 gap-6">
                        {/* Kira Trend Gauge */}
                        <div className="flex flex-col items-center">
                            <div className="relative w-40 h-40">
                                <svg viewBox="0 0 100 60" className="w-full">
                                    {/* Background Arc */}
                                    <path
                                        d="M 10 50 A 40 40 0 0 1 90 50"
                                        fill="none"
                                        stroke={isDark ? '#334155' : '#e5e7eb'}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                    />
                                    {/* Foreground Arc */}
                                    <path
                                        d="M 10 50 A 40 40 0 0 1 90 50"
                                        fill="none"
                                        stroke="#8B5CF6"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${Math.min(data.section5.rentTrend * 1.25, 125)} 125`}
                                        className="transition-all duration-1000"
                                    />
                                    {/* Center Text */}
                                    <text x="50" y="45" textAnchor="middle" className="text-xl font-black" fill={isDark ? '#fff' : '#1f2937'}>
                                        {data.section5.rentTrend.toFixed(1)}
                                    </text>
                                </svg>
                            </div>
                            <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-3 mb-1">
                                {getScoreLegend(data.section5.rentTrend).label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                                Skor: {data.section5.rentTrend.toFixed(1)}
                            </div>
                            <h4 className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center justify-center gap-1">
                                2025 Kira Trend
                                <ScoreInfoTooltip
                                    title={scoreExplanations.rentTrend2025.title}
                                    description={scoreExplanations.rentTrend2025.description}
                                    formula={scoreExplanations.rentTrend2025.formula}
                                    position="top"
                                />
                            </h4>
                            <p className="text-[10px] text-center text-purple-900/80 dark:text-purple-100 leading-relaxed mt-2 px-3">
                                Yıllık kira artış trendi. Kiralık piyasasının canlılığını ve değer artış hızını gösterir.
                            </p>
                        </div>

                        {/* Satış Momentum Gauge */}
                        <div className="flex flex-col items-center">
                            <div className="relative w-40 h-40">
                                <svg viewBox="0 0 100 60" className="w-full">
                                    {/* Background Arc */}
                                    <path
                                        d="M 10 50 A 40 40 0 0 1 90 50"
                                        fill="none"
                                        stroke={isDark ? '#334155' : '#e5e7eb'}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                    />
                                    {/* Foreground Arc */}
                                    <path
                                        d="M 10 50 A 40 40 0 0 1 90 50"
                                        fill="none"
                                        stroke="#3B82F6"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${Math.min(data.section5.salesMomentum * 1.25, 125)} 125`}
                                        className="transition-all duration-1000"
                                    />
                                    {/* Center Text */}
                                    <text x="50" y="45" textAnchor="middle" className="text-xl font-black" fill={isDark ? '#fff' : '#1f2937'}>
                                        {data.section5.salesMomentum.toFixed(1)}
                                    </text>
                                </svg>
                            </div>
                            <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-3 mb-1">
                                {getScoreLegend(data.section5.salesMomentum).label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                                Skor: {data.section5.salesMomentum.toFixed(1)}
                            </div>
                            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center justify-center gap-1">
                                Satış Momentum
                                <ScoreInfoTooltip
                                    title={scoreExplanations.salesMomentum.title}
                                    description={scoreExplanations.salesMomentum.description}
                                    formula={scoreExplanations.salesMomentum.formula}
                                    position="left"
                                />
                            </h4>
                            <p className="text-[10px] text-center text-blue-900/80 dark:text-blue-100 leading-relaxed mt-2 px-3">
                                Satılık piyasasının kısa vadeli ivmesi. Fiyat artış hızını ve piyasa canlılığını yansıtır.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase flex items-center gap-1">
                            Ort. Kira (2025)
                            <ScoreInfoTooltip
                                title={scoreExplanations.averageRent.title}
                                description={scoreExplanations.averageRent.description}
                                formula={scoreExplanations.averageRent.formula}
                                position="top"
                            />
                        </span>
                        <span className="text-xl font-black text-gray-900 dark:text-white">₺{data.section5.rentAvg?.toLocaleString()}</span>
                    </div>
                    <AnalysisBox text={data.section5.interpretation} />
                </Card>

                {/* 6. ARZ BASKISI (ENHANCED SCATTER) */}
                <Card title="6. Arz Baskısı ve Fiyat Tutunması" icon={ArrowDownToLine} cols="col-span-1 lg:col-span-2">
                    <div className="mb-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                            <span className="font-bold text-gray-900 dark:text-white">Grafik Okuma:</span> X ekseni ilan yoğunluğunu, Y ekseni fiyat momentumunu gösterir. Noktanın konumu, piyasada satıcı mı yoksa alıcı avantajı mı olduğunu anlamanızı sağlar.\n\nSol üst: Satıcı avantajı | Sağ alt: Alıcı avantajı | Orta: Denge\n\nAcıbadem genellikle denge veya satıcı avantajı bölgesindedir; bu da fiyatların kolay kolay düşmediği, talebin güçlü olduğu anlamına gelir.
                        </p>
                    </div>
                    <div className="h-64 relative">
                        {/* Custom Axis Labels overlaid */}
                        <div className="absolute top-2 left-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 z-10">Güçlü Tutunma</div>
                        <div className="absolute bottom-10 left-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200 z-10">Denge Bölgesi</div>
                        <div className="absolute bottom-10 right-2 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200 z-10">Yüksek Baskı</div>

                        <ResponsiveContainer>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis type="number" dataKey="x" name="İlan Baskısı" domain={[0, 100]} hide />
                                <YAxis type="number" dataKey="y" name="Momentum" domain={[0, 100]} hide />
                                <Tooltip content={<InterpretativeTooltip text="Arz baskısına karşı fiyatın direnç seviyesi." />} />

                                <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="#10B981" fillOpacity={0.05} />
                                <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="#EF4444" fillOpacity={0.05} />
                                <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="#3B82F6" fillOpacity={0.05} />

                                <Scatter name="Konum" data={data.section6.data} fill="#8884d8">
                                    <Cell fill="#4F46E5" />
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-1 py-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            İlan Baskısı
                        </span>
                        <ScoreInfoTooltip
                            title={scoreExplanations.listingPressure.title}
                            description={scoreExplanations.listingPressure.description}
                            formula={scoreExplanations.listingPressure.formula}
                            position="top"
                        />
                    </div>
                    <AnalysisBox text={data.section6.interpretation} />
                </Card>

                {/* 7. GENEL SKORLAR (Footer) */}
                <Card title="7. Genel Sentez ve AI Kararı" icon={ClipboardList} cols="col-span-1 lg:col-span-2">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-56 w-full md:w-1/3">
                            <ResponsiveContainer>
                                <RadarChart outerRadius={80} data={data.section7.data}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                    <Radar dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                                    <Tooltip content={<InterpretativeTooltip text="Bölgenin genel performans karinesi." />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-2/3">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-white/5 dark:to-white/5 p-6 rounded-2xl border border-indigo-100 dark:border-white/10">
                                <h4 className="font-bold text-indigo-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-indigo-500" />
                                    Yapay Zeka Kararı
                                </h4>
                                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                                    {data.section7.text}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-5 gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800 flex flex-col justify-center h-full">
                            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-1 flex items-center justify-center">
                                {getScoreLegend(data.section7.data[0]?.A).label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                                Skor: {data.section7.data[0]?.A?.toFixed(0) || '—'}
                            </div>
                            <div className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1">
                                Momentum
                                <ScoreInfoTooltip
                                    title={scoreExplanations.overallMomentum.title}
                                    description={scoreExplanations.overallMomentum.description}
                                    formula={scoreExplanations.overallMomentum.formula}
                                    position="top"
                                />
                            </div>
                        </div>
                        <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800 flex flex-col justify-center h-full">
                            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-1 flex items-center justify-center">
                                {getScoreLegend(data.section7.data[1]?.A).label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                                Skor: {data.section7.data[1]?.A?.toFixed(0) || '—'}
                            </div>
                            <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1">
                                İstikrar
                                <ScoreInfoTooltip
                                    title={scoreExplanations.overallStability.title}
                                    description={scoreExplanations.overallStability.description}
                                    formula={scoreExplanations.overallStability.formula}
                                    position="top"
                                />
                            </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-1 flex items-center justify-center">
                                {getScoreLegend(data.section7.data[2]?.A).label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                                Skor: {data.section7.data[2]?.A?.toFixed(0) || '—'}
                            </div>
                            <div className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-1">
                                Süreklilik
                                <ScoreInfoTooltip
                                    title={scoreExplanations.overallContinuity.title}
                                    description={scoreExplanations.overallContinuity.description}
                                    formula={scoreExplanations.overallContinuity.formula}
                                    position="top"
                                />
                            </div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800">
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-1 flex items-center justify-center">
                                {getScoreLegend(data.section7.data[3]?.A).label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                                Skor: {data.section7.data[3]?.A?.toFixed(0) || '—'}
                            </div>
                            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
                                Arz Dengesi
                                <ScoreInfoTooltip
                                    title={scoreExplanations.overallSupplyBalance.title}
                                    description={scoreExplanations.overallSupplyBalance.description}
                                    formula={scoreExplanations.overallSupplyBalance.formula}
                                    position="top"
                                />
                            </div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800 mr-4">
                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mb-1">
                                {getScoreLegend(data.section7.data[4]?.A).label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                                Skor: {data.section7.data[4]?.A?.toFixed(0) || '—'}
                            </div>
                            <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1">
                                Uzun Vade
                                <ScoreInfoTooltip
                                    title={scoreExplanations.overall3YearPotential.title}
                                    description={scoreExplanations.overall3YearPotential.description}
                                    formula={scoreExplanations.overall3YearPotential.formula}
                                    position="left"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

// --- LOGIC INTERPRETERS (UNCHANGED LOGIC) ---
function getPriceStoryText(timeSeries: any[], avg: number) {
    if (!timeSeries.length) return "Veri seti hazırlanıyor.";
    const last = timeSeries[timeSeries.length - 1].value;
    const first = timeSeries[0].value;
    const trend = last > first ? "Yükseliş" : "Düşüş";
    const pos = last > avg ? "Ortalama Üzeri" : "Ortalama Altı";
    return `Fiyatlar genel olarak ${trend} trendinde olup, şu an tarihsel ortalamanın ${pos}ndedir.`;
}

function getDivergenceText(momentum: number, longTerm: number) {
    const diff = Math.abs(momentum - longTerm);
    if (diff < 15) return "Kısa ve uzun vadeli göstergeler uyumlu, sağlıklı bir trend yapısı görülüyor.";
    if (momentum > longTerm) return "Kısa vadeli talep artışı uzun vade trendinin önüne geçmiş durumda.";
    return "Mevcut durgunluğa rağmen bölgenin uzun vade potansiyeli güçlü.";
}

function getMomentumText(m: number) {
    if (m >= 75) return "Bölge kısa vadede yüksek hızda değer üretiyor; fiyatlar güçlü bir ivmeye sahip.";
    if (m >= 50) return "Kısa vadede dengeli ama yukarı yönlü bir hareket söz konusu.";
    if (m >= 30) return "Momentum ılımlı; piyasa seçici alıcılarla temkinli bir fiyatlama içinde.";
    return "Kısa vadeli fiyat hareketleri zayıf; bölge daha çok uzun vade hikâyesiyle öne çıkıyor.";
}

function getLongTermText(l: number) {
    if (l >= 75) return "Uzun vadeli potansiyel güçlü; bölge orta-uzun vadede değer koruma ve artış vadeden bir profil çiziyor.";
    if (l >= 50) return "Uzun vadeli görünüm dengeli; bölge, döngüsel dalgalanmalara rağmen çizgisini koruyor.";
    if (l >= 30) return "Uzun vadede temkinli olmak gereken, seçici fırsatlar barındıran bir piyasa yapısı var.";
    return "Uzun vade skoru düşük; bölge daha çok kısa dönem fırsatlarıyla değerlendirilmelidir.";
}

function getDeviationText(d: number) {
    const ad = Math.abs(d);
    if (ad < 10) return "Kısa ve uzun vade neredeyse aynı hizada; fiyatlama tarafında büyük bir sürpriz alanı yok.";
    if (ad < 25) return "Vade algıları arasında kontrollü bir fark var; bu fark seçici yatırımcı için okuması kolay bir alan yaratıyor.";
    return "Kısa ve uzun vade arasında belirgin bir ayrışma var; zamanlama kararı, getiri profili üzerinde kritik rol oynuyor.";
}

function getVadeSummaryText(momentum: number, longTerm: number, deviation: number) {
    const base = getDivergenceText(momentum, longTerm);
    if (Math.abs(deviation) < 10) {
        return `${base} Üç gösterge birlikte okunduğunda, vade tercihinde esnek davranılabilecek dengeli bir görünüm ortaya çıkıyor.`;
    }
    if (momentum > longTerm) {
        return `${base} Sapma skoru, özellikle kısa vadede fırsat kollayan yatırımcılar için zamanlamanın kritik olduğunu işaret ediyor.`;
    }
    return `${base} Uzun vade skoru ve sapma birlikte değerlendirildiğinde, sabırlı yatırımcının ödüllendirildiği bir piyasa yapısı öne çıkıyor.`;
}

function getRiskText(stability: number, std: number) {
    const volScore = std * 1000;
    if (stability > 70 && volScore < 30) return "Güvenli Liman: Yüksek istikrar ve düşük fiyat dalgalanması.";
    if (stability < 40 && volScore > 50) return "Yüksek Profil: Bölge şu an spekülatif fiyat hareketlerine açık.";
    return "Piyasa dönemsel dalgalanmalarla birlikte dengeli bir seyir izliyor.";
}

function getVitalityText(mean: number, flow: number) {
    if (mean > 5000 && flow > 60) return "Piyasa çok canlı, alıcı ve satıcı bulmak oldukça hızlı.";
    if (flow < 40) return "İşlem derinliği sığ, likidite zaman zaman düşebiliyor.";
    return "İşlem hacmi makul seviyede, standart bir piyasa davranışı.";
}

function getBalanceText(rentTrend: number, salesMomentum: number) {
    if (rentTrend > salesMomentum) return "Kira artışları satış fiyatlarından hızlı. Yatırım geri dönüş süresi kısalıyor.";
    return "Satış fiyatları kiradan hızlı artıyor. Değer artışı odaklı bir dönem.";
}

function getPressureText(supply: number, momentum: number) {
    if (supply > 70 && momentum > 60) return "Yüksek stoğa rağmen fiyatlar düşmüyor, talep bu arzı karşılıyor.";
    if (supply > 70 && momentum < 40) return "Artan ilan sayıları fiyat üzerinde baskı oluşturmaya başlamış.";
    if (supply < 30 && momentum > 60) return "Düşük stok ortamı satıcıların elini güçlendiriyor.";
    return "Arz ve talep tarafında belirgin bir dengesizlik görülmüyor.";
}

function getSummaryText(p: any) {
    const istikrar = Number(p.piyasa_istikrar || 0).toFixed(2);
    const momentum = Number(p.fiyat_momentum || 0).toFixed(2);
    const uzunVade = Number(p.s3_uzunvade_artis_skor || 0).toFixed(2);
    const ilanBaski = Number(p.ilan_baski || 0).toFixed(2);
    
    // Piyasa karakteri belirleme
    let karakter = '';
    if (p.fiyat_momentum > 70) karakter = 'yüksek ivmeli ve dinamik';
    else if (p.fiyat_momentum > 50) karakter = 'dengeli ve hareketli';
    else if (p.fiyat_momentum > 30) karakter = 'ılımlı ve temkinli';
    else karakter = 'sakin ve durağan';
    
    // Risk profili
    let riskProfili = '';
    if (p.piyasa_istikrar > 70) riskProfili = 'Yüksek istikrar ve güvenilir yapısıyla risk profili düşük.';
    else if (p.piyasa_istikrar > 50) riskProfili = 'Makul düzeyde istikrar sunuyor, risk dengeli.';
    else if (p.piyasa_istikrar > 30) riskProfili = 'Dalgalanmalara açık, orta-yüksek risk profili.';
    else riskProfili = 'Volatilite yüksek, risk toleransı gerektiren bir yapı.';
    
    // Uzun vade değerlendirme
    let uzunVadeYorum = '';
    if (p.s3_uzunvade_artis_skor > 80) uzunVadeYorum = 'Uzun vadeli yatırım stratejileri için oldukça cazip.';
    else if (p.s3_uzunvade_artis_skor > 60) uzunVadeYorum = 'Uzun vadeli portföylere uygun bir potansiyel sunuyor.';
    else if (p.s3_uzunvade_artis_skor > 40) uzunVadeYorum = 'Uzun vadede seçici yaklaşım gerektiren bir profil.';
    else uzunVadeYorum = 'Kısa-orta vadeli stratejiler daha uygun görünüyor.';
    
    // Arz durumu
    let arzDurum = '';
    if (p.ilan_baski > 70) arzDurum = 'Yüksek ilan baskısı fiyat beklentilerini sınırlıyor.';
    else if (p.ilan_baski > 50) arzDurum = 'Arz tarafında rekabetçi bir ortam mevcut.';
    else if (p.ilan_baski > 30) arzDurum = 'Arz-talep dengesi kontrol altında.';
    else arzDurum = 'Düşük arz ortamı fiyatları destekliyor.';
    
    return `Bölge ${istikrar} istikrar skoru ve ${momentum} momentum değeriyle ${karakter} bir piyasa yapısına sahip. ${riskProfili} ${arzDurum} ${uzunVadeYorum}`;
}
