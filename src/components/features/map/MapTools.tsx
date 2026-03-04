import React, { useState } from 'react';
import { Ruler, Square, Trash2, MousePointer2, Crosshair, ChevronDown, ChevronUp } from 'lucide-react';
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
    ];

    return (
        <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-[1000]">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/10 dark:bg-slate-900/15 backdrop-blur-xl p-2 lg:p-3 rounded-xl lg:rounded-2xl shadow-lg border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-slate-900/25 transition-all text-gray-900 dark:text-white flex items-center gap-1 lg:gap-2 font-semibold text-xs lg:text-sm mb-2"
                title="Harita Araçları"
            >
                <span className="flex items-center gap-1 lg:gap-2">
                    {isOpen ? <ChevronUp size={16} className="lg:w-[18px] lg:h-[18px]" /> : <ChevronDown size={16} className="lg:w-[18px] lg:h-[18px]" />}
                    <span className="hidden sm:inline">Araçlar</span>
                </span>
            </button>

            {/* Tools Panel */}
            {isOpen && (
                <div className="bg-white/10 dark:bg-slate-900/15 backdrop-blur-xl p-1 lg:p-1.5 rounded-xl lg:rounded-2xl shadow-lg border border-white/20 dark:border-white/10 flex flex-col gap-1">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => {
                                if (tool.action) {
                                    tool.action();
                                } else {
                                    onToolSelect(activeTool === tool.id ? null : tool.id);
                                }
                            }}
                            className={cn(
                                "p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all group relative flex items-center gap-2",
                                activeTool === tool.id
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                            )}
                            title={tool.label}
                        >
                            <tool.icon size={16} className="lg:w-[18px] lg:h-[18px]" />
                            <span className="text-[10px] lg:text-xs font-medium hidden sm:inline">{tool.label}</span>
                        </button>
                    ))}

                    <div className="h-px bg-white/20 dark:bg-white/10 my-1 mx-2" />

                    <button
                        onClick={onClear}
                        className="p-3 rounded-xl text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/15 transition-all flex items-center gap-2"
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
