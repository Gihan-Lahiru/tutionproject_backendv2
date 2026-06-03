-- Disable foreign key checks for dropping tables easily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables
DROP TABLE IF EXISTS `class_students`;
DROP TABLE IF EXISTS `submissions`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `announcements`;
DROP TABLE IF EXISTS `notes`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `papers`;
DROP TABLE IF EXISTS `videos`;
DROP TABLE IF EXISTS `users`;

-- Table `users`
CREATE TABLE `users` (
  `id` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` TEXT NOT NULL,
  `name` TEXT NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'student',
  `profilePicture` TEXT DEFAULT NULL,
  `tuitionClass` TEXT DEFAULT NULL,
  `grade` TEXT DEFAULT NULL,
  `phone` TEXT DEFAULT NULL,
  `institute` TEXT DEFAULT NULL,
  `emailVerificationCode` TEXT DEFAULT NULL,
  `emailVerified` BOOLEAN NOT NULL DEFAULT 1,
  `approvalStatus` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active',
  `paymentStatus` VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  `paymentDueDate` DATETIME DEFAULT NULL,
  `dashboardAccess` BOOLEAN NOT NULL DEFAULT 1,
  `currentSessionId` TEXT DEFAULT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `classes`
CREATE TABLE `classes` (
  `id` VARCHAR(255) NOT NULL,
  `name` TEXT NOT NULL,
  `title` TEXT DEFAULT NULL,
  `grade` TEXT NOT NULL,
  `subject` TEXT NOT NULL,
  `day` TEXT DEFAULT NULL,
  `time` TEXT DEFAULT NULL,
  `fee` INT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `location` TEXT DEFAULT NULL,
  `teacherId` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_classes_teacher` FOREIGN KEY (`teacherId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `class_students` (ManyToMany relation)
CREATE TABLE `class_students` (
  `classesId` VARCHAR(255) NOT NULL,
  `usersId` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`classesId`, `usersId`),
  CONSTRAINT `fk_class_students_class` FOREIGN KEY (`classesId`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_class_students_user` FOREIGN KEY (`usersId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `assignments`
CREATE TABLE `assignments` (
  `id` VARCHAR(255) NOT NULL,
  `classId` VARCHAR(255) NOT NULL,
  `title` TEXT NOT NULL,
  `description` TEXT DEFAULT NULL,
  `dueDate` DATETIME DEFAULT NULL,
  `attachmentUrl` TEXT DEFAULT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `createdById` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_assignments_class` FOREIGN KEY (`classId`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_createdBy` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `submissions`
CREATE TABLE `submissions` (
  `id` VARCHAR(255) NOT NULL,
  `assignmentId` VARCHAR(255) NOT NULL,
  `studentId` VARCHAR(255) NOT NULL,
  `fileUrl` TEXT DEFAULT NULL,
  `remarks` TEXT DEFAULT NULL,
  `marks` INT DEFAULT NULL,
  `submittedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_submissions_assignment_student` (`assignmentId`, `studentId`),
  CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`assignmentId`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_student` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `announcements`
CREATE TABLE `announcements` (
  `id` VARCHAR(255) NOT NULL,
  `classId` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `createdById` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_announcements_class` FOREIGN KEY (`classId`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_announcements_createdBy` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `notes`
CREATE TABLE `notes` (
  `id` VARCHAR(255) NOT NULL,
  `title` TEXT NOT NULL,
  `classId` VARCHAR(255) DEFAULT NULL,
  `fileUrl` TEXT DEFAULT NULL,
  `originalName` TEXT DEFAULT NULL,
  `fileType` TEXT DEFAULT NULL,
  `uploadedBy` TEXT DEFAULT NULL,
  `uploaderId` VARCHAR(255) DEFAULT NULL,
  `uploadedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notes_class` FOREIGN KEY (`classId`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_uploader` FOREIGN KEY (`uploaderId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `messages`
CREATE TABLE `messages` (
  `id` VARCHAR(255) NOT NULL,
  `studentId` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `adminReply` TEXT DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'unread',
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_messages_student` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `notifications`
CREATE TABLE `notifications` (
  `id` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `type` TEXT NOT NULL,
  `message` TEXT NOT NULL,
  `relatedPaymentId` TEXT DEFAULT NULL,
  `read` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `papers`
CREATE TABLE `papers` (
  `id` VARCHAR(255) NOT NULL,
  `title` TEXT NOT NULL,
  `grade` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'Paper',
  `topic` TEXT DEFAULT NULL,
  `classId` VARCHAR(255) DEFAULT NULL,
  `fileUrl` TEXT NOT NULL,
  `originalName` TEXT DEFAULT NULL,
  `filePublicId` TEXT DEFAULT NULL,
  `teacherId` VARCHAR(255) DEFAULT NULL,
  `downloads` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `payments`
CREATE TABLE `payments` (
  `id` VARCHAR(255) NOT NULL,
  `userId` VARCHAR(255) NOT NULL,
  `classId` VARCHAR(255) DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `method` VARCHAR(50) DEFAULT NULL,
  `receiptUrl` TEXT DEFAULT NULL,
  `approvalStatus` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `month` VARCHAR(50) DEFAULT NULL,
  `year` VARCHAR(50) DEFAULT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table `videos`
CREATE TABLE `videos` (
  `id` VARCHAR(255) NOT NULL,
  `title` TEXT NOT NULL,
  `videoUrl` TEXT NOT NULL,
  `thumbnailUrl` TEXT DEFAULT NULL,
  `grade` TEXT DEFAULT NULL,
  `subject` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `classId` VARCHAR(255) DEFAULT NULL,
  `teacherId` VARCHAR(255) DEFAULT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
