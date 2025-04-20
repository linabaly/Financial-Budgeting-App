/*
  Warnings:

  - You are about to drop the column `accountId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `accountID` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_accountId_fkey`;

-- DropIndex
DROP INDEX `Transaction_accountId_fkey` ON `Transaction`;

-- AlterTable
ALTER TABLE `Transaction` DROP COLUMN `accountId`,
    ADD COLUMN `accountID` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_accountID_fkey` FOREIGN KEY (`accountID`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
