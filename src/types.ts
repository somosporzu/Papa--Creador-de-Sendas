export type EnergyType = 1 | 2 | 3;
export type VitalityProfile = 'Titán' | 'Caminante' | 'Sombra';
export type AbilityType = 'Pasiva' | 'Reactiva' | 'Acción' | 'Interacción';
export type ConditionScale = 'Específica' | 'General' | 'Sin condición';
export type Range = 'Inicial' | 'Rango 1' | 'Rango 2' | 'Rango 3';

export type BonusCategory = 'Ataque' | 'Daño' | 'Defensa' | 'Salvación' | 'Resistencia' | 'Movilidad';

export interface Module {
  id: string;
  name: string;
  baseCost: number;
  description: string;
  type: 'Pasiva' | 'Reactiva' | 'Acción' | 'Interacción' | 'Suprema';
  category?: string;
  bonusCategory?: BonusCategory;
  bonusValue?: number;
  appliesScale?: boolean;
}

export interface SelectedModule {
  moduleId: string;
  condition: ConditionScale;
  customNote?: string;
}

export type ActionObjective = 'Yo solo' | '1 objetivo' | '2 objetivos' | 'Todos los aliados' | 'Todos los enemigos' | 'Área (6m)';
export type ActionDistance = 'Adyacente' | 'Corto (6m)' | 'Medio (12m)' | 'Largo (18m)';

export interface Ability {
  id: string;
  name: string;
  range: Range;
  type: AbilityType;
  modules: SelectedModule[];
  disadvantage?: string; // Layer 1 disadvantage
  psCap: number;
  // Action specific
  actionSubtype?: 'Rápida' | 'Principal' | 'Completa';
  executionModality?: 'Autónoma' | 'Ligada a ataque' | 'Ligada a otra';
  objective?: ActionObjective;
  distance?: ActionDistance;
  limitedUses?: number; // -3, -2, -1 PS
  isEvasion?: boolean; // For Sombra requirement
  isOffensive?: boolean; // For Titán requirement
  isCumbre?: boolean; // For Rango 3 requirement
}

export interface NarrativeDisadvantage {
  id: string;
  name: string;
  pcsGain: number;
  restriction: string;
}

export type ConceptCategory = 'Marciales' | 'Sociales' | 'Productivos' | 'Espirituales' | 'Intelectuales';

export interface Concept {
  name: string;
  category: ConceptCategory;
  isPrincipal: boolean;
}

export type ImprovementCategory = 
  | 'Conceptos marciales'
  | 'Conceptos sociales'
  | 'Conceptos productivos'
  | 'Conceptos espirituales'
  | 'Conceptos intelectuales'
  | 'Potenciar Naturaleza (+1)'
  | 'Aprender Naturaleza nueva'
  | 'Aprender Concepto nuevo'
  | 'Potenciar Concepto (+1)'
  | 'Rango de Senda (2 habilidades)'
  | 'Subir Atributo Cuerpo'
  | 'Subir Atributo Destreza'
  | 'Subir Atributo Aura'
  | 'Nuevo Árbol de Técnicas'
  | 'Técnicas de Energía';

export interface EquipmentItem {
  id: string;
  name: string;
  cost: number;
  description: string;
}

export interface Senda {
  name: string;
  fantasy: string;
  energies: EnergyType;
  vitalityProfile: VitalityProfile;
  narrativeDisadvantage?: string;
  concepts: Concept[];
  affinities: ImprovementCategory[];
  contraries: ImprovementCategory[];
  equipment: EquipmentItem[];
  abilities: Ability[];
}
