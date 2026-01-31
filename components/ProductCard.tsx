
import React from 'react';
import { ProductItem, WeightUnit } from '../types';
import { EUR_TO_BGN } from '../constants';

interface ProductCardProps {
  product: ProductItem;
  result?: {
    pricePerKgEur: number;
    pricePerKgBgn: number;
    isBestValue: boolean;
    totalWeightKg: number;
  };
  onUpdate: (id: string, field: keyof ProductItem, value: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, result, onUpdate }) => {
  const handleChange = (field: keyof ProductItem, value: string) => {
    if (field === 'weight' || field === 'priceEur' || field === 'quantity') {
      const num = value === '' ? '' : parseFloat(value);
      onUpdate(product.id, field, num);
    } else {
      onUpdate(product.id, field, value);
    }
  };

  const bgnValue = product.priceEur !== '' ? (Number(product.priceEur) * EUR_TO_BGN).toFixed(2) : '0.00';

  return (
    <div className={`group relative p-6 rounded-[2rem] transition-all duration-500 border-2 flex flex-col h-full ${
      result?.isBestValue 
        ? 'bg-white border-blue-500 shadow-[0_20px_50px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/20 scale-[1.02] z-10' 
        : 'bg-white border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50'
    }`}>
      {result?.isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap animate-bounce">
          🏆 Top Value
        </div>
      )}

      <div className="space-y-5 flex-grow">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.15em]">Identity</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-bold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
            placeholder="Item Name..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.15em]">Amount</label>
            <input
              type="number"
              inputMode="decimal"
              value={product.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.15em]">Unit</label>
            <select
              value={product.unit}
              onChange={(e) => handleChange('unit', e.target.value as WeightUnit)}
              className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
            >
              <option value="g">g / ml</option>
              <option value="kg">kg / L</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.15em]">Multiplier (Pack)</label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-black text-sm">×</span>
             <input
              type="number"
              inputMode="numeric"
              value={product.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-500"
              placeholder="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.15em]">Cost (Total)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-black text-base">€</span>
            <input
              type="number"
              inputMode="decimal"
              value={product.priceEur}
              onChange={(e) => handleChange('priceEur', e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 text-base font-black focus:outline-none focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {result && result.pricePerKgEur > 0 ? (
          <div className={`pt-6 border-t border-dashed mt-4 ${result.isBestValue ? 'border-blue-100' : 'border-slate-100'}`}>
            <div className="flex flex-col gap-1">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${result.isBestValue ? 'text-blue-500' : 'text-slate-400'}`}>
                Efficiency Score
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-[900] text-slate-900 tabular-nums tracking-tighter">
                  €{result.pricePerKgEur.toFixed(2)}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase">/ kg</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-black text-blue-600 tabular-nums">{result.pricePerKgBgn.toFixed(2)}</span>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">BGN Unit</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-10 flex flex-col items-center justify-center opacity-20 filter grayscale">
             <div className="w-12 h-1 bg-slate-200 rounded-full mb-1"></div>
             <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
