// Componente para mostrar tarifas de envío nacionales e internacionales
import React from 'react';
import ReactCountryFlag from 'react-country-flag';

const nationalRates = [
  { peso: '1 kg', precio: 'Bs 3.50–4.00', notas: 'Tarifa mínima. Ideal para documentos o pequeños paquetes.' },
  { peso: '10 kg', precio: 'Bs 35–40', notas: 'Caja mediana.' },
  { peso: '25 kg', precio: 'Bs 80–100', notas: 'Límite sugerido por paquete.' },
  { peso: '100 kg', precio: 'Bs 300–350', notas: 'Tarifa solidaria.' },
  { peso: '300+ kg', precio: 'Bs 3.00/kg', notas: 'Precio empresarial o masivo.' },
];

const internationalRates = [
  { destino: 'Miami (EEUU)', kg1: '$25–35', kg5: '$80–110', kg10: '$140–180', notas: 'Desde oficinas BoA vía CargoXpress' },
  { destino: 'Madrid (España)', kg1: '$40–50', kg5: '$120–160', kg10: '$200–280', notas: 'Precios más altos por distancia' },
  { destino: 'Buenos Aires', kg1: '$20–25', kg5: '$60–80', kg10: '$100–130', notas: 'Vuelos frecuentes' },
  { destino: 'São Paulo', kg1: '$22–30', kg5: '$65–90', kg10: '$110–140', notas: '' },
  { destino: 'Lima (Perú)', kg1: '$18–25', kg5: '$55–75', kg10: '$90–120', notas: 'Corta distancia' },
  { destino: 'La Habana', kg1: '$35–45', kg5: '$100–130', kg10: '$160–200', notas: 'Restricciones aduaneras posibles' },
  { destino: 'Caracas', kg1: '$30–40', kg5: '$90–120', kg10: '$150–190', notas: '' },
];

const countryFlags: Record<string, string> = {
  'Miami (EEUU)': 'US',
  'Madrid (España)': 'ES',
  'Buenos Aires': 'AR',
  'São Paulo': 'BR',
  'Lima (Perú)': 'PE',
  'La Habana': 'CU',
  'Caracas': 'VE',
};

const ShippingRatesCard: React.FC = () => (
  <div className="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 rounded-3xl shadow-2xl p-8 mb-12 max-w-4xl mx-auto text-white animate-fade-in-up border border-blue-300/30 backdrop-blur-md">
    <h2 className="text-4xl font-extrabold mb-6 flex items-center gap-3 text-blue-100 drop-shadow-lg">
      <span className="rounded-full bg-white/20 p-2"><ReactCountryFlag countryCode="BO" svg style={{ fontSize: '2em' }} /></span>
      Envíos Nacionales (Bolivia)
    </h2>
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full text-left text-lg rounded-xl overflow-hidden shadow-md bg-white/10">
        <thead>
          <tr className="border-b border-blue-200/30 text-blue-200">
            <th className="py-3 pr-4 font-bold">Peso</th>
            <th className="py-3 pr-4 font-bold">Estimado en Bs</th>
            <th className="py-3 font-bold">Notas</th>
          </tr>
        </thead>
        <tbody>
          {nationalRates.map((row, idx) => (
            <tr key={idx} className="border-b border-blue-100/10 hover:bg-blue-900/30 transition">
              <td className="py-2 pr-4 font-semibold text-blue-100">{row.peso}</td>
              <td className="py-2 pr-4 font-semibold text-blue-300">{row.precio}</td>
              <td className="py-2 text-blue-100">{row.notas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="text-blue-200 text-base mb-8 italic">
      Tiempo de entrega: 1–2 días hábiles (según destino). Rutas comunes: La Paz, Santa Cruz, Cochabamba, Sucre, Tarija, etc.
    </p>
    <h2 className="text-4xl font-extrabold mb-6 flex items-center gap-3 text-blue-100 drop-shadow-lg mt-10">
      <span className="rounded-full bg-white/20 p-2"><span role="img" aria-label="Mundo" style={{ fontSize: '2em' }}>🌍</span></span>
      Envíos Internacionales
    </h2>
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full text-left text-lg rounded-xl overflow-hidden shadow-md bg-white/10">
        <thead>
          <tr className="border-b border-blue-200/30 text-blue-200">
            <th className="py-3 pr-4 font-bold">Destino</th>
            <th className="py-3 pr-4 font-bold">1 kg</th>
            <th className="py-3 pr-4 font-bold">5 kg</th>
            <th className="py-3 pr-4 font-bold">10 kg</th>
            <th className="py-3 font-bold">Notas</th>
          </tr>
        </thead>
        <tbody>
          {internationalRates.map((row, idx) => (
            <tr key={idx} className="border-b border-blue-100/10 hover:bg-blue-900/30 transition">
              <td className="py-2 pr-4 flex items-center gap-2 font-semibold text-blue-100">
                {countryFlags[row.destino] && (
                  <ReactCountryFlag countryCode={countryFlags[row.destino]} svg style={{ fontSize: '1.5em', filter: 'drop-shadow(0 0 2px #fff)' }} />
                )}
                {row.destino}
              </td>
              <td className="py-2 pr-4 font-semibold text-blue-300">{row.kg1}</td>
              <td className="py-2 pr-4 font-semibold text-blue-300">{row.kg5}</td>
              <td className="py-2 pr-4 font-semibold text-blue-300">{row.kg10}</td>
              <td className="py-2 text-blue-100">{row.notas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6">
      <p className="text-blue-200 text-base italic">
        Conversión referencial: <b>1 USD ≈ 6.96 Bs</b>. Ejemplo: 5 kg a Miami = $100 → ~Bs 700
      </p>
      <p className="text-yellow-200 text-base">
        <b>Otros factores:</b> Tipo de carga, embalaje, seguro, aduanas en destino.
      </p>
    </div>
  </div>
);

export default ShippingRatesCard;
