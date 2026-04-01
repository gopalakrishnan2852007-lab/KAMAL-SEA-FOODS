import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: string;
}

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getStockInfo = (stock: number) => {
    if (stock > 5) return { 
      label: 'In Stock ✅', 
      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', 
      glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]',
      icon: CheckCircle2 
    };
    if (stock > 0) return { 
      label: 'Low Stock ⚠️', 
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', 
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
      icon: AlertTriangle 
    };
    return { 
      label: 'Out of Stock ❌', 
      color: 'text-red-400 bg-red-400/10 border-red-400/20', 
      glow: 'shadow-[0_0_15px_rgba(248,113,113,0.3)]',
      icon: XCircle 
    };
  };

  const stockInfo = getStockInfo(product.stock);
  const isOutOfStock = product.stock === 0;

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={cn(
        "glass-card glass-card-hover rounded-[3rem] overflow-hidden group border border-white/10",
        stockInfo.glow
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={product.image || `https://picsum.photos/seed/${product.name}/800/1000`}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute top-6 left-6">
          <span className="bg-slate-950/80 backdrop-blur-xl text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border border-white/10 shadow-2xl">
            {product.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80"></div>
      </div>

      <div className="p-8 space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={cn(
              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
              product.category === 'Ready-to-Cook' 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            )}>
              {product.category === 'Ready-to-Cook' ? 'Ready-to-Cook 🍳' : 'Frozen ❄️'}
            </span>
            <span className="bg-slate-900/50 text-slate-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">
              Store at -18°C
            </span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <h3 className="font-black text-3xl text-white tracking-tighter line-clamp-1 text-glow">{product.name}</h3>
            <div className="flex flex-col items-end">
              <span className="font-black text-blue-400 text-3xl tracking-tighter">₹{product.price}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">per kg</span>
            </div>
          </div>
          
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border",
            stockInfo.color
          )}>
            <stockInfo.icon className="w-3.5 h-3.5" />
            {stockInfo.label}
          </div>
        </div>

        <Link
          to={`/order/${product.id}`}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.3em] transition-all",
            isOutOfStock
              ? "bg-white/5 text-slate-700 cursor-not-allowed border border-white/5"
              : "bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95"
          )}
          onClick={(e) => isOutOfStock && e.preventDefault()}
        >
          {isOutOfStock ? 'OUT OF STOCK' : (
            <>
              <ShoppingCart className="w-5 h-5" />
              PLACE ORDER
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
