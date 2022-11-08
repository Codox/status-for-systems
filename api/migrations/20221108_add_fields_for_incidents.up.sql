-- Create lookup table for incident statuses
CREATE TABLE IF NOT EXISTS `incident_status` (
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
INSERT INTO `incident_status` (`uuid`, `name`) VALUES (UUID(), 'Investigating');
INSERT INTO `incident_status` (`uuid`, `name`) VALUES (UUID(), 'Identified');
INSERT INTO `incident_status` (`uuid`, `name`) VALUES (UUID(), 'Monitoring');
INSERT INTO `incident_status` (`uuid`, `name`) VALUES (UUID(), 'Resolved');

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
  CONSTRAINT `fk_systems_system_groups_id`
  FOREIGN KEY (`group_id`)
  REFERENCES `status_for_systems`.`system_groups` (`id`)
  ENGINE = InnoDB;

