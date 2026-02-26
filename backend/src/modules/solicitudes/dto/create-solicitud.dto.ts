// src/modules/solicitudes/dto/create-solicitud.dto.ts
export class CreateSolicitudDto {
  idEmpresa: number;
  idArea: number; // CAMBIADO: Antes era 'area: string'
  justificacion: string;
  items: {
    descripcion: string;
    cantidad: number;
    idUnidad: number;
  }[];
}
