// src/utils/semaforo.ts
import { PrioridadColor } from '@/types';

export const calcularColorPrioridad = (fechaReset: string): { color: PrioridadColor; dias: number } => {
  const inicio = new Date(fechaReset);
  const hoy = new Date();
  const diferenciaDias = Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

  if (diferenciaDias < 3) return { color: 'AZUL', dias: diferenciaDias };
  if (diferenciaDias < 6) return { color: 'VERDE', dias: diferenciaDias };
  if (diferenciaDias < 9) return { color: 'AMARILLO', dias: diferenciaDias };
  if (diferenciaDias < 12) return { color: 'NARANJA', dias: diferenciaDias };
  return { color: 'ROJO', dias: diferenciaDias };
};
