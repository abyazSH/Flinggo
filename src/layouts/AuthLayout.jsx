import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AuthLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/40 p-4 relative overflow-hidden select-none">
      
      {/* 1. Ambient Background Blobs (Gerakan Diperhalus) */}
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -35, 20, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-10 w-80 h-80 bg-primary/10 rounded-full blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -30, 30, 0], y: [0, 25, -45, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, 20, -20, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent/5 rounded-full blur-[90px]"
      />

      {/* 2. Main Container Box (Login / Register Area) */}
      <motion.div 
        initial={{ opacity: 0, y: 25 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }} 
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Logo Header */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 150 }}
          className="flex items-center justify-center gap-3 mb-8 cursor-pointer group"
          onClick={() => navigate("/dashboard")} // Diarahkan ke Dashboard Utama
          title="Back to Dashboard"
        >
          {/* Titik Lingkaran Gradasi Berputar */}
          <motion.div 
            animate={{ rotate: [0, 360] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
            className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20 group-hover:scale-110 transition-transform" 
          />
          <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Flinggo
          </span>
        </motion.div>

        {/* Form Content Wrapper (Outlet) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Outlet />
        </motion.div>

        {/* Sub-Footer Deskripsi Aplikasi (Disesuaikan Menjadi 3 Bahasa) */}
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }} 
          className="text-center text-xs font-semibold text-base-content/30 mt-8 max-w-xs mx-auto leading-relaxed"
        >
          Master 3 core languages with our Llama 3 AI-powered translation engine and interactive games
        </motion.p>
      </motion.div>

    </div>
  );
}