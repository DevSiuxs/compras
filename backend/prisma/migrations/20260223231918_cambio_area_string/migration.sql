/*
  Warnings:

  - You are about to drop the column `idArea` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the `Area` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `area` to the `Solicitud` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Solicitud` DROP FOREIGN KEY `Solicitud_idArea_fkey`;

-- DropIndex
DROP INDEX `Solicitud_idArea_fkey` ON `Solicitud`;

-- AlterTable
ALTER TABLE `Solicitud` DROP COLUMN `idArea`,
    ADD COLUMN `area` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Area`;
