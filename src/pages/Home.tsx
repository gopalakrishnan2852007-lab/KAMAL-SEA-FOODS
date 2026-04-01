import { Link } from 'react-router-dom';
import { ArrowRight, Waves, ShieldCheck, Truck, MessageCircle, CheckCircle2, Snowflake, ChefHat } from 'lucide-react';
import OceanScene from '../components/OceanScene';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '../lib/utils';
import React, { useEffect, useState } from 'react';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ProductCard, { Product } from '../components/ProductCard';

export default function Home() {
  const [previewProducts, setPreviewProducts] = useState<Product[]>([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);

  useEffect(() => {
    const q = query(collection(db, 'products'), limit(6));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setPreviewProducts(prods);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) - 0.5;
      const y = (e.clientY / innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <OceanScene />
      
      <div className="relative z-10 space-y-24 pb-20 pt-8">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
          <motion.div
            style={{ rotateX, rotateY, perspective: 1000 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl space-y-6"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]"
            >
              <Snowflake className="w-3 h-3" />
              Premium Frozen Selection
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter text-white text-glow uppercase">
              Premium Frozen & <br />
              <span className="text-blue-400">Ready-to-Cook Seafood</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              High-quality frozen fish, prawns, crab, squid & ready-to-cook items like fish fingers and crab lollipop in Salem.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
              <Link
                to="/products"
                className="group bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-400 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95"
              >
                View Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/919865668125?text=Hello,%20I%20want%20to%20order%20frozen%20seafood"
                className="glass-card text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all border border-white/10 flex items-center gap-3"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                Order on WhatsApp
              </a>
            </div>
          </motion.div>
        </section>

        {/* Product Preview Section */}
        <section className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Featured Selection</h2>
              <p className="text-slate-500">Our most popular frozen and ready-to-cook items.</p>
            </div>
            <Link to="/products" className="text-blue-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:text-blue-300 transition-colors">
              See All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {previewProducts.length > 0 ? (
              previewProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              // Fallback placeholders with specific names if no products in DB yet
              [
                { id: '1', name: 'Basha Fish', category: 'Frozen Seafood', price: 350, stock: 10, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800', status: 'In Stock' },
                { id: '2', name: 'Nethili', category: 'Frozen Seafood', price: 330, stock: 15, image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&q=80&w=800', status: 'In Stock' },
                { id: '3', name: 'Squid', category: 'Frozen Seafood', price: 400, stock: 8, image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=800', status: 'In Stock' },
                { id: '4', name: 'Fish Fingers', category: 'Ready-to-Cook', price: 600, stock: 20, image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800', status: 'In Stock' },
                { id: '5', name: 'Crab Lollipop', category: 'Ready-to-Cook', price: 580, stock: 12, image: 'https://images.unsplash.com/photo-1551443874-e34988647005?auto=format&fit=crop&q=80&w=800', status: 'In Stock' },
                { id: '6', name: 'Medium Prawn', category: 'Frozen Seafood', price: 500, stock: 18, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=800', status: 'In Stock' }
              ].map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Frozen Seafood',
              icon: Snowflake,
              desc: 'Premium fish, prawns, and crab flash-frozen to preserve freshness.',
              items: ['Basha Fish', 'Nethili', 'Squid', 'Prawns'],
              color: 'text-blue-400',
              bg: 'bg-blue-500/5',
              border: 'border-blue-500/20'
            },
            {
              title: 'Ready-to-Cook',
              icon: ChefHat,
              desc: 'Convenient and delicious items prepared for instant cooking.',
              items: ['Fish Fingers', 'Crab Lollipop', 'Fish Cutlets', 'Marinated Prawns'],
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/5',
              border: 'border-emerald-500/20'
            }
          ].map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={cn("glass-card p-10 rounded-[3rem] border space-y-6", cat.bg, cat.border)}
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10", cat.color)}>
                <cat.icon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{cat.title}</h3>
                <p className="text-slate-400">{cat.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.items.map(item => (
                  <span key={item} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {item}
                  </span>
                ))}
              </div>
              <Link
                to={`/products?category=${cat.title}`}
                className="inline-flex items-center gap-2 text-white font-black uppercase tracking-widest text-[10px] hover:text-blue-400 transition-colors"
              >
                Explore Category <ArrowRight className="w-3 h-3" />
              </Link>
            </motion.div>
          ))}
        </section>

        {/* Trust Section */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="glass-card p-12 rounded-[3rem] border border-white/10 grid md:grid-cols-3 gap-12 text-center">
            {[
              { title: 'Hygienically Packed', icon: ShieldCheck, desc: 'Strict quality control and safe packaging standards.' },
              { title: 'Frozen at -18°C', icon: Snowflake, desc: 'Maintained at optimal temperatures for maximum shelf life.' },
              { title: 'Bulk Supply Available', icon: Truck, desc: 'Reliable wholesale supply for hotels and restaurants.' }
            ].map((item, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-400 border border-blue-500/20">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-white tracking-tighter uppercase">{item.title}</h4>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
