export class DecidirCotizacionDto {
  cotizacionId: number;
  resetColor?: boolean;
  nuevaPrioridad?: 'AZUL' | 'VERDE' | 'AMARILLO' | 'NARANJA' | 'ROJO'; // <--- Nuevo
}
