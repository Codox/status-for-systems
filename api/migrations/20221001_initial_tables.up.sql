CREATE TABLE IF NOT EXISTS `status_for_systems`.`system_groups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC)),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC),
  ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `status_for_systems`.`systems` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `uuid` VARCHAR(36) NOT NULL,
  `group_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC),
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC),
  INDEX `fk_systems_system_groups_id_idx` (`group_id` ASC),
  CONSTRAINT `fk_systems_system_groups_id`
  FOREIGN KEY (`group_id`)
  REFERENCES `status_for_systems`.`system_groups` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION)
  ENGINE = InnoDB
