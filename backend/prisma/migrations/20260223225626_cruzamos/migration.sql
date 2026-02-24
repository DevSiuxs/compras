/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `ConfiguracionGlobal` table. All the data in the column will be lost.
  - You are about to drop the column `contenido` on the `Mensaje` table. All the data in the column will be lost.
  - You are about to drop the column `areaId` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `cantidad` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `cotizacionSeleccionadaId` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `empresaId` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `unidadId` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Solicitud` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - Added the required column `motivo` to the `Mensaje` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idArea` to the `Solicitud` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idEmpresa` to the `Solicitud` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Solicitud` DROP FOREIGN KEY `Solicitud_areaId_fkey`;

-- DropForeignKey
ALTER TABLE `Solicitud` DROP FOREIGN KEY `Solicitud_empresaId_fkey`;

-- DropForeignKey
ALTER TABLE `Solicitud` DROP FOREIGN KEY `Solicitud_unidadId_fkey`;

-- DropIndex
DROP INDEX `Solicitud_areaId_fkey` ON `Solicitud`;

-- DropIndex
DROP INDEX `Solicitud_empresaId_fkey` ON `Solicitud`;

-- DropIndex
DROP INDEX `Solicitud_unidadId_fkey` ON `Solicitud`;

-- AlterTable
ALTER TABLE `ConfiguracionGlobal` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `Cotizacion` ADD COLUMN `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `seleccionada` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Mensaje` DROP COLUMN `contenido`,
    ADD COLUMN `motivo` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Solicitud` DROP COLUMN `areaId`,
    DROP COLUMN `cantidad`,
    DROP COLUMN `cotizacionSeleccionadaId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `empresaId`,
    DROP COLUMN `material`,
    DROP COLUMN `unidadId`,
    ADD COLUMN `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `idArea` INTEGER NOT NULL,
    ADD COLUMN `idEmpresa` INTEGER NOT NULL,
    ADD COLUMN `prioridad` VARCHAR(191) NOT NULL DEFAULT 'AZUL',
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'SOLICITADO';

-- CreateTable
CREATE TABLE `ItemSolicitud` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(191) NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `idUnidad` INTEGER NOT NULL,
    `solicitudId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_idEmpresa_fkey` FOREIGN KEY (`idEmpresa`) REFERENCES `Empresa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_idArea_fkey` FOREIGN KEY (`idArea`) REFERENCES `Area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemSolicitud` ADD CONSTRAINT `ItemSolicitud_idUnidad_fkey` FOREIGN KEY (`idUnidad`) REFERENCES `Unidad`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItemSolicitud` ADD CONSTRAINT `ItemSolicitud_solicitudId_fkey` FOREIGN KEY (`solicitudId`) REFERENCES `Solicitud`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
