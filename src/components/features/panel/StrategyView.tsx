import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Pause, Play,
    Sparkles, Users, Target, Activity, BrainCircuit,
    Zap, Briefcase, Home, BarChart3, ShieldCheck,
    MapPin, TrendingUp, Users2, Building, 
    BarChart2, Gauge, TreePine,
    Clock, AlertCircle, Shield, Coffee
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { dataService } from '../../../services/dataService';

// --- Types & AI Data Structures ---

interface PersonaInsight {
    id: number;
    role: string;
    icon: any;
    scenarioTitle: string;
    recommendedUnit: string;
    traits: string[];
    insightText: string;
}


const PERSONA_DATA: PersonaInsight[] = [
    {
        id: 1,
        role: "Genç Yatırımcı / Kiracı Odaklı",
        icon: Users2,
        scenarioTitle: "Yüksek Likidite & Kiralanabilirlik",
        recommendedUnit: "1+0 – 1+1",
        traits: ["20–35 yaş", "Küçük metrekare", "Hızlı kiralama", "Ulaşım & günlük hayata duyarlı"],
        insightText: "Hareketlilik ve hızlı kiralama odaklı profil; kısa geri dönüş ve likidite beklentisi ön planda."
    },
    {
        id: 2,
        role: "Aile & Yerleşik Yaşam",
        icon: Home,
        scenarioTitle: "Aile Yaşamı & Uzun Vadeli Oturum",
        recommendedUnit: "2+1 – 3+1",
        traits: ["30–50 yaş", "Eğitim–sağlık öncelikli", "Düşük dalgalanma", "Uzun vadeli plan"],
        insightText: "Yatırım hızından çok yaşam istikrarını ölçer; kalıcılık ve konfor arayan hane profili."
    },
    {
        id: 3,
        role: "Değer Artışı Odaklı Yatırımcı",
        icon: TrendingUp,
        scenarioTitle: "Gelişen Bölge & Değer Artışı",
        recommendedUnit: "1+1 – 2+1",
        traits: ["30–45 yaş", "Orta–uzun vadeli bakış", "Dönüşüm odaklı", "Bugünden çok yarını okur"],
        insightText: "Kısa vadeli sıçramadan çok birikimli değer artışını hedefleyen yatırım profili."
    },
    {
        id: 4,
        role: "Güvenli Yaşam & Düşük Risk",
        icon: Shield,
        scenarioTitle: "Yaşam Kalitesi & Düşük Risk",
        recommendedUnit: "2+1 – ferah 3+1",
        traits: ["45+", "Konfor ve sağlık öncelikli", "Düşük oynaklık", "Uzun süreli oturum"],
        insightText: "Getiri hızından çok riskten kaçınmayı ve yaşam kalitesini öne çıkarır."
    }
];

