/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS `PROD_SUG` (
  `idp` INT(11) NOT NULL,
  `ids` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`ids`, `idp`)
)
DEFAULT CHARACTER SET = utf8;

alter table PRODUCTO
add column `sug` varchar(128);