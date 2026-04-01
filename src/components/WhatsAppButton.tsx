import React from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = "919865668125";
  const message = "Hello, I want to order frozen seafood";
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20
        }
      }}
      whileHover={{ 
        scale: 1.05,
        backgroundColor: "#128C7E" // Darker WhatsApp green
      }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 md:px-6 md:py-4 bg-[#25D366] text-white rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] border border-white/20 group transition-colors duration-300"
      aria-label="Chat on WhatsApp"
    >
      {/* Pulse Effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-0 transition-opacity"></span>
      
      <MessageCircle className="w-6 h-6 md:w-7 md:h-7 fill-white/20" />
      
      <span className="hidden md:block font-black uppercase tracking-[0.2em] text-sm">
        Chat on WhatsApp
      </span>
    </motion.a>
  );
}
