import { Module, NarrativeDisadvantage } from './types';

export const MODULES: Module[] = [
  // PASIVAS - Bonos numéricos
  { id: 'def_1', name: '+1 a Defensa', baseCost: 1, description: 'Condición obligatoria. Techo Defensa. Comparte techo con Armadura', type: 'Pasiva', category: 'Bonos', bonusCategory: 'Defensa', bonusValue: 1, appliesScale: true },
  { id: 'arm_1', name: '+1 a Armadura', baseCost: 1, description: 'Condición obligatoria. Comparte techo con Defensa', type: 'Pasiva', category: 'Bonos', bonusCategory: 'Defensa', bonusValue: 1, appliesScale: true },
  { id: 'salv_2', name: '+2 a Salvación específica', baseCost: 1, description: 'Condición obligatoria. Especificar tipo (Cuerpo / Destreza / Aura). Techo Salvación', type: 'Pasiva', category: 'Bonos', bonusCategory: 'Salvación', bonusValue: 2, appliesScale: true },
  { id: 'res_3', name: '+3 Resistencia máxima', baseCost: 2, description: 'Coste fijo. Sin condición. Máx. 1 en Inicial y Rango 1', type: 'Pasiva', category: 'Bonos', bonusCategory: 'Resistencia', bonusValue: 3, appliesScale: false },
  { id: 'res_5', name: '+5 Resistencia máxima', baseCost: 4, description: 'Coste fijo. Sin condición. Máx. 1 en Inicial y Rango 1', type: 'Pasiva', category: 'Bonos', bonusCategory: 'Resistencia', bonusValue: 5, appliesScale: false },
  { id: 'dan_1', name: '+1 al daño', baseCost: 1, description: 'Condición obligatoria. Sin condición prohibido. Techo Daño', type: 'Pasiva', category: 'Bonos', bonusCategory: 'Daño', bonusValue: 1, appliesScale: true },
  { id: 'atk_1', name: '+1 a ataque', baseCost: 1, description: 'Condición obligatoria. Sin condición prohibido. Techo Ataque', type: 'Pasiva', category: 'Bonos', bonusCategory: 'Ataque', bonusValue: 1, appliesScale: true },
  { id: 'mov_3', name: '+3 metros de movimiento', baseCost: 1, description: 'Aplica escala. Sin condición = 4 PS. Techo Movilidad', type: 'Pasiva', category: 'Bonos', bonusCategory: 'Movilidad', bonusValue: 3, appliesScale: true },
  { id: 'ini_2', name: '+2 a Iniciativa', baseCost: 1, description: 'Aplica escala. Sin condición = 4 PS. Techo Movilidad', type: 'Pasiva', category: 'Bonos', bonusCategory: 'Movilidad', bonusValue: 2, appliesScale: true },

  // PASIVAS - Conocimiento y percepción
  { id: 'con_1', name: 'Ventaja en tiradas de conocimiento', baseCost: 1, description: 'Condición obligatoria. Dominio concreto', type: 'Pasiva', category: 'Conocimiento', appliesScale: true },
  { id: 'per_1', name: 'Ventaja en tiradas de percepción', baseCost: 1, description: 'Condición obligatoria. Circunstancia concreta', type: 'Pasiva', category: 'Conocimiento', appliesScale: true },
  { id: 'mem_1', name: 'Ventaja en tiradas de memoria', baseCost: 1, description: 'Condición obligatoria. Tipo de información', type: 'Pasiva', category: 'Conocimiento', appliesScale: true },
  { id: 'concep_1', name: 'Concepto +1', baseCost: 3, description: 'Coste fijo. +1 a sus tiradas fuera de combate', type: 'Pasiva', category: 'Conocimiento', appliesScale: false },

  // PASIVAS - Supervivencia
  { id: 'no_dormir', name: 'No necesitas dormir', baseCost: 4, description: 'Coste fijo. Recuperas con 4 horas de reposo', type: 'Pasiva', category: 'Supervivencia', appliesScale: false },
  { id: 'clima', name: 'Ignorar clima extremo', baseCost: 4, description: 'Coste fijo. Sin penalizadores por frío, calor o lluvia', type: 'Pasiva', category: 'Supervivencia', appliesScale: false },
  { id: 'comida', name: 'Mitad de comida y agua', baseCost: 2, description: 'Coste fijo. Solo narrativo', type: 'Pasiva', category: 'Supervivencia', appliesScale: false },
  { id: 'rastro', name: 'Sin rastro voluntario', baseCost: 2, description: 'Coste fijo. Rastrear al personaje requiere tirada con Desventaja', type: 'Pasiva', category: 'Supervivencia', appliesScale: false },
  { id: 'penumbra', name: 'Visión en penumbra sin Desventaja', baseCost: 2, description: 'Coste fijo. No sufre Desventaja en tiradas por penumbra', type: 'Pasiva', category: 'Supervivencia', appliesScale: false },
  { id: 'oscuridad', name: 'Visión en oscuridad total (12m)', baseCost: 4, description: 'Coste fijo. Ve con normalidad hasta 12m', type: 'Pasiva', category: 'Supervivencia', appliesScale: false },
  { id: 'fatiga_extra', name: 'Recuperación de Fatiga extra', baseCost: 3, description: 'Coste fijo. Recupera 1 nivel extra en Descansos Largos', type: 'Pasiva', category: 'Supervivencia', appliesScale: false },

  // REACTIVAS
  { id: 'contra', name: 'Contraataque', baseCost: 4, description: 'Ataca al objetivo que te atacó. Consume Reacción', type: 'Reactiva', category: 'Defensivas', appliesScale: false },
  { id: 'interceptar', name: 'Interceptar ataque a aliado', baseCost: 4, description: 'Te conviertes en el objetivo. Consume Reacción', type: 'Reactiva', category: 'Defensivas', appliesScale: false },
  { id: 'escudo_react', name: 'Escudo reactivo', baseCost: 2, description: 'Ventaja en próxima tirada de Defensa. Consume Reacción', type: 'Reactiva', category: 'Defensivas', appliesScale: false },
  { id: 'evitar_caida', name: 'Evitar caída a 0 de aliado', baseCost: 6, description: 'Aliado adyacente queda en 1 Res. Consume Reacción + 2 Res', type: 'Reactiva', category: 'Defensivas', appliesScale: false },

  // ACCIÓN - Ofensivas
  { id: 'atk_ventaja', name: 'Ataque con Ventaja', baseCost: 2, description: 'Ventaja en la tirada de ataque. Condición específica obligatoria', type: 'Acción', category: 'Ofensivas', appliesScale: true },
  { id: 'desv_enm', name: 'Desventaja al enemigo', baseCost: 2, description: 'Próxima tirada del objetivo con Desventaja. Condición específica obligatoria', type: 'Acción', category: 'Ofensivas', appliesScale: true },
  { id: 'pen_def', name: 'Penalizador -2 Defensa', baseCost: 2, description: '-2 Defensa hasta inicio de tu próximo turno. Condición general obligatoria', type: 'Acción', category: 'Ofensivas', appliesScale: true },
  { id: 'aturdido', name: 'Estado menor — Aturdido o Inmovilizado', baseCost: 4, description: '1 ronda. Salvación Cuerpo o Destreza (ND 12)', type: 'Acción', category: 'Ofensivas', appliesScale: false },
  { id: 'paralizado', name: 'Estado mayor — Paralizado, Asustado o Dormido', baseCost: 6, description: '1 ronda. Salvación (ND 14)', type: 'Acción', category: 'Ofensivas', appliesScale: false },
  { id: 'envenenado', name: 'Estado de daño continuo — Envenenado o Quemado', baseCost: 5, description: '1d6 daño/ronda hasta superar Salvación (ND 12)', type: 'Acción', category: 'Ofensivas', appliesScale: false },
  { id: 'cegado', name: 'Cegado (ND 12)', baseCost: 4, description: '1 ronda. Salvación Aura. Falla tiradas dependientes de vista', type: 'Acción', category: 'Ofensivas', appliesScale: false },
  { id: 'fatiga_1', name: '1 nivel de Fatiga (ND 12)', baseCost: 4, description: 'Salvación de Cuerpo. Impacto acumulativo en combates largos', type: 'Acción', category: 'Ofensivas', appliesScale: false },
  { id: 'reposicionamiento', name: 'Reposicionamiento forzado', baseCost: 3, description: 'Empuja hasta 3m. Tirada enfrentada Cuerpo vs. Cuerpo o Destreza', type: 'Acción', category: 'Ofensivas', appliesScale: false },
  { id: 'distraccion', name: 'Distracción en área', baseCost: 2, description: 'Área 6m. Salvación Aura ND 12 o Desventaja próxima tirada', type: 'Acción', category: 'Ofensivas', appliesScale: true },

  // ACCIÓN - Apoyo
  { id: 'def_temp', name: '+2 Defensa temporal (1 ronda)', baseCost: 2, description: '+2 Def hasta inicio de tu próximo turno', type: 'Acción', category: 'Apoyo', appliesScale: false },
  { id: 'com_mental', name: 'Comunicación mental táctica', baseCost: 4, description: 'Transmite pensamiento simple sin señas. Acción Rápida', type: 'Acción', category: 'Apoyo', appliesScale: true },
  { id: 'vent_aliado', name: 'Ventaja en próxima tirada del aliado', baseCost: 2, description: 'Especificar tipo de tirada al diseñar', type: 'Acción', category: 'Apoyo', appliesScale: false },
  { id: 'cur_men', name: 'Curación menor — 3 Res.', baseCost: 2, description: 'Restaura 3 Res.', type: 'Acción', category: 'Apoyo', appliesScale: false },
  { id: 'cur_mod', name: 'Curación moderada — 6 Res.', baseCost: 4, description: 'Restaura 6 Res.', type: 'Acción', category: 'Apoyo', appliesScale: false },
  { id: 'cur_may', name: 'Curación mayor — 9 Res.', baseCost: 6, description: 'Restaura 9 Res.', type: 'Acción', category: 'Apoyo', appliesScale: false },
  { id: 'elim_estado', name: 'Eliminar estado (Ventaja en tirada)', baseCost: 3, description: 'Ventaja para eliminar estado activo', type: 'Acción', category: 'Apoyo', appliesScale: false },
  { id: 'estabilizar', name: 'Estabilizar aliado caído', baseCost: 3, description: 'Aliado queda en 1 Res en lugar de morir. Acción Principal', type: 'Acción', category: 'Apoyo', appliesScale: false },

  // ACCIÓN - Control y área
  { id: 'vent_grupal', name: 'Ventaja grupal en área', baseCost: 4, description: 'Aliados en área 6m obtienen Ventaja en próxima tirada', type: 'Acción', category: 'Control', appliesScale: true },
  { id: 'desv_grupal', name: 'Desventaja grupal en área', baseCost: 4, description: 'Enemigos en área 6m realizan próxima tirada con Desventaja', type: 'Acción', category: 'Control', appliesScale: true },
  { id: 'barrera', name: 'Barrera táctica', baseCost: 4, description: 'Atacante que te impacte sufre Desventaja en su siguiente tirada', type: 'Acción', category: 'Control', appliesScale: true },

  // INTERACCIÓN
  { id: 'vent_exploracion', name: 'Ventaja en tiradas de exploración', baseCost: 2, description: 'Rastreo, orientación, lectura de entorno, supervivencia', type: 'Interacción', category: 'Social', appliesScale: true },
  { id: 'vent_sociales', name: 'Ventaja en tiradas sociales', baseCost: 2, description: 'Persuasión, intimidación, engaño, negociación', type: 'Interacción', category: 'Social', appliesScale: true },
  { id: 'vent_fabricacion', name: 'Ventaja en tiradas de fabricación y conocimiento', baseCost: 2, description: 'Fabricar, identificar, reparar, evaluar', type: 'Interacción', category: 'Social', appliesScale: true },
  { id: 'com_criatura', name: 'Comunicarse con tipo de criatura', baseCost: 2, description: 'Ventaja en tiradas de interacción con un tipo concreto', type: 'Interacción', category: 'Social', appliesScale: false },
  { id: 'cur_fuera', name: 'Curación fuera de combate — 6 Res.', baseCost: 3, description: 'Restaura 6 Res. Sin coste de Res. Sin tirada', type: 'Interacción', category: 'Social', appliesScale: false },
  { id: 'prep_fatiga', name: 'Preparar recuperación de Fatiga', baseCost: 4, description: 'Objetivo recupera 1 nivel extra en próximo Descanso Largo', type: 'Interacción', category: 'Social', appliesScale: false },
  { id: 'elim_estado_fuera', name: 'Eliminar estado fuera de combate', baseCost: 3, description: 'Elimina estado activo sin tirada (10 min)', type: 'Interacción', category: 'Social', appliesScale: false },
  { id: 'reputacion', name: 'Reputación activa en zona', baseCost: 4, description: 'Tiradas sociales del grupo obtienen Ventaja durante la sesión', type: 'Interacción', category: 'Social', appliesScale: false },

  // SUPREMAS (Rango 3)
  { id: 'inm_temp', name: 'Inmunidad temporal a daño (2 rondas)', baseCost: 7, description: 'Por tipo concreto definido al diseñar', type: 'Suprema', category: 'Efectos Cumbre', appliesScale: false },
  { id: 'area_mult', name: 'Área grande + efectos múltiples', baseCost: 8, description: 'Radio 12m. Varios efectos simultáneos', type: 'Suprema', category: 'Efectos Cumbre', appliesScale: false },
  { id: 'revivir', name: 'Revivir desde 0 Resistencia', baseCost: 9, description: 'Aliado vuelve con 1 Res. Consume Reacción + 3 Res', type: 'Suprema', category: 'Efectos Cumbre', appliesScale: false },
  { id: 'transform', name: 'Estado de transformación (3+ rondas)', baseCost: 9, description: 'Múltiples bonos activos 3+ rondas', type: 'Suprema', category: 'Efectos Cumbre', appliesScale: false },
];

