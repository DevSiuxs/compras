// 1. PRIMERO: Definimos la función de obtención de URL
// Forzamos el puerto 3000 que es donde vive tu API de NestJS
export const API_URL = 'http://localhost:3000';

export const getHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || ''}`,
  };
};

  // ... mantén tus otros endpoints igual pero usando la constante API_URL de arriba

// 4. CUARTO: Construimos los ENDPOINTS usando la constante ya definida arriba
export const ENDPOINTS = {
  CATALOGOS: {
    EMPRESAS: `${API_URL}/catalogos/empresas`,
    UNIDADES: `${API_URL}/catalogos/unidades`,
    AREAS: `${API_URL}/catalogos/areas`,
  },
  SOLICITUDES: {
    CREAR: `${API_URL}/solicitudes`,
    LISTAR: `${API_URL}/solicitudes`,
  },
  REPORTES: {
    DASHBOARD: `${API_URL}/reportes/dashboard`,
    TRAZABILIDAD: (id: number) => `${API_URL}/reportes/detalle/${id}`,
  },
  ALMACEN: {
    PENDIENTES: `${API_URL}/almacen/pendientes`,
    PROCESAR: (id: number) => `${API_URL}/almacen/${id}/procesar`,
   },
  COTIZACION: {
    PENDIENTES: `${API_URL}/cotizacion/pendientes`,
    REGISTRAR: (id: number) => `${API_URL}/cotizacion/${id}/registrar`,

  },
  AUTORIZACION: {
    PENDIENTES: `${API_URL}/autorizacion/pendientes`,
    PRESUPUESTO: `${API_URL}/autorizacion/presupuesto`,
    DECIDIR: (id: number) => `${API_URL}/autorizacion/${id}/decidir`,
  },
  COMPRAS: {
   PENDIENTES: `${API_URL}/compras/pendientes`,
    EJECUTAR: (id: number) => `${API_URL}/compras/${id}/ejecutar`,
    NOTIFICAR: (id: number) => `${API_URL}/compras/${id}/notificar-presupuesto`,
  },

    RECEPCION: {
    PENDIENTES: `${API_URL}/recepcion/pendientes`,
    FINALIZAR: (id: number) => `${API_URL}/recepcion/${id}/finalizar`,
    ENTREGAR: (id: number) => `${API_URL}/recepcion/${id}/entregar`,
  },

};
