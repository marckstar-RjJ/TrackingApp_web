import React, { useState } from 'react';

interface CostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PricingInfo {
  weight: number;
  nationalPrice: string;
  internationalPrices: {
    [key: string]: {
      [key: number]: string;
      notes: string;
    };
  };
}

const CostCalculatorModal: React.FC<CostCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [weight, setWeight] = useState<number>(1);
  const [destination, setDestination] = useState<string>('national');
  const [selectedCountry, setSelectedCountry] = useState<string>('miami');

  const nationalPricing: PricingInfo[] = [
    { weight: 1, nationalPrice: 'Bs 3.50–4.00', internationalPrices: {} },
    { weight: 10, nationalPrice: 'Bs 35–40', internationalPrices: {} },
    { weight: 25, nationalPrice: 'Bs 80–100', internationalPrices: {} },
    { weight: 100, nationalPrice: 'Bs 300–350', internationalPrices: {} },
    { weight: 300, nationalPrice: 'Bs 3.00/kg', internationalPrices: {} }
  ];

  const internationalPricing = {
    miami: {
      1: '$25–35',
      5: '$80–110',
      10: '$140–180',
      notes: 'Desde oficinas BoA vía CargoXpress'
    },
    madrid: {
      1: '$40–50',
      5: '$120–160',
      10: '$200–280',
      notes: 'Precios más altos por distancia'
    },
    buenosAires: {
      1: '$20–25',
      5: '$60–80',
      10: '$100–130',
      notes: 'Vuelos frecuentes'
    },
    saoPaulo: {
      1: '$22–30',
      5: '$65–90',
      10: '$110–140',
      notes: 'Conexión desde Santa Cruz'
    },
    lima: {
      1: '$18–25',
      5: '$55–75',
      10: '$90–120',
      notes: 'Corta distancia'
    },
    laHabana: {
      1: '$35–45',
      5: '$100–130',
      10: '$160–200',
      notes: 'Restricciones aduaneras posibles'
    },
    caracas: {
      1: '$30–40',
      5: '$90–120',
      10: '$150–190',
      notes: 'Demoras frecuentes por control de ingreso'
    }
  };

  const deliveryTimes = {
    national: {
      'La Paz ↔ Santa Cruz': '1 día hábil',
      'La Paz ↔ Cochabamba': '1 día hábil',
      'La Paz ↔ Sucre': '1–2 días hábiles',
      'La Paz ↔ Tarija': '1–2 días hábiles',
      'Santa Cruz ↔ Cobija': '2 días hábiles',
      'Cochabamba ↔ Trinidad': '1–2 días hábiles',
      'Santa Cruz ↔ Oruro': '1 día hábil'
    },
    international: {
      'Miami (EEUU)': '4–6 días hábiles',
      'Madrid (España)': '6–8 días hábiles',
      'Buenos Aires (Argentina)': '3–5 días hábiles',
      'São Paulo (Brasil)': '3–5 días hábiles',
      'Lima (Perú)': '2–3 días hábiles',
      'La Habana (Cuba)': '5–7 días hábiles',
      'Caracas (Venezuela)': '5–7 días hábiles'
    }
  };

  const calculateNationalPrice = (weight: number): string => {
    if (weight <= 1) return 'Bs 3.50–4.00';
    if (weight <= 10) return `Bs ${(weight * 3.5).toFixed(0)}–${(weight * 4).toFixed(0)}`;
    if (weight <= 25) return `Bs ${(weight * 3.2).toFixed(0)}–${(weight * 4).toFixed(0)}`;
    if (weight <= 100) return `Bs ${(weight * 3).toFixed(0)}–${(weight * 3.5).toFixed(0)}`;
    return `Bs ${(weight * 3).toFixed(0)}`;
  };

  const calculateInternationalPrice = (weight: number, country: string): string => {
    const pricing = internationalPricing[country as keyof typeof internationalPricing];
    if (!pricing) return 'No disponible';

    if (weight <= 1) return pricing[1];
    if (weight <= 5) return pricing[5];
    if (weight <= 10) return pricing[10];
    
    // Para pesos mayores, estimar basado en el precio por kg
    const basePrice = pricing[10];
    const baseWeight = 10;
    const estimatedPrice = Math.round((weight / baseWeight) * parseFloat(basePrice.split('–')[1]));
    return `~$${estimatedPrice}`;
  };

  const getEstimatedPrice = (): string => {
    if (destination === 'national') {
      return calculateNationalPrice(weight);
    } else {
      return calculateInternationalPrice(weight, selectedCountry);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Calculadora de Costos de Envío</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {/* Calculadora */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">Calcula tu envío</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese el peso"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Envío
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="national">🇧🇴 Nacional (Bolivia)</option>
                  <option value="international">🌍 Internacional</option>
                </select>
              </div>
              
              {destination === 'international' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destino
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="miami">🇺🇸 Miami (EEUU)</option>
                    <option value="madrid">🇪🇸 Madrid (España)</option>
                    <option value="buenosAires">🇦🇷 Buenos Aires (Argentina)</option>
                    <option value="saoPaulo">🇧🇷 São Paulo (Brasil)</option>
                    <option value="lima">🇵🇪 Lima (Perú)</option>
                    <option value="laHabana">🇨🇺 La Habana (Cuba)</option>
                    <option value="caracas">🇻🇪 Caracas (Venezuela)</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-300">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Precio Estimado</p>
                <p className="text-3xl font-bold text-blue-600">{getEstimatedPrice()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {destination === 'national' ? 'Envío Nacional' : `Envío a ${selectedCountry}`}
                </p>
              </div>
            </div>
          </div>

          {/* Tablas de Precios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Precios Nacionales */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-3 flex items-center">
                🇧🇴 ENVÍOS NACIONALES (Bolivia)
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-green-300">
                      <th className="text-left py-2 font-medium text-green-800">Peso</th>
                      <th className="text-left py-2 font-medium text-green-800">Precio</th>
                      <th className="text-left py-2 font-medium text-green-800">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nationalPricing.map((item, index) => (
                      <tr key={index} className="border-b border-green-200">
                        <td className="py-2 font-medium">{item.weight} kg</td>
                        <td className="py-2">{item.nationalPrice}</td>
                        <td className="py-2 text-xs text-green-700">
                          {item.weight === 1 && 'Tarifa mínima'}
                          {item.weight === 10 && 'Precio típico'}
                          {item.weight === 25 && 'Límite sugerido'}
                          {item.weight === 100 && 'Tarifa solidaria'}
                          {item.weight === 300 && 'Precio empresarial'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-green-700">
                <p>• Tiempo de entrega: 1–2 días hábiles</p>
                <p>• Todas las rutas principales: Máximo 48h</p>
              </div>
            </div>

            {/* Precios Internacionales */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 mb-3 flex items-center">
                🌍 ENVÍOS INTERNACIONALES
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-purple-300">
                      <th className="text-left py-2 font-medium text-purple-800">Destino</th>
                      <th className="text-left py-2 font-medium text-purple-800">1 kg</th>
                      <th className="text-left py-2 font-medium text-purple-800">5 kg</th>
                      <th className="text-left py-2 font-medium text-purple-800">10 kg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(internationalPricing).map(([country, prices]) => (
                      <tr key={country} className="border-b border-purple-200">
                        <td className="py-2 font-medium text-xs">
                          {country === 'miami' && '🇺🇸 Miami'}
                          {country === 'madrid' && '🇪🇸 Madrid'}
                          {country === 'buenosAires' && '🇦🇷 Buenos Aires'}
                          {country === 'saoPaulo' && '🇧🇷 São Paulo'}
                          {country === 'lima' && '🇵🇪 Lima'}
                          {country === 'laHabana' && '🇨🇺 La Habana'}
                          {country === 'caracas' && '🇻🇪 Caracas'}
                        </td>
                        <td className="py-2">{prices[1]}</td>
                        <td className="py-2">{prices[5]}</td>
                        <td className="py-2">{prices[10]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-purple-700">
                <p>• Conversión: 1 USD ≈ 6.96 Bs</p>
                <p>• Incluye transporte + costos de proceso</p>
                <p>• No incluye impuestos aduaneros</p>
              </div>
            </div>
          </div>

          {/* Tiempos de Entrega */}
          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h5 className="font-semibold text-orange-900 mb-3">📦 Tiempos de Entrega Estimados</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h6 className="font-medium text-orange-800 mb-2">🇧🇴 Nacional (Bolivia)</h6>
                <div className="space-y-1 text-sm">
                  {Object.entries(deliveryTimes.national).map(([route, time]) => (
                    <div key={route} className="flex justify-between">
                      <span className="text-orange-700">{route}</span>
                      <span className="font-medium">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h6 className="font-medium text-orange-800 mb-2">🌍 Internacional</h6>
                <div className="space-y-1 text-sm">
                  {Object.entries(deliveryTimes.international).map(([destination, time]) => (
                    <div key={destination} className="flex justify-between">
                      <span className="text-orange-700">{destination}</span>
                      <span className="font-medium">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Factores Adicionales */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-3">🧾 Factores que pueden afectar el precio</h5>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Tipo de carga (perecedera, frágil, valorada)</li>
              <li>• Embalaje y manejo especial</li>
              <li>• Seguro (opcional)</li>
              <li>• Aduanas en el país receptor (puede haber cobros extras)</li>
            </ul>
          </div>

          {/* Botón de Cerrar */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostCalculatorModal; 