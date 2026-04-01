import React, { useState, useEffect } from 'react';
import { User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../components/ProductCard';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import OceanScene from '../components/OceanScene';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Edit2, Trash2, Package, IndianRupee, Image as ImageIcon, 
  X, Save, AlertCircle, CheckCircle2, XCircle, AlertTriangle, LayoutDashboard,
  Search, Waves, Tag, LogIn, Sparkles, Loader2, Upload
} from 'lucide-react';
import { cn } from '../lib/utils';
import { enhanceProductImage } from '../services/imageEnhancer';

interface AdminDashboardProps {
  user: User | null;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [fastMode, setFastMode] = useState(localStorage.getItem('fastMode') === 'true');
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Frozen Seafood',
    price: 0,
    stock: 0,
    image: '',
  });

  const isAdmin = user?.email === 'gopalakrishnan2852007@gmail.com';

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <OceanScene />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 rounded-[3rem] max-w-lg w-full text-center space-y-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
        >
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Access Denied</h2>
            <p className="text-slate-400 text-lg">
              {user 
                ? "You do not have permission to access the admin dashboard. This area is restricted to authorized personnel only."
                : "Please login with an admin account to access the dashboard."}
            </p>
          </div>
          {!user && (
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-3 bg-blue-500 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all active:scale-95 w-full"
            >
              <LogIn className="w-5 h-5" />
              Admin Login
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        image: product.image,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'Frozen Seafood',
        price: 0,
        stock: 0,
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const toggleFastMode = () => {
    const newMode = !fastMode;
    setFastMode(newMode);
    localStorage.setItem('fastMode', String(newMode));
    window.location.reload(); // Reload to apply scene changes
  };

  const handleBulkUpdate = async () => {
    if (!window.confirm('This will add new seafood varieties and update all product images to high-quality versions. Continue?')) return;
    
    setIsBulkUpdating(true);
    try {
      const newProducts = [
        { name: 'Basha Fish', category: 'Frozen Seafood', price: 350, stock: 10, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800' },
        { name: 'Nethili', category: 'Frozen Seafood', price: 330, stock: 15, image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&q=80&w=800' },
        { name: 'Squid', category: 'Frozen Seafood', price: 400, stock: 8, image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=800' },
        { name: 'Fish Fingers', category: 'Ready-to-Cook', price: 600, stock: 20, image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800' },
        { name: 'Crab Lollipop', category: 'Ready-to-Cook', price: 580, stock: 12, image: 'https://images.unsplash.com/photo-1551443874-e34988647005?auto=format&fit=crop&q=80&w=800' },
        { name: 'Small Prawn', category: 'Frozen Seafood', price: 400, stock: 25, image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=800' },
        { name: 'Medium Prawn', category: 'Frozen Seafood', price: 500, stock: 18, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=800' },
        { name: 'Vanjaram', category: 'Frozen Seafood', price: 850, stock: 12, image: 'https://images.unsplash.com/photo-1559742811-824289511f48?auto=format&fit=crop&q=80&w=800' },
        { name: 'Crab', category: 'Frozen Seafood', price: 500, stock: 15, image: 'https://images.unsplash.com/photo-1551443874-e34988647005?auto=format&fit=crop&q=80&w=800' },
        { name: 'Boneless Fish', category: 'Frozen Seafood', price: 330, stock: 20, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800' },
        { name: 'Mathi', category: 'Frozen Seafood', price: 300, stock: 30, image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&q=80&w=800' }
      ];

      // Add or update products
      for (const prod of newProducts) {
        const existing = products.find(p => p.name === prod.name);
        if (!existing) {
          await addDoc(collection(db, 'products'), {
            ...prod,
            status: 'In Stock',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(doc(db, 'products', existing.id), {
            price: prod.price,
            image: prod.image,
            updatedAt: serverTimestamp(),
          });
        }
      }

      alert('Bulk update completed successfully!');
    } catch (error) {
      console.error('Bulk update error:', error);
      alert('Failed to perform bulk update.');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const getStatus = (stock: number) => {
      if (stock > 5) return 'In Stock';
      if (stock > 0) return 'Low Stock';
      return 'Out of Stock';
    };

    const productData = {
      ...formData,
      status: getStatus(formData.stock),
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }
      handleCloseModal();
    } catch (error) {
      handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleEnhanceImage = async () => {
    if (!formData.image || !formData.name) {
      alert('Please provide a product name and an image first.');
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await enhanceProductImage(formData.image, formData.name);
      if (enhanced) {
        setFormData(prev => ({ ...prev, image: enhanced }));
      } else {
        alert('Failed to enhance image. Please try again.');
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      alert('An error occurred during image enhancement.');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <OceanScene />
      
      <div className="relative max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <LayoutDashboard className="w-3 h-3" />
              Control Center
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter text-glow">ADMIN DASHBOARD</h1>
            <p className="text-slate-400 text-lg">Manage your inventory and product listings.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={toggleFastMode}
              className={cn(
                "flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border",
                fastMode 
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                  : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
              )}
            >
              <Sparkles className="w-4 h-4" />
              {fastMode ? 'Fast Mode: ON' : 'Fast Mode: OFF'}
            </button>

            <button
              onClick={handleBulkUpdate}
              disabled={isBulkUpdating}
              className="flex items-center justify-center gap-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isBulkUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Bulk Update Images & Prawns
            </button>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-3 bg-blue-500 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Products', value: products.length, icon: Package, color: 'text-blue-400' },
            { label: 'In Stock', value: products.filter(p => p.stock > 5).length, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock <= 5).length, icon: AlertTriangle, color: 'text-amber-400' },
            { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: XCircle, color: 'text-red-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-[2.5rem] border border-white/10 space-y-4"
            >
              <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-3xl font-black text-white tracking-tighter">{stat.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Products Table */}
        <div className="glass-card rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="text-2xl font-black text-white tracking-tighter">INVENTORY LIST</h2>
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500 transition-all text-white text-sm placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Price</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Stock</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                          <img
                            src={product.image || `https://picsum.photos/seed/${product.name}/200/200`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="font-black text-white tracking-tight">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-white">₹{product.price}</td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="font-black text-white">{product.stock} kg</div>
                        <div className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          product.stock > 5 ? "text-emerald-400" : product.stock > 0 ? "text-amber-400" : "text-red-400"
                        )}>
                          {product.stock > 5 ? 'Healthy' : product.stock > 0 ? 'Low' : 'Empty'}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-500 hover:text-white hover:border-blue-400 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-card w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white tracking-tighter">
                    {editingProduct ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
                  </h3>
                  <p className="text-slate-500 text-sm">Fill in the details below.</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
                    <div className="relative">
                      <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                        placeholder="e.g. Fresh Seer Fish"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                    <div className="relative">
                      <Waves className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
                      >
                        {['Frozen Seafood', 'Ready-to-Cook'].map(cat => (
                          <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Price (₹/kg)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input
                        required
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock (kg)</label>
                    <div className="relative">
                      <Package className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input
                        required
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Image</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="relative aspect-square rounded-[2rem] bg-white/5 border border-white/10 overflow-hidden group">
                          {formData.image ? (
                            <img 
                              src={formData.image} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                              <ImageIcon className="w-12 h-12 mb-2" />
                              <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                            </div>
                          )}
                          <label className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="w-6 h-6 text-white" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Upload Image</span>
                            </div>
                          </label>
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleEnhanceImage}
                          disabled={isEnhancing || !formData.image || !formData.name}
                          className={cn(
                            "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all",
                            isEnhancing || !formData.image || !formData.name
                              ? "bg-white/5 text-slate-600 cursor-not-allowed"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                          )}
                        >
                          {isEnhancing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Enhancing with AI...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Enhance with AI
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Image URL (Optional)</label>
                          <div className="relative">
                            <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                              type="url"
                              value={formData.image.startsWith('data:') ? '' : formData.image}
                              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                              placeholder="https://images.unsplash.com/..."
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                          Tip: Upload a raw photo and use "Enhance with AI" to automatically remove backgrounds, improve lighting, and create a professional catalog look.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <button
                    type="submit"
                    className="w-full py-5 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Save className="w-5 h-5" />
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
