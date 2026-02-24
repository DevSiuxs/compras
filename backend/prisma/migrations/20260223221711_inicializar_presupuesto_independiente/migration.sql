/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `presupuesto` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Empresa` table. All the data in the column will be lost.
  - You are about to drop the column `leido` on the `Mensaje` table. All the data in the column will be lost.
  - You are about to drop the column `montoFaltante` on the `Mensaje` table. All the data in the column will be lost.
  - You are about to drop the column `motivo` on the `Mensaje` table. All the data in the column will be lost.
  - You are about to drop the column `colorActual` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `concepto` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `cotizacionA_Monto` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `cotizacionA_Proveedor` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `cotizacionB_Monto` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `cotizacionB_Proveedor` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `diasTotales` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `fechaInicio` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `montoAprobado` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `motivoRechazo` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `opcionElegida` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Solicitud` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.
  - You are about to alter the column `cantidad` on the `Solicitud` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the `catalogos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contenido` to the `Mensaje` table without a default value. This is not possible if the table is not empty.
  - Added the required column `areaId` to the `Solicitud` table without a default value. This is not possible if the table is not empty.
  - Added the required column `justificacion` to the `Solicitud` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material` to the `Solicitud` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidadId` to the `Solicitud` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Empresa` DROP COLUMN `createdAt`,
    DROP COLUMN `presupuesto`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `Mensaje` DROP COLUMN `leido`,
    DROP COLUMN `montoFaltante`,
    DROP COLUMN `motivo`,
    ADD COLUMN `contenido` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Solicitud` DROP COLUMN `colorActual`,
    DROP COLUMN `concepto`,
    DROP COLUMN `cotizacionA_Monto`,
    DROP COLUMN `cotizacionA_Proveedor`,
    DROP COLUMN `cotizacionB_Monto`,
    DROP COLUMN `cotizacionB_Proveedor`,
    DROP COLUMN `diasTotales`,
    DROP COLUMN `fechaInicio`,
    DROP COLUMN `montoAprobado`,
    DROP COLUMN `motivoRechazo`,
    DROP COLUMN `opcionElegida`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `areaId` INTEGER NOT NULL,
    ADD COLUMN `cotizacionSeleccionadaId` INTEGER NULL,
    ADD COLUMN `fechaResetColor` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `justificacion` TEXT NOT NULL,
    ADD COLUMN `material` VARCHAR(191) NOT NULL,
    ADD COLUMN `unidadId` INTEGER NOT NULL,
    MODIFY `status` ENUM('SOLICITADO', 'ALMACEN', 'COTIZADO', 'AUTORIZADO', 'RECHAZADO', 'COMPRADO', 'RECIBIDO', 'ENTREGADO') NOT NULL DEFAULT 'SOLICITADO',
    MODIFY `cantidad` DOUBLE NOT NULL;

-- DropTable
DROP TABLE `catalogos`;

-- CreateTable
CREATE TABLE `ConfiguracionGlobal` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `presupuestoGlobal` DOUBLE NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Area` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Area_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Unidad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Unidad_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cotizacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proveedor` VARCHAR(191) NOT NULL,
    `monto` DOUBLE NOT NULL,
    `quienCotizo` VARCHAR(191) NOT NULL,
    `observaciones` TEXT NULL,
    `solicitudId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_unidadId_fkey` FOREIGN KEY (`unidadId`) REFERENCES `Unidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cotizacion` ADD CONSTRAINT `Cotizacion_solicitudId_fkey` FOREIGN KEY (`solicitudId`) REFERENCES `Solicitud`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
