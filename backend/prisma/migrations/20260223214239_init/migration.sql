-- CreateTable
CREATE TABLE `Empresa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `presupuesto` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Empresa_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Solicitud` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `folio` VARCHAR(191) NOT NULL,
    `status` ENUM('ALMACEN', 'COTIZACION', 'AUTORIZACION', 'COMPRANDO', 'RECEPCION', 'ENTREGADO', 'RECHAZADA') NOT NULL DEFAULT 'ALMACEN',
    `fechaInicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `colorActual` VARCHAR(191) NOT NULL DEFAULT 'AZUL',
    `diasTotales` INTEGER NOT NULL DEFAULT 0,
    `concepto` VARCHAR(191) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `empresaId` INTEGER NOT NULL,
    `cotizacionA_Monto` DECIMAL(10, 2) NULL,
    `cotizacionA_Proveedor` VARCHAR(191) NULL,
    `cotizacionB_Monto` DECIMAL(10, 2) NULL,
    `cotizacionB_Proveedor` VARCHAR(191) NULL,
    `montoAprobado` DECIMAL(10, 2) NULL,
    `opcionElegida` VARCHAR(191) NULL,
    `motivoRechazo` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Solicitud_folio_key`(`folio`),
    INDEX `Solicitud_empresaId_fkey`(`empresaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mensaje` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `solicitudId` INTEGER NOT NULL,
    `motivo` TEXT NOT NULL,
    `montoFaltante` DECIMAL(10, 2) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leido` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Mensaje_solicitudId_fkey`(`solicitudId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Solicitud` ADD CONSTRAINT `Solicitud_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `Empresa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_solicitudId_fkey` FOREIGN KEY (`solicitudId`) REFERENCES `Solicitud`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
