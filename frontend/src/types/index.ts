// src/types/index.ts

export type PrioridadColor = 'AZUL' | 'VERDE' | 'AMARILLO' | 'NARANJA' | 'ROJO';

export interface Unidad {
  id: number;
  nombre: string;
}

export interface Empresa {
  id: number;
  nombre: string;
}

export interface Area {
  id: number;
  nombre: string;
}

export interface ItemSolicitud {
  id: number;
  descripcion: string;
  cantidad: number;
  idUnidad: number;
  unidad?: Unidad;
}

export interface Solicitud {
  id: number;
  folio: string;
  fechaCreacion: string;
  fechaResetColor: string;
  justificacion: string;
  status: string;
  prioridad: PrioridadColor;
  idEmpresa: number;
  idArea: number;
  empresa?: Empresa;
  area?: Area;
  items?: ItemSolicitud[];
  montoFinal?: number;
  proveedorFinal?: string;
  fechaFinalizado?: string;
  nombreRecibe?: string;
  apellidoPRecibe?: string;
  apellidoMRecibe?: string;
  fechaRecepcion?: string;
}

export interface DashboardStats {
  totalSolicitudes: number;
  porStatus: Record<string, number>;
  porPrioridad: Record<PrioridadColor, number>;
  presupuestoDisponible: number;
  gastoTotal: number;
}

export interface CreateSolicitudDTO {
  idEmpresa: number;
  idArea: number;
  justificacion: string;
  items: {
    descripcion: string;
    cantidad: number;
    idUnidad: number;
  }[];
}

export interface CatalogosData {
  empresas: Empresa[];
  unidades: Unidad[];
  areas: Area[];
}

export interface AlmacenForm {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

export interface SolicitudAlmacen extends Solicitud {
  empresa: Empresa;
  area: Area;
  items: ItemSolicitud[];
}

// Cotizaciones
export interface CotizacionPropuesta {
  proveedor: string;
  monto: number;
  quien: string;
  obs: string;
}

export interface SolicitudCotizable extends Solicitud {
  empresa: Empresa;
  items: ItemSolicitud[];
}

export interface CreateCotizacionesDTO {
  c1_proveedor: string;
  c1_monto: number;
  c1_quien: string;
  c1_observaciones: string;
  c2_proveedor: string;
  c2_monto: number;
  c2_quien: string;
  c2_observaciones: string;
}

export interface Cotizacion {
  id: number;
  proveedor: string;
  monto: number;
  quienCotizo: string;
  observaciones: string;
  seleccionada: boolean;
  createdAt?: string;
}

export interface MensajeHistorial {
  id: number;
  solicitudId: number;
  motivo: string;
  fecha: string;
  folio?: string;
}

export interface SolicitudAutorizable extends Solicitud {
  empresa: Empresa;
  items: ItemSolicitud[];
  cotizaciones: Cotizacion[];
  mensajes: MensajeHistorial[];
}

export interface DecidirCotizacionDTO {
  cotizacionId: number;
  nuevaPrioridad: PrioridadColor;
}

// Recepción
export interface SolicitudRecepcion extends Solicitud {
  empresa: Empresa;
  area: Area;
  items: ItemSolicitud[];
}

export interface FinalizarRecepcionDTO {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

// Dashboard e Historial General
export interface TimelineEntry {
  fecha: string;
  evento: string;
  detalle: string;
  color: string;
}

export interface SolicitudHistorial extends Solicitud {
  empresa: Empresa;
  timeline?: TimelineEntry[];
}

export interface DashboardData {
  presupuestoRestante: number;
  gastoTotal: number;
  totalTickets: number;
  conteoSecciones: {
    ALMACEN: number;
    COTIZANDO: number;
    AUTORIZAR: number;
    COMPRAS: number;
    RECIBIDO: number;
  };
  
  porPrioridad: Record<string, number>;
  solicitudes: any[]; // Cambia any[] por SolicitudHistorial[] si ya tienes ese tipo
}
