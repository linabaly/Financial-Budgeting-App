/*
  Warnings:

  - You are about to drop the column `nextDueDate` on the `RecurringTransaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Budget` MODIFY `category` ENUM('FOOD', 'RENT', 'ENTERTAINMENT', 'UTILITIES', 'TRANSPORTATION', 'HEALTHCARE', 'OTHER', 'INCOME', 'PERSONAL') NOT NULL;

-- AlterTable
ALTER TABLE `RecurringTransaction` DROP COLUMN `nextDueDate`,
    MODIFY `category` ENUM('FOOD', 'RENT', 'ENTERTAINMENT', 'UTILITIES', 'TRANSPORTATION', 'HEALTHCARE', 'OTHER', 'INCOME', 'PERSONAL') NOT NULL;

-- AlterTable
ALTER TABLE `Transaction` MODIFY `category` ENUM('FOOD', 'RENT', 'ENTERTAINMENT', 'UTILITIES', 'TRANSPORTATION', 'HEALTHCARE', 'OTHER', 'INCOME', 'PERSONAL') NOT NULL;
