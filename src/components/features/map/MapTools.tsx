import React, { useState } from 'react';
import { Ruler, Square, Trash2, MousePointer2, Crosshair, ChevronDown, ChevronUp, Globe2, Compass, Copy } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MapToolsProps {
    onToolSelect: (tool: string | null) => void;
    activeTool: string | null;
    onClear: () => void;
    onFocus: () => void;
}

export const MapTools = ({ onToolSelect, activeTool, onClear, onFocus }: MapToolsProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const tools = [
        { id: 'select', icon: MousePointer2, label: 'Seç' },
        { id: 'focus', icon: Crosshair, label: 'Projeye Odaklan', action: onFocus },
        { id: 'measure', icon: Ruler, label: 'Mesafe Ölç' },
        { id: 'area', icon: Square, label: 'Alan Ölç' },
        { id: 'coords', icon: Globe2, label: 'Koordinat Göster' },
        { id: 'centerCopy', icon: Copy, label: 'Harita Merkezi Kopyala' },
        { id: 'rotate', icon: Compass, label: 'Haritayı Döndür' },
    ];

    return (
        <div className="absolute top-6 right-6 z-[1000]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-slate-900/80 transition-all text-gray-700 dark:text-gray-300 flex items-center gap-2 font-semibold text-sm mb-2"
                title="Harita Araçları"
            >
                <span className="flex items-center gap-2">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    Araçlar
                </span>
            </button>

            {/* Tools Panel */}
            {isOpen && (
                <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col gap-1">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => {
                                if (tool.id === 'focus') {
                                    onFocus();
                                } else {
                                    onToolSelect(activeTool === tool.id ? null : tool.id);
                                }
                            }}
                            className={cn(
                                "p-3 rounded-xl transition-all group relative flex items-center gap-2",
                                activeTool === tool.id
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                            )}
                            title={tool.label}
                        >
                            <tool.icon size={18} />
                            <span className="text-xs font-medium">{tool.label}</span>
                        </button>
                    ))}

                    <div className="h-px bg-gray-100 dark:bg-white/10 my-1 mx-2" />

                    <button
                        onClick={onClear}
                        className="p-3 rounded-xl text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-all flex items-center gap-2"
                        title="Temizle"
                    >
                        <Trash2 size={18} />
                        <span className="text-xs font-medium">Temizle</span>
                    </button>
                </div>
            )}
        </div>
    );
};
