
CREATE TABLE IF NOT EXISTS `ANDROID` (
	`id` int auto_increment primary key,
    `email` varchar(50) unique,
    `celular` varchar(15)
) DEFAULT CHARSET=utf8;