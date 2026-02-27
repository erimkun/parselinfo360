import type { FC } from 'react';
import {
    Building2, School, Bus,
    Stethoscope, Leaf,
    Filter, Activity, MapPin, Footprints
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface CapabilitiesViewProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    activeSubCategory?: string;
    onSubCategoryChange?: (subCategory: string) => void;
    subCategories?: string[];
    poiList?: any[]; // GeoJSON features
    walkingDistance?: number | null;
    onWalkingDistanceChange?: (distance: number | null) => void;
}

const CATEGORIES = [
    {
        id: 'transport',
        label: 'Ulaşım',
        icon: Bus,
        color: 'orange',
        textColor: 'text-orange-500',
        textLight: 'text-orange-700',
        bgActive: 'bg-orange-500',
        bgLight: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        ringColor: 'ring-orange-500/20',
        shadowColor: 'shadow-orange-500/20'
    },
    {
        id: 'health',
        label: 'Sağlık',
        icon: Stethoscope,
        color: 'red',
        textColor: 'text-red-500',
        textLight: 'text-red-700',
        bgActive: 'bg-red-500',
        bgLight: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        ringColor: 'ring-red-500/20',
        shadowColor: 'shadow-red-500/20'
    },
    {
        id: 'education',
        label: 'Eğitim',
        icon: School,
        color: 'yellow',
        textColor: 'text-yellow-500',
        textLight: 'text-yellow-700',
        bgActive: 'bg-yellow-500',
        bgLight: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        ringColor: 'ring-yellow-500/20',
        shadowColor: 'shadow-yellow-500/20'
    },
    {
        id: 'life',
        label: 'Yaşam',
        icon: Building2,
        color: 'teal',
        textColor: 'text-teal-500',
        textLight: 'text-teal-700',
        bgActive: 'bg-teal-500',
        bgLight: 'bg-teal-500/10',
        borderColor: 'border-teal-500/30',
        ringColor: 'ring-teal-500/20',
        shadowColor: 'shadow-teal-500/20'
    },
    {
        id: 'social',
        label: 'Sosyal',
        icon: Leaf,
        color: 'indigo',
        textColor: 'text-indigo-500',
        textLight: 'text-indigo-700',
        bgActive: 'bg-indigo-500',
        bgLight: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/30',
        ringColor: 'ring-indigo-500/20',
        shadowColor: 'shadow-indigo-500/20'
    },
];

