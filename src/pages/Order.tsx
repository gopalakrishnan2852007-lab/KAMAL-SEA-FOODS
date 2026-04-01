import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../components/ProductCard';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import OceanScene from '../components/OceanScene';
import { motion } from 'motion/react';
import { Send, User, Phone, MapPin, Package, CheckCircle2, ChevronLeft, Info, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Order() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    quantity: 1,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          navigate('/products');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `products/${productId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (formData.quantity > product.stock) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Order in Firestore
      await addDoc(collection(db, 'orders'), {
        ...formData,
        productId: product.id,
        productName: product.name,
        totalPrice: product.price * formData.quantity,
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
        status: 'pending'
      });

      // 2. Reduce Stock
      const newStock = product.stock - formData.quantity;
      const getStatus = (stock: number) => {
        if (stock > 5) return 'In Stock';
        if (stock > 0) return 'Low Stock';
        return 'Out of Stock';
      };

      await updateDoc(doc(db, 'products', product.id), {
        stock: increment(-formData.quantity),
        status: getStatus(newStock),
      });

      // 3. Generate WhatsApp Message
      const message = `*New Order from Kamal Sea Foods*%0A%0A` +
        `*Product:* ${product.name}%0A` +
        `*Type:* ${product.category}%0A` +
        `*Quantity:* ${formData.quantity} kg%0A` +
        `*Total Price:* ₹${product.price * formData.quantity}%0A%0A` +
        `*Customer:* ${formData.customerName}%0A` +
        `*Phone:* ${formData.phone}%0A` +
        `*Address:* ${formData.address}%0A%0A` +
        `*Storage Note:* Store at -18°C`;

      const whatsappUrl = `https://wa.me/919865668125?text=${message}`;
      
      setIsSuccess(true);
      
      // Delay opening WhatsApp to show success state
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1500);

    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  if (isSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <OceanScene />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 rounded-[3rem] max-w-lg w-full text-center space-y-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        >
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter">ORDER PLACED!</h2>
            <p className="text-slate-400 text-lg">Your fresh catch is being prepared. We've opened WhatsApp to confirm your order.</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <OceanScene />
      
      <div className="relative max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="group mb-12 inline-flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-400 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="font-black uppercase tracking-widest text-xs">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="glass-card rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={product.image || `https://picsum.photos/seed/${product.name}/1200/1000`}
                alt={product.name}
                className="w-full aspect-[4/3] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-10 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      {product.category}
                    </span>
                    <h1 className="text-5xl font-black text-white tracking-tighter">{product.name}</h1>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Price</div>
                    <div className="text-4xl font-black text-blue-400 tracking-tighter">₹{product.price}<span className="text-lg text-slate-500">/kg</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                      <Package className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Availability</span>
                    </div>
                    <div className="text-xl font-black text-white">{product.stock} kg</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                      <Info className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Storage</span>
                    </div>
                    <div className="text-xl font-black text-white">Store at -18°C</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tighter">SECURE ORDER</h2>
              <p className="text-slate-500">Complete the form below to place your order.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantity (kg)</label>
                  <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                      className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-blue-500 transition-all font-black"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)) })}
                      className="flex-1 bg-transparent text-center text-2xl font-black text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, quantity: Math.min(product.stock, formData.quantity + 1) })}
                      className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-blue-500 transition-all font-black"
                    >
                      +
                    </button>
                  </div>
                  {formData.quantity > product.stock && (
                    <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest mt-2">
                      <AlertCircle className="w-3 h-3" />
                      Exceeds available stock
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      required
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-6 w-4 h-4 text-slate-600" />
                    <textarea
                      required
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter your full address in Salem"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Total Amount</span>
                  <span className="text-3xl font-black text-white tracking-tighter">₹{product.price * formData.quantity}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || formData.quantity > product.stock || !formData.customerName || !formData.address}
                  className={cn(
                    "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all",
                    isSubmitting || formData.quantity > product.stock || !formData.customerName || !formData.address
                      ? "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5"
                      : "bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95"
                  )}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Place Order via WhatsApp
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