export const StrategyView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'scenarios' | 'personas'>('scenarios');
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [personaIndex, setPersonaIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [scenarioFeatures, setScenarioFeatures] = useState<any[]>([]);
    const [scenarioLoading, setScenarioLoading] = useState(true);
    const hasInitScenarioIndex = useRef(false);

    const selectedNeighborhoodName = 'ACIBADEM';

    useEffect(() => {
        dataService.getScenarioCardData().then((features) => {
            setScenarioFeatures(features || []);
            setScenarioLoading(false);
        });
    }, []);


    const handleNext = () => {
        if (activeTab === 'scenarios') setScenarioIndex((prev) => (prev + 1) % Math.max(scenarioCards.length, 1));
        else setPersonaIndex((prev) => (prev + 1) % PERSONA_DATA.length);
        setIsPlaying(false);
    };

    const handlePrev = () => {
        if (activeTab === 'scenarios') setScenarioIndex((prev) => (prev - 1 + Math.max(scenarioCards.length, 1)) % Math.max(scenarioCards.length, 1));
        else setPersonaIndex((prev) => (prev - 1 + PERSONA_DATA.length) % PERSONA_DATA.length);
        setIsPlaying(false);
    };

    const scenarioProps = useMemo(() => {
        if (!scenarioFeatures.length) return null;
        const feature = scenarioFeatures.find(
            (f) => f?.properties?.MAHALLEADI === selectedNeighborhoodName
        ) || scenarioFeatures[0];
        return feature?.properties || null;
    }, [scenarioFeatures]);

    const scenarioCards = useMemo(() => {
        if (!scenarioProps) return [];

        return [
            {
                id: 1,
                title: 'Yüksek Likidite & Kiralanabilirlik',
                description: 'Hızlı kiralama ve yatırım likiditesi için erişim, genç profil ve kiralık piyasa canlılığı birlikte ağırlıklandı.',
                score: scenarioProps.senaryo1_skor,
                housing: { types: '1+0 – 1+1', reason: 'Bu senaryo hız satar. Düşük kiralık canlılık büyük daireleri riskli kılar. Küçük daireler hızlı kiralanır ve daha kolay el değiştirir.' },
                metrics: [
                    { label: 'Ulaşım Erişimi', value: scenarioProps.ulasim_skor, tone: 'blue' },
                    { label: 'Günlük Hayat', value: scenarioProps.yasam_skor, tone: 'indigo' },
                    { label: 'Genç-Öğrenci', value: scenarioProps.genc_ogr_te, tone: 'purple' },
                    { label: 'Kiralık Canlılık', value: scenarioProps.piyasa_canlilik_1, tone: 'emerald' },
                    { label: 'Kira Momentumu', value: scenarioProps.fiyat_momentum_1, tone: 'rose' },
                ],
            },
            {
                id: 2,
                title: 'Aile Yaşamı & Uzun Vadeli Oturum',
                description: 'Eğitim, sağlık, park erişimi ve aile demografisi ile düşük dalgalanma birlikte değerlendirildi.',
                score: scenarioProps.senaryo2_skor,
                housing: { types: '2+1 – 3+1', reason: 'Yüksek istikrar uzun vadeli oturuma olanak tanır. Aile demografisi küçük daireyi dışlar. Bu profilde yaşam alanı esastır.' },
                metrics: [
                    { label: 'Eğitim', value: scenarioProps.egitim_skor, tone: 'amber' },
                    { label: 'Sağlık', value: scenarioProps.saglik_skor, tone: 'emerald' },
                    { label: 'Yeşil Alan', value: scenarioProps.yesil_alan_skor, tone: 'green' },
                    { label: 'Aile Demografi', value: scenarioProps.aile_demografi, tone: 'purple' },
                    { label: 'Volatilite', value: scenarioProps.fiyat_voltalite, tone: 'slate' },
                ],
            },
            {
                id: 3,
                title: 'Gelişen Bölge & Değer Artışı',
                description: 'Uzun dönem artış, demografik dönüşüm ve talep desteği ile gelişim potansiyeli ölçüldü.',
                score: scenarioProps.senaryo3_skor,
                housing: { types: '1+1 – 2+1', reason: 'Bölge olgun büyüme aşamasında. Büyük daireler zayıf getiri sunar. 1+1–2+1 tipi daha esnek talep ve iyi yatırım/geri dönüş dengesi sunar.' },
                metrics: [
                    { label: 'Uzun Vade Artış', value: scenarioProps.s3_uzunvade_artis_skor, tone: 'blue' },
                    { label: 'Momentum', value: scenarioProps.fiyat_momentum, tone: 'indigo' },
                    { label: 'Talep Desteği', value: scenarioProps.talep_des_erisim, tone: 'violet' },
                    { label: 'SES Dönüşüm', value: scenarioProps.ses_2023_skor, tone: 'amber' },
                    { label: 'İlan Baskısı', value: scenarioProps.ilan_baski, tone: 'red' },
                ],
            },
            {
                id: 4,
                title: 'Yaşam Kalitesi & Düşük Risk',
                description: 'Sağlık-park erişimi, 50+ yoğunluğu ve istikrar birlikte okunarak düşük risk profili oluşturuldu.',
                score: scenarioProps.senaryo4_skor,
                housing: { types: '2+1 – ferah 3+1', reason: '50+ profil küçük daireyi tercih etmez. Konfor ve kullanım alanı önceliklidir. Risk düşük olduğu için büyük metrekare tolere edilebilir.' },
                metrics: [
                    { label: 'Sağlık', value: scenarioProps.saglik_skor, tone: 'emerald' },
                    { label: 'Yeşil Alan', value: scenarioProps.yesil_alan_skor, tone: 'green' },
                    { label: '50+ Yoğunluğu', value: scenarioProps.yas50_yogunlugu, tone: 'blue' },
                    { label: 'İşlem Sürekliliği', value: scenarioProps.islem_sureklilligi, tone: 'indigo' },
                    { label: 'İstikrar', value: scenarioProps.piyasa_istikrar, tone: 'purple' },
                ],
            },
        ];
    }, [scenarioProps]);

    useEffect(() => {
        if (hasInitScenarioIndex.current) return;
        if (!scenarioCards.length) return;
        const maxIndex = scenarioCards.reduce((maxIdx, card, idx) => {
            const maxVal = Number(scenarioCards[maxIdx]?.score || 0);
            const val = Number(card?.score || 0);
            return val > maxVal ? idx : maxIdx;
        }, 0);
        setScenarioIndex(maxIndex);
        hasInitScenarioIndex.current = true;
    }, [scenarioCards]);

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                if (activeTab === 'scenarios') {
                    setScenarioIndex((prev) => (prev + 1) % Math.max(scenarioCards.length, 1));
                } else {
                    setPersonaIndex((prev) => (prev + 1) % PERSONA_DATA.length);
                }
            }, 8000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, activeTab, scenarioCards.length]);

    const maxScenarioScore = useMemo(() => {
        if (!scenarioCards.length) return 0;
        return Math.max(...scenarioCards.map(card => Number(card.score || 0)));
    }, [scenarioCards]);

    const getStatus = (score?: number, isMaxScore: boolean = false) => {
        const val = Number(score || 0);
        if (isMaxScore) return { label: 'Güçlü', classes: 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10' };
        if (val >= 80) return { label: 'Baskın', classes: 'text-purple-600 border-purple-500/30 bg-purple-500/10' };
        if (val >= 70) return { label: 'Güçlü', classes: 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10' };
        if (val >= 45) return { label: 'Dengeli', classes: 'text-amber-600 border-amber-500/30 bg-amber-500/10' };
        return { label: 'Temkinli', classes: 'text-rose-600 border-rose-500/30 bg-rose-500/10' };
    };

    const scenarioStatusByTitle = useMemo(() => {
        const map = new Map<string, ReturnType<typeof getStatus>>();
        scenarioCards.forEach((card) => {
            const isMax = Number(card.score || 0) === maxScenarioScore;
            map.set(card.title, getStatus(card.score, isMax));
        });
        return map;
    }, [scenarioCards, maxScenarioScore]);

    const getPersonaEvaluation = (scenarioTitle: string) => {
        const status = scenarioStatusByTitle.get(scenarioTitle) || getStatus(0);
        const text = status.label === 'Baskın'
            ? 'Acıbadem profili bu persona için güçlü uyum gösteriyor.'
            : status.label === 'Güçlü'
                ? 'Acıbadem profili bu persona için destekleyici.'
                : status.label === 'Dengeli'
                    ? 'Acıbadem profili bu persona için dengeli, temkinli okuma önerilir.'
                    : 'Acıbadem profili bu persona için sınırlı uyum gösteriyor.';
        return { status, text };
    };

    const toBand = (value?: number | null) => {
        if (value == null || Number.isNaN(Number(value))) return 'belirsiz';
        const val = Number(value);
        if (val >= 70) return 'yüksek';
        if (val >= 45) return 'orta';
        return 'düşük';
    };

    const buildScenarioInsight = (card: any, isMaxScore: boolean) => {
        const metrics = card.metrics
            .filter((m: any) => m.value != null)
            .map((m: any) => `${m.label.toLowerCase()} ${toBand(m.value)} seviyede`)
            .slice(0, 3)
            .join(', ');

        const status = getStatus(card.score, isMaxScore).label.toLowerCase();
        const scoreNarrative = status === 'baskın'
            ? 'Bu senaryo baskın şekilde ortaya çıkıyor; göstergeler güçlü, tutarlı ve yatırımcılar için en uygun profili oluşturuyor.'
            : status === 'güçlü'
                ? 'Senaryo güçlü görünüyor çünkü temel göstergeler uyumlu ve destekleyici.'
                : status === 'dengeli'
                    ? 'Senaryo dengeli; bazı göstergeler güçlü, bazıları ise temkinli sinyaller veriyor.'
                    : 'Senaryo temkinli; destekleyici sinyaller sınırlı ve risk iştahı gerektiriyor.';

        return `${scoreNarrative} Özellikle ${metrics} olması bu senaryoyu öne çıkarıyor.`;
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header Tabs */}
            <div className="flex bg-gray-100 dark:bg-white/5 rounded-2xl p-1.5 border border-gray-200 dark:border-white/10 shadow-inner">
                <button
                    onClick={() => { setActiveTab('scenarios'); setIsPlaying(true); }}
                    className={cn(
                        "flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                        activeTab === 'scenarios'
                            ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    )}
                >
                    <Target size={14} /> Senaryolar
                </button>
                <button
                    onClick={() => { setActiveTab('personas'); setIsPlaying(true); }}
                    className={cn(
                        "flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                        activeTab === 'personas'
                            ? "bg-purple-600 dark:bg-purple-500 text-white shadow-lg"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    )}
                >
                    <Users size={14} /> Personalar
                </button>
            </div>

            {/* Content Area - Expanded */}
            <div className="min-h-[480px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                    {activeTab === 'scenarios' ? (
                        <motion.div
                            key={`scenario-${scenarioIndex}`}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div 
                                        className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Target size={18} />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Senaryo Analizi</h2>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{selectedNeighborhoodName} için yapay zeka okuması</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-200 dark:border-blue-500/30 text-[10px] font-bold text-blue-600 dark:text-blue-300">
                                    <Sparkles size={12} /> Niteliksel Değerlendirme
                                </div>
                            </div>

                            {scenarioLoading ? (
                                <div className="py-10 text-center text-sm text-gray-500">Senaryolar hazırlanıyor...</div>
                            ) : (
                                (() => {
                                    const card = scenarioCards[scenarioIndex];
                                    if (!card) return <div className="py-10 text-center text-sm text-gray-500">Senaryo verisi bulunamadı.</div>;
                                    const isMax = Number(card.score || 0) === maxScenarioScore;
                                    const status = getStatus(card.score, isMax);
                                    return (
                                        <motion.div 
                                            className="bg-gradient-to-br from-white to-blue-50 dark:from-white/5 dark:to-blue-500/5 rounded-3xl p-5 border border-gray-200 dark:border-white/10 shadow-md space-y-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {/* Status Badge */}
                                            <div className="flex items-center justify-between">
                                                <motion.span 
                                                    className={cn("px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border rounded-full", status.classes)}
                                                    animate={{ scale: [1, 1.02, 1] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                >
                                                    ● {status.label} Senaryo
                                                </motion.span>
                                            </div>

                                            {/* Title + Description */}
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                                                    {card.title}
                                                </h3>
                                                <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    {card.description}
                                                </p>
                                            </div>

                                            {/* AI Insight Box - Enhanced */}
                                            <motion.div 
                                                className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-300/30 dark:border-blue-500/30 p-5 rounded-2xl relative overflow-hidden"
                                                whileHover={{ boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)" }}
                                            >
                                                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>
                                                <div className="flex items-start gap-3">
                                                    <motion.div 
                                                        className="text-blue-500"
                                                        animate={{ rotate: [0, 10, -10, 0] }}
                                                        transition={{ duration: 3, repeat: Infinity }}
                                                    >
                                                        <BrainCircuit size={22} />
                                                    </motion.div>
                                                    <p className="text-[12px] text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                                                        {buildScenarioInsight(card, isMax)}
                                                    </p>
                                                </div>
                                            </motion.div>

                                            {/* Housing Recommendation */}
                                            {card.housing && (
                                                <motion.div 
                                                    className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 border border-orange-300/30 dark:border-orange-500/30 p-4 rounded-2xl"
                                                    whileHover={{ scale: 1.01 }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="text-orange-600 dark:text-orange-400 mt-0.5">🏠</div>
                                                        <div>
                                                            <div className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-1">İdeal Daire Tipi</div>
                                                            <div className="text-lg font-black text-orange-900 dark:text-orange-100 mb-2">
                                                                {card.housing.types}
                                                            </div>
                                                            <p className="text-[11px] text-orange-800 dark:text-orange-200 leading-relaxed">
                                                                {card.housing.reason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Metrics Grid - Enhanced */}
                                            <div>
                                                <div className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Destekleyici Göstergeler</div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {card.metrics.slice(0, 5).map((metric: any, idx: number) => {
                                                        const val = Number(metric.value || 0);
                                                        const band = val >= 70 ? 'yüksek' : val >= 45 ? 'orta' : 'düşük';
                                                        
                                                        // Icon selector based on metric label
                                                        const getMetricIcon = () => {
                                                            const label = metric.label.toLowerCase();
                                                            if (label.includes('ulaşım') || label.includes('erişim')) return <MapPin size={16} />;
                                                            if (label.includes('trend') || label.includes('momentum')) return <TrendingUp size={16} />;
                                                            if (label.includes('genç') || label.includes('öğrenci') || label.includes('demografi')) return <Users2 size={16} />;
                                                            if (label.includes('kiralık') || label.includes('canlılık')) return <Building size={16} />;
                                                            if (label.includes('volatilite') || label.includes('istikrar')) return <Gauge size={16} />;
                                                            if (label.includes('sağlık')) return <Shield size={16} />;
                                                            if (label.includes('yeşil') || label.includes('park')) return <TreePine size={16} />;
                                                            if (label.includes('eğitim')) return <Coffee size={16} />;
                                                            if (label.includes('sürekliliği')) return <Clock size={16} />;
                                                            if (label.includes('uzun vade') || label.includes('artış')) return <TrendingUp size={16} />;
                                                            if (label.includes('talep')) return <BarChart2 size={16} />;
                                                            if (label.includes('ses')) return <Zap size={16} />;
                                                            if (label.includes('ilan') || label.includes('baskı')) return <AlertCircle size={16} />;
                                                            if (label.includes('50+') || label.includes('yaş')) return <Users size={16} />;
                                                            if (label.includes('aile')) return <Home size={16} />;
                                                            return <Activity size={16} />;
                                                        };
                                                        
                                                        const bandBg = band === 'yüksek' ? 'from-emerald-500/20 to-emerald-500/5 border-emerald-300/50' : 
                                                                      band === 'orta' ? 'from-amber-500/20 to-amber-500/5 border-amber-300/50' :
                                                                      'from-red-500/20 to-red-500/5 border-red-300/50';
                                                        
                                                        const bandText = band === 'yüksek' ? 'text-emerald-700 dark:text-emerald-300' : 
                                                                        band === 'orta' ? 'text-amber-700 dark:text-amber-300' :
                                                                        'text-red-700 dark:text-red-300';
                                                        
                                                        const bandDot = band === 'yüksek' ? 'bg-emerald-500' : 
                                                                       band === 'orta' ? 'bg-amber-500' :
                                                                       'bg-red-500';
                                                        
                                                        const bandLabel = band === 'yüksek' ? 'Yüksek' : 
                                                                         band === 'orta' ? 'Orta' :
                                                                         'Düşük';
                                                        
                                                        return (
                                                            <motion.div 
                                                                key={idx} 
                                                                className={cn("relative overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 backdrop-blur-sm", bandBg, "bg-gradient-to-br")}
                                                                whileHover={{ 
                                                                    scale: 1.03,
                                                                    boxShadow: band === 'yüksek' ? '0 0 20px rgba(16, 185, 129, 0.15)' : 
                                                                              band === 'orta' ? '0 0 20px rgba(245, 158, 11, 0.15)' :
                                                                              '0 0 20px rgba(239, 68, 68, 0.15)'
                                                                }}
                                                            >
                                                                {/* Background decoration */}
                                                                <div className="absolute -right-8 -top-8 w-16 h-16 opacity-10 rounded-full"
                                                                    style={{ background: band === 'yüksek' ? '#10b981' : band === 'orta' ? '#f59e0b' : '#ef4444' }}
                                                                />
                                                                
                                                                {/* Content */}
                                                                <div className="relative p-3.5 flex flex-col gap-2">
                                                                    {/* Label + Icon Row */}
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2 flex-1">
                                                                            <div className={cn("p-1.5 rounded-lg text-gray-700 dark:text-gray-200", bandText)}>
                                                                                {getMetricIcon()}
                                                                            </div>
                                                                            <span className={cn("text-[10px] font-bold uppercase tracking-wide line-clamp-2", bandText)}>
                                                                                {metric.label}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Status Badge */}
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={cn("w-2 h-2 rounded-full", bandDot)}></div>
                                                                        <span className={cn("text-[11px] font-bold tracking-wide", bandText)}>
                                                                            {bandLabel}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Summary Line */}
                                            <div className="pt-3 border-t border-gray-200 dark:border-white/10">
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 italic leading-relaxed">
                                                    {status.label === 'Baskın' && '👑 Bu senaryo dominant ve en uygun yatırım stratejisidir; tüm göstergeler uyumlu.'}
                                                    {status.label === 'Güçlü' && '🎯 Bu senaryo, bölgenin güçlü yönlerini öne çıkarmak için optimize edilmiştir.'}
                                                    {status.label === 'Dengeli' && '⚖️ Bu senaryo, avantajları ve sınırlamalarını dengeli şekilde göstermektedir.'}
                                                    {status.label === 'Temkinli' && '⚠️ Bu senaryo, dikkatli değerlendirme ve ek araştırma gerektirmektedir.'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })()
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`persona-${PERSONA_DATA[personaIndex].id}`}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-4"
                        >
                            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
                                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">Persona üretim akışı</div>
                                <ul className="text-[11px] text-gray-600 dark:text-gray-300 space-y-1">
                                    <li>• Mahalle verileri 0–100 normalize edilir</li>
                                    <li>• Senaryolara farklı ağırlıklarla bağlanır</li>
                                    <li>• Persona–senaryo eşleşmesi yorum katmanıyla sunulur</li>
                                </ul>
                            </div>

                            <motion.div 
                                className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/5 dark:to-violet-500/5 rounded-3xl p-5 border border-purple-200 dark:border-purple-500/30 shadow-md space-y-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {(() => {
                                    const persona = PERSONA_DATA[personaIndex];
                                    const evaluation = getPersonaEvaluation(persona.scenarioTitle);
                                    const Icon = persona.icon;
                                    return (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <motion.div 
                                                        className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/30 to-violet-500/30 text-purple-600 dark:text-purple-400 border border-purple-300 dark:border-purple-500/50"
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        <Icon size={24} />
                                                    </motion.div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{persona.role}</h3>
                                                        <div className="text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-widest font-black">Persona profili</div>
                                                    </div>
                                                </div>
                                                <div className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full", evaluation.status.classes)}>
                                                    {evaluation.status.label} Uyum
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {persona.traits.map((item, idx) => (
                                                    <div key={idx} className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2">
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-3">
                                                    <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">Uyumlu Senaryo</div>
                                                    <div className="text-[12px] font-semibold text-indigo-900 dark:text-indigo-100 mt-1">
                                                        {persona.scenarioTitle}
                                                    </div>
                                                </div>
                                                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-3">
                                                    <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">İdeal Daire Tipi</div>
                                                    <div className="text-[12px] font-semibold text-emerald-900 dark:text-emerald-100 mt-1">
                                                        {persona.recommendedUnit}
                                                    </div>
                                                </div>
                                            </div>

                                            <motion.div 
                                                className="bg-gradient-to-r from-purple-500/15 to-violet-500/15 dark:from-purple-500/30 dark:to-violet-500/30 border border-purple-300/50 dark:border-purple-500/40 p-4 rounded-2xl relative overflow-hidden"
                                                whileHover={{ boxShadow: "0 0 24px rgba(147, 51, 234, 0.12)" }}
                                            >
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-violet-500 rounded-r"></div>
                                                <div className="flex items-start gap-3 pl-1">
                                                    <Sparkles size={18} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-[12px] text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                                                            {persona.insightText}
                                                        </p>
                                                        <p className="text-[11px] text-purple-700 dark:text-purple-200 mt-2 font-semibold">
                                                            Acıbadem değerlendirmesi: {evaluation.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </>
                                    );
                                })()}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Controls - Enhanced */}
                <motion.div 
                    className="flex items-center justify-between pt-8 mt-auto border-t border-gray-200 dark:border-white/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* Indicator Dots */}
                    <div className="flex gap-2 items-center">
                        <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mr-2">
                            {activeTab === 'scenarios' ? `Senaryo ${scenarioIndex + 1}/${scenarioCards.length}` : `Persona ${personaIndex + 1}/${PERSONA_DATA.length}`}
                        </div>
                        <div className="flex gap-1.5">
                            {(activeTab === 'scenarios' ? scenarioCards : PERSONA_DATA).map((_, idx) => (
                                <motion.div 
                                    key={idx} 
                                    className={cn("rounded-full transition-all duration-300",
                                        ((activeTab === 'scenarios' ? scenarioIndex : personaIndex) === idx)
                                            ? `h-2 ${activeTab === 'scenarios' ? 'w-8 bg-blue-500' : 'w-8 bg-purple-500'}`
                                            : "w-2 h-2 bg-gray-300 dark:bg-white/20"
                                    )}
                                    whileHover={{ scale: 1.2 }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex gap-2.5">
                        <motion.button 
                            onClick={handlePrev} 
                            className="p-2.5 rounded-full border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/30 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />
                        </motion.button>
                        
                        <motion.button 
                            onClick={() => setIsPlaying(!isPlaying)} 
                            className="p-2.5 rounded-full border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/30 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isPlaying ? (
                                <Pause size={18} className="text-gray-600 dark:text-gray-300" />
                            ) : (
                                <Play size={18} className="text-gray-600 dark:text-gray-300" />
                            )}
                        </motion.button>
                        
                        <motion.button 
                            onClick={handleNext} 
                            className="p-2.5 rounded-full border border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/30 transition-all"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