export const NARRATIVE_DISADVANTAGES: NarrativeDisadvantage[] = [
  { id: 'pacto', name: 'Pacto oscuro', pcsGain: 5, restriction: 'Cumple una tarea narrativa declarada una vez por sesión. Si no, pierde acceso a Rango 3 hasta el próximo Descanso Largo' },
  { id: 'necesidad', name: 'Necesidad especial', pcsGain: 4, restriction: 'Debe consumir algo raro cada 24h (declarado al diseñar). Si no, -2 a todos los Atributos' },
  { id: 'ritual', name: 'Ritual de activación', pcsGain: 4, restriction: 'Para usar Rango 2 y 3, debe completar un ritual de 10 min en las últimas 8h' },
  { id: 'enemigo', name: 'Enemigo designado', pcsGain: 3, restriction: 'Una facción concreta le conoce y le caza. El DJ introduce complicaciones periódicamente' },
  { id: 'carga', name: 'Carga mental', pcsGain: 3, restriction: 'Al usar Rango 2 o 3, Salvación Aura ND 12 o queda Aturdido hasta su próximo turno' },
  { id: 'vulnerabilidad', name: 'Vulnerabilidad elemental', pcsGain: 3, restriction: 'Recibe doble daño de un tipo concreto declarado al diseñar. Efecto permanente' },
  { id: 'codigo', name: 'Código de conducta', pcsGain: 3, restriction: 'Sigue un código declarado al diseñar. Si lo viola, pierde acceso a todas las habilidades de Senda hasta Descanso Largo + acto de reparación narrativo' },
  { id: 'sin_armas', name: 'Sin armas fabricadas', pcsGain: 3, restriction: 'Solo puede atacar con armas naturales o improvisadas. Sus ataques usan 1d6 de daño base sin modificador de arma' },
  { id: 'marca', name: 'Marca visible', pcsGain: 2, restriction: 'Marca física permanente visible. No se oculta por medios mundanos. Desventaja en tiradas sociales con desconocidos' },
  { id: 'sed', name: 'Sed de conflicto', pcsGain: 2, restriction: 'Más de 24h sin combate: acumula 1 nivel de Fatiga por día. Ese nivel solo se recupera en un Descanso Largo el día en que el personaje haya combatido' },
  { id: 'testigos', name: 'Dependencia de testigos', pcsGain: 2, restriction: 'Rango 2 y 3 solo funcionan si hay al menos 1 criatura consciente observando al personaje' },
  { id: 'ligadura_arma', name: 'Ligadura de arma', pcsGain: 4, restriction: 'Solo puede usar un tipo de arma concreto declarado al diseñar. Si usa otra arma, sus ataques tienen Desventaja y sus habilidades de Senda no funcionan ese turno' },
  { id: 'ligadura_combate', name: 'Ligadura de combate', pcsGain: 3, restriction: 'Solo puede combatir sin armadura o con armadura ligera. Si porta media o pesada, sus habilidades de Senda no funcionan y sufre -2 a Iniciativa' },
  { id: 'prohibicion_arma', name: 'Prohibición de arma', pcsGain: 2, restriction: 'No puede usar un tipo de arma declarado al diseñar. Si lo hace, sus habilidades de Senda no funcionan hasta el próximo Descanso Corto' },
  { id: 'prohibicion_armadura', name: 'Prohibición de armadura', pcsGain: 2, restriction: 'No puede portar un tipo de armadura declarado al diseñar. Si lo hace, sus habilidades de Senda no funcionan y los módulos de Defensa quedan inactivos' },
];

