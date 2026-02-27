import type { FC, ReactNode } from 'react';
import { FileDown, Sun, Moon, User, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { useCompany } from '../../contexts/CompanyContext';
import { ProfilePage } from '../features/profile/ProfilePage';
import { useState } from 'react';
import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

export type TabId = 'overview' | 'capabilities' | 'demographics' | 'market' | 'strategy';

interface SidebarProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    children: ReactNode;
    parcelData?: FeatureCollection<Geometry, GeoJsonProperties> | null;
}

export const Sidebar: FC<SidebarProps> = ({ activeTab, onTabChange, children, parcelData }) => {
    const { theme, toggleTheme } = useTheme();
    const { logout, adaParsel } = useCompany();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Extract mahalle name from parcel data
    const mahalleName = parcelData?.features?.[0]?.properties?.Mahalle || 'Bulgurlu';
    const ilceAdi = parcelData?.features?.[0]?.properties?.ilce || 'Üsküdar';

    const tabs: { id: TabId; label: string; activeColor: string }[] = [
        { id: 'overview', label: 'Genel Bakış', activeColor: 'bg-blue-600 dark:bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)] border-blue-400/50' },
        { id: 'capabilities', label: 'Olanaklar', activeColor: 'bg-green-600 dark:bg-green-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.4)] border-green-400/50' },
        { id: 'demographics', label: 'Demografi', activeColor: 'bg-purple-600 dark:bg-purple-500 text-white shadow-[0_4px_12px_rgba(168,85,247,0.4)] border-purple-400/50' },
        { id: 'market', label: 'Pazar', activeColor: 'bg-orange-600 dark:bg-orange-500 text-white shadow-[0_4px_12px_rgba(249,115,22,0.4)] border-orange-400/50' },
        { id: 'strategy', label: 'AI Strateji', activeColor: 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.4)] border-indigo-400/50' },
    ];

    return (
        <div className="flex flex-col h-full bg-white/80 dark:bg-slate-900/75 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 shadow-2xl relative transition-all duration-500">

            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-500/5 dark:from-white/5 to-transparent pointer-events-none"></div>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 blur-[80px] pointer-events-none mix-blend-normal dark:mix-blend-screen"></div>

            <header className="px-6 py-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center shrink-0 relative z-10">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight drop-shadow-sm">Parsel360</h1>
                    <p className="text-xs text-gray-500 dark:text-blue-200/80 font-medium mt-1 tracking-wide uppercase">{ilceAdi} • {mahalleName}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsProfileOpen(true)}
                        className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm"
                        title="Profil"
                    >
                        <User size={18} />
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm"
                        title={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button 
                        onClick={logout}
                        className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-red-100 dark:hover:bg-red-500/20 text-gray-600 dark:text-white/80 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-white/5 hover:border-red-300 dark:hover:border-red-500/30 transition-all shadow-sm"
                        title="Çıkış Yap"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <div className="px-6 py-5 overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-gray-50 dark:border-white/5 shrink-0 relative z-10">
                <nav className="flex space-x-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 border",
                                activeTab === tab.id
                                    ? (tab.activeColor || "bg-blue-600 text-white border-blue-400 shadow-md backdrop-blur-md")
                                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar overflow-visible">
                {children}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-slate-900/40 shrink-0 relative z-10 backdrop-blur-md">
                <button
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-500/20 hover:bg-blue-700 dark:hover:bg-blue-500/30 text-white dark:text-blue-100 text-sm font-semibold py-3 px-4 rounded-xl shadow-lg border border-blue-600 dark:border-blue-400/30 hover:border-blue-700 dark:hover:border-blue-400/50 transition-all backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
                    onClick={async () => {
                        // Projeye özel raporu indir (ada_parsel'e göre)
                        const raporUrl = `/data/rapor/${adaParsel}.pdf`;
                        const link = document.createElement('a');
                        link.href = raporUrl;
                        link.download = `Parsel360_Rapor_${adaParsel}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                >
                    <FileDown size={18} />
                    Rapor İndir
                </button>
            </div>

            {/* Profile Page Modal */}
            {isProfileOpen && <ProfilePage onClose={() => setIsProfileOpen(false)} />}
        </div>
    );
};
