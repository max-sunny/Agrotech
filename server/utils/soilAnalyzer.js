const soilRules = require('../config/soilRules');

/**
 * Calculates a parameter score (0 to 100) based on ideal and tolerable bounds.
 */
function scoreParameter(value, config) {
  const { idealMin, idealMax, tolerableMin, tolerableMax } = config;

  if (value >= idealMin && value <= idealMax) {
    return 100;
  }

  if (value < idealMin) {
    if (value <= tolerableMin) return 0;
    // Linear interpolation between tolerableMin (0) and idealMin (100)
    return Math.round(((value - tolerableMin) / (idealMin - tolerableMin)) * 100);
  } else {
    if (value >= tolerableMax) return 0;
    // Linear interpolation between idealMax (100) and tolerableMax (0)
    return Math.round(((tolerableMax - value) / (tolerableMax - idealMax)) * 100);
  }
}

/**
 * Analyzes soil metrics and returns total score, rating, and recommendations.
 * @param {Object} metrics { pH, nitrogen, phosphorus, potassium, moisture }
 */
function analyzeSoil(metrics) {
  const { weights, parameters, ratingThresholds } = soilRules;
  const recommendations = [];
  let totalScore = 0;
  const breakdown = {};

  for (const [key, weight] of Object.entries(weights)) {
    const val = Number(metrics[key]);
    const config = parameters[key];
    const paramScore = scoreParameter(val, config);

    breakdown[key] = {
      value: val,
      score: paramScore,
      weight,
      weightedScore: Math.round(paramScore * weight)
    };

    totalScore += paramScore * weight;

    // Check recommendations
    if (val < config.idealMin && config.lowRecommendation) {
      recommendations.push(config.lowRecommendation);
    } else if (val > config.idealMax && config.highRecommendation) {
      recommendations.push(config.highRecommendation);
    }
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // Determine rating
  let rating = 'poor';
  for (const thresh of ratingThresholds) {
    if (finalScore >= thresh.min) {
      rating = thresh.rating;
      break;
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Soil nutrients and moisture are within optimal agronomic ranges. Maintain current crop rotation and balanced organic fertilization.');
  }

  return {
    score: finalScore,
    rating,
    recommendations,
    breakdown
  };
}

module.exports = { analyzeSoil, scoreParameter };