export const CapabilitiesView: FC<CapabilitiesViewProps> = ({
    activeCategory,
    onCategoryChange,
    activeSubCategory = 'all',
    onSubCategoryChange,
    subCategories = [],
    poiList = [],
    walkingDistance,
    onWalkingDistanceChange
}) => {
    const { theme } = useTheme();
    const activeCatData = CATEGORIES.find(c => c.id === activeCategory);

    // Calculate mock score
    const score = Math.min(98, 65 + (poiList.length > 0 ? poiList.length * 1.5 : 0));

    return (
        <div className="h-full flex flex-col space-y-4">

            {/* Category Selection - Glass Buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onCategoryChange('all')}
                    className={`
              flex-1 min-w-[30%] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 backdrop-blur-sm
              ${activeCategory === 'all'
                                ? `bg-slate-600 text-white border-white/20 shadow-lg`
                                : `bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20`}
            `}
                >
                    <Filter size={16} />
                    <span className="text-xs font-bold leading-none">
                        TÜM KATEGORİ
                    </span>
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.id)}
                        className={`
              flex-1 min-w-[30%] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 backdrop-blur-sm
              ${activeCategory === cat.id
                                ? `${cat.bgActive} text-white border-white/20 shadow-lg ${cat.shadowColor}`
                                : `bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20`}
            `}
                    >
                        <cat.icon size={16} />
                        <span className="text-xs font-bold leading-none">
                            {cat.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Score Card - Themed with Active Category Color */}
            <div className={`rounded-3xl bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-5 shadow-xl border-2 ${activeCatData?.borderColor || 'border-gray-200'} relative overflow-hidden transition-all duration-500`}>
                {/* Decorative background elements - themed */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${activeCatData?.bgLight || 'bg-blue-500/10'} rounded-full blur-2xl`}></div>
                <div className={`absolute -left-4 -bottom-4 w-20 h-20 ${activeCatData?.bgLight || 'bg-blue-500/10'} rounded-full blur-xl`}></div>

                <div className="relative z-10 flex flex-row-reverse items-center justify-between">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">Bölge Verimlilik Skoru</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className={`text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br ${activeCategory === activeCatData?.id ? 'from-gray-900 to-gray-600 dark:from-white dark:to-gray-300' : 'from-blue-600 to-blue-400'}`}>
                                {Math.round(score)}
                            </span>
                            <span className="text-xl text-gray-400 font-bold">/ 100</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 w-fit">
                            <Activity size={14} className="text-green-500" />
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Yüksek Potansiyel</span>
                        </div>
                    </div>

                    {/* Data Summary (Moved Left) */}
                    <div className="text-left">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-bold">Toplam Veri</div>
                        <div className="text-3xl font-black text-gray-900 dark:text-white">{poiList.length}</div>
                        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Nokta</div>
                    </div>
                </div>

                {/* Mini progress bar - themed */}
                <div className="mt-4 h-2 w-full bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden border border-gray-200 dark:border-transparent">
                    <div
                        className={`h-full ${activeCatData?.bgActive || 'bg-blue-500'} shadow-[0_0_12px] ${activeCatData?.shadowColor || 'shadow-blue-500/50'} transition-all duration-1000`}
                        style={{ width: `${score}%` }}
                    ></div>
                </div>
            </div>

            {/* Sub-Category Buttons (Dynamic) - Themed */}
            {subCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100 dark:border-white/5">
                    <button
                        onClick={() => onSubCategoryChange?.('all')}
                        className={`
                    px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 border backdrop-blur-sm
                    ${activeSubCategory === 'all'
                                ? `${activeCatData?.bgActive || 'bg-gray-800'} text-white border-white/20 shadow-md`
                                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        TÜMÜ
                    </button>

                    {subCategories.map((sub, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSubCategoryChange?.(sub)}
                            className={`
                        px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 border backdrop-blur-sm
                        ${activeSubCategory === sub
                                    ? `${activeCatData?.bgLight || 'bg-blue-500/20'} ${theme === 'dark' ? activeCatData?.textColor : activeCatData?.textLight} ${activeCatData?.borderColor || 'border-blue-500/30'} shadow-md ring-1 ${activeCatData?.ringColor || 'ring-blue-500/20'}`
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
            )}

            {/* Walking Distance Filter Buttons */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100 dark:border-white/5">
                <button
                    onClick={() => onWalkingDistanceChange?.(null)}
                    className={`
                    flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 border backdrop-blur-sm
                    ${walkingDistance === null
                            ? `bg-slate-600 text-white border-white/20 shadow-md`
                            : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <Footprints size={14} />
                    TÜM MESAFE
                </button>

                {[5, 10, 15].map((mins) => (
                    <button
                        key={mins}
                        onClick={() => onWalkingDistanceChange?.(mins)}
                        className={`
                        flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 border backdrop-blur-sm
                        ${walkingDistance === mins
                                ? `bg-[#13f287] text-black border-white/20 shadow-md`
                                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <Footprints size={14} />
                        {mins}' YÜR.
                    </button>
                ))}

                {/* Clear Filters Button */}
                {(walkingDistance !== null) && (
                    <button
                        onClick={() => {
                            onWalkingDistanceChange?.(null);
                            onSubCategoryChange?.('all');
                        }}
                        className="ml-auto flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 border bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 backdrop-blur-sm"
                    >
                        <Filter size={14} />
                        FİLTRELERİ TEMIZLE
                    </button>
                )}
            </div>

            {/* POI List - Themed borders */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                <div className="flex items-center justify-between mb-3 sticky top-0 bg-white dark:bg-slate-950/80 backdrop-blur-md py-2 z-10">
                    <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
                        {activeSubCategory === 'all' ? 'Veri Listesi' : activeSubCategory}
                    </h4>
                    <span className="text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400 font-bold border border-gray-200 dark:border-white/10">
                        {poiList.length} Nokta
                    </span>
                </div>

                <div className="space-y-2.5 pb-4">
                    {poiList.map((poi, idx) => (
                        <div
                            key={idx}
                            className={`group p-3.5 bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:${activeCatData?.bgLight || 'bg-white/10'} border border-gray-100 dark:${activeCatData?.borderColor || 'border-white/10'} hover:border-blue-200 dark:hover:border-opacity-50 rounded-2xl transition-all cursor-default flex items-center gap-4 backdrop-blur-sm shadow-sm hover:shadow-md`}
                        >
                            <div className={`w-10 h-10 rounded-2xl ${activeCatData?.bgLight || 'bg-blue-500/10'} flex items-center justify-center ${activeCatData?.textColor || 'text-gray-400'} flex-shrink-0 shadow-inner`}>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black">{poi.properties?.skor_norm ? Number(poi.properties.skor_norm).toFixed(1) : '-'}</span>
                                    <span className="text-[8px] opacity-70">Puan</span>
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-bold text-sm text-gray-900 dark:text-white truncate mb-1">
                                    {poi.properties?.adi || poi.properties?.ad || 'İsimsiz Nokta'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 ${activeCatData?.textColor}`}>
                                        {poi.properties?.alt_kategori || poi.properties?.kategori_app || 'Genel'}
                                    </span>
                                    <span className="ml-auto font-bold text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-md">
                                        {poi.properties?.parsel_uzaklik ? `${Math.round(poi.properties.parsel_uzaklik)} mt` : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {poiList.length === 0 && (
                        <div className="text-center py-16 flex flex-col items-center gap-4 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                            <Filter size={32} className="text-gray-300 dark:text-gray-700" />
                            <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider text-center px-6">Bu kategori için veri bulunamadı</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
