import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, Pause, Play,
    Sparkles, TrendingUp, Users, Layers, X, Maximize2,
    Activity, BarChart3, Target, ShieldCheck,
    ArrowUpRight, ArrowDownRight, Zap, Briefcase, Home, BrainCircuit
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// --- Types & AI Data Structures ---

// 1. Persona Insight Data
interface PersonaInsight {
    id: number;
    role: string; // e.g., "Yatırımcı (Investor)"
    icon: any;
    aiScore: number;
    confidence: 'Yüksek' | 'Orta' | 'Düşük';
    metrics: { label: string; value: string; trend?: 'up' | 'down' | 'stable' }[];
    insightText: string;
}

// 2. Scenario Analysis Data
interface ScenarioAnalysis {
    id: number;
    title: string;
    status: 'Positive' | 'Neutral' | 'Risk';
    drivers: { label: string; icon: any }[];
    insightText: string;
}

const PERSONA_DATA: PersonaInsight[] = [
    {
        id: 1,
        role: "Fırsat Yatırımcısı",
        icon: Briefcase,
        aiScore: 94,
        confidence: 'Yüksek',
        metrics: [
            { label: "Fiyat Trendi (12 Ay)", value: "+%18.5", trend: "up" },
            { label: "Talep Yoğunluğu", value: "9.2/10", trend: "up" },
            { label: "Kira Getirisi", value: "%5.8", trend: "stable" }
        ],
        insightText: "Yapay zeka modellerimiz, bölgedeki işlem hacmi ivmesi ve stok erime hızına dayanarak bu profil için 'Güçlü Alım' sinyali üretmektedir."
    },
    {
        id: 2,
        role: "Uzun Vadeli Oturum",
        icon: Home,
        aiScore: 82,
        confidence: 'Orta',
        metrics: [
            { label: "Demografik Uyum", value: "%85", trend: "up" },
            { label: "Sosyal İmkanlar", value: "7.4/10", trend: "stable" },
            { label: "Değer Koruma", value: "Yüksek", trend: "up" }
        ],
        insightText: "Bölgenin sosyo-kültürel dönüşüm verileri, 5+ yıl vadeli oturum hedefleri için riskin düşük, yaşam kalitesi potansiyelinin yüksek olduğunu öngörmektedir."
    },
    {
        id: 3,
        role: "Ticari Geliştirici",
        icon: Zap,
        aiScore: 65,
        confidence: 'Düşük',
        metrics: [
            { label: "Ticari Zonlama", value: "Kısıtlı", trend: "down" },
            { label: "Yaya Trafiği", value: "Orta", trend: "stable" },
            { label: "Dönüşüm Maliyeti", value: "Yüksek", trend: "up" }
        ],
        insightText: "Mevcut imar planı ve ticari ruhsat yoğunluğu verileri, bu taşınmazın ticari dönüşüm senaryoları için, henüz 'Bekle-Gör' aşamasında olduğunu işaret etmektedir."
    }
];

const SCENARIO_DATA: ScenarioAnalysis[] = [
    {
        id: 1,
        title: "Agresif Değer Artışı",
        status: "Positive",
        drivers: [
            { label: "Stok Erime Hızı", icon: Activity },
            { label: "Metro Entegrasyonu", icon: Zap },
            { label: "Kurumsal Talep", icon: Users }
        ],
        insightText: "Tahmine dayalı algoritmalar, bölgedeki altyapı projelerinin tamamlanmasıyla birlikte önümüzdeki 18 ayda %25-30 bandında reel değer artışı olasılığını %78 olarak hesaplamaktadır."
    },
    {
        id: 2,
        title: "Kira Getirisi İstikrarı",
        status: "Neutral",
        drivers: [
            { label: "Kiracı Profili", icon: Users },
            { label: "Doluluk Oranı", icon: Target },
        ],
        insightText: "Kısa dönem kiralama regülasyonlarındaki belirsizlik riski, yapay zeka tarafından 'Orta Düzey Risk' olarak puanlanmıştır. Uzun dönemli kontratlar daha güvenli bir nakit akışı sunmaktadır."
    }
];

