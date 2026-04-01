import { useState } from 'react';
import { products } from '../data/products';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import OceanScene from '../components/OceanScene';

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Frozen', 'Ready-to-Cook'];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const getWhatsAppLink = (productName: string) => {
    return `https://wa.me/919865668125?text=Hello%2C%20I%20want%20to%20order%20${encodeURIComponent(productName)}`;
  };

  return (
    <div className="relative min-h-screen">
      <OceanScene />
      
      <div className="max-w-7xl mx-auto space-y-12 pb-20 pt-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header and Filters */}
        <div className="space-y-8 flex flex-col items-center text-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase text-glow">
              Our Selection
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg font-medium">
              Premium quality seafood delivered to your doorstep. Explore our finest selection.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 backdrop-blur-md">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2.5 rounded-[1.5rem] text-sm font-bold tracking-wide transition-all whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/5"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-7">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={product.id}
                className="group flex flex-col bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden hover:bg-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:-translate-y-2"
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-slate-800">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.name}/400/400`;
                    }}
                  />
                  {/* Left Badge: Type */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={cn(
                      "px-3 py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-wider rounded-full border shadow-2xl backdrop-blur-md",
                      product.category === 'Ready-to-Cook' 
                        ? "bg-amber-500/90 text-white border-amber-400/50" 
                        : "bg-blue-600/90 text-white border-blue-400/50"
                    )}>
                      {product.type}
                    </span>
                  </div>
                  {/* Right Badge: Stock Status */}
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded-full shadow-2xl backdrop-blur-md border border-emerald-400/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Stock ✅
                    </span>
                  </div>
                  {/* Gradient overlay to smoothly transition to dark text area */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-90" />
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 p-5 md:p-6 space-y-5 -mt-6 relative z-10">
                  <div className="flex-1 space-y-1">
                    <h3 className="font-extrabold text-xl md:text-2xl text-white tracking-tight line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-blue-400 text-2xl md:text-3xl tracking-tighter drop-shadow-md">₹{product.price}</span>
                    </div>
                  </div>

                  {/* WhatsApp Order Button */}
                  <a
                    href={getWhatsAppLink(product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold uppercase tracking-widest text-[#0b141a] bg-gradient-to-r from-[#25D366] to-[#128C7E] transition-all duration-300 shadow-[0_8px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_12px_25px_rgba(37,211,102,0.4)] active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span className="text-white text-xs md:text-sm drop-shadow-sm">Order on WhatsApp</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
