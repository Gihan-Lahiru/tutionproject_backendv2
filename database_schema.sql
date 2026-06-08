-- ============================================================
-- Tuition Sir LMS - Complete Database Schema (MySQL)
-- Generated from TypeORM entities (synchronize: false)
-- ============================================================

-- Disable foreign key checks for clean table recreation
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- DROP EXISTING TABLES (Order matters: dependents first)
-- ============================================================
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

-- ============================================================
-- TABLE: users
-- Core user table for students, teachers, and admins.
-- @Entity('users')
-- ============================================================
CREATE TABLE `users` (
  `id`                      VARCHAR(255)    NOT NULL,
  `email`                   VARCHAR(255)    NOT NULL,
  `password`                TEXT            NOT NULL,
  `name`                    TEXT            NOT NULL,
  `role`                    VARCHAR(50)     NOT NULL DEFAULT 'student',
  `profilePicture`          TEXT            DEFAULT NULL,
  `tuitionClass`            TEXT            DEFAULT NULL,
  `grade`                   TEXT            DEFAULT NULL,
  `phone`                   TEXT            DEFAULT NULL,
  `institute`               TEXT            DEFAULT NULL,
  `emailVerificationCode`   TEXT            DEFAULT NULL,
  `emailVerified`           BOOLEAN         NOT NULL DEFAULT 1,
  `approvalStatus`          VARCHAR(50)     NOT NULL DEFAULT 'pending',
  `status`                  VARCHAR(50)     NOT NULL DEFAULT 'active',
  `paymentStatus`           VARCHAR(50)     NOT NULL DEFAULT 'unpaid',
  `paymentDueDate`          DATETIME        DEFAULT NULL,
  `dashboardAccess`         BOOLEAN         NOT NULL DEFAULT 1,
  `currentSessionId`        TEXT            DEFAULT NULL,
  `createdAt`               DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt`               DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: classes
-- Classes created by teachers.
-- @Entity('classes')
-- ============================================================
CREATE TABLE `classes` (
  `id`          VARCHAR(255)    NOT NULL,
  `name`        TEXT            NOT NULL,
  `title`       TEXT            DEFAULT NULL,
  `grade`       TEXT            NOT NULL,
  `subject`     TEXT            NOT NULL,
  `day`         TEXT            DEFAULT NULL,
  `time`        TEXT            DEFAULT NULL,
  `fee`         INT             DEFAULT NULL,
  `description` TEXT            DEFAULT NULL,
  `location`    TEXT            DEFAULT NULL,
  `teacherId`   VARCHAR(255)    DEFAULT NULL,
  `createdAt`   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt`   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_classes_teacher` (`teacherId`),
  CONSTRAINT `fk_classes_teacher` FOREIGN KEY (`teacherId`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: class_students (ManyToMany join table)
-- Links students to classes via @JoinTable.
-- @Entity('classes').students
-- ============================================================
CREATE TABLE `class_students` (
  `classesId`   VARCHAR(255)    NOT NULL,
  `usersId`     VARCHAR(255)    NOT NULL,
  PRIMARY KEY (`classesId`, `usersId`),
  INDEX `idx_cs_user` (`usersId`),
  CONSTRAINT `fk_class_students_class` FOREIGN KEY (`classesId`)
    REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_class_students_user` FOREIGN KEY (`usersId`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: assignments
-- Assignments belong to a class and are created by a user.
-- @Entity('assignments')
-- ============================================================
CREATE TABLE `assignments` (
  `id`            VARCHAR(255)    NOT NULL,
  `classId`       VARCHAR(255)    NOT NULL,
  `title`         TEXT            NOT NULL,
  `description`   TEXT            DEFAULT NULL,
  `dueDate`       DATETIME        DEFAULT NULL,
  `attachmentUrl` TEXT            DEFAULT NULL,
  `createdAt`     DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `createdById`   VARCHAR(255)    DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_assignments_class` (`classId`),
  INDEX `idx_assignments_creator` (`createdById`),
  CONSTRAINT `fk_assignments_class` FOREIGN KEY (`classId`)
    REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignments_createdBy` FOREIGN KEY (`createdById`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: submissions
-- Student submissions for an assignment.
-- @Entity('submissions')
-- ============================================================
CREATE TABLE `submissions` (
  `id`            VARCHAR(255)    NOT NULL,
  `assignmentId`  VARCHAR(255)    NOT NULL,
  `studentId`     VARCHAR(255)    NOT NULL,
  `fileUrl`       TEXT            DEFAULT NULL,
  `remarks`       TEXT            DEFAULT NULL,
  `marks`         INT             DEFAULT NULL,
  `submittedAt`   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_submissions_assignment_student` (`assignmentId`, `studentId`),
  INDEX `idx_submissions_student` (`studentId`),
  CONSTRAINT `fk_submissions_assignment` FOREIGN KEY (`assignmentId`)
    REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_submissions_student` FOREIGN KEY (`studentId`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: announcements
-- Class announcements posted by teachers/admins.
-- @Entity('announcements')
-- ============================================================
CREATE TABLE `announcements` (
  `id`            VARCHAR(255)    NOT NULL,
  `classId`       VARCHAR(255)    NOT NULL,
  `message`       TEXT            NOT NULL,
  `createdById`   VARCHAR(255)    DEFAULT NULL,
  `createdAt`     DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt`     DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_announcements_class` (`classId`),
  INDEX `idx_announcements_creator` (`createdById`),
  CONSTRAINT `fk_announcements_class` FOREIGN KEY (`classId`)
    REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_announcements_createdBy` FOREIGN KEY (`createdById`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: notes
-- Study notes uploaded for a class.
-- @Entity('notes')
-- ============================================================
CREATE TABLE `notes` (
  `id`            VARCHAR(255)    NOT NULL,
  `title`         TEXT            NOT NULL,
  `classId`       VARCHAR(255)    DEFAULT NULL,
  `fileUrl`       TEXT            DEFAULT NULL,
  `originalName`  TEXT            DEFAULT NULL,
  `fileType`      TEXT            DEFAULT NULL,
  `uploadedBy`    TEXT            DEFAULT NULL,
  `uploaderId`    VARCHAR(255)    DEFAULT NULL,
  `uploadedAt`    DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `createdAt`     DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_notes_class` (`classId`),
  INDEX `idx_notes_uploader` (`uploaderId`),
  CONSTRAINT `fk_notes_class` FOREIGN KEY (`classId`)
    REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_uploader` FOREIGN KEY (`uploaderId`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: messages
-- Student messages / support inquiries with admin replies.
-- @Entity('messages')
-- ============================================================
CREATE TABLE `messages` (
  `id`          VARCHAR(255)    NOT NULL,
  `studentId`   VARCHAR(255)    NOT NULL,
  `message`     TEXT            NOT NULL,
  `adminReply`  TEXT            DEFAULT NULL,
  `status`      VARCHAR(50)     NOT NULL DEFAULT 'unread',
  `createdAt`   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt`   DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_messages_student` (`studentId`),
  CONSTRAINT `fk_messages_student` FOREIGN KEY (`studentId`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: notifications
-- User notifications (payment reminders, system alerts, etc.).
-- @Entity('notifications')
-- ============================================================
CREATE TABLE `notifications` (
  `id`                VARCHAR(255)    NOT NULL,
  `userId`            VARCHAR(255)    NOT NULL,
  `type`              TEXT            NOT NULL,
  `message`           TEXT            NOT NULL,
  `relatedPaymentId`  TEXT            DEFAULT NULL,
  `read`              INT             NOT NULL DEFAULT 0,
  `createdAt`         DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user` (`userId`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: papers
-- Past papers and worksheets uploaded for students.
-- @Entity('papers')
-- ============================================================
CREATE TABLE `papers` (
  `id`              VARCHAR(255)    NOT NULL,
  `title`           TEXT            NOT NULL,
  `grade`           TEXT            NOT NULL,
  `type`            VARCHAR(50)     NOT NULL DEFAULT 'Paper',
  `topic`           TEXT            DEFAULT NULL,
  `classId`         VARCHAR(255)    DEFAULT NULL,
  `fileUrl`         TEXT            NOT NULL,
  `originalName`    TEXT            DEFAULT NULL,
  `filePublicId`    TEXT            DEFAULT NULL,
  `teacherId`       VARCHAR(255)    DEFAULT NULL,
  `downloads`       INT             NOT NULL DEFAULT 0,
  `createdAt`       DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_papers_class` (`classId`),
  INDEX `idx_papers_grade` (`grade`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: payments
-- Student payment records with approval workflow.
-- @Entity('payments')
-- ============================================================
CREATE TABLE `payments` (
  `id`              VARCHAR(255)    NOT NULL,
  `userId`          VARCHAR(255)    NOT NULL,
  `classId`         VARCHAR(255)    DEFAULT NULL,
  `amount`          DECIMAL(10,2)   NOT NULL,
  `status`          VARCHAR(50)     NOT NULL DEFAULT 'pending',
  `method`          VARCHAR(50)     DEFAULT NULL,
  `receiptUrl`      TEXT            DEFAULT NULL,
  `approvalStatus`  VARCHAR(50)     NOT NULL DEFAULT 'pending',
  `month`           VARCHAR(50)     DEFAULT NULL,
  `year`            VARCHAR(50)     DEFAULT NULL,
  `createdAt`       DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt`       DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_payments_user` (`userId`),
  INDEX `idx_payments_status` (`status`),
  INDEX `idx_payments_approval` (`approvalStatus`),
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: videos
-- Educational videos uploaded for streaming.
-- @Entity('videos')
-- ============================================================
CREATE TABLE `videos` (
  `id`            VARCHAR(255)    NOT NULL,
  `title`         TEXT            NOT NULL,
  `videoUrl`      TEXT            NOT NULL,
  `thumbnailUrl`  TEXT            DEFAULT NULL,
  `grade`         TEXT            DEFAULT NULL,
  `subject`       TEXT            DEFAULT NULL,
  `description`   TEXT            DEFAULT NULL,
  `classId`       VARCHAR(255)    DEFAULT NULL,
  `teacherId`     VARCHAR(255)    DEFAULT NULL,
  `createdAt`     DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt`     DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `idx_videos_class` (`classId`),
  INDEX `idx_videos_teacher` (`teacherId`),
  INDEX `idx_videos_grade` (`grade`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- QUICK VERIFICATION QUERIES
-- ============================================================
-- List all tables:
--   SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE();
--
-- Describe a table:
--   DESCRIBE users;
--
-- Show CREATE TABLE statement:
--   SHOW CREATE TABLE users;
--
-- Check foreign keys:
--   SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
--   FROM information_schema.KEY_COLUMN_USAGE
--   WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL;