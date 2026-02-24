export class CreateSolicitudDto {
  idEmpresa: number;
  area: string;
  justificacion: string;
  items: {
    descripcion: string;
    cantidad: number;
    idUnidad: number;
  }[];
}
