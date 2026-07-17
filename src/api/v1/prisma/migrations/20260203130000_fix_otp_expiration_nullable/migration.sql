-- Fix otp_expiration column to allow NULL (schema says DateTime? but column was NOT NULL)
ALTER TABLE `user_secrets` MODIFY `otp_expiration` DATETIME NULL;
