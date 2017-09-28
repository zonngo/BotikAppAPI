CREATE TABLE IF NOT EXISTS `NOTIFICATIONS` (
  `id`         INT(11) PRIMARY KEY AUTO_INCREMENT,
  `fecha`      DATETIME            DEFAULT CURRENT_TIMESTAMP,
  `message`    VARCHAR(256) NULL,
  `image_link` VARCHAR(256) NULL,
  `type`       CHAR(1)      NULL
)
  DEFAULT CHARACTER SET = utf8;


CREATE TABLE IF NOT EXISTS `NOTI_USER` (
  `id_notification` INT(11)     NOT NULL,
  `id_user`         VARCHAR(15) NOT NULL,
  `estado`          CHAR(1)     NOT NULL,
  `fecha`           DATETIME    NULL,
  PRIMARY KEY (`id_notification`, `id_user`),
  INDEX `fk_NOTI_USER_NOTIFICATIONS1_idx` (`id_notification`, `id_user` ASC),
  CONSTRAINT `fk_NOTI_USER_NOTIFICATIONS1`
  FOREIGN KEY (`id_notification`)
  REFERENCES `NOTIFICATIONS` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
)
  DEFAULT CHARACTER SET = utf8;
