import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, Calendar, ThermometerSun, Leaf, Grape } from 'lucide-react';
import { calculateGrowth } from '../utils/engine';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Calculator() {
  const [crop, setCrop] = useLocalStorage('greenvibe_gdd_crop', 'Melon');
  const [plantingDate, setPlantingDate] = useLocalStorage('greenvibe_gdd_date', new Date().toISOString().split('T')[0]);
  const [avgTemp, setAvgTemp] = useLocalStorage('greenvibe_gdd_temp', 27);
  
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (plantingDate) {
      const res = calculateGrowth(crop, plantingDate, avgTemp);
      setResult(res);
    }
  }, [crop, plantingDate, avgTemp]);

  return (
    <div className="calculator animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><CalcIcon /> GDD Harvest Calculator</h2>
        <p className="text-muted">Estimate harvest date based on Growing Degree Days</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card flex-col gap-4">
          <div className="control-group">
            <label className="block mb-2 font-semibold">Select Crop</label>
            <select className="input-field" value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="Melon">Melon</option>
              <option value="Strawberry">Strawberry</option>
              <option value="Grape">Grape</option>
            </select>
          </div>

          <div className="control-group mt-4">
            <label className="block mb-2 font-semibold flex items-center gap-2"><Calendar size={18}/> Planting Date</label>
            <input 
              type="date" 
              className="input-field" 
              value={plantingDate} 
              onChange={(e) => setPlantingDate(e.target.value)}
            />
          </div>

          <div className="control-group mt-4">
            <label className="block mb-2 font-semibold flex items-center gap-2"><ThermometerSun size={18}/> Average Daily Temperature (°C)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" min="10" max="40" step="1" 
                value={avgTemp} 
                onChange={(e) => setAvgTemp(Number(e.target.value))} 
              />
              <span className="font-bold w-12 text-right">{avgTemp}°C</span>
            </div>
          </div>
        </div>

        <div className="card bg-bg-50 border-primary">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Calculation Result</h3>
          
          {result ? (
            <div className="flex flex-col gap-4">
              <motion.div 
                key={result.currentGdd}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card p-4 rounded shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <ThermometerSun className="text-warning"/>
                  <span>Current GDD</span>
                </div>
                <span className="font-bold text-xl">{result.currentGdd}</span>
              </motion.div>

              <motion.div 
                key={result.phase}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card p-4 rounded shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Leaf className="text-primary"/>
                  <span>Growth Phase</span>
                </div>
                <span className="font-bold text-lg text-primary">{result.phase}</span>
              </motion.div>

              <motion.div 
                key={result.estimatedHarvestDate}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card p-4 rounded shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Grape className="text-purple-600"/>
                  <span>Estimated Harvest</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{result.estimatedHarvestDate || '-'}</div>
                  {result.daysToHarvestRemaining !== undefined && (
                    <div className="text-sm text-muted">{result.daysToHarvestRemaining} days remaining</div>
                  )}
                </div>
              </motion.div>
              
              {result.message && (
                <div className="text-warning text-sm mt-2">{result.message}</div>
              )}
            </div>
          ) : (
             <div className="text-muted text-center py-8">Enter valid parameters to see estimation.</div>
          )}
        </div>
      </div>
    </div>
  );
}
