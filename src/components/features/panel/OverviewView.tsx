import React, { useState, useEffect } from 'react';
import { Building2, Calendar, MapPin, Ruler, Users, Briefcase } from 'lucide-react';
import { dataService, type ProjectOverview } from '../../../services/dataService';
import { useCompany } from '../../../contexts/CompanyContext';

export const OverviewView: React.FC = () => {
    const { adaParsel } = useCompany();
    const [project, setProject] = useState<ProjectOverview | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!adaParsel) return;
        
        dataService.getProjectOverview(adaParsel).then(data => {
            setProject(data);
            setLoading(false);
        });
    }, [adaParsel]);

    if (loading || !project) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-48 bg-gray-200 dark:bg-white/10 rounded-2xl"></div>
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
                    ))}
                </div>
                <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-2xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">

            {/* Project Header Image */}
            <div className="relative h-48 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900"></div>
                {project.image && (
                    <img
                        src={project.image}
                        alt={project.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                            // Görsel yüklenemezse gizle
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                )}
                <div className="absolute bottom-0 left-0 p-5 w-full bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent">
                    <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{project.name}</h2>
                    <p className="text-blue-100 text-sm flex items-center gap-1.5 mt-1 font-medium backdrop-blur-sm bg-white/10 inline-flex px-2 py-0.5 rounded-lg border border-white/20">
                        <MapPin size={14} />
                        {project.address}
                    </p>
                </div>
            </div>

            {/* Firma Bilgisi - Varsa göster */}
            {project.firmaAdi && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/10 dark:to-orange-500/10 p-4 rounded-xl border border-amber-500/20 shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-300">
                            <Briefcase size={18} />
                        </div>
                        <div>
                            <span className="text-[10px] text-amber-700/70 dark:text-amber-200/70 uppercase tracking-wider font-semibold">Müteahhit Firma</span>
                            <div className="font-bold text-gray-900 dark:text-white">{project.firmaAdi}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Stats Grid - Colored Glass Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-500/10 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 shadow-lg backdrop-blur-md hover:bg-blue-500/15 transition-all group">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-300 group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">
                            <Building2 size={16} />
                        </div>
                        <span className="text-[10px] text-blue-700/70 dark:text-blue-200/70 uppercase tracking-wider font-semibold">Proje Tipi</span>
                    </div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white tracking-wide">{project.type}</div>
                </div>
                <div className="bg-green-500/10 dark:bg-green-500/10 p-4 rounded-xl border border-green-500/20 shadow-lg backdrop-blur-md hover:bg-green-500/15 transition-all group">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-green-500/20 text-green-600 dark:text-green-300 group-hover:text-green-700 dark:group-hover:text-green-200 transition-colors">
                            <Calendar size={16} />
                        </div>
                        <span className="text-[10px] text-green-700/70 dark:text-green-200/70 uppercase tracking-wider font-semibold">Teslim Tarihi</span>
                    </div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white tracking-wide">{project.deliveryDate}</div>
                </div>
                <div className="bg-purple-500/10 dark:bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 shadow-lg backdrop-blur-md hover:bg-purple-500/15 transition-all group">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-300 group-hover:text-purple-700 dark:group-hover:text-purple-200 transition-colors">
                            <Users size={16} />
                        </div>
                        <span className="text-[10px] text-purple-700/70 dark:text-purple-200/70 uppercase tracking-wider font-semibold">Toplam Konut</span>
                    </div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white tracking-wide">{project.totalUnits}</div>
                </div>
                <div className="bg-orange-500/10 dark:bg-orange-500/10 p-4 rounded-xl border border-orange-500/20 shadow-lg backdrop-blur-md hover:bg-orange-500/15 transition-all group">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-300 group-hover:text-orange-700 dark:group-hover:text-orange-200 transition-colors">
                            <Ruler size={16} />
                        </div>
                        <span className="text-[10px] text-orange-700/70 dark:text-orange-200/70 uppercase tracking-wider font-semibold">Arsa Alanı</span>
                    </div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white tracking-wide">{project.landArea}</div>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all overflow-hidden relative">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Proje Hakkında
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/80 text-[11px] font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Parse Info */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-sm flex items-center justify-between">
                    Parsel Bilgileri
                    <span className="text-[10px] bg-blue-600 dark:bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">Resmi Veri</span>
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-500/5 transition-colors">
                        <span className="text-[11px] text-blue-700/80 dark:text-blue-300 uppercase tracking-wider font-bold">Ada / Parsel</span>
                        <span className="font-mono font-bold text-sm text-blue-900 dark:text-blue-100">{project.parcelInfo.adaParsel}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-500/5 transition-colors border-t border-blue-100 dark:border-blue-800/30">
                        <span className="text-[11px] text-blue-700/80 dark:text-blue-300 uppercase tracking-wider font-bold">Tapu Alanı</span>
                        <span className="font-mono font-bold text-sm text-blue-900 dark:text-blue-100">{project.parcelInfo.tapuAlani}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-blue-500/5 transition-colors border-t border-blue-100 dark:border-blue-800/30">
                        <span className="text-[11px] text-blue-700/80 dark:text-blue-300 uppercase tracking-wider font-bold">İmar Durumu</span>
                        <span className="font-mono font-bold text-sm text-blue-900 dark:text-blue-100">{project.parcelInfo.imarDurumu}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};
