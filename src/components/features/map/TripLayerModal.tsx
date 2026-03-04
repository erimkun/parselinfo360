import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TripLayerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TripLayerModal: React.FC<TripLayerModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
                        onClick={onClose}
                    />
                    
                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-8 lg:inset-12 z-[2001] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/95 backdrop-blur-xl rounded-t-2xl border border-white/10 border-b-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M9 3L5 7l4 4M15 3l4 4-4 4"/>
                                        <path d="M5 17c0-4 3-6 7-6s7 2 7 6"/>
                                        <circle cx="12" cy="19" r="2"/>
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-white font-semibold text-sm">Nasıl Giderim?</h2>
                                    <p className="text-gray-400 text-xs">Rota animasyonları ve ulaşım analizi</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* iframe Container */}
                        <div className="flex-1 bg-slate-900/95 rounded-b-2xl border border-white/10 border-t-0 overflow-hidden">
                            <iframe
                                src="/parsel360_1101_8_trip.html"
                                className="w-full h-full border-0"
                                title="Trip Layer Widget"
                                allow="accelerometer; gyroscope"
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