export const FloatingStrategyPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'scenarios' | 'personas'>('scenarios');

    // Sliders state
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [personaIndex, setPersonaIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // Auto-play Logic
    useEffect(() => {
        let interval: any;
        if (isPlaying && isOpen) {
            interval = setInterval(() => {
                if (activeTab === 'scenarios') {
                    setScenarioIndex((prev) => (prev + 1) % SCENARIO_DATA.length);
                } else {
                    setPersonaIndex((prev) => (prev + 1) % PERSONA_DATA.length);
                }
            }, 8000); // 8 seconds per slide for reading
        }
        return () => clearInterval(interval);
    }, [isPlaying, isOpen, activeTab]);

    const handleNext = () => {
        if (activeTab === 'scenarios') setScenarioIndex((prev) => (prev + 1) % SCENARIO_DATA.length);
        else setPersonaIndex((prev) => (prev + 1) % PERSONA_DATA.length);
        setIsPlaying(false);
    };

    const handlePrev = () => {
        if (activeTab === 'scenarios') setScenarioIndex((prev) => (prev - 1 + SCENARIO_DATA.length) % SCENARIO_DATA.length);
        else setPersonaIndex((prev) => (prev - 1 + PERSONA_DATA.length) % PERSONA_DATA.length);
        setIsPlaying(false);
    };

    return (
        <div className="absolute bottom-8 right-8 z-[1000] flex flex-col items-end pointer-events-none">

            <AnimatePresence mode="wait">
                {!isOpen ? (
                    /* TRIGGER BUTTON (High Contrast Glass) */
                    <motion.button
                        key="trigger-btn"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-full bg-white/80 dark:bg-slate-900/60 text-gray-900 dark:text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-gray-200 dark:border-white/20 backdrop-blur-xl hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-all group"
                    >
                        <div className="relative">
                            <BrainCircuit size={22} className="text-blue-300 group-hover:text-white transition-colors" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-slate-900 shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
                        </div>
                        <div className="flex flex-col items-start leading-none gap-0.5">
                            <span className="text-[11px] text-blue-600 dark:text-blue-200 font-bold font-mono tracking-widest uppercase">AI ANALYZER</span>
                            <span className="font-bold text-sm tracking-wide text-gray-900 dark:text-white drop-shadow-sm">Yatırım Zekası</span>
                        </div>
                    </motion.button>
                ) : (
                    /* EXPANDED CARD (High Contrast Glass) */
                    <motion.div
                        key="strategy-card"
                        initial={{ y: 20, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.95 }}
                        className="pointer-events-auto w-[420px] bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl border border-gray-200 dark:border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative"
                    >
                        {/* Gradient Glow - Stronger */}
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/30 rounded-full blur-[90px] pointer-events-none mix-blend-screen"></div>
                        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-600/30 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>

                        {/* --- HEADER TABS --- */}
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-black/30 relative z-10">
                            <div className="flex bg-gray-200/50 dark:bg-black/30 rounded-full p-1.5 border border-gray-200 dark:border-white/10 shadow-inner">
                                <button
                                    onClick={() => { setActiveTab('scenarios'); setIsPlaying(true); }}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                                        activeTab === 'scenarios' ? "bg-blue-600/80 text-white shadow-lg shadow-blue-900/50 ring-1 ring-white/20 backdrop-blur-sm" : "text-gray-400 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <Target size={14} /> Senaryolar
                                </button>
                                <button
                                    onClick={() => { setActiveTab('personas'); setIsPlaying(true); }}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2",
                                        activeTab === 'personas' ? "bg-purple-600/80 text-white shadow-lg shadow-purple-900/50 ring-1 ring-white/20 backdrop-blur-sm" : "text-gray-400 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    <Users size={14} /> Personalar
                                </button>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2.5 text-white/70 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/20 border border-white/5 hover:border-white/20">
                                <X size={20} />
                            </button>
                        </div>

                        {/* --- CONTENT SLIDER --- */}
                        <div className="p-6 min-h-[300px] relative z-10 flex flex-col justify-between">
                            <AnimatePresence mode="wait">
                                {activeTab === 'scenarios' ? (
                                    /* SCENARIO CARD */
                                    <motion.div
                                        key={`scenario-${SCENARIO_DATA[scenarioIndex].id}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest border rounded-lg backdrop-blur-md shadow-md",
                                                SCENARIO_DATA[scenarioIndex].status === 'Positive' ? "text-green-300 border-green-500/50 bg-green-500/20" :
                                                    SCENARIO_DATA[scenarioIndex].status === 'Neutral' ? "text-yellow-200 border-yellow-500/50 bg-yellow-500/20" : "text-red-300 border-red-500/50 bg-red-500/20"
                                            )}>
                                                {SCENARIO_DATA[scenarioIndex].status} SCENARIO
                                            </span>
                                            <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20 shadow-inner">
                                                <BarChart3 size={16} />
                                            </div>
                                        </div>

                                        <h2 className="text-3xl font-bold text-white drop-shadow-md leading-none tracking-tight">
                                            {SCENARIO_DATA[scenarioIndex].title}
                                        </h2>

                                        {/* Key Drivers */}
                                        <div className="flex gap-2.5 flex-wrap">
                                            {SCENARIO_DATA[scenarioIndex].drivers.map((d, i) => (
                                                <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-white/10 border border-gray-200 dark:border-white/20 text-xs font-bold text-gray-700 dark:text-white shadow-sm backdrop-blur-md hover:bg-white/20 transition-colors">
                                                    <d.icon size={14} className="text-blue-600 dark:text-blue-300" />
                                                    {d.label}
                                                </div>
                                            ))}
                                        </div>

                                        {/* AI Interpretation */}
                                        <div className="bg-gradient-to-br from-blue-600/10 to-gray-50 dark:from-blue-600/20 dark:to-slate-800/60 border border-blue-400/30 p-5 rounded-2xl relative overflow-hidden shadow-lg backdrop-blur-md group hover:border-blue-400/50 transition-colors">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                                            <div className="flex items-start gap-4">
                                                <BrainCircuit size={22} className="text-blue-600 dark:text-blue-300 shrink-0 mt-0.5 animate-pulse drop-shadow-md" />
                                                <p className="text-[13px] text-gray-900 dark:text-white leading-relaxed font-bold drop-shadow-sm opacity-95">
                                                    {SCENARIO_DATA[scenarioIndex].insightText}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* PERSONA CARD */
                                    <motion.div
                                        key={`persona-${PERSONA_DATA[personaIndex].id}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-600/40 to-pink-600/40 text-white border border-white/30 shadow-lg shadow-purple-900/20">
                                                    {(() => { const Icon = PERSONA_DATA[personaIndex].icon; return <Icon size={24} />; })()}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white drop-shadow-md tracking-tight">{PERSONA_DATA[personaIndex].role}</h3>
                                                    <span className="text-[10px] text-purple-600 dark:text-purple-200 uppercase tracking-widest font-black opacity-90">AI MATCH SCORE</span>
                                                </div>
                                            </div>

                                            {/* AI Score Circle */}
                                            <div className="flex flex-col items-center">
                                                <div className="text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-600 to-purple-400 dark:from-white dark:to-purple-300 drop-shadow-lg">
                                                    {PERSONA_DATA[personaIndex].aiScore}
                                                </div>
                                                <div className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/20 border border-purple-400/30 text-purple-600 dark:text-purple-100 font-bold shadow-sm backdrop-blur-sm">
                                                    {PERSONA_DATA[personaIndex].confidence} Güven
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metrics Grid */}
                                        <div className="grid grid-cols-3 gap-2.5">
                                            {PERSONA_DATA[personaIndex].metrics.map((m, i) => (
                                                <div key={i} className="flex flex-col p-3 rounded-2xl bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/20 hover:bg-white dark:hover:bg-white/15 transition-colors backdrop-blur-md shadow-sm group">
                                                    <span className="text-[9px] text-gray-500 dark:text-gray-300 truncate mb-1.5 uppercase tracking-wide font-bold">{m.label}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors">{m.value}</span>
                                                        {m.trend === 'up' && <ArrowUpRight size={14} className="text-green-500" />}
                                                        {m.trend === 'down' && <ArrowDownRight size={14} className="text-red-500" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Insight Text */}
                                        <div className="p-5 rounded-2xl bg-purple-600/10 dark:bg-purple-900/30 border border-purple-400/30 text-[13px] text-gray-900 dark:text-white leading-relaxed font-bold relative shadow-lg backdrop-blur-md">
                                            <Sparkles size={18} className="absolute top-3.5 left-3.5 text-purple-600 dark:text-purple-300 opacity-90" />
                                            <p className="pl-7 drop-shadow-sm opacity-95">
                                                {PERSONA_DATA[personaIndex].insightText}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* --- CONTROLS --- */}
                            <div className="flex items-center justify-between pt-6 mt-2 border-t border-white/10">
                                <div className="flex gap-2">
                                    {(activeTab === 'scenarios' ? SCENARIO_DATA : PERSONA_DATA).map((_, idx) => (
                                        <div key={idx} className={cn("h-1.5 rounded-full transition-all duration-300 shadow-md",
                                            ((activeTab === 'scenarios' ? scenarioIndex : personaIndex) === idx)
                                                ? "w-10 bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                                                : "w-2.5 bg-white/20"
                                        )} />
                                    ))}
                                </div>
                                <div className="flex gap-2.5">
                                    <button onClick={handlePrev} className="p-2.5 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white transition-all border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30 shadow-lg hover:scale-105 active:scale-95"><ChevronLeft size={18} /></button>
                                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-2.5 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white transition-all border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30 shadow-lg hover:scale-105 active:scale-95">
                                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <button onClick={handleNext} className="p-2.5 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white transition-all border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30 shadow-lg hover:scale-105 active:scale-95"><ChevronRight size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
