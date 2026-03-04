/**
 * Pazar Analizi Skorları - Pop-up Açıklamaları
 * Her bir skor/istatistiğin ne olduğunu ve nasıl hesaplandığını açıklayan kısa notlar
 */

export const scoreExplanations = {
  // ===== OLANAKLAR SAYFASI =====
  categoryScore: {
    title: "Kategori Verimlilik Skoru",
    description:
      "Parsele en yakın olanakların (okul, hastane, market vb.) uzaklığı ve önemlerine göre hesaplanır. Skor ne kadar yüksekse, o kadar çok ve yakın olanağa sahiptir.",
    formula: "Yakındaki olanaklar × mesafe ve önem ağırlığı",
  },

  // ===== DEMOGRAFİ SAYFASI =====
  householdSize: {
    title: "Hane Büyüklüğü",
    description:
      "Bu mahalledeki bir dairede ortalama kaç kişi yaşadığını gösterir. (örn: 3.5 = dairede ortalama 3-4 kişi)",
    formula: "Toplam nüfus ÷ toplam hane sayısı",
  },

  density: {
    title: "Nüfus Yoğunluğu",
    description:
      "1 hektara (10.000 m²) düşen ortalama kişi sayısı. Ne kadar yüksekse mahalle o kadar kalabalık ve gelişmiş.",
    formula: "Toplam nüfus ÷ mahalle alanı (hektar)",
  },

  sesScore: {
    title: "SES Skoru (Sosyal-Ekonomik Statü)",
    description:
      "Mahallenin sosyal ve ekonomik seviyesini gösteren bileşik endeks. Eğitim, gelir, meslek ve konut kalitesini yansıtır.",
    formula: "Eğitim + Gelir + Meslek + Konut kalitesi",
  },

  // ===== PAZAR SAYFASI - GRAFİKLER =====
  priceHistory: {
    title: "Fiyatın Hikâyesi",
    description:
      "Son 30 aylık kiralık ve satılık m² fiyat trendini gösterir. Fiyatların yükseliş, sabitlik veya düşüş eğilimini anlama için kullanılır.",
    formula: "Aylık kira m² + Aylık satış m²",
  },

  listingSupply: {
    title: "İlan Arzı ve Stok",
    description:
      "Son 6 yılda piyasada kaç satılık/kiralık ilan olduğunu gösterir. Az ilan = sınırlı seçenek, çok ilan = rekabetçi piyasa.",
    formula: "Yıllık satılık ilan + Yıllık kiralık ilan",
  },

  transactionDepth: {
    title: "İşlem ve Satış Derinliği",
    description:
      "Son 5 yılda tapuda yapılan alım-satım işlem sayısı. Yüksek = piyasa canlı ve likit, Düşük = durağan piyasa.",
    formula: "Yıllık alım-satım işlem + Bağımsız birim işlem",
  },

  // ===== UZUN VADE ANALİZİ =====
  shortTermMomentum: {
    title: "Kısa Vade Momentum",
    description:
      "Fiyatların SON 1 yıldaki ivmesini gösterir (0-100 arası). Yüksek = fiyatlar hızla yükseliyor, Düşük = fiyatlar durağan.",
    formula:
      "7 yıl trend (60%) + Son 12 ay trend (40%) → 0-100",
  },

  longTermPotential: {
    title: "Uzun Vade Potansiyeli",
    description:
      "7 yıllık orta-uzun vadeli fiyat artış potansiyelini gösterir. Satılık fiyatları %60, kiralık fiyatları %40 ağırlıkla alınır.",
    formula:
      "Satılık artış (60%) + Kiralık artış (40%) → 0-100",
  },

  longTermDeviation: {
    title: "Uzun Vade Sapma",
    description:
      "Şu anki fiyatların uzun vadeli trend ortalamasından ne kadar saptığını gösterir. Yüksek = fiyatlar aşırı yüksek/düşük, Düşük = normal seviyede.",
    formula:
      "(Son ortalama - 7Y ortalama) ÷ 7Y ortalama × 100",
  },

  // ===== RİSK VE İSTİKRAR ANALİZİ =====
  riskScore: {
    title: "Risk Skoru",
    description:
      "Aylık fiyat değişimlerinin ne kadar dalgalanacağını gösterir. Yüksek = öngörülmesi zor hareketler, Düşük = istikrarlı piyasa.",
    formula: "Aylık fiyat dalgalanması (standart sapma) × 100",
  },

  stabilityScore: {
    title: "Stabilite Skoru",
    description:
      "Piyasanın genel istikrarını gösteren üç faktörün birleşimidir: fiyat dalgalanması, işlem sürekliliği ve uzun vadeli sapma.",
    formula:
      "Dalgalanma (40%) + Sapma (30%) + İşlem Sürekliliği (30%)",
  },

  volatilityScore: {
    title: "Oynaklık Skoru",
    description:
      "Fiyatların bölge içinde ne kadar homojen dağıldığını gösterir. Düşük oynaklık = benzer fiyatlandırma, Yüksek = fiyat farklılıkları.",
    formula:
      "1 - (Fiyat sapması ÷ Ortalama fiyat) → 0-100",
  },

  // ===== PİYASA AKTİVİTESİ VE CANLILIK =====
  transactionContinuity: {
    title: "İşlem Sürekliliği",
    description:
      "Yıllar arasında işlem sayısında ne kadar tutarlılık olduğunu gösterir. Yüksek = piyasa düzenli çalışıyor, Düşük = dönemsel dalgalanmalar var.",
    formula:
      "1 - (İşlem sapması ÷ Ortalama işlem)",
  },

  averageTransactionVolume: {
    title: "Ortalama İşlem Hacmi",
    description:
      "Aylık ortalama alım-satım işlem sayısı. Piyasanın canlılığı ve likidite seviyesini gösterir.",
    formula: "Toplam işlem ÷ ay sayısı",
  },

  // ===== KİRA VE SATILIIK DENGESİ =====
  rentTrend2025: {
    title: "2025 Kira Trend",
    description:
      "Kiralık m² fiyatlarının 2025 yılında ayda ortalama yüzde kaç oranında arttığını gösterir.",
    formula:
      "(Son fiyat - İlk fiyat) ÷ Ortalama × 100 ÷ 12",
  },

  salesMomentum: {
    title: "Satış Momentum",
    description:
      "Satılık fiyatlarının SON 1 yıldaki ivmesini gösterir. Yüksek = fiyatlar hızla yükseliyor, Düşük = durağan veya düşüş eğilimi.",
    formula:
      "7 yıl trend (60%) + Son 12 ay trend (40%) → 0-100",
  },

  averageRent: {
    title: "Ortalama Kira",
    description: "2025 yılı için tahmin edilen kiralık m² birim fiyatı (TL).",
    formula: "Trend analizi ile tahmin",
  },

  // ===== ARZ BASKISI VE FİYAT TUTUNMASI =====
  listingPressure: {
    title: "İlan Baskısı ve Fiyat Tutunması",
    description:
      "Bu grafik, X ekseninde ilan yoğunluğunu (sağa gittikçe artar), Y ekseninde fiyat momentumunu (yukarı çıktıkça güçlenir) gösterir. Noktanın konumu, piyasada satıcı mı yoksa alıcı avantajı mı olduğunu anlamanızı sağlar.\n\nÖrneğin: Nokta sol üstteyse satıcı avantajı, sağ altta ise alıcı avantajı vardır. Orta bölgede denge hakimdir.\n\nAcıbadem için: Nokta genellikle denge veya satıcı avantajı bölgesindedir; bu da fiyatların kolay kolay düşmediği, talebin güçlü olduğu anlamına gelir.",
    formula:
      "Güncel ilan ÷ Maksimum ilan × 100 | 2D grafik: X = İlan Baskısı, Y = Fiyat Momentum",
  },

  priceResistance: {
    title: "İlan Baskısı vs Fiyat Momentumu",
    description:
      "Yüksek ilan sayısına rağmen fiyatın ne kadar direnç gösterdiğini analiz eder. Yeşil bölge = satıcı avantajı, Kırmızı bölge = alıcı avantajı.",
    formula:
      "2D grafik: X = İlan Baskısı, Y = Fiyat Momentum",
  },

  // ===== GENELESİ SKORLAR =====
  overallMomentum: {
    title: "Momentum",
    description: "Bölgenin şu anki kısa vadeli fiyat artış hızı (0-100).",
    formula: "Momentum = 7 yıl trend (60%) + Son 12 ay trend (40%)",
  },

  overallStability: {
    title: "İstikrar",
    description: "Bölgenin genel piyasa istikrar seviyesi (0-100).",
    formula: "İstikrar = Dalgalanma (40%) + Sapma (30%) + İşlem Sürekliliği (30%)",
  },

  overallContinuity: {
    title: "Süreklilik",
    description: "İşlem sürekliliği ve piyasa düzenli çalışma oranı (0-100).",
    formula: "Süreklilik = 1 - (İşlem sapması ÷ Ortalama işlem)",
  },

  overallSupplyBalance: {
    title: "Arz Dengesi",
    description: "İlan baskısının tersine çevrilerek arz-talep dengesini gösterir.",
    formula: "Arz Dengesi = 100 - İlan Baskısı",
  },

  overall3YearPotential: {
    title: "Uzun Vade",
    description:
      "Bölgenin 3+ yıllık orta-uzun vadeli fiyat artış potansiyeli (0-100).",
    formula: "Uzun Vade = Satılık artış (60%) + Kiralık artış (40%)",
  },
};

/**
 * Açıklamaları bileşenden kolayca kullanabilmek için bir hook
 */
export const useScoreExplanation = (scoreKey: keyof typeof scoreExplanations) => {
  return scoreExplanations[scoreKey];
};
