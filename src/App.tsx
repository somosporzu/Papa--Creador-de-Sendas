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
  Coins
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

export default function App() {
  const [senda, setSenda] = useState<Senda>(INITIAL_SENDA);

  const [expandedAbility, setExpandedAbility] = useState<string | null>('init');

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Structural Decisions & Validation */}
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

            <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                <Shield className="w-5 h-5 text-[#d4af37]" /> Decisiones Estructurales
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#a0785a] mb-1">Energías Primigenias</label>
                  <select 
                    value={senda.energies}
                    onChange={e => setSenda(prev => ({ ...prev, energies: parseInt(e.target.value) as EnergyType }))}
                    className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-2 focus:border-[#d4af37] outline-none"
                  >
                    <option value={1}>1 Energía (0 PCS)</option>
                    <option value={2}>2 Energías (4 PCS)</option>
                    <option value={3}>3 Energías (10 PCS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#a0785a] mb-1">Perfil de Vitalidad</label>
                  <select 
                    value={senda.vitalityProfile}
                    onChange={e => setSenda(prev => ({ ...prev, vitalityProfile: e.target.value as VitalityProfile }))}
                    className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-2 focus:border-[#d4af37] outline-none"
                  >
                    <option value="Titán">Titán (+6 Res/lvl, 8 PCS)</option>
                    <option value="Caminante">Caminante (+4 Res/lvl, 4 PCS)</option>
                    <option value="Sombra">Sombra (+2 Res/lvl, 0 PCS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#a0785a] mb-1">Desventaja Narrativa</label>
                  <select 
                    value={senda.narrativeDisadvantage || ''}
                    onChange={e => setSenda(prev => ({ ...prev, narrativeDisadvantage: e.target.value || undefined }))}
                    className="w-full bg-[#2c1810] border-[#5d3a1a] rounded p-2 focus:border-[#d4af37] outline-none"
                  >
                    <option value="">Ninguna</option>
                    {NARRATIVE_DISADVANTAGES.map(d => (
                      <option key={d.id} value={d.id}>{d.name} (+{d.pcsGain} PCS)</option>
                    ))}
                  </select>
                  {senda.narrativeDisadvantage && (
                    <p className="text-xs mt-2 text-[#a0785a] italic">
                      {NARRATIVE_DISADVANTAGES.find(d => d.id === senda.narrativeDisadvantage)?.restriction}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                <Zap className="w-5 h-5 text-[#d4af37]" /> Mejoras Afines y Contrarias
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-tighter mb-2">
                  <div className="text-center text-green-400">Afines (3)</div>
                  <div className="text-center text-red-400">Contrarias (2)</div>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
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

            <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                <AlertTriangle className="w-5 h-5 text-[#d4af37]" /> Verificación
              </h2>
              {validationErrors.length > 0 ? (
                <ul className="space-y-2">
                  {validationErrors.map((err, i) => (
                    <li key={i} className="text-red-400 text-sm flex gap-2">
                      <span className="shrink-0">•</span> {err}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Senda válida y equilibrada
                </div>
              )}
            </section>

            <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                <Info className="w-5 h-5 text-[#d4af37]" /> Resumen de Senda
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Pasivas:</span>
                  <span className={pasivasCount < 2 ? 'text-red-400' : 'text-green-400'}>{pasivasCount} / 2</span>
                </div>
                <div className="flex justify-between">
                  <span>Acciones:</span>
                  <span className={accionesCount < 2 ? 'text-red-400' : 'text-green-400'}>{accionesCount} / 2</span>
                </div>
                {senda.vitalityProfile === 'Titán' && (
                  <div className="flex justify-between">
                    <span>Ofensivas (Titán):</span>
                    <span className={offensiveCount > 2 ? 'text-red-400' : 'text-green-400'}>{offensiveCount} / 2</span>
                  </div>
                )}
                {senda.vitalityProfile === 'Sombra' && (
                  <div className="flex justify-between">
                    <span>Evasión (Sombra):</span>
                    <span className={evasionCount < 1 ? 'text-red-400' : 'text-green-400'}>{evasionCount} / 1</span>
                  </div>
                )}
                <div className="border-t border-[#5d3a1a] my-2 pt-2">
                  <div className="flex justify-between">
                    <span>Conceptos:</span>
                    <span className={senda.concepts.some(c => !c.name.trim()) ? 'text-red-400' : 'text-green-400'}>
                      {senda.concepts.filter(c => c.name.trim()).length} / 3
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mejoras Afines:</span>
                    <span className={senda.affinities.length !== 3 ? 'text-red-400' : 'text-green-400'}>
                      {senda.affinities.length} / 3
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mejoras Contrarias:</span>
                    <span className={senda.contraries.length !== 2 ? 'text-red-400' : 'text-green-400'}>
                      {senda.contraries.length} / 2
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipo:</span>
                    <span className={equipmentSpent > equipmentBudget ? 'text-red-400' : 'text-green-400'}>
                      {equipmentSpent} / {equipmentBudget} L
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-[#3e2723] p-6 rounded-xl border-2 border-[#5d3a1a] shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[#5d3a1a] pb-2">
                <Package className="w-5 h-5 text-[#d4af37]" /> Equipo Inicial
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#a0785a]">Presupuesto: {equipmentBudget} L</span>
                  <span className={`text-sm font-bold ${equipmentSpent > equipmentBudget ? 'text-red-400' : 'text-green-400'}`}>
                    {equipmentSpent} / {equipmentBudget} L
                  </span>
                </div>
                
                <div className="space-y-2">
                  {senda.equipment.map(item => (
                    <div key={item.id} className="p-2 bg-[#2c1810]/50 rounded border border-[#5d3a1a] space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          value={item.name}
                          onChange={e => updateEquipment(item.id, { name: e.target.value })}
                          placeholder="Nombre del objeto"
                          className="flex-1 bg-[#2c1810] border-[#5d3a1a] rounded p-1 text-xs focus:border-[#d4af37] outline-none"
                        />
                        <input 
                          type="number"
                          value={item.cost}
                          onChange={e => updateEquipment(item.id, { cost: parseInt(e.target.value) || 0 })}
                          className="w-16 bg-[#2c1810] border-[#5d3a1a] rounded p-1 text-xs focus:border-[#d4af37] outline-none"
                        />
                        <button 
                          onClick={() => removeEquipment(item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={addEquipment}
                  className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-[#5d3a1a] rounded-lg text-[#a0785a] hover:border-[#d4af37] hover:text-[#d4af37] transition-all text-sm"
                >
                  <Plus className="w-4 h-4" /> Añadir Objeto
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Abilities */}
          <div className="lg:col-span-2 space-y-4">
            {senda.abilities.map(ability => (
              <div 
                key={ability.id}
                className={`bg-[#3e2723] rounded-xl border-2 transition-all duration-300 ${expandedAbility === ability.id ? 'border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border-[#5d3a1a] shadow-lg'}`}
              >
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedAbility(expandedAbility === ability.id ? null : ability.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      ability.type === 'Pasiva' ? 'bg-blue-900/40 text-blue-300' :
                      ability.type === 'Acción' ? 'bg-red-900/40 text-red-300' :
                      ability.type === 'Reactiva' ? 'bg-amber-900/40 text-amber-300' :
                      'bg-green-900/40 text-green-300'
                    }`}>
                      {ability.type === 'Pasiva' && <Zap className="w-5 h-5" />}
                      {ability.type === 'Acción' && <Sword className="w-5 h-5" />}
                      {ability.type === 'Reactiva' && <Shield className="w-5 h-5" />}
                      {ability.type === 'Interacción' && <Users className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{ability.name}</h3>
                      <div className="text-xs text-[#a0785a] uppercase tracking-widest">{ability.range} • {ability.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-[#a0785a]">Coste PS</div>
                      <div className={`font-bold ${calculateAbilityPS(ability) > ability.psCap ? 'text-red-400' : 'text-[#d4af37]'}`}>
                        {calculateAbilityPS(ability)} / {ability.psCap}
                      </div>
                    </div>
                    {expandedAbility === ability.id ? <ChevronUp /> : <ChevronDown />}
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
                            <div className="relative group">
                              <button className="flex items-center gap-1 bg-[#5d3a1a] hover:bg-[#8b4513] text-white px-3 py-1 rounded text-sm transition-colors">
                                <Plus className="w-4 h-4" /> Añadir Módulo
                              </button>
                              <div className="absolute right-0 mt-2 w-72 bg-[#3e2723] border-2 border-[#5d3a1a] rounded-lg shadow-2xl z-50 hidden group-hover:block max-h-96 overflow-y-auto">
                                {MODULES.filter(m => {
                                  if (m.type === ability.type) return true;
                                  if (ability.range === 'Rango 3' && ability.type === 'Acción' && m.type === 'Suprema') return true;
                                  return false;
                                }).map(m => (
                                  <div 
                                    key={m.id}
                                    onClick={() => addModuleToAbility(ability.id, m.id)}
                                    className="p-3 hover:bg-[#5d3a1a] cursor-pointer border-b border-[#2c1810] last:border-none"
                                  >
                                    <div className="flex justify-between font-bold text-sm">
                                      <span>{m.name}</span>
                                      <span className="text-[#d4af37]">{m.baseCost} PS</span>
                                    </div>
                                    <div className="text-xs text-[#a0785a] line-clamp-1">{m.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {ability.modules.map((sm, idx) => {
                              const mod = MODULES.find(m => m.id === sm.moduleId);
                              if (!mod) return null;
                              return (
                                <div key={idx} className="flex flex-col md:flex-row gap-4 p-3 bg-[#2c1810]/90 rounded border border-[#5d3a1a] items-center">
                                  <div className="flex-1">
                                    <div className="font-bold text-[#d4af37]">{mod.name}</div>
                                    <div className="text-xs text-[#a0785a]">{mod.description}</div>
                                  </div>
                                  
                                  {mod.appliesScale && (
                                    <div className="flex items-center gap-2">
                                      <label className="text-xs text-[#a0785a]">Escala:</label>
                                      <select 
                                        value={sm.condition}
                                        onChange={e => updateModuleCondition(ability.id, idx, e.target.value as ConditionScale)}
                                        className="bg-[#3e2723] border-[#5d3a1a] rounded p-1 text-xs"
                                      >
                                        <option value="Específica">Específica (x1)</option>
                                        <option value="General">General (x2)</option>
                                        <option value="Sin condición">Sin condición (x4)</option>
                                      </select>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-4">
                                    <div className="font-bold text-[#d4af37]">
                                      {mod.appliesScale ? mod.baseCost * CONDITION_FACTORS[sm.condition] : mod.baseCost} PS
                                    </div>
                                    <button 
                                      onClick={() => removeModuleFromAbility(ability.id, idx)}
                                      className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
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
              </div>
            ))}
          </div>
        </div>

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
