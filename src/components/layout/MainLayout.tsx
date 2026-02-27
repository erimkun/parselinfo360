import { useState, type FC, type ReactNode } from 'react';
import { Map, PanelLeft } from 'lucide-react';

interface MainLayoutProps {
    sidebar: ReactNode;
    map: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ sidebar, map }) => {
    const [mobileView, setMobileView] = useState<'sidebar' | 'map'>('sidebar');

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-text-primary-light dark:text-text-primary-dark transition-colors duration-300">
            {/* Sidebar - Mobilde toggle ile göster/gizle, Desktop'ta her zaman göster */}
            <aside className={`
                w-full lg:w-[40%] h-full z-10 shadow-xl relative flex flex-col 
                bg-panel-light dark:bg-panel-dark border-r border-gray-200 dark:border-gray-800
                ${mobileView === 'sidebar' ? 'flex' : 'hidden'} lg:flex
            `}>
                {sidebar}
            </aside>

            {/* Map - Mobilde toggle ile göster/gizle, Desktop'ta her zaman göster */}
            <main className={`
                flex-1 relative bg-gray-100 dark:bg-gray-900 overflow-hidden
                ${mobileView === 'map' ? 'flex' : 'hidden'} lg:flex
            `}>
                {map}
            </main>

            {/* Mobile Toggle Button - Sadece mobilde görünür */}
            <button
                onClick={() => setMobileView(mobileView === 'sidebar' ? 'map' : 'sidebar')}
                className="
                    lg:hidden fixed bottom-6 right-6 z-50
                    w-14 h-14 rounded-full
                    bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                    text-white shadow-lg
                    flex items-center justify-center
                    transition-all duration-200
                    border-2 border-white/20
                "
                aria-label={mobileView === 'sidebar' ? 'Haritayı Göster' : 'Paneli Göster'}
            >
                {mobileView === 'sidebar' ? <Map size={24} /> : <PanelLeft size={24} />}
            </button>
        </div>
    );
};
