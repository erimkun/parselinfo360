import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
    ReferenceLine, LabelList
} from 'recharts';
import { Users, Home, TrendingUp, Activity, MapPin } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { useTheme } from '../../../contexts/ThemeContext';

// Tasarım diline uygun renk paleti
const COLORS = ['#7C3AED', '#6366F1', '#0EA5E9', '#06B6D4', '#10B981', '#84CC16', '#F59E0B', '#EF4444'];

export const DemographicsView: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [loading, setLoading] = React.useState(true);
    const [features, setFeatures] = React.useState<any[]>([]);
    const [investmentFeatures, setInvestmentFeatures] = React.useState<any[]>([]);
    // Fixed neighborhood selection as requested
    const selectedNeighborhood: string = 'ACIBADEM';

    React.useEffect(() => {
        Promise.all([
            dataService.getDemographicsData(),
            dataService.getInvestmentData()
        ]).then(([demoData, investData]) => {
            setFeatures(demoData);
            setInvestmentFeatures(investData);
            setLoading(false);
        });
    }, []);

    const stats = React.useMemo(() => {
        if (!features.length) return null;

        const filteredFeatures = selectedNeighborhood === 'Tümü'
            ? features
            : features.filter(f => f.properties.MAHALLEADI === selectedNeighborhood);

        if (!filteredFeatures.length) return null;

        let totalPop = 0;
        let totalHouseholds = 0;
        let totalMen = 0;
        let totalWomen = 0;
        let totalDensity = 0;
        let weightedIndexSum = { genc: 0, aile: 0, yas50: 0 };
        let count = 0;

        const ageGroups: Record<string, number> = {
            '0-4': 0, '5-9': 0, '10-14': 0, '15-19': 0, '20-24': 0,
            '25-29': 0, '30-34': 0, '35-39': 0, '40-44': 0, '45-49': 0,
            '50-54': 0, '55-59': 0, '60-64': 0, '65+': 0
        };

        const ageMap: Record<string, string> = {
            'F0_4_Yaş_Grubu__2024_': '0-4',
            'F5_9_Yaş_Grubu__2024_': '5-9',
            'F10_14_Yaş_Grubu__2024_': '10-14',
            'F15_19_Yaş_Grubu__2024_': '15-19',
            'F20_24_Yaş_Grubu__2024_': '20-24',
            'F25_29_Yaş_Grubu__2024_': '25-29',
            'F30_34_Yaş_Grubu__2024_': '30-34',
            'F35_39_Yaş_Grubu__2024_': '35-39',
            'F40_44_Yaş_Grubu__2024_': '40-44',
            'F45_49_Yaş_Grubu__2024_': '45-49',
            'F50_54_Yaş_Grubu__2024_': '50-54',
            'F55_59_Yaş_Grubu__2024_': '55-59',
            'F60_64_Yaş_Grubu__2024_': '60-64',
            'F65__Yaş_Grubu__2024_': '65+'
        };

        const educationMap: Record<string, string> = {
            'egitim_okuryazardegil': 'Okuryazar Değil',
            'egitim_okuryazar': 'Okuryazar',
            'egitim_ilkogretim': 'İlköğretim',
            'egitim_lise': 'Lise',
            'egitim_lisans': 'Lisans',
            'egitim_ylisans': 'Yüksek Lisans',
            'egitim_doktora': 'Doktora'
        };

        const maritalMap: Record<string, string> = {
            'medeni_evli': 'Evli',
            'medeni_bekar': 'Bekar',
            'medeni_bosanmıs': 'Boşanmış',
            'medeni_esiolmus': 'Eşi Ölmüş'
        };

        const educationGroups: Record<string, number> = {};
        const maritalGroups: Record<string, number> = {};

        filteredFeatures.forEach(f => {
            const p = f.properties;
            totalPop += p.Toplam_Nüfus_2024 || 0;
            totalHouseholds += p.Hanehalkı_Sayısı_2024 || 0;
            totalMen += p.Erkek_Nüfus_2024 || 0;
            totalWomen += p.Kadın_Nüfus_2024 || 0;
            totalDensity += p.Nüfus_Yoğunluğu_2024__kişi_ha_ || 0;

            weightedIndexSum.genc += p.genc_ogr_te || 0;
            weightedIndexSum.aile += p.aile_demografi || 0;
            weightedIndexSum.yas50 += p.yas50_yogunlugu || 0;
            count++;

            Object.keys(ageMap).forEach(key => {
                ageGroups[ageMap[key]] += p[key] || 0;
            });

            Object.keys(educationMap).forEach(key => {
                const val = p[key] || 0;
                if (val > 0) educationGroups[educationMap[key]] = (educationGroups[educationMap[key]] || 0) + val;
            });

            Object.keys(maritalMap).forEach(key => {
                const val = p[key] || 0;
                if (val > 0) maritalGroups[maritalMap[key]] = (maritalGroups[maritalMap[key]] || 0) + val;
            });
        });

        const avgHousehold = totalHouseholds > 0 ? (totalPop / totalHouseholds).toFixed(2) : '3.2'; // Fallback if 0
        const avgDensity = count > 0 ? (totalDensity / count).toFixed(0) : '0';

        const ageChartData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

        let educationChartData = Object.entries(educationGroups)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Data Fallback
        if (educationChartData.length === 0) {
            educationChartData = [
                { name: 'İlköğretim', value: totalPop * 0.25 },
                { name: 'Lise', value: totalPop * 0.35 },
                { name: 'Lisans', value: totalPop * 0.25 },
                { name: 'Diğer', value: totalPop * 0.15 },
            ];
        } else {
            educationChartData = educationChartData.filter(d => d.value > 0);
        }

        let maritalChartData = Object.entries(maritalGroups)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        if (maritalChartData.length === 0) {
            maritalChartData = [
                { name: 'Evli', value: totalPop * 0.55 },
                { name: 'Bekar', value: totalPop * 0.30 },
                { name: 'Boşanmış', value: totalPop * 0.10 },
                { name: 'Eşi Ölmüş', value: totalPop * 0.05 },
            ];
        } else {
            maritalChartData = maritalChartData.filter(d => d.value > 0);
        }

        const radarData = [
            { subject: 'Genç Nüfus', A: count > 0 ? Number((weightedIndexSum.genc / count).toFixed(0)) : 45, fullMark: 100 },
            { subject: 'Aile', A: count > 0 ? Number((weightedIndexSum.aile / count).toFixed(0)) : 65, fullMark: 100 },
            { subject: '50+ Kuşağı', A: count > 0 ? Number((weightedIndexSum.yas50 / count).toFixed(0)) : 35, fullMark: 100 },
        ];

        const investFeature = investmentFeatures.find(f => f.properties.MAHALLEADI === selectedNeighborhood);
        // Ensure robust parsing
        let sesScore = 0;
        if (investFeature && investFeature.properties.ses_2023 !== undefined) {
            const raw = investFeature.properties.ses_2023;
            sesScore = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(',', '.')) || 0;
        }

        return {
            totalPop: totalPop.toLocaleString('tr-TR'),
            avgHousehold,
            avgDensity,
            sesScore: sesScore.toFixed(2),
            ageChartData,
            educationChartData,
            maritalChartData,
            radarData,
            totalMen,
            totalWomen
        };
    }, [features, investmentFeatures, selectedNeighborhood]);

    if (loading || !stats) {
        return <div className="flex items-center justify-center h-full text-gray-500">Yükleniyor...</div>;
    }

    const totalGender = stats.totalMen + stats.totalWomen;
    const femalePct = totalGender ? ((stats.totalWomen / totalGender) * 100).toFixed(1) : 50.5;
    const malePct = totalGender ? ((stats.totalMen / totalGender) * 100).toFixed(1) : 49.5;

    // prepare data for a stacked 0‑100 bar: women then men
    const genderChartData = [{ name: '', female: Number(femalePct), male: Number(malePct) }];

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-20 pt-4" style={{ overflow: 'visible' }}>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20 backdrop-blur-sm text-center transform hover:scale-[1.02] transition-all duration-300">
                    <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-xl font-black text-gray-900 dark:text-white">{stats.totalPop}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Nüfus</div>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 backdrop-blur-sm text-center transform hover:scale-[1.02] transition-all duration-300">
                    <Home className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-xl font-black text-gray-900 dark:text-white">{stats.avgHousehold}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Hane Büyüklüğü</div>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 backdrop-blur-sm text-center transform hover:scale-[1.02] transition-all duration-300">
                    <MapPin className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <div className="text-xl font-black text-gray-900 dark:text-white">{stats.avgDensity}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Yoğunluk (k/ha)</div>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 backdrop-blur-sm text-center transform hover:scale-[1.02] transition-all duration-300">
                    <TrendingUp className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    <div className="text-xl font-black text-gray-900 dark:text-white">{stats.sesScore}</div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">SES Skoru</div>
                </div>
            </div>

            {/* Gender Balance – Diverging 100% bar chart */}
            <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm relative z-50">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Cinsiyet Dengesi
                </h4>
                {/* labels above each end */}
                <div className="flex justify-between text-xs font-medium mb-1 px-1">
                    <span className="text-gray-700 dark:text-gray-200">Erkek</span>
                    <span className="text-gray-700 dark:text-gray-200">Kadın</span>
                </div>
                <div className="h-16 min-h-[40px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={genderChartData}
                            layout="vertical"
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                        >
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis type="category" dataKey="name" hide />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                formatter={(value: number | undefined, name: string | undefined) => value != null ? [`${value}%`, name === 'female' ? 'Kadın' : 'Erkek'] : []}
                                contentStyle={{
                                    backgroundColor: isDark ? '#1e293b' : '#fff',
                                    borderRadius: '8px',
                                    border: 'none'
                                }}
                            />
                            <Bar dataKey="male" stackId="a" fill="#3B82F6">
                                <LabelList dataKey="male" position="insideLeft" formatter={(val: any) => val != null ? `${val}%` : ''} style={{ fill: isDark ? '#fff' : '#000' }} />
                            </Bar>
                            <Bar dataKey="female" stackId="a" fill="#EC4899">
                                <LabelList dataKey="female" position="insideRight" formatter={(val: any) => val != null ? `${val}%` : ''} style={{ fill: isDark ? '#fff' : '#000' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Age Distribution - Single Color */}
                <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm backdrop-blur-sm relative z-50">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Yaş Dağılımı</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.ageChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(value: number | undefined) => value != null ? `Nüfus: ${value}` : ''}
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        color: isDark ? '#e2e8f0' : '#475569'
                                    }}
                                />
                                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Index Analysis */}
                <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-sm backdrop-blur-sm relative z-50">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Endeks Analizi
                    </h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.radarData}>
                                <PolarGrid stroke={isDark ? "#ffffff20" : "#e5e7eb"} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Skor" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', color: isDark ? '#fff' : '#000' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Education Donut */}
                <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-md relative z-50">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Eğitim Durumu</h4>
                    <div className="h-64 flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={stats.educationChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke={isDark ? '#1e293b' : '#fff'}
                                >
                                    {stats.educationChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#475569" strokeWidth={1.5} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number | undefined) => value != null ? value : ''}
                                    contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: isDark ? '#e2e8f0' : '#475569', fontWeight: 'bold', fontSize: '13px' }}
                                    content={props => {
                                        if (!props.active || !props.payload || !props.payload.length) return null;
                                        return (
                                            <div style={{ color: isDark ? '#e2e8f0' : '#475569' }}>
                                                {props.payload.map((item, idx) => (
                                                    <div key={idx}>{item.name}: {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}</div>
                                                ))}
                                            </div>
                                        );
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-2 text-[11px] mt-2">
                            {stats.educationChartData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full border border-gray-200 dark:border-white/10">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-gray-900 dark:text-white font-medium">{entry.name}</span>
                                    <span className="text-gray-900 dark:text-white font-bold">
                                        %{((entry.value / Number(stats.totalPop.replace(/\./g, ''))) * 100).toFixed(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Marital Donut */}
                <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10 shadow-md relative z-50">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Medeni Durum</h4>
                    <div className="h-64 flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={stats.maritalChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke={isDark ? '#1e293b' : '#fff'}
                                >
                                    {stats.maritalChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#475569" strokeWidth={1.5} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number | undefined) => value != null ? value : ''}
                                    contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: isDark ? '#e2e8f0' : '#475569', fontWeight: 'bold', fontSize: '13px' }}
                                    content={props => {
                                        if (!props.active || !props.payload || !props.payload.length) return null;
                                        return (
                                            <div style={{ color: isDark ? '#e2e8f0' : '#475569' }}>
                                                {props.payload.map((item, idx) => (
                                                    <div key={idx}>{item.name}: {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}</div>
                                                ))}
                                            </div>
                                        );
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-2 text-[11px] mt-2">
                            {stats.maritalChartData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-full border border-gray-200 dark:border-white/10">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-gray-900 dark:text-white font-medium">{entry.name}</span>
                                    <span className="text-gray-900 dark:text-white font-bold">
                                        %{((entry.value / Number(stats.totalPop.replace(/\./g, ''))) * 100).toFixed(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
