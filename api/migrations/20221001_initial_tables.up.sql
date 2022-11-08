-- -----------------------------------------------------
-- Table `system_groups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_groups` (
                                             `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                             `uuid` VARCHAR(36) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC))
  ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `system_statuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_statuses` (
                                               `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                               `uuid` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC))
  ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `systems`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `systems` (
                                       `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                       `uuid` VARCHAR(36) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `group_id` INT UNSIGNED NOT NULL,
  `system_status_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC),
  INDEX `fk_systems_system_groups_id_idx` (`group_id` ASC),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC),
  INDEX `fk_systems_system_statuses_idx` (`system_status_id` ASC),
  CONSTRAINT `fk_systems_system_groups_id`
  FOREIGN KEY (`group_id`)
  REFERENCES `system_groups` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
  CONSTRAINT `fk_systems_system_statuses`
  FOREIGN KEY (`system_status_id`)
  REFERENCES `system_statuses` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION)
  ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `incident_statuses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `incident_statuses` (
                                                 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                                 `uuid` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC))
  ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `incidents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `incidents` (
                                         `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                         `uuid` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `incident_status_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC),
  INDEX `fk_incidents_incident_status_id_idx` (`incident_status_id` ASC),
  CONSTRAINT `fk_incidents_incident_status_id`
  FOREIGN KEY (`incident_status_id`)
  REFERENCES `incident_statuses` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION)
  ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `incident_updates`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `incident_updates` (
                                                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                                `uuid` VARCHAR(36) NOT NULL,
  `update` TEXT NOT NULL,
  `incident_id` INT UNSIGNED NOT NULL,
  `incident_status_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC),
  INDEX `fk_ incident_updates_incident_status_id_idx` (`incident_status_id` ASC),
  INDEX `fk_ incident_updates_incident_id_idx` (`incident_id` ASC),
  CONSTRAINT `fk_incident_updates_incident_status_id`
  FOREIGN KEY (`incident_status_id`)
  REFERENCES `incident_statuses` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
  CONSTRAINT `fk_incident_updates_incident_id`
  FOREIGN KEY (`incident_id`)
  REFERENCES `incidents` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION)
  ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `incident_systems`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `incident_systems` (
                                                `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
                                                `uuid` VARCHAR(36) NOT NULL,
  `incident_id` INT UNSIGNED NOT NULL,
  `system_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC),
  INDEX `fk_incident_systems_incident_id_idx` (`incident_id` ASC),
  INDEX `fk_incident_systems_system_id_idx` (`system_id` ASC),
  CONSTRAINT `fk_incident_systems_incident_id`
  FOREIGN KEY (`incident_id`)
  REFERENCES `incidents` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
  CONSTRAINT `fk_incident_systems_system_id`
  FOREIGN KEY (`system_id`)
  REFERENCES `systems` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION)
  ENGINE = InnoDB;
