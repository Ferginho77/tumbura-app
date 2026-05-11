import knowledgeBase from '../data/knowledgeBase.json';

/**
 * Calculates environmental health score and gives recommendations based on real-time inputs.
 * @param {string} crop - The crop name (Melon, Strawberry, Grape)
 * @param {object} current - { temperature, humidity, lightIntensity, pH, PPM }
 * @param {string} phase - 'vegetative' or 'generative'
 * @returns {object} { score, recommendations }
 */
export function evaluateEnvironment(crop, current, phase = 'vegetative') {
  const params = knowledgeBase.crops[crop]?.idealParameters;
  if (!params) return { score: 0, recommendations: ["Crop not found in knowledge base."] };

  let score = 100;
  let recommendations = [];

  // Temperature
  if (current.temperature < params.temperature.min) {
    score -= 15;
    recommendations.push("Suhu terlalu rendah. Nyalakan Heater.");
  } else if (current.temperature > params.temperature.max) {
    score -= 15;
    recommendations.push("Suhu terlalu tinggi. Nyalakan Cooling Pad / Exhaust Fan.");
  }

  // Humidity
  if (current.humidity < params.humidity.min) {
    score -= 15;
    recommendations.push("Kelembapan di bawah ambang batas. Nyalakan Mist Maker.");
  } else if (current.humidity > params.humidity.max) {
    score -= 15;
    recommendations.push("Kelembapan terlalu tinggi. Tingkatkan sirkulasi udara (Nyalakan Fan).");
  }

  // Light
  if (current.lightIntensity < params.lightIntensity.min) {
    score -= 10;
    recommendations.push("Intensitas cahaya kurang. Nyalakan Grow Light.");
  } else if (current.lightIntensity > params.lightIntensity.max) {
    score -= 10;
    recommendations.push("Intensitas cahaya berlebih. Tarik shading net.");
  }

  // pH
  if (current.pH < params.pH.min) {
    score -= 15;
    recommendations.push("pH terlalu asam. Tambahkan pH Up.");
  } else if (current.pH > params.pH.max) {
    score -= 15;
    recommendations.push("pH terlalu basa. Tambahkan pH Down.");
  }

  // PPM
  const ppmTarget = params.PPM[phase];
  if (current.PPM < ppmTarget.min) {
    score -= 15;
    recommendations.push(`PPM kurang untuk fase ${phase}. Tambahkan nutrisi (AB Mix).`);
  } else if (current.PPM > ppmTarget.max) {
    score -= 15;
    recommendations.push(`PPM berlebih untuk fase ${phase}. Tambahkan air baku.`);
  }

  return {
    score: Math.max(0, score),
    recommendations: recommendations.length > 0 ? recommendations : ["Kondisi optimal. Tidak ada tindakan diperlukan."]
  };
}

/**
 * Calculates Growing Degree Days (GDD) and estimates harvest.
 * @param {string} crop - Crop name
 * @param {string} plantingDate - YYYY-MM-DD
 * @param {number} avgDailyTemp - Average temperature
 * @returns {object} { gdd, phase, estimatedHarvestDate }
 */
export function calculateGrowth(crop, plantingDate, avgDailyTemp) {
  const cropData = knowledgeBase.crops[crop];
  if (!cropData || !plantingDate) return null;

  const baseTemp = cropData.gddBaseTemp;
  // Simple GDD approximation based on average daily temperature
  const dailyGdd = Math.max(0, avgDailyTemp - baseTemp);
  
  if (dailyGdd === 0) {
    return {
      gdd: 0,
      phase: 'Dormant',
      estimatedHarvestDate: null,
      message: "Suhu rata-rata terlalu rendah untuk pertumbuhan."
    };
  }

  const daysToVegetative = Math.ceil(cropData.gddTargetVegetative / dailyGdd);
  const daysToHarvest = Math.ceil(cropData.gddTargetHarvest / dailyGdd);

  const start = new Date(plantingDate);
  const now = new Date();
  
  const daysElapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const currentGdd = daysElapsed * dailyGdd;

  let phase = "Vegetative";
  if (currentGdd >= cropData.gddTargetHarvest) {
    phase = "Harvest Ready";
  } else if (currentGdd >= cropData.gddTargetVegetative) {
    phase = "Generative";
  }

  const harvestDate = new Date(start);
  harvestDate.setDate(harvestDate.getDate() + daysToHarvest);

  return {
    currentGdd: currentGdd.toFixed(1),
    phase,
    daysElapsed,
    daysToHarvestRemaining: Math.max(0, daysToHarvest - Math.max(0, daysElapsed)),
    estimatedHarvestDate: harvestDate.toISOString().split('T')[0]
  };
}
