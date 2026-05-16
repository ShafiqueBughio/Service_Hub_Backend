-- Add is_completed, is_cancelled (bool); replace completed_at
ALTER TABLE `jobs` ADD COLUMN `is_completed` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `jobs` ADD COLUMN `is_cancelled` BOOLEAN NOT NULL DEFAULT false;
UPDATE `jobs` SET `is_completed` = true WHERE `completed_at` IS NOT NULL;
ALTER TABLE `jobs` DROP COLUMN `completed_at`;
