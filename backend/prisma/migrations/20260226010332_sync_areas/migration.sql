/*
  Warnings:

  - You are about to drop the column `area` on the `Solicitud` table. All the data in the column will be lost.
  - Added the required column `idArea` to the `Solicitud` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Solicitud` DROP COLUMN `area`,
    ADD COLUMN `apellidoMRecibe` VARCHAR(191) NULL,
    ADD COLUMN `apellidoPRecibe` VARCHAR(191) NULL,
    ADD COLUMN `fechaRecepcion` DATETIME(3) NULL,
    ADD COLUMN `idArea` INTEGER NOT NULL,
    ADD COLUMN `nombreRecibe` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Area` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Area_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_idArea_fkey` FOREIGN KEY (`idArea`) REFERENCES `Area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
