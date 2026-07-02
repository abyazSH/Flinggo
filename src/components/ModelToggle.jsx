import { motion } from "framer-motion";

export default function ModelToggle() {
  return (
    <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-xl shadow-sm">
      {/* Efek animasi denyut nadi hijau/biru penanda AI aktif */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </span>
      
      {/* Label Model */}
      <div className="flex items-center gap-1 text-xs font-bold tracking-wide">
        <span>🦙</span>
        <span>Llama 3 Engine</span>
      </div>
    </div>
  );
}