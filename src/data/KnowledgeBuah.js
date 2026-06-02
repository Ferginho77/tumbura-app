export const KnowledgeBuah = {
  "Anggur": {
    "idealParameters": {
      "temperature": { "min": 23, "max": 32, "optimal": 28 }, // Anggur tropis/subtropis butuh suhu hangat untuk fotosintesis optimal
      "humidity": { "min": 75, "max": 80, "optimal": 77 }, // Kelembaban di atas 75% berisiko tinggi jamur (Downy Mildew)
      "lightIntensity": { "min": 35000, "max": 60000, "optimal": 45000 }, // Membutuhkan penetrasi cahaya yang kuat untuk pematangan buah
      "pH": { "min": 6.0, "max": 7.0, "optimal": 6.5 }, // Tanah sedikit asam hingga netral untuk serapan nutrisi mikro
      "PPM": {
        "vegetative": { "min": 800, "max": 1100 }, 
        "generative": { "min": 1200, "max": 1600 } // Fase pembuahan butuh EC/PPM lebih tinggi untuk kadar gula (Brix)
      },
      "EC"  : {
        "vegetative": { "min": 1.2, "max": 1.5 },
        "generative": { "min": 1.5, "max": 2.0 }
      }
    },
    "gddBaseTemp": 10, // Standar Vitikultur (Winkler Scale)
    "gddTargetVegetative": 450, 
    "gddTargetHarvest": 1200 // Tergantung varietas (Table Grape vs Wine Grape)
  },
  "Semangka": {
    "idealParameters": {
      "temperature": { "min": 22, "max": 35, "optimal": 30 }, // Tanaman C4 yang sangat menyukai panas
      "humidity": { "min": 45, "max": 60, "optimal": 55 }, // Kelembaban rendah membantu pembentukan net dan mencegah busuk buah
      "lightIntensity": { "min": 45000, "max": 80000, "optimal": 60000 }, // Sangat rakus cahaya (Full Sun)
      "pH": { "min": 6.0, "max": 6.8, "optimal": 6.4 },
      "PPM": {
        "vegetative": { "min": 500, "max": 900 },
        "generative": { "min": 1200, "max": 1600 } // Kebutuhan Kalium tinggi pada fase pembuahan
      },
       "EC"  : {
        "vegetative": { "min": 1.2, "max": 1.5 },
        "generative": { "min": 1.5, "max": 2.0 }
      }
    },
    "gddBaseTemp": 10, // Ambang bawah pertumbuhan Cucurbitaceae
    "gddTargetVegetative": 700,
    "gddTargetHarvest": 1800 
  },
  "Melon": {
    "idealParameters": {
      "temperature": { "min": 22, "max": 35, "optimal": 30 }, // Tanaman C4 yang sangat menyukai panas
      "humidity": { "min": 45, "max": 60, "optimal": 55 }, // Kelembaban rendah membantu pembentukan net dan mencegah busuk buah
      "lightIntensity": { "min": 45000, "max": 80000, "optimal": 60000 }, // Sangat rakus cahaya (Full Sun)
      "pH": { "min": 6.0, "max": 6.8, "optimal": 6.4 },
      "PPM": {
        "vegetative": { "min": 500, "max": 900 },
        "generative": { "min": 1200, "max": 1600 } // Kebutuhan Kalium tinggi pada fase pembuahan
      },
       "EC"  : {
        "vegetative": { "min": 1.2, "max": 1.5 },
        "generative": { "min": 1.5, "max": 2.0 }
      }
    },
    "gddBaseTemp": 10, // Ambang bawah pertumbuhan Cucurbitaceae
    "gddTargetVegetative": 700,
    "gddTargetHarvest": 1800 
  }
}