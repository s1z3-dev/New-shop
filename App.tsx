
import React, { useState, useMemo, useCallback } from 'react';
import { ProductItem, ComparisonResult } from './types';
import { DEFAULT_PRODUCTS, EUR_TO_BGN } from './constants';
import ProductCard from './components/ProductCard';
import { getShoppingAdvice, ShoppingAdviceResponse } from './services/geminiService';

const App: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>(
    JSON.parse(JSON.stringify(DEFAULT_PRODUCTS))
  );
  const [advice, setAdvice] = useState<ShoppingAdviceResponse | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [useSearch, setUseSearch] = useState(false);

  const handleUpdate = useCallback((id: string, field: keyof ProductItem, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }, []);

  const results = useMemo(() => {
    const calculatedResults: ComparisonResult[] = products.map(p => {
      if (p.weight === '' || p.weight <= 0 || p.priceEur === '' || p.priceEur <= 0) {
        return { id: p.id, pricePerKgEur: 0, pricePerKgBgn: 0, isBestValue: false, totalWeightKg: 0 };
      }

      const qty = p.quantity === '' || p.quantity <= 0 ? 1 : (p.quantity as number);
      const unitWeightKg = p.unit === 'g' ? (p.weight as number) / 1000 : (p.weight as number);
      const totalWeightKg = unitWeightKg * qty;
      
      const pricePerKgEur = (p.priceEur as number) / totalWeightKg;
      const pricePerKgBgn = pricePerKgEur * EUR_TO_BGN;

      return {
        id: p.id,
        pricePerKgEur,
        pricePerKgBgn,
        isBestValue: false,
        totalWeightKg
      };
    });

    const validResults = calculatedResults.filter(r => r.pricePerKgEur > 0);
    if (validResults.length > 0) {
      const minPrice = Math.min(...validResults.map(r => r.pricePerKgEur));
      validResults.forEach(r => {
        if (Math.abs(r.pricePerKgEur - minPrice) < 0.0001) {
          const original = calculatedResults.find(orig => orig.id === r.id);
          if (original) original.isBestValue = true;
        }
      });
    }

    return calculatedResults;
  }, [products]);

  const resetAll = () => {
    setProducts(JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)));
    setAdvice(null);
  };

  const loadChocolateExample = () => {
    const newProducts = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    newProducts[0] = { ...newProducts[0], name: 'Small Box', weight: 100, unit: 'g', quantity: 1, priceEur: 2.99 };
    newProducts[1] = { ...newProducts[1], name: 'Value Box', weight: 300, unit: 'g', quantity: 1, priceEur: 4.99 };
    setProducts(newProducts);
    setAdvice(null);
  };

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    const result = await getShoppingAdvice(products, useSearch);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col items-center py-8 px-4 sm:px-10 overflow-x-hidden selection:bg-blue-100">
      <header className="max-w-4xl w-full mb-12 text-center flex flex-col items-center">
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-6">
            <svg className="w-9 h-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-[900] text-slate-900 tracking-tight sm:text-6xl mb-2">
          Smart<span className="text-blue-600">Shop</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium uppercase tracking-[0.2em] opacity-70">
          Professional Unit Price Intelligence
        </p>
      </header>

      <main className="max-w-7xl w-full flex-grow pb-20">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={loadChocolateExample}
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-all text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <span role="img" aria-label="chocolate">🍫</span> Compare Chocolates
          </button>
          <button
            onClick={resetAll}
            className="px-6 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold rounded-full transition-all text-xs uppercase tracking-wider"
          >
            Reset Form
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              result={results[idx].pricePerKgEur > 0 ? results[idx] : undefined}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-6 w-full max-w-xl">
             <div className="flex items-center gap-3 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
               <button 
                 onClick={() => setUseSearch(false)}
                 className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${!useSearch ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Local Math
               </button>
               <button 
                 onClick={() => setUseSearch(true)}
                 className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest flex items-center gap-2 ${useSearch ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.55 3.4c-.27-.36-.66-.59-1.1-.65l-2.85-.41c-.44-.06-.83.13-1.07.48l-1.57 2.3c-.24.35-.24.81 0 1.16l1.57 2.3c.24.35.63.54 1.07.48l2.85-.41c.44-.06.83-.29 1.1-.65.27-.36.36-.81.25-1.25l-.5-2.1c-.11-.44-.39-.8-.75-1.05zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                 Market Check
               </button>
             </div>
             
             <button
              onClick={fetchAdvice}
              disabled={loadingAdvice}
              className="w-full sm:w-80 group relative overflow-hidden px-10 py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-xs"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {loadingAdvice ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <span>Analyze with Gemini</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {advice && (
            <div className="w-full max-w-4xl bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100">
                      Expert Analysis
                    </span>
                    {useSearch && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                        Live Market Data
                      </span>
                    )}
                  </div>
                  <div className="prose prose-slate prose-lg text-slate-700 font-semibold leading-relaxed whitespace-pre-wrap">
                    {advice.text}
                  </div>
                  
                  {advice.sources && advice.sources.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verification Sources</p>
                      <div className="flex flex-wrap gap-2">
                        {advice.sources.map((source: any, idx: number) => (
                          <a 
                            key={idx}
                            href={source.web?.uri || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {source.web?.title || `Source ${idx + 1}`}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-20 text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] text-center py-12 border-t border-slate-100 w-full max-w-4xl opacity-50">
        <p>© {new Date().getFullYear()} SmartShop Intelligence • 1 EUR = 1.95583 BGN</p>
      </footer>
    </div>
  );
};

export default App;
