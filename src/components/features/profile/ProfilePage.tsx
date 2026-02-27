import React, { useState, useEffect } from 'react';
import { useCompany } from '../../../contexts/CompanyContext';
import { X, Building2, MapPin, Calendar, Users, Home, FileText, Save, Loader2 } from 'lucide-react';

interface ProfilePageProps {
    onClose: () => void;
}

interface ProjectInfo {
    proje_tipi: string;
    teslim_tarihi: string;
    toplam_konut: string;
    proje_nitelik: string;
    firma_adi: string;
    mahalle: string;
    ilce: string;
    ada: string;
    parsel: string;
    alan: string;
    nitelik: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onClose }) => {
    const { user, adaParsel } = useCompany();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
        proje_tipi: '',
        teslim_tarihi: '',
        toplam_konut: '',
        proje_nitelik: '',
        firma_adi: '',
        mahalle: '',
        ilce: '',
        ada: '',
        parsel: '',
        alan: '',
        nitelik: ''
    });
    const [tempInfo, setTempInfo] = useState<ProjectInfo>(projectInfo);

    // Proje verilerini parsel360.geojson'dan yükle
    useEffect(() => {
        if (!adaParsel) return;

        const loadProjectData = async () => {
            setLoading(true);
            try {
                const res = await fetch('/data/proje/parsel360.geojson');
                const data = await res.json();
                
                const feature = data.features.find((f: { properties: Record<string, unknown> }) =>
                    f.properties.ada_parsel === adaParsel ||
                    f.properties.ADA_PARSEL === adaParsel
                );

                if (feature) {
                    const props = feature.properties;
                    const info: ProjectInfo = {
                        proje_tipi: String(props.proje_tipi || ''),
                        teslim_tarihi: String(props.teslim_tarihi || ''),
                        toplam_konut: String(props.toplam_konut || ''),
                        proje_nitelik: String(props.proje_nitelik || ''),
                        firma_adi: String(props.firma_adi || '').trim(),
                        mahalle: String(props.Mahalle || ''),
                        ilce: String(props.ilce || ''),
                        ada: String(props.Ada || ''),
                        parsel: String(props.parsel || ''),
                        alan: String(props.Alan || ''),
                        nitelik: String(props.Nitelik || '')
                    };
                    setProjectInfo(info);
                    setTempInfo(info);
                }
            } catch (error) {
                console.error('Proje verisi yüklenemedi:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProjectData();
    }, [adaParsel]);

    const handleSave = async () => {
        setSaving(true);
        // TODO: Backend API'ye kaydet
        // Şimdilik sadece local state güncelle
        setProjectInfo(tempInfo);
        setIsEditing(false);
        setSaving(false);
        
        // Burada gerçek bir API çağrısı yapılabilir:
        // await api.updateProjectInfo(adaParsel, tempInfo);
        console.log('Proje bilgileri güncellendi:', tempInfo);
    };

    const handleCancel = () => {
        setTempInfo(projectInfo);
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 flex items-center gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                    <span className="text-gray-700 dark:text-gray-300">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Proje Profili</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Ada/Parsel: {projectInfo.ada}/{projectInfo.parsel}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Parsel Bilgileri (Salt Okunur) */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-slate-600 dark:bg-slate-500 rounded-lg text-white">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parsel Bilgileri</h3>
                                <span className="text-xs text-slate-500 dark:text-slate-400">Resmi kayıtlardan alınmıştır</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Mahalle</label>
                                <div className="px-3 py-2 bg-white/60 dark:bg-slate-800/60 rounded-lg text-gray-900 dark:text-white font-medium">
                                    {projectInfo.mahalle || '-'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">İlçe</label>
                                <div className="px-3 py-2 bg-white/60 dark:bg-slate-800/60 rounded-lg text-gray-900 dark:text-white font-medium">
                                    {projectInfo.ilce || '-'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Alan</label>
                                <div className="px-3 py-2 bg-white/60 dark:bg-slate-800/60 rounded-lg text-gray-900 dark:text-white font-medium">
                                    {projectInfo.alan} m²
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Nitelik</label>
                                <div className="px-3 py-2 bg-white/60 dark:bg-slate-800/60 rounded-lg text-gray-900 dark:text-white font-medium">
                                    {projectInfo.nitelik || '-'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Proje Bilgileri (Düzenlenebilir) */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-lg text-white">
                                <Home size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proje Bilgileri</h3>
                                <span className="text-xs text-blue-600 dark:text-blue-400">Düzenlenebilir alanlar</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Proje Tipi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Building2 size={14} /> Proje Tipi
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={tempInfo.proje_tipi}
                                        onChange={(e) => setTempInfo({ ...tempInfo, proje_tipi: e.target.value })}
                                        placeholder="Örn: Konut, Karma Yaşam, Ticaret"
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                                    />
                                ) : (
                                    <div className="px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 rounded-lg text-gray-900 dark:text-white">
                                        {projectInfo.proje_tipi || <span className="text-gray-400 italic">Belirtilmemiş</span>}
                                    </div>
                                )}
                            </div>

                            {/* Teslim Tarihi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Calendar size={14} /> Teslim Tarihi
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={tempInfo.teslim_tarihi}
                                        onChange={(e) => setTempInfo({ ...tempInfo, teslim_tarihi: e.target.value })}
                                        placeholder="Örn: Aralık 2026"
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                                    />
                                ) : (
                                    <div className="px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 rounded-lg text-gray-900 dark:text-white">
                                        {projectInfo.teslim_tarihi || <span className="text-gray-400 italic">Belirtilmemiş</span>}
                                    </div>
                                )}
                            </div>

                            {/* Toplam Konut */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Users size={14} /> Toplam Konut
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={tempInfo.toplam_konut}
                                        onChange={(e) => setTempInfo({ ...tempInfo, toplam_konut: e.target.value })}
                                        placeholder="Örn: 48 Daire"
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                                    />
                                ) : (
                                    <div className="px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 rounded-lg text-gray-900 dark:text-white">
                                        {projectInfo.toplam_konut || <span className="text-gray-400 italic">Belirtilmemiş</span>}
                                    </div>
                                )}
                            </div>

                            {/* Firma Adı */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Building2 size={14} /> Müteahhit Firma
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={tempInfo.firma_adi}
                                        onChange={(e) => setTempInfo({ ...tempInfo, firma_adi: e.target.value })}
                                        placeholder="Firma adı"
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                                    />
                                ) : (
                                    <div className="px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 rounded-lg text-gray-900 dark:text-white">
                                        {projectInfo.firma_adi || <span className="text-gray-400 italic">Belirtilmemiş</span>}
                                    </div>
                                )}
                            </div>

                            {/* Proje Nitelik/Açıklama */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <FileText size={14} /> Proje Nitelikleri
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={tempInfo.proje_nitelik}
                                        onChange={(e) => setTempInfo({ ...tempInfo, proje_nitelik: e.target.value })}
                                        placeholder="Proje özellikleri, öne çıkan noktalar..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all resize-none"
                                    />
                                ) : (
                                    <div className="px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 rounded-lg text-gray-900 dark:text-white min-h-[80px]">
                                        {projectInfo.proje_nitelik || <span className="text-gray-400 italic">Belirtilmemiş</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Kullanıcı Bilgisi */}
                    {user && (
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-700/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {user.firmaAdi?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{user.firmaAdi}</div>
                                        <div className="text-xs text-green-600 dark:text-green-400">{user.projeAdi}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Oturum açık
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-end gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="px-6 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-all disabled:opacity-50"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg"
                        >
                            Düzenle
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
