'use client';
import { useState } from 'react';

export function SearchFilters() {
  const [radius, setRadius] = useState(10);

  return (
    <>
      <div className="bg-surface-bg rounded-xl border border-border-light p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-h3 text-text-primary">Filters</h3>
          <button className="text-primary font-small-bold text-small bg-transparent border-none cursor-pointer">Clear All</button>
        </div>
        
        {/* Online Status */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative inline-flex items-center">
              <input className="sr-only peer" type="checkbox" />
              <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
            </div>
            <span className="font-body text-text-primary">Available Now</span>
          </label>
        </div>
        
        {/* Price Range */}
        <div className="mb-6 border-t border-border-light pt-4">
          <h4 className="font-small-bold mb-4 text-text-primary">Price Range (VND)</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 font-small cursor-pointer text-text-secondary">
              <input className="rounded focus:ring-primary h-4 w-4 border-border-light" style={{ accentColor: '#FF8228' }} type="checkbox" />
              <span>Under 200,000</span>
            </label>
            <label className="flex items-center gap-3 font-small cursor-pointer text-text-secondary">
              <input className="rounded focus:ring-primary h-4 w-4 border-border-light" style={{ accentColor: '#FF8228' }} type="checkbox" />
              <span>200,000 - 500,000</span>
            </label>
            <label className="flex items-center gap-3 font-small cursor-pointer text-text-secondary">
              <input className="rounded focus:ring-primary h-4 w-4 border-border-light" style={{ accentColor: '#FF8228' }} type="checkbox" />
              <span>Over 500,000</span>
            </label>
          </div>
        </div>
        
        {/* Rating */}
        <div className="mb-6 border-t border-border-light pt-4">
          <h4 className="font-small-bold mb-4 text-text-primary">Minimum Rating</h4>
          <div className="space-y-3">
            {[4, 3].map((rating) => (
              <label key={rating} className="flex items-center gap-3 font-small cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input className="sr-only peer" name="rating" type="radio" />
                  <div className="w-5 h-5 rounded-full border-2 border-border-light peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white scale-0 peer-checked:scale-100 transition-transform"></div>
                  </div>
                </div>
                <span className="flex items-center text-primary">
                  {[...Array(rating)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                  <span className="text-text-tertiary ml-2">& up</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Radius */}
        <div className="border-t border-border-light pt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-small-bold text-text-primary">Distance Radius</h4>
            <div className="flex items-center gap-1.5">
              <input 
                type="number" 
                value={radius}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) setRadius(Math.min(50, Math.max(1, val)));
                }}
                className="w-12 h-7 text-center text-primary font-bold text-sm bg-primary/10 border-none rounded-md focus:ring-1 focus:ring-primary outline-none"
              />
              <span className="text-[11px] font-bold text-text-tertiary uppercase">km</span>
            </div>
          </div>
          <input 
            className="w-full h-2 bg-border-light rounded-lg appearance-none cursor-pointer" 
            style={{ accentColor: '#FF8228' }} 
            max="50" 
            min="1" 
            type="range" 
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
          />
          <div className="flex justify-between text-xs mt-2 text-text-tertiary">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>
      
      {/* Ad/Promo Card */}
      <div style={{ background: '#F2F8FF', border: '1px solid #006EF5' }} className="rounded-xl p-4 overflow-hidden relative">
        <h5 className="font-body-bold text-text-primary mb-2">Join Vua Thợ Pro</h5>
        <p className="text-small text-text-secondary mb-4">Boost your visibility and find more local clients today.</p>
        <button className="font-small-bold bg-transparent border-none cursor-pointer p-0 hover:underline" style={{ color: '#006EF5' }}>Register now →</button>
      </div>
    </>
  );
}
