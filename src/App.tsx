import React, { useState, useMemo, useEffect } from 'react';
import { 
  EnergyType, 
  VitalityProfile, 
  Ability, 
  Senda, 
  AbilityType, 
  ConditionScale, 
  Range,
  SelectedModule,
  ActionObjective,
  ActionDistance,
  BonusCategory,
  Concept,
  ConceptCategory,
  ImprovementCategory,
  EquipmentItem
} from './types';
import { MODULES, NARRATIVE_DISADVANTAGES, IMPROVEMENT_CATEGORIES, PREDEFINED_CONCEPTS } from './constants';
import { 
  Shield, 
  Zap, 
  Sword, 
  Users, 
  Info, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Download,
  AlertTriangle,
  CheckCircle2,
  Book,
  Star,
  Package,
  Coins,
  Trophy,
  BookOpen,
  Heart,
  Crown,
  Target,
  Compass,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CONDITION_FACTORS: Record<ConditionScale, number> = {
  'Específica': 1,
  'General': 2,
  'Sin condición': 4
};

const RANGE_PS_CAPS: Record<Range, number> = {
  'Inicial': 6,
  'Rango 1': 4,
  'Rango 2': 6,
  'Rango 3': 9
};

const OBJECTIVE_COSTS: Record<ActionObjective, number> = {
  'Yo solo': 0,
  '1 objetivo': 0,
  '2 objetivos': 1,
  'Todos los aliados': 2,
  'Todos los enemigos': 2,
  'Área (6m)': 2
};

const DISTANCE_COSTS: Record<ActionDistance, number> = {
  'Adyacente': 0,
  'Corto (6m)': 1,
  'Medio (12m)': 2,
  'Largo (18m)': 3
};

const TECHO_BONOS: Record<Range, Record<BonusCategory, number>> = {
  'Inicial': { 'Ataque': 2, 'Daño': 2, 'Defensa': 2, 'Salvación': 2, 'Resistencia': 5, 'Movilidad': 3 },
  'Rango 1': { 'Ataque': 2, 'Daño': 2, 'Defensa': 2, 'Salvación': 2, 'Resistencia': 5, 'Movilidad': 3 },
  'Rango 2': { 'Ataque': 4, 'Daño': 4, 'Defensa': 4, 'Salvación': 4, 'Resistencia': 5, 'Movilidad': 3 },
  'Rango 3': { 'Ataque': 4, 'Daño': 4, 'Defensa': 6, 'Salvación': 6, 'Resistencia': 5, 'Movilidad': 3 }
};

const INITIAL_ABILITIES: Ability[] = [
  { id: 'init', name: 'Habilidad Inicial', range: 'Inicial', type: 'Pasiva', modules: [], psCap: 6 },
  { id: 'r1a', name: 'Rango 1A', range: 'Rango 1', type: 'Pasiva', modules: [], psCap: 4 },
  { id: 'r1b', name: 'Rango 1B', range: 'Rango 1', type: 'Pasiva', modules: [], psCap: 4 },
  { id: 'r2a', name: 'Rango 2A', range: 'Rango 2', type: 'Acción', modules: [], psCap: 6, actionSubtype: 'Principal', executionModality: 'Autónoma', objective: '1 objetivo', distance: 'Adyacente' },
  { id: 'r2b', name: 'Rango 2B', range: 'Rango 2', type: 'Pasiva', modules: [], psCap: 6 },
  { id: 'r3a', name: 'Rango 3A (Cumbre)', range: 'Rango 3', type: 'Acción', modules: [], psCap: 9, actionSubtype: 'Principal', executionModality: 'Autónoma', objective: '1 objetivo', distance: 'Adyacente', isCumbre: true },
  { id: 'r3b', name: 'Rango 3B', range: 'Rango 3', type: 'Pasiva', modules: [], psCap: 9 },
];

const INITIAL_SENDA: Senda = {
  name: 'Nueva Senda',
  fantasy: '',
  energies: 1,
  vitalityProfile: 'Caminante',
  concepts: [
    { name: '', category: 'Marciales', isPrincipal: true },
    { name: '', category: 'Sociales', isPrincipal: false },
    { name: '', category: 'Productivos', isPrincipal: false },
  ],
  affinities: [],
  contraries: [],
  equipment: [],
  abilities: INITIAL_ABILITIES
};

import { ModuleSelector } from './components/ModuleSelector';

export default function App() {
  const [senda, setSenda] = useState<Senda>(INITIAL_SENDA);

  const [expandedAbility, setExpandedAbility] = useState<string | null>('init');
  const [activeTab, setActiveTab] = useState<'estructura' | 'identidad' | 'habilidades' | 'equipo' | 'resumen'>('estructura');
  const [moduleSelectorAbilityId, setModuleSelectorAbilityId] = useState<string | null>(null);
  const [moduleSelectorCategory, setModuleSelectorCategory] = useState<string>('Todos');
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');

  // Calculations
  const energyCost = useMemo(() => {
    if (senda.energies === 1) return 0;
    if (senda.energies === 2) return 4;
    return 10;
  }, [senda.energies]);

  const vitalityCost = useMemo(() => {
    if (senda.vitalityProfile === 'Titán') return 8;
    if (senda.vitalityProfile === 'Caminante') return 4;
    return 0;
  }, [senda.vitalityProfile]);

  const narrativeBonus = useMemo(() => {
    if (!senda.narrativeDisadvantage) return 0;
    const dis = NARRATIVE_DISADVANTAGES.find(d => d.id === senda.narrativeDisadvantage);
    // Cap gain at 5 PCS
    return dis ? Math.min(5, dis.pcsGain) : 0;
  }, [senda.narrativeDisadvantage]);

  const totalPCSAvailable = useMemo(() => {
    const base = 30 + narrativeBonus;
    // Absolute cap of 35 PCS
    return Math.min(35, base);
  }, [narrativeBonus]);

  const psAvailableTotal = totalPCSAvailable - energyCost - vitalityCost;

  const equipmentSpent = useMemo(() => {
    return senda.equipment.reduce((sum, item) => sum + item.cost, 0);
  }, [senda.equipment]);

  const equipmentBudget = 100;

  const calculateAbilityPS = (ability: Ability) => {
    let total = 0;
    ability.modules.forEach(sm => {
      const mod = MODULES.find(m => m.id === sm.moduleId);
      if (mod) {
        if (mod.appliesScale) {
          total += mod.baseCost * CONDITION_FACTORS[sm.condition];
        } else {
          total += mod.baseCost;
        }
      }
    });

    // Action costs
    if (ability.type === 'Acción') {
      // Modality costs
      if (ability.executionModality === 'Ligada a ataque') total += 2;
      if (ability.executionModality === 'Ligada a otra') total += 3;
      
      // Objective & Distance
      if (ability.objective) total += OBJECTIVE_COSTS[ability.objective];
      if (ability.distance) total += DISTANCE_COSTS[ability.distance];

      // Limited uses bonus
      if (ability.limitedUses) total += ability.limitedUses;
    }

    // Layer 1 Disadvantages
    if (ability.disadvantage) {
      const psGain = ['Telegrafía', 'Requiere preparación'].includes(ability.disadvantage) ? 1 : 2;
      total -= psGain;
    }

    return total;
  };

  const psSpent = useMemo(() => {
    return senda.abilities.reduce((sum, ab) => sum + calculateAbilityPS(ab), 0);
  }, [senda.abilities]);

  const pasivasCount = useMemo(() => senda.abilities.filter(a => a.type === 'Pasiva').length, [senda.abilities]);
  const accionesCount = useMemo(() => senda.abilities.filter(a => a.type === 'Acción').length, [senda.abilities]);
  const offensiveCount = useMemo(() => senda.abilities.filter(a => a.isOffensive).length, [senda.abilities]);
  const evasionCount = useMemo(() => senda.abilities.filter(a => a.isEvasion).length, [senda.abilities]);

  // Handlers
  const updateAbility = (id: string, updates: Partial<Ability>) => {
    setSenda(prev => ({
      ...prev,
      abilities: prev.abilities.map(ab => ab.id === id ? { ...ab, ...updates } : ab)
    }));
  };

  const addModuleToAbility = (abilityId: string, moduleId: string) => {
    const ability = senda.abilities.find(a => a.id === abilityId);
    if (!ability) return;
    
    const module = MODULES.find(m => m.id === moduleId);
    if (!module) return;

    const newModule: SelectedModule = {
      moduleId,
      condition: module.appliesScale ? 'Específica' : 'Sin condición'
    };

    updateAbility(abilityId, {
      modules: [...ability.modules, newModule]
    });
  };

  const removeModuleFromAbility = (abilityId: string, index: number) => {
    const ability = senda.abilities.find(a => a.id === abilityId);
    if (!ability) return;

    const newModules = [...ability.modules];
    newModules.splice(index, 1);
    updateAbility(abilityId, { modules: newModules });
  };

  const updateConcept = (index: number, updates: Partial<Concept>) => {
    setSenda(prev => ({
      ...prev,
      concepts: prev.concepts.map((c, i) => i === index ? { ...c, ...updates } : c)
    }));
  };

  const toggleAffinity = (category: ImprovementCategory) => {
    setSenda(prev => {
      const isAffinity = prev.affinities.includes(category);
      if (isAffinity) {
        return { ...prev, affinities: prev.affinities.filter(a => a !== category) };
      } else {
        const newContraries = prev.contraries.filter(c => c !== category);
        return { ...prev, contraries: newContraries, affinities: [...prev.affinities, category] };
      }
    });
  };

  const toggleContrary = (category: ImprovementCategory) => {
    setSenda(prev => {
      const isContrary = prev.contraries.includes(category);
      if (isContrary) {
        return { ...prev, contraries: prev.contraries.filter(c => c !== category) };
      } else {
        const newAffinities = prev.affinities.filter(a => a !== category);
        return { ...prev, affinities: newAffinities, contraries: [...prev.contraries, category] };
      }
    });
  };

  const addEquipment = () => {
    const newItem: EquipmentItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      cost: 0,
      description: ''
    };
    setSenda(prev => ({ ...prev, equipment: [...prev.equipment, newItem] }));
  };

  const updateEquipment = (id: string, updates: Partial<EquipmentItem>) => {
    setSenda(prev => ({
      ...prev,
      equipment: prev.equipment.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const removeEquipment = (id: string) => {
    setSenda(prev => ({
      ...prev,
      equipment: prev.equipment.filter(item => item.id !== id)
    }));
  };

  const updateModuleCondition = (abilityId: string, index: number, condition: ConditionScale) => {
    const ability = senda.abilities.find(a => a.id === abilityId);
    if (!ability) return;

    const newModules = [...ability.modules];
    newModules[index] = { ...newModules[index], condition };
    updateAbility(abilityId, { modules: newModules });
  };

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    // Total budget
    if (psSpent > psAvailableTotal) errors.push(`Presupuesto excedido: ${psSpent}/${psAvailableTotal} PS`);
    
    // Range requirements
    if (pasivasCount < 2) errors.push('Se requieren al menos 2 habilidades Pasivas en total');
    if (accionesCount < 2) errors.push('Se requieren al menos 2 habilidades de Acción en total');
    
    // Per-range requirements
    const init = senda.abilities.find(a => a.id === 'init');
    if (init && init.type !== 'Pasiva') errors.push('Habilidad Inicial: Debe ser obligatoriamente Pasiva');
    
    const r1 = senda.abilities.filter(a => a.range === 'Rango 1');
    if (!r1.some(a => a.type === 'Pasiva')) errors.push('Rango 1: Al menos una habilidad debe ser Pasiva');

    const r2 = senda.abilities.filter(a => a.range === 'Rango 2');
    if (!r2.some(a => a.type === 'Acción')) errors.push('Rango 2: Al menos una habilidad debe ser Acción');

    const r3 = senda.abilities.filter(a => a.range === 'Rango 3');
    if (!r3.some(a => a.type === 'Acción' && a.isCumbre)) {
      errors.push('Rango 3: Una Acción con Efecto Cumbre es obligatoria');
    }

    // Concepts validation
    const emptyConcepts = senda.concepts.filter(c => !c.name.trim());
    if (emptyConcepts.length > 0) errors.push('Todos los Conceptos deben tener un nombre');
    
    // Affinities and Contraries
    if (senda.affinities.length !== 3) errors.push('Debes elegir exactamente 3 categorías afines');
    if (senda.contraries.length !== 2) errors.push('Debes elegir exactamente 2 categorías contrarias');

    // Equipment
    if (equipmentSpent > equipmentBudget) errors.push(`Presupuesto de equipo excedido: ${equipmentSpent}/${equipmentBudget} L`);

    // Caps per ability
    senda.abilities.forEach(ab => {
      const cost = calculateAbilityPS(ab);
      if (cost > ab.psCap) errors.push(`${ab.name} excede su techo de ${ab.psCap} PS (actual: ${cost})`);

      // Techo de Bonos validation
      const bonuses: Record<BonusCategory, number> = { 'Ataque': 0, 'Daño': 0, 'Defensa': 0, 'Salvación': 0, 'Resistencia': 0, 'Movilidad': 0 };
      ab.modules.forEach(sm => {
        const mod = MODULES.find(m => m.id === sm.moduleId);
        if (mod && mod.bonusCategory && mod.bonusValue) {
          bonuses[mod.bonusCategory] += mod.bonusValue;
        }
      });

      Object.entries(bonuses).forEach(([cat, val]) => {
        const cap = TECHO_BONOS[ab.range][cat as BonusCategory];
        if (val > cap) {
          errors.push(`${ab.name}: El bono de ${cat} (${val}) excede el techo de ${cap} para ${ab.range}`);
        }
      });

      // Resistencia modules limit
      const resModules = ab.modules.filter(sm => {
        const mod = MODULES.find(m => m.id === sm.moduleId);
        return mod && mod.bonusCategory === 'Resistencia';
      });
      if ((ab.range === 'Inicial' || ab.range === 'Rango 1') && resModules.length > 1) {
        errors.push(`${ab.name}: Máximo 1 módulo de Resistencia en Inicial/Rango 1`);
      }

      // Movilidad modules limit
      const movModules = ab.modules.filter(sm => {
        const mod = MODULES.find(m => m.id === sm.moduleId);
        return mod && (mod.bonusCategory === 'Movilidad');
      });
      if ((ab.range === 'Inicial' || ab.range === 'Rango 1') && movModules.length > 1) {
        errors.push(`${ab.name}: Máximo 1 módulo de Movilidad en Inicial/Rango 1`);
      }
      if ((ab.range === 'Rango 2' || ab.range === 'Rango 3') && movModules.length > 2) {
        errors.push(`${ab.name}: Máximo 2 módulos de Movilidad en Rango 2/Rango 3`);
      }

      // No condition for offensive modules validation
      ab.modules.forEach(sm => {
        const mod = MODULES.find(m => m.id === sm.moduleId);
        if (mod && (mod.bonusCategory === 'Ataque' || mod.bonusCategory === 'Daño') && sm.condition === 'Sin condición') {
          errors.push(`${ab.name}: Los bonos de Ataque/Daño no pueden ser 'Sin condición'`);
        }
      });
    });

    // Vitality Profile restrictions
    if (senda.vitalityProfile === 'Titán') {
      if (offensiveCount > 2) errors.push('Perfil Titán: Máximo 2 habilidades ofensivas puras');
    }
    if (senda.vitalityProfile === 'Sombra') {
      if (evasionCount < 1) errors.push('Perfil Sombra: Obligatoria al menos 1 habilidad de evasión');
    }

    return errors;
  }, [senda, psSpent, psAvailableTotal]);

  return (
    <div className="min-h-screen bg-[#2c1810] text-[#f4e4bc] font-serif p-4 md:p-8 selection:bg-[#8b4513] selection:text-white">
      {/* Wood texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-8 border-b-4 border-[#5d3a1a] pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <input 
              type="text" 
              value={senda.name}
              onChange={e => setSenda(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nombre de la Senda"
              className="text-4xl font-bold bg-transparent border-none focus:ring-0 text-[#d4af37] w-full md:w-auto placeholder:text-[#d4af37]/30"
            />
            <p className="text-[#a0785a] italic">Sistema de Diseño de Sendas Modular PAPA v3</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#3e2723] p-3 rounded-lg border-2 border-[#5d3a1a] shadow-lg text-center min-w-[120px]">
              <div className="text-xs uppercase tracking-widest text-[#a0785a]">PCS Disponibles</div>
              <div className="text-2xl font-bold text-[#d4af37]">{psAvailableTotal}</div>
            </div>
            <div className="bg-[#3e2723] p-3 rounded-lg border-2 border-[#5d3a1a] shadow-lg text-center min-w-[120px]">
              <div className="text-xs uppercase tracking-widest text-[#a0785a]">PS Gastados</div>
              <div className={`text-2xl font-bold ${psSpent > psAvailableTotal ? 'text-red-500' : 'text-[#d4af37]'}`}>
                {psSpent}
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex flex-wrap gap-2 mb-6 border-b-2 border-[#5d3a1a] pb-2">
          {[
            { id: 'identidad', label: 'Identidad', icon: Book },
            { id: 'estructura', label: 'Estructura', icon: Shield },
            { id: 'habilidades', label: 'Habilidades', icon: Zap },
            { id: 'equipo', label: 'Equipo', icon: Package },
            { id: 'resumen', label: 'Resumen', icon: Info },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-200 font-bold text-sm ${
                activeTab === tab.id 
                  ? 'bg-[#5d3a1a] text-[#d4af37] shadow-[0_-4px_10px_rgba(0,0,0,0.3)]' 
                  : 'bg-[#3e2723]/50 text-[#a0785a] hover:bg-[#3e2723] hover:text-[#f4e4bc]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="space-y-8">
          {activeTab === 'identidad' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-6">
                <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                    <Book className="w-5 h-5 text-[#d4af37]" /> Fantasía Central
                  </h2>
                  <textarea 
                    value={senda.fantasy}
                    onChange={e => setSenda(prev => ({ ...prev, fantasy: e.target.value }))}
                    placeholder="Define la idea central del personaje en una sola frase..."
                    className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-2 focus:border-[#d4af37] outline-none text-sm italic h-24 resize-none"
                  />
                </section>

                <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                    <Star className="w-5 h-5 text-[#d4af37]" /> Conceptos de la Senda
                  </h2>
                  <div className="space-y-4">
                    {senda.concepts.map((concept, idx) => {
                      const options = PREDEFINED_CONCEPTS[concept.category] || [];
                      const isPredefined = options.includes(concept.name);
                      const showCustomInput = concept.name !== '' && !isPredefined;

                      return (
                        <div key={idx} className="p-3 bg-[#2c1810]/50 rounded border border-[#5d3a1a]">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs uppercase font-bold text-[#a0785a]">
                              {concept.isPrincipal ? 'Concepto Principal' : `Concepto Secundario ${idx}`}
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-[10px] text-[#a0785a] cursor-pointer">
                                <input 
                                  type="radio" 
                                  name="principalConcept" 
                                  checked={concept.isPrincipal}
                                  onChange={() => {
                                    const newConcepts = senda.concepts.map((c, i) => ({ ...c, isPrincipal: i === idx }));
                                    setSenda(prev => ({ ...prev, concepts: newConcepts }));
                                  }}
                                  className="text-[#d4af37] focus:ring-[#d4af37] w-3 h-3"
                                /> Principal
                              </label>
                              <select 
                                value={concept.category}
                                onChange={e => updateConcept(idx, { category: e.target.value as ConceptCategory, name: '' })}
                                className="bg-transparent text-xs text-[#d4af37] border-none focus:ring-0 cursor-pointer"
                              >
                                <option value="Marciales">Marciales</option>
                                <option value="Sociales">Sociales</option>
                                <option value="Productivos">Productivos</option>
                                <option value="Espirituales">Espirituales</option>
                                <option value="Intelectuales">Intelectuales</option>
                              </select>
                            </div>
                          </div>
                          
                          <select
                            value={isPredefined ? concept.name : (concept.name === '' ? '' : 'custom')}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === 'custom') {
                                updateConcept(idx, { name: ' ' }); // Use a space to trigger custom mode
                              } else {
                                updateConcept(idx, { name: val });
                              }
                            }}
                            className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-2 text-sm focus:border-[#d4af37] outline-none mb-2"
                          >
                            <option value="">Seleccionar concepto...</option>
                            {options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                            <option value="custom">Otro (Personalizado)...</option>
                          </select>

                          {(showCustomInput || concept.name === ' ') && (
                            <input 
                              type="text"
                              value={concept.name === ' ' ? '' : concept.name}
                              onChange={e => updateConcept(idx, { name: e.target.value })}
                              placeholder="Escribe tu concepto personalizado..."
                              className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-2 text-sm focus:border-[#d4af37] outline-none"
                              autoFocus
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                  <Zap className="w-5 h-5 text-[#d4af37]" /> Mejoras Afines y Contrarias
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-tighter mb-2">
                    <div className="text-center text-green-400">Afines (3)</div>
                    <div className="text-center text-red-400">Contrarias (2)</div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {IMPROVEMENT_CATEGORIES.map(cat => {
                      const isAffinity = senda.affinities.includes(cat as ImprovementCategory);
                      const isContrary = senda.contraries.includes(cat as ImprovementCategory);
                      return (
                        <div key={cat} className="flex items-center justify-between p-2 bg-[#2c1810]/30 rounded border border-[#5d3a1a]/30">
                          <span className="text-xs truncate mr-2">{cat}</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => toggleAffinity(cat as ImprovementCategory)}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isAffinity ? 'bg-green-600 text-white' : 'bg-[#2c1810] border border-[#5d3a1a]'}`}
                            >
                              {isAffinity && <CheckCircle2 className="w-3 h-3" />}
                            </button>
                            <button 
                              onClick={() => toggleContrary(cat as ImprovementCategory)}
                              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isContrary ? 'bg-red-600 text-white' : 'bg-[#2c1810] border border-[#5d3a1a]'}`}
                            >
                              {isContrary && <AlertTriangle className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'estructura' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                  <Shield className="w-5 h-5 text-[#d4af37]" /> Decisiones Estructurales
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-[#a0785a] mb-2 font-bold uppercase tracking-wider">Energías Primigenias</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map(num => (
                        <button
                          key={num}
                          onClick={() => setSenda(prev => ({ ...prev, energies: num as EnergyType }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            senda.energies === num 
                              ? 'border-[#d4af37] bg-[#5d3a1a]/30 text-[#d4af37]' 
                              : 'border-[#5d3a1a] bg-[#2c1810]/50 text-[#a0785a] hover:border-[#a0785a]'
                          }`}
                        >
                          <div className="text-lg font-bold">{num} Energía{num > 1 ? 's' : ''}</div>
                          <div className="text-xs opacity-70">{num === 1 ? '0' : num === 2 ? '4' : '10'} PCS</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#a0785a] mb-2 font-bold uppercase tracking-wider">Perfil de Vitalidad</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Titán', 'Caminante', 'Sombra'].map(profile => (
                        <button
                          key={profile}
                          onClick={() => setSenda(prev => ({ ...prev, vitalityProfile: profile as VitalityProfile }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            senda.vitalityProfile === profile 
                              ? 'border-[#d4af37] bg-[#5d3a1a]/30 text-[#d4af37]' 
                              : 'border-[#5d3a1a] bg-[#2c1810]/50 text-[#a0785a] hover:border-[#a0785a]'
                          }`}
                        >
                          <div className="text-lg font-bold">{profile}</div>
                          <div className="text-xs opacity-70">
                            {profile === 'Titán' ? '+6 Res/lvl (8 PCS)' : profile === 'Caminante' ? '+4 Res/lvl (4 PCS)' : '+2 Res/lvl (0 PCS)'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#a0785a] mb-2 font-bold uppercase tracking-wider">Desventaja Narrativa</label>
                    <select 
                      value={senda.narrativeDisadvantage || ''}
                      onChange={e => setSenda(prev => ({ ...prev, narrativeDisadvantage: e.target.value || undefined }))}
                      className="w-full bg-[#2c1810] border-2 border-[#5d3a1a] rounded-lg p-3 focus:border-[#d4af37] outline-none text-[#f4e4bc]"
                    >
                      <option value="">Ninguna</option>
                      {NARRATIVE_DISADVANTAGES.map(d => (
                        <option key={d.id} value={d.id}>{d.name} (+{d.pcsGain} PCS)</option>
                      ))}
                    </select>
                    {senda.narrativeDisadvantage && (
                      <div className="mt-4 p-4 bg-[#2c1810]/80 border border-[#d4af37]/30 rounded-lg italic text-sm text-[#a0785a]">
                        <div className="font-bold text-[#d4af37] mb-1 not-italic uppercase text-xs">Restricción:</div>
                        {NARRATIVE_DISADVANTAGES.find(d => d.id === senda.narrativeDisadvantage)?.restriction}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'habilidades' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 gap-4">
                {senda.abilities.map(ability => (
                <motion.div 
                  layout
                  key={ability.id}
                  className={`bg-[#3e2723] rounded-2xl border-2 transition-all duration-300 group ${expandedAbility === ability.id ? 'border-[#d4af37] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(212,175,55,0.1)]' : 'border-[#5d3a1a] hover:border-[#a0785a]/50 shadow-xl'}`}
                >
                  <div 
                    className="p-5 flex justify-between items-center cursor-pointer select-none"
                    onClick={() => setExpandedAbility(expandedAbility === ability.id ? null : ability.id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner ${
                        ability.type === 'Pasiva' ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' :
                        ability.type === 'Acción' ? 'bg-red-900/40 text-red-300 border border-red-500/30' :
                        ability.type === 'Reactiva' ? 'bg-amber-900/40 text-amber-300 border border-amber-500/30' :
                        'bg-green-900/40 text-green-300 border border-green-500/30'
                      }`}>
                        {ability.type === 'Pasiva' && <Zap className="w-6 h-6" />}
                        {ability.type === 'Acción' && <Sword className="w-6 h-6" />}
                        {ability.type === 'Reactiva' && <Shield className="w-6 h-6" />}
                        {ability.type === 'Interacción' && <Users className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xl text-[#f4e4bc] mb-0.5">{ability.name}</h3>
                          {ability.isCumbre && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-bold uppercase tracking-widest">Cumbre</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#a0785a] font-medium uppercase tracking-widest">
                          <span>{ability.range}</span>
                          <span className="w-1 h-1 rounded-full bg-[#5d3a1a]" />
                          <span className={
                            ability.type === 'Pasiva' ? 'text-blue-400' :
                            ability.type === 'Acción' ? 'text-red-400' :
                            ability.type === 'Reactiva' ? 'text-amber-400' :
                            'text-green-400'
                          }>{ability.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-[#a0785a] uppercase font-bold tracking-widest mb-1">Capacidad PS</div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-[#2c1810] rounded-full overflow-hidden border border-[#5d3a1a]/50">
                            <div 
                              className={`h-full transition-all duration-500 ${calculateAbilityPS(ability) > ability.psCap ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#d4af37]'}`}
                              style={{ width: `${Math.min(100, (calculateAbilityPS(ability) / ability.psCap) * 100)}%` }}
                            />
                          </div>
                          <span className={`font-mono font-bold text-sm ${calculateAbilityPS(ability) > ability.psCap ? 'text-red-400' : 'text-[#d4af37]'}`}>
                            {calculateAbilityPS(ability)}/{ability.psCap}
                          </span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-full transition-colors ${expandedAbility === ability.id ? 'bg-[#5d3a1a] text-[#d4af37]' : 'text-[#a0785a] group-hover:text-[#f4e4bc]'}`}>
                        {expandedAbility === ability.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                      </div>
                    </div>
                  </div>

                <AnimatePresence>
                  {expandedAbility === ability.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 border-t border-[#5d3a1a] space-y-6 bg-[#2c1810]/50 bg-[url('https://www.transparenttextures.com/patterns/papyros.png')]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-[#a0785a] uppercase mb-1">Nombre de Habilidad</label>
                            <input 
                              type="text"
                              value={ability.name}
                              onChange={e => updateAbility(ability.id, { name: e.target.value })}
                              className="w-full bg-[#2c1810]/80 border-[#5d3a1a] rounded p-2 focus:border-[#d4af37] outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-[#a0785a] uppercase mb-1">Tipo</label>
                              <select 
                                value={ability.type}
                                onChange={e => updateAbility(ability.id, { type: e.target.value as AbilityType })}
                                className="w-full bg-[#2c1810]/80 border-[#5d3a1a] rounded p-2 focus:border-[#d4af37] outline-none"
                              >
                                <option value="Pasiva">Pasiva</option>
                                <option value="Reactiva">Reactiva</option>
                                <option value="Acción">Acción</option>
                                <option value="Interacción">Interacción</option>
                              </select>
                            </div>
                            <div className="flex items-end gap-2 pb-2">
                              <label className="flex items-center gap-2 text-xs text-[#a0785a] cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={ability.isOffensive} 
                                  onChange={e => updateAbility(ability.id, { isOffensive: e.target.checked })}
                                  className="rounded border-[#5d3a1a] bg-[#2c1810] text-[#d4af37] focus:ring-[#d4af37]"
                                /> Ofensiva
                              </label>
                              <label className="flex items-center gap-2 text-xs text-[#a0785a] cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={ability.isEvasion} 
                                  onChange={e => updateAbility(ability.id, { isEvasion: e.target.checked })}
                                  className="rounded border-[#5d3a1a] bg-[#2c1810] text-[#d4af37] focus:ring-[#d4af37]"
                                /> Evasión
                              </label>
                              {ability.range === 'Rango 3' && (
                                <label className="flex items-center gap-2 text-xs text-[#a0785a] cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={ability.isCumbre} 
                                    onChange={e => updateAbility(ability.id, { isCumbre: e.target.checked })}
                                    className="rounded border-[#5d3a1a] bg-[#2c1810] text-[#d4af37] focus:ring-[#d4af37]"
                                  /> Cumbre
                                </label>
                              )}
                            </div>
                          </div>
                        </div>

                        {ability.type === 'Acción' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#3e2723]/80 rounded-lg border border-[#5d3a1a]">
                              <div>
                                <label className="block text-xs text-[#a0785a] uppercase mb-1">Subtipo</label>
                                <select 
                                  value={ability.actionSubtype}
                                  onChange={e => updateAbility(ability.id, { actionSubtype: e.target.value as any })}
                                  className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-1 text-sm"
                                >
                                  <option value="Rápida">Acción Rápida (4 Res)</option>
                                  <option value="Principal">Acción Principal (2 Res)</option>
                                  <option value="Completa">Acción Completa (0 Res)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-[#a0785a] uppercase mb-1">Modalidad</label>
                                <select 
                                  value={ability.executionModality}
                                  onChange={e => updateAbility(ability.id, { executionModality: e.target.value as any })}
                                  className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-1 text-sm"
                                >
                                  <option value="Autónoma">Autónoma (+0 PS)</option>
                                  <option value="Ligada a ataque">Ligada a ataque (+2 PS)</option>
                                  <option value="Ligada a otra">Ligada a otra (+3 PS)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-[#a0785a] uppercase mb-1">Usos Limitados</label>
                                <select 
                                  value={ability.limitedUses || 0}
                                  onChange={e => updateAbility(ability.id, { limitedUses: parseInt(e.target.value) || undefined })}
                                  className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-1 text-sm"
                                >
                                  <option value={0}>Sin límite</option>
                                  <option value={-3}>1 uso / Descanso Largo (-3 PS)</option>
                                  <option value={-2}>2 usos / Descanso Largo (-2 PS)</option>
                                  <option value={-1}>3 usos / Descanso Largo (-1 PS)</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#3e2723]/80 rounded-lg border border-[#5d3a1a]">
                              <div>
                                <label className="block text-xs text-[#a0785a] uppercase mb-1">Objetivo</label>
                                <select 
                                  value={ability.objective}
                                  onChange={e => updateAbility(ability.id, { objective: e.target.value as ActionObjective })}
                                  className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-1 text-sm"
                                >
                                  {Object.keys(OBJECTIVE_COSTS).map(obj => (
                                    <option key={obj} value={obj}>{obj} (+{OBJECTIVE_COSTS[obj as ActionObjective]} PS)</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-[#a0785a] uppercase mb-1">Distancia</label>
                                <select 
                                  value={ability.distance}
                                  onChange={e => updateAbility(ability.id, { distance: e.target.value as ActionDistance })}
                                  className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-1 text-sm"
                                >
                                  {Object.keys(DISTANCE_COSTS).map(dist => (
                                    <option key={dist} value={dist}>{dist} (+{DISTANCE_COSTS[dist as ActionDistance]} PS)</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-[#d4af37]">Módulos</h4>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setModuleSelectorAbilityId(ability.id)}
                                className="flex items-center gap-2 bg-[#5d3a1a] hover:bg-[#d4af37] hover:text-[#2c1810] px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
                              >
                                <Plus className="w-4 h-4" /> Añadir Módulo
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                              {ability.modules.map((sm, idx) => {
                                const mod = MODULES.find(m => m.id === sm.moduleId);
                                if (!mod) return null;
                                
                                const getModuleIcon = (category: string) => {
                                  switch (category) {
                                    case 'Bonos': return <Trophy className="w-4 h-4 text-yellow-500" />;
                                    case 'Conocimiento': return <BookOpen className="w-4 h-4 text-blue-400" />;
                                    case 'Supervivencia': return <Heart className="w-4 h-4 text-green-400" />;
                                    case 'Defensivas': return <Shield className="w-4 h-4 text-blue-300" />;
                                    case 'Ofensivas': return <Sword className="w-4 h-4 text-red-500" />;
                                    case 'Apoyo': return <Heart className="w-4 h-4 text-pink-400" />;
                                    case 'Control': return <Target className="w-4 h-4 text-purple-400" />;
                                    case 'Social': return <Users className="w-4 h-4 text-orange-400" />;
                                    case 'Efectos Cumbre': return <Crown className="w-4 h-4 text-amber-300" />;
                                    default: return <Package className="w-4 h-4 text-[#a0785a]" />;
                                  }
                                };

                                const moduleCost = mod.appliesScale ? mod.baseCost * CONDITION_FACTORS[sm.condition] : mod.baseCost;

                                return (
                                  <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                    key={`${ability.id}-mod-${idx}`} 
                                    className="group/module flex flex-col md:flex-row gap-4 p-4 bg-[#2c1810] border-2 border-[#5d3a1a] rounded-xl hover:border-[#d4af37]/50 transition-all shadow-md relative overflow-hidden"
                                  >
                                    {/* Decoration */}
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#5d3a1a] group-hover/module:bg-[#d4af37] transition-colors" />
                                    
                                    <div className="flex-1 flex gap-3">
                                      <div className="mt-1 p-2 bg-[#3e2723] rounded-lg border border-[#5d3a1a] h-fit">
                                        {getModuleIcon(mod.category)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-bold text-[#f4e4bc] truncate">{mod.name}</span>
                                          <span className="text-[10px] px-1.5 py-0.5 bg-[#5d3a1a]/50 text-[#d4af37] border border-[#d4af37]/20 rounded whitespace-nowrap">
                                            {mod.category}
                                          </span>
                                        </div>
                                        <div className="text-xs text-[#a0785a] line-clamp-2 leading-relaxed italic">{mod.description}</div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#5d3a1a] pt-3 md:pt-0 md:pl-4">
                                      {mod.appliesScale && (
                                        <div className="flex flex-col gap-1 min-w-[140px]">
                                          <label className="text-[10px] text-[#a0785a] uppercase font-bold tracking-widest flex items-center gap-1">
                                            <Compass className="w-3 h-3" /> Condición / Escala
                                          </label>
                                          <select 
                                            value={sm.condition}
                                            onChange={e => updateModuleCondition(ability.id, idx, e.target.value as ConditionScale)}
                                            className="bg-[#3e2723] border-[#5d3a1a] rounded p-1.5 text-xs text-[#f4e4bc] outline-none hover:border-[#d4af37]/50 transition-colors cursor-pointer"
                                          >
                                            <option value="Específica">Específica (x1)</option>
                                            <option value="General">General (x2)</option>
                                            <option value="Sin condición">Sin condición (x4)</option>
                                          </select>
                                        </div>
                                      )}

                                      <div className="flex items-center gap-4 ml-auto">
                                        <div className="text-right">
                                          <div className="text-[10px] text-[#a0785a] uppercase font-bold tracking-widest">Coste</div>
                                          <div className="font-bold text-[#d4af37] text-xl flex items-baseline gap-1">
                                            {moduleCost} <span className="text-[10px]">PS</span>
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => removeModuleFromAbility(ability.id, idx)}
                                          className="p-2.5 text-[#a0785a] hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                          title="Eliminar módulo"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                            {ability.modules.length === 0 && (
                              <div className="py-10 text-center border-2 border-dashed border-[#5d3a1a] rounded-xl text-[#a0785a] italic text-sm">
                                No has añadido módulos a esta habilidad aún.
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-[#a0785a] uppercase mb-1">Desventaja de Habilidad (Capa 1)</label>
                          <select 
                            value={ability.disadvantage || ''}
                            onChange={e => updateAbility(ability.id, { disadvantage: e.target.value || undefined })}
                            className="w-full bg-[#2c1810]/80 border-[#5d3a1a] rounded p-2 focus:border-[#d4af37] outline-none"
                          >
                            <option value="">Ninguna</option>
                            <option value="Coste de salud">Coste de salud (+2 PS)</option>
                            <option value="Efecto rebote">Efecto rebote (+2 PS)</option>
                            <option value="Telegrafía">Telegrafía (+1 PS)</option>
                            <option value="Secuela mental">Secuela mental (+2 PS)</option>
                            <option value="Agotamiento extendido">Agotamiento extendido (+2 PS)</option>
                            <option value="Requiere preparación">Requiere preparación (+1 PS)</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </motion.div>
              ))}
              </div>
            </motion.div>
          )}

        {activeTab === 'equipo' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                <Package className="w-5 h-5 text-[#d4af37]" /> Equipo Inicial
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4 p-4 bg-[#2c1810] rounded-lg border border-[#5d3a1a]">
                  <div>
                    <span className="text-xs text-[#a0785a] uppercase block">Presupuesto Total</span>
                    <span className="text-xl font-bold text-[#d4af37]">{equipmentBudget} L</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#a0785a] uppercase block">Gastado</span>
                    <span className={`text-xl font-bold ${equipmentSpent > equipmentBudget ? 'text-red-400' : 'text-green-400'}`}>
                      {equipmentSpent} L
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {senda.equipment.map(item => (
                    <div key={item.id} className="p-4 bg-[#2c1810]/50 rounded-lg border border-[#5d3a1a] flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] text-[#a0785a] uppercase mb-1">Nombre del Objeto</label>
                        <input 
                          type="text"
                          value={item.name}
                          onChange={e => updateEquipment(item.id, { name: e.target.value })}
                          placeholder="Ej: Espada de Acero, Poción de Vida..."
                          className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-2 text-sm focus:border-[#d4af37] outline-none"
                        />
                      </div>
                      <div className="w-full md:w-32">
                        <label className="block text-[10px] text-[#a0785a] uppercase mb-1">Coste (L)</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            value={item.cost}
                            onChange={e => updateEquipment(item.id, { cost: parseInt(e.target.value) || 0 })}
                            className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-2 text-sm focus:border-[#d4af37] outline-none"
                          />
                          <button 
                            onClick={() => removeEquipment(item.id)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            title="Eliminar objeto"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {senda.equipment.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-[#5d3a1a] rounded-xl text-[#a0785a] italic">
                    No has añadido equipo todavía.
                  </div>
                )}

                <button 
                  onClick={addEquipment}
                  className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#5d3a1a] rounded-xl text-[#a0785a] hover:border-[#d4af37] hover:text-[#d4af37] transition-all font-bold"
                >
                  <Plus className="w-5 h-5" /> Añadir Nuevo Objeto al Equipo
                </button>
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'resumen' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                <AlertTriangle className="w-5 h-5 text-[#d4af37]" /> Estado de Validación
              </h2>
              {validationErrors.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#a0785a]">Se han detectado los siguientes problemas que deben corregirse:</p>
                  <ul className="space-y-3">
                    {validationErrors.map((err, i) => (
                      <li key={i} className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg text-red-300 text-sm flex gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" /> {err}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-900/50 p-6 rounded-xl text-green-400 flex flex-col items-center gap-4 text-center">
                  <CheckCircle2 className="w-12 h-12" />
                  <div>
                    <h3 className="text-lg font-bold">¡Senda Válida!</h3>
                    <p className="text-sm opacity-80">Todos los requisitos del sistema SDSM v3 se han cumplido correctamente.</p>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                <Info className="w-5 h-5 text-[#d4af37]" /> Resumen de Selección
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#2c1810] rounded-lg border border-[#5d3a1a]">
                    <span className="text-[10px] text-[#a0785a] uppercase block">Pasivas</span>
                    <span className={`text-lg font-bold ${pasivasCount < 2 ? 'text-red-400' : 'text-green-400'}`}>{pasivasCount} / 2</span>
                  </div>
                  <div className="p-3 bg-[#2c1810] rounded-lg border border-[#5d3a1a]">
                    <span className="text-[10px] text-[#a0785a] uppercase block">Acciones</span>
                    <span className={`text-lg font-bold ${accionesCount < 2 ? 'text-red-400' : 'text-green-400'}`}>{accionesCount} / 2</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 border-b border-[#5d3a1a]/30">
                    <span className="text-[#a0785a]">Conceptos Definidos:</span>
                    <span className={senda.concepts.some(c => !c.name.trim()) ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                      {senda.concepts.filter(c => c.name.trim()).length} / 3
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-[#5d3a1a]/30">
                    <span className="text-[#a0785a]">Mejoras Afines:</span>
                    <span className={senda.affinities.length !== 3 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                      {senda.affinities.length} / 3
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-[#5d3a1a]/30">
                    <span className="text-[#a0785a]">Mejoras Contrarias:</span>
                    <span className={senda.contraries.length !== 2 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                      {senda.contraries.length} / 2
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-[#5d3a1a]/30">
                    <span className="text-[#a0785a]">Presupuesto Equipo:</span>
                    <span className={equipmentSpent > equipmentBudget ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                      {equipmentSpent} / {equipmentBudget} L
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button className="flex-1 bg-[#5d3a1a] hover:bg-[#8b4513] text-[#f4e4bc] py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg">
                    <Save className="w-5 h-5" /> Guardar Senda
                  </button>
                  <button className="flex-1 bg-[#d4af37] hover:bg-[#b8860b] text-[#2c1810] py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg">
                    <Download className="w-5 h-5" /> Exportar PDF
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )}
        </div>

        <ModuleSelector 
          isOpen={!!moduleSelectorAbilityId}
          onClose={() => setModuleSelectorAbilityId(null)}
          abilityId={moduleSelectorAbilityId || ''}
          abilityType={senda.abilities.find(a => a.id === moduleSelectorAbilityId)?.type || 'Acción'}
          abilityRange={senda.abilities.find(a => a.id === moduleSelectorAbilityId)?.range || 'Rango 1'}
          onSelect={(moduleId) => {
            if (moduleSelectorAbilityId) {
              addModuleToAbility(moduleSelectorAbilityId, moduleId);
              setModuleSelectorAbilityId(null);
            }
          }}
          currentCategory={moduleSelectorCategory}
          setCategory={setModuleSelectorCategory}
          searchQuery={moduleSearchQuery}
          setSearchQuery={setModuleSearchQuery}
        />
        
        {/* Footer Actions */}
        <footer className="mt-12 border-t-4 border-[#5d3a1a] pt-8 flex flex-col md:flex-row justify-between items-center gap-6 pb-12">
          <div className="flex items-center gap-4 text-[#a0785a]">
            <Info className="w-6 h-6" />
            <p className="max-w-md text-sm">
              Esta herramienta ayuda a equilibrar el presupuesto de PCS y PS siguiendo las reglas de SDSM v3. 
              Recuerda que la narrativa es la base de cada decisión.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-[#3e2723] border-2 border-[#5d3a1a] hover:border-[#d4af37] px-6 py-3 rounded-lg font-bold transition-all">
              <Save className="w-5 h-5" /> Guardar Borrador
            </button>
            <button className="flex items-center gap-2 bg-[#d4af37] text-[#2c1810] hover:bg-[#f4e4bc] px-6 py-3 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <Download className="w-5 h-5" /> Exportar PDF
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
