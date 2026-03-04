import { useState, type FC, type ReactNode } from 'react';
import { Map, PanelLeft } from 'lucide-react';

interface MainLayoutProps {
    sidebar: ReactNode;
    map: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ sidebar, map }) => {
    const [mobileView, setMobileView] = useState<'sidebar' | 'map'>('sidebar');

    return (
        <div className="relative h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-text-primary-light dark:text-text-primary-dark transition-colors duration-300">
            {/* Map - Full screen background */}
            <main className="absolute inset-0 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                {map}
            </main>

            {/* Sidebar - Overlay on top of map with glassmorphism */}
            <aside className={`
                absolute top-0 left-0 w-full lg:w-[40%] h-full z-10 flex flex-col 
                ${mobileView === 'sidebar' ? 'flex' : 'hidden'} lg:flex
            `}>
                {sidebar}
            </aside>

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
