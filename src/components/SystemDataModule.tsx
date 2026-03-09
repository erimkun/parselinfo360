import React, { useState } from 'react';

// Hedef sunucu her zaman lokalde çalışan admin-server.js ('node admin-server.js')
const ADMIN_API_URL = 'http://localhost:3001/api/project';

const SystemDataModule: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const response = await fetch(ADMIN_API_URL, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: `✅ Başarılı! ${result.message} Yeni parsel eklendi.` });
                form.reset();
            } else {
                setMessage({ type: 'error', text: `❌ Hata: ${result.error}` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: '❌ Sunucuya bağlanılamadı. "npm run admin" komutunun çalıştığından emin olun.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-700">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        🏗️ Parsel360 Sistem Yönetimi
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sisteme yeni projeler eklemek ve parsel verilerini entegre etmek için bu arayüzü kullanabilirsiniz.
                        Arka planda "npm run admin" sunucusuna bağlanmaktadır.
                    </p>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-sm font-medium border whitespace-pre-line ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                            1. Kimlik Bilgileri
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Firma Adı</label>
                                <input type="text" name="firmaAdi" required placeholder="X İnşaat A.Ş."
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proje Adı</label>
                                <input type="text" name="projeAdi" required placeholder="X Prestij Konutları"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ada / Parsel</label>
                                <input type="text" name="adaParsel" required placeholder="1105-8"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                                <p className="text-xs text-gray-500 mt-1">Sistemdeki klasörleme kodu (Örn: 1105-8).</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Şifre</label>
                                <input type="password" name="sifre" required placeholder="••••••••"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                            2. Veri Katmanları Yüklemesi
                        </h2>
                        <p className="text-sm text-gray-500">Seçtiğiniz dosyalar ana veritabanı JSON dosyalarına otomatik olarak katıştırılacaktır (append).</p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proje Sınırı (parsel360.json)</label>
                                <input type="file" name="parsel360_file" accept=".geojson,.json"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yerel Olanaklar (olanak_poi.geojson)</label>
                                <input type="file" name="distance_matrix_file" accept=".geojson,.json"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rotalar (trip_layers.json)</label>
                                <input type="file" name="trip_layer_file" accept=".json"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hizmet Alanı (service_areas.geojson)</label>
                                <input type="file" name="service_area_file" accept=".geojson,.json"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proje Raporu (PDF/Doc)</label>
                                <input type="file" name="report_file" accept=".pdf,.doc,.docx"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                                <p className="text-[10px] text-gray-400 mt-1">Bu dosya public/data/rapor/ altına [ada-parsel] ismiyle kaydedilecektir.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 mt-6 rounded-lg text-white font-semibold flex justify-center items-center transition-colors 
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Yükleniyor...
                            </span>
                        ) : (
                            '🚀 Projeyi Sistemi Kaydet'
                        )}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default SystemDataModule;
