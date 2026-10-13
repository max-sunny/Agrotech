/**
 * Configurable thresholds, ideal ranges, weights, and recommendation templates
 * for Soil Health Scoring (PRD Section 6.3)
 */
module.exports = {
  weights: {
    pH: 0.25,
    nitrogen: 0.25,
    phosphorus: 0.20,
    potassium: 0.15,
    moisture: 0.15,
  },
  parameters: {
    pH: {
      idealMin: 6.0,
      idealMax: 7.5,
      tolerableMin: 5.0,
      tolerableMax: 8.5,
      unit: '',
      label: 'pH Level',
      lowRecommendation: 'Soil is acidic (pH < 6.0). Apply agricultural lime (calcium carbonate) or dolomite to raise soil pH to optimal levels (6.5).',
      highRecommendation: 'Soil is alkaline (pH > 7.5). Apply elemental sulfur, organic compost, or gypsum to reduce soil pH.'
    },
    nitrogen: {
      idealMin: 280,
      idealMax: 560,
      tolerableMin: 150,
      tolerableMax: 750,
      unit: 'kg/ha',
      label: 'Available Nitrogen (N)',
      lowRecommendation: 'Nitrogen level is low (< 280 kg/ha). Apply nitrogen-rich fertilizer such as urea, neem-coated urea, or well-rotted farmyard manure (FYM).',
      highRecommendation: 'Nitrogen level is excessive (> 560 kg/ha). Reduce nitrogen inputs to avoid excessive vegetative foliage and disease susceptibility.'
    },
    phosphorus: {
      idealMin: 25,
      idealMax: 60,
      tolerableMin: 10,
      tolerableMax: 90,
      unit: 'kg/ha',
      label: 'Available Phosphorus (P)',
      lowRecommendation: 'Phosphorus level is low (< 25 kg/ha). Apply Single Superphosphate (SSP) or Diammonium Phosphate (DAP) during root zone preparation.',
      highRecommendation: 'Phosphorus level is high (> 60 kg/ha). Avoid additional phosphate fertilizer to maintain micronutrient absorption balance.'
    },
    potassium: {
      idealMin: 150,
      idealMax: 350,
      tolerableMin: 80,
      tolerableMax: 500,
      unit: 'kg/ha',
      label: 'Available Potassium (K)',
      lowRecommendation: 'Potassium level is low (< 150 kg/ha). Apply Muriate of Potash (MOP) or Sulfate of Potash to improve drought resistance and stalk strength.',
      highRecommendation: 'Potassium level is elevated (> 350 kg/ha). Adequate reserve present; adjust potash dosage downwards.'
    },
    moisture: {
      idealMin: 40,
      idealMax: 70,
      tolerableMin: 20,
      tolerableMax: 85,
      unit: '%',
      label: 'Soil Moisture',
      lowRecommendation: 'Soil moisture is low (< 40%). Irrigate field soon using drip or furrow systems to prevent crop moisture stress.',
      highRecommendation: 'Soil moisture is high/waterlogged (> 70%). Check field drainage channels to avoid root asphyxiation and fungal collar rot.'
    }
  },
  ratingThresholds: [
    { min: 80, rating: 'excellent', color: '#16a34a' },
    { min: 60, rating: 'good', color: '#2563eb' },
    { min: 40, rating: 'fair', color: '#d97706' },
    { min: 0, rating: 'poor', color: '#dc2626' }
  ]
};
