-- Create lookup table for incident statuses
CREATE TABLE IF NOT EXISTS `incident_statuses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC) VISIBLE)
  UNIQUE INDEX `name_UNIQUE` (`uuid` ASC) VISIBLE)
  ENGINE = InnoDB;

-- Insert static data
INSERT INTO `incident_statuses` (`uuid`, `name`) VALUES (UUID(), 'Investigating');
INSERT INTO `incident_statuses` (`uuid`, `name`) VALUES (UUID(), 'Identified');
INSERT INTO `incident_statuses` (`uuid`, `name`) VALUES (UUID(), 'Monitoring');
INSERT INTO `incident_statuses` (`uuid`, `name`) VALUES (UUID(), 'Resolved');

-- Create incidents table
CREATE TABLE IF NOT EXISTS `incidents` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `incident_status_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC) VISIBLE)
  CONSTRAINT `fk_incidents_incident_status_id`
  FOREIGN KEY (`incident_status_id`)
  REFERENCES `incident_statuses` (`id`)
  ENGINE = InnoDB;

-- Create incident updates table
CREATE TABLE IF NOT EXISTS `incident_updates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL,
  `incident_id` INT UNSIGNED NOT NULL,
  `incident_status_id` INT UNSIGNED NOT NULL,
  `body` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC) VISIBLE)
  CONSTRAINT `fk_incident_updates_incident_id`
  FOREIGN KEY (`incident_id`)
  REFERENCES `incidents` (`id`)
  CONSTRAINT `fk_incident_updates_incident_status_id`
  FOREIGN KEY (`incident_status_id`)
  REFERENCES `incident_statuses` (`id`)
  ENGINE = InnoDB;

-- Create incident systems table
CREATE TABLE IF NOT EXISTS `incident_systems` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL,
  `incident_id` INT UNSIGNED NOT NULL,
  `system_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC) VISIBLE)
  CONSTRAINT `fk_incident_systems_incident_id`
  FOREIGN KEY (`incident_id`)
  REFERENCES `incidents` (`id`)
  CONSTRAINT `fk_incident_systems_system_id`
  FOREIGN KEY (`system_id`)
  REFERENCES `systems` (`id`)
  ENGINE = InnoDB;