export const IMPROVEMENT_CATEGORIES: string[] = [
  'Conceptos marciales',
  'Conceptos sociales',
  'Conceptos productivos',
  'Conceptos espirituales',
  'Conceptos intelectuales',
  'Potenciar Naturaleza (+1)',
  'Aprender Naturaleza nueva',
  'Aprender Concepto nuevo',
  'Potenciar Concepto (+1)',
  'Rango de Senda (2 habilidades)',
  'Subir Atributo Cuerpo',
  'Subir Atributo Destreza',
  'Subir Atributo Aura',
  'Nuevo Árbol de Técnicas',
  'Técnicas de Energía'
];

export const PREDEFINED_CONCEPTS: Record<string, string[]> = {
  'Marciales': ['Cazador', 'Domador', 'Explorador', 'Guerrero', 'Ladrón', 'Marinero', 'Monje'],
  'Sociales': ['Bardo', 'Cortesano', 'Espía', 'Ladrón', 'Mercader', 'Noble', 'Pícaro', 'Profesor'],
  'Productivos': ['Agricultor', 'Alfarero', 'Artesano', 'Carpintero', 'Cocinero', 'Constructor', 'Herrero', 'Minero', 'Pescador', 'Sastre', 'Tintorero'],
  'Espirituales': ['Bardo', 'Curandero', 'Erudito', 'Espiritista', 'Hechicero', 'Monje', 'Sacerdote'],
  'Intelectuales': ['Astrólogo', 'Botánico', 'Erudito', 'Filósofo', 'Historiador', 'Ingeniero', 'Lingüista', 'Naturalista', 'Profesor']
};
