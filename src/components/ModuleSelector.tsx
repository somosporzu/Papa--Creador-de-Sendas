import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Shield, Sword, Heart, Target, 
  Users, Crown, Trophy, BookOpen, Package, Plus 
} from 'lucide-react';
import { Module } from '../types';
import { MODULES } from '../constants';

interface ModuleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  abilityId: string;
  abilityType: 'Acción' | 'Pasiva' | 'Reactiva' | 'Interacción';
  abilityRange: string;
  onSelect: (moduleId: string) => void;
  currentCategory: string;
  setCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CATEGORIES = [
  'Todos',
  'Bonos',
  'Ofensivas',
  'Defensivas',
  'Apoyo',
  'Control',
  'Social',
  'Supervivencia',
  'Conocimiento',
  'Efectos Cumbre'
];

export const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  isOpen, onClose, abilityType, abilityRange, onSelect,
  currentCategory, setCategory, searchQuery, setSearchQuery
}) => {
  const filteredModules = MODULES.filter(m => {
    // Basic filter by compatibility
    let isCompatible = false;
    if (m.type === abilityType) isCompatible = true;
    if (abilityRange === 'Rango 3' && abilityType === 'Acción' && m.type === 'Suprema') isCompatible = true;
    
    if (!isCompatible) return false;

    // Filter by search
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase()) && !m.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
    }

    // Filter by category
    if (currentCategory !== 'Todos' && m.category !== currentCategory) {
        return false;
    }

    return true;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'Bonos': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'Conocimiento': return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'Supervivencia': return <Heart className="w-5 h-5 text-green-400" />;
      case 'Defensivas': return <Shield className="w-5 h-5 text-blue-300" />;
      case 'Ofensivas': return <Sword className="w-5 h-5 text-red-500" />;
      case 'Apoyo': return <Heart className="w-5 h-5 text-pink-400" />;
      case 'Control': return <Target className="w-5 h-5 text-purple-400" />;
      case 'Social': return <Users className="w-5 h-5 text-orange-400" />;
      case 'Efectos Cumbre': return <Crown className="w-5 h-5 text-amber-300" />;
      default: return <Package className="w-5 h-5 text-[#a0785a]" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl h-[85vh] bg-[#2c1810] border-2 border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#5d3a1a] bg-[#3e2723] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#d4af37] flex items-center gap-3">
                  <Package className="w-6 h-6" /> Explorador de Módulos
                </h2>
                <p className="text-xs text-[#a0785a] uppercase tracking-wider mt-1">
                  Compatible con: <span className="text-[#f4e4bc]">{abilityType}</span> • <span className="text-[#f4e4bc]">{abilityRange}</span>
                </p>
              </div>
              
              <div className="flex-1 w-full md:max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0785a]" />
                <input 
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a0f0a] border border-[#5d3a1a] rounded-lg py-2 pl-10 pr-4 text-sm focus:border-[#d4af37] outline-none text-[#f4e4bc]"
                />
              </div>

              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#a0785a] hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <aside className="w-48 md:w-64 border-r border-[#5d3a1a] bg-[#1a0f0a]/50 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-1">
                  <p className="text-[10px] font-bold text-[#a0785a] uppercase tracking-widest mb-4 px-2">Categorías</p>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 font-medium ${
                        currentCategory === cat 
                          ? 'bg-[#d4af37] text-[#2c1810] shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                          : 'text-[#a0785a] hover:bg-white/5 hover:text-[#f4e4bc]'
                      }`}
                    >
                      <span className="shrink-0">{cat === 'Todos' ? <Package className="w-4 h-4" /> : getIcon(cat)}</span>
                      {cat}
                    </button>
                  ))}
                </div>
              </aside>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-[radial-gradient(circle_at_center,rgba(62,39,35,0.2)_0%,transparent_100%)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredModules.map(m => (
                    <motion.div 
                      layout
                      key={m.id}
                      className="group p-4 bg-[#3e2723]/30 border border-[#5d3a1a] rounded-xl hover:border-[#d4af37]/50 hover:bg-[#3e2723]/50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="p-2 bg-[#1a0f0a] border border-[#5d3a1a] rounded-lg">
                            {getIcon(m.category)}
                          </div>
                          <div className="px-2 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full text-[10px] font-bold text-[#d4af37]">
                            {m.baseCost} PS
                          </div>
                        </div>
                        <h3 className="font-bold text-[#f4e4bc] mb-1 group-hover:text-[#d4af37] transition-colors">{m.name}</h3>
                        <p className="text-xs text-[#a0785a] leading-relaxed line-clamp-3">{m.description}</p>
                      </div>
                      
                      <button 
                        onClick={() => onSelect(m.id)}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-[#5d3a1a] hover:bg-[#d4af37] text-white hover:text-[#2c1810] font-bold text-sm rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" /> Seleccionar
                      </button>
                    </motion.div>
                  ))}
                </div>

                {filteredModules.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-[#a0785a] opacity-50 text-center">
                    <Package className="w-16 h-16 mb-4" />
                    <p className="text-lg font-bold">No se encontraron módulos</p>
                    <p className="text-sm">Prueba ajustando los filtros o la búsqueda</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-[#5d3a1a] bg-[#1a0f0a]/80 text-[10px] text-[#a0785a] uppercase tracking-widest text-center">
              Sistema de Diseño de Sendas Marciales • SDSM v3.1
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
