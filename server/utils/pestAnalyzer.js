/**
 * Rule-based pest and disease risk alert engine based on micro-climatic weather inputs
 * (PRD Section 6.4, Requirements PEST-1, PEST-2)
 */

function generatePestAlerts(weather) {
  const alerts = [];
  const { temperature, humidity, rainfall = 0, windSpeed = 0 } = weather;

  // Rule 1: High Fungal Blight / Downy Mildew / Rust Risk
  // Humidity > 80% and Temperature between 20°C and 30°C
  if (humidity >= 80 && temperature >= 20 && temperature <= 30) {
    alerts.push({
      id: 'fungal-blight-risk',
      severity: 'high',
      title: 'High Fungal Blight & Downy Mildew Risk',
      description: `Prolonged high humidity (${humidity}%) and moderate temperature (${temperature}°C) create optimal conditions for rapid fungal spore germination.`,
      recommendedAction: 'Apply prophylactic bio-fungicide (Trichoderma viride @ 5g/L) or copper oxychloride (2.5g/L). Avoid sprinkler irrigation and improve crop row aeration.'
    });
  } else if (humidity >= 70 && temperature >= 18 && temperature <= 28) {
    alerts.push({
      id: 'mildew-risk-medium',
      severity: 'medium',
      title: 'Moderate Powdery Mildew Advisory',
      description: `Elevated humidity (${humidity}%) detected. Conditions favor initial spore dispersion.`,
      recommendedAction: 'Inspect crop canopy for white powdery patches on lower leaves. Prepare preventive neem oil spray.'
    });
  }

  // Rule 2: Sucking Pests (Aphids, Whiteflies, Jassids)
  // Humidity > 65% and Temperature > 28°C
  if (humidity >= 65 && temperature >= 28) {
    alerts.push({
      id: 'sucking-pest-risk',
      severity: 'medium',
      title: 'Aphid & Whitefly Outbreak Warning',
      description: `Warm (${temperature}°C) and humid (${humidity}%) weather accelerates reproduction cycles of sucking pests.`,
      recommendedAction: 'Install yellow sticky traps (10-15 per acre). Spray 5% Neem Seed Kernel Extract (NSKE) or systemic insecticide if threshold exceeds 5 pests/leaf.'
    });
  }

  // Rule 3: Mites & Thrips
  // High temperature (> 32°C) and Low Humidity (< 45%)
  if (temperature >= 32 && humidity <= 45) {
    alerts.push({
      id: 'mite-thrip-risk',
      severity: 'medium',
      title: 'Red Spider Mite & Thrip Advisory',
      description: `Hot (${temperature}°C) and dry (${humidity}%) microclimate favors rapid mite population explosion.`,
      recommendedAction: 'Provide light sprinkler irrigation in mornings to raise microclimate humidity. Apply wettable sulfur (2g/L) if leaf curling is observed.'
    });
  }

  // Rule 4: Root Rot and Damping-Off
  // Heavy rainfall (> 20mm)
  if (rainfall >= 20) {
    alerts.push({
      id: 'root-rot-alert',
      severity: 'high',
      title: 'Waterlogging & Damping-Off Alert',
      description: `Intense precipitation (${rainfall} mm) can cause prolonged root submergence and soil-borne Phytophthora infections.`,
      recommendedAction: 'Open drainage furrows immediately. Avoid chemical soil drenching until surface water fully recedes.'
    });
  }

  // Rule 5: High Wind Spore Dispersion & Lodging
  if (windSpeed >= 35) {
    alerts.push({
      id: 'wind-lodging-alert',
      severity: 'medium',
      title: 'High Wind Velocity & Spore Drift Advisory',
      description: `Wind gusts (${windSpeed} km/h) can cause physical crop lodging and carry bacterial blight across adjoining fields.`,
      recommendedAction: 'Provide earthing up or physical staking for tall crops (maize, banana). Defer foliar spray applications until winds subside.'
    });
  }

  // Fallback: If no high/medium risks triggered, provide general low-risk scouting alert
  if (alerts.length === 0) {
    alerts.push({
      id: 'normal-scouting-advisory',
      severity: 'low',
      title: 'Normal Conditions - Routine Field Scouting',
      description: `Microclimate (Temp: ${temperature}°C, Humidity: ${humidity}%) is within standard ranges with low immediate pest pressure.`,
      recommendedAction: 'Conduct routine weekly pest scouting along field diagonals. Maintain beneficial predator insects.'
    });
  }

  return alerts;
}

module.exports = { generatePestAlerts };
