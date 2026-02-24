-- AlterTable
ALTER TABLE `Solicitud` ADD COLUMN `compradorId` INTEGER NULL,
    ADD COLUMN `fechaFinalizado` DATETIME(3) NULL,
    ADD COLUMN `montoFinal` DOUBLE NULL,
    ADD COLUMN `proveedorFinal` VARCHAR(191) NULL;
