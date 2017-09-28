-- MySQL dump 10.13  Distrib 5.7.16, for Linux (x86_64)
--
-- Host: zonngoserver.ctohksbyei9h.us-west-2.rds.amazonaws.com    Database: medicine
-- ------------------------------------------------------
-- Server version	5.7.11-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `FARMACIA`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `FARMACIA` (
  `id` int(11) NOT NULL,
  `estado` char(1) DEFAULT NULL,
  `tipo_est` char(1) DEFAULT NULL,
  `nombre` varchar(105) DEFAULT NULL,
  `ubigeo` char(6) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `horario` varchar(301) DEFAULT NULL,
  `dtecnico` varchar(150) DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `distrito` varchar(50) DEFAULT NULL,
  `departamento` varchar(50) DEFAULT NULL,
  `ruc` varchar(15) DEFAULT NULL,
  `situacion` varchar(50) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `razonSocial` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FAVORITE`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `FAVORITE` (
  `idUser` varchar(15) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idUser`,`idProducto`),
  CONSTRAINT `FAVORITE_ibfk_1` FOREIGN KEY (`idProducto`) REFERENCES `PRODUCTO` (`id`)
) DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LABORATORIO`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `LABORATORIO` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PERSONAL`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `PERSONAL` (
  `idF` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `cargo` varchar(50) DEFAULT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `horario` varchar(300) DEFAULT NULL,
  `tipo` int(11) NOT NULL,
  PRIMARY KEY (`nombre`,`idF`,`tipo`),
  CONSTRAINT `PERSONAL_ibfk_1` FOREIGN KEY (`idF`) REFERENCES `FARMACIA` (`id`),
  CONSTRAINT `PERSONAL_ibfk_2` FOREIGN KEY (`tipo`) REFERENCES `TIPO_PERSONAL` (`id`)
) DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PRESENTACION`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `PRESENTACION` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `descripcion` (`descripcion`)
) DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PRODUCTO`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `PRODUCTO` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `concent` varchar(100) DEFAULT NULL,
  `tp_pre` int(11) DEFAULT NULL,
  `tp_pre_si` int(11) DEFAULT NULL,
  `fracciones` int(11) DEFAULT NULL,
  `reg_san` int(11) DEFAULT NULL,
  `laboratorio` int(11) DEFAULT NULL,
  `presentacion` int(11) DEFAULT NULL,
  `estado` char(1) DEFAULT NULL,
  `condicionV` varchar(35) DEFAULT NULL,
  `tipo` varchar(35) DEFAULT NULL,
  `fabricante` varchar(35) DEFAULT NULL,
  `Situacion` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_PRESENTACION` FOREIGN KEY (`presentacion`) REFERENCES `PRESENTACION` (`id`),
  CONSTRAINT `PRODUCTO_ibfk_1` FOREIGN KEY (`tp_pre`) REFERENCES `TIPO_PRESENTACION` (`id`),
  CONSTRAINT `PRODUCTO_ibfk_2` FOREIGN KEY (`tp_pre_si`) REFERENCES `TIPO_PRESENTACION` (`id`),
  CONSTRAINT `PRODUCTO_ibfk_3` FOREIGN KEY (`reg_san`) REFERENCES `REG_SAN` (`id`),
  CONSTRAINT `PRODUCTO_ibfk_4` FOREIGN KEY (`laboratorio`) REFERENCES `LABORATORIO` (`id`)
) DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PROD_FARM`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `PROD_FARM` (
  `idP` int(11) NOT NULL,
  `idF` int(11) NOT NULL,
  `fecha_act` datetime DEFAULT NULL,
  `precio` float DEFAULT NULL,
  PRIMARY KEY (`idP`,`idF`),
  CONSTRAINT `PROD_FARM_ibfk_1` FOREIGN KEY (`idP`) REFERENCES `PRODUCTO` (`id`),
  CONSTRAINT `PROD_FARM_ibfk_2` FOREIGN KEY (`idF`) REFERENCES `FARMACIA` (`id`)
) DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `REG_SAN`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `REG_SAN` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(13) DEFAULT NULL,
  `vencimiento` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`)
) DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TIPO_PERSONAL`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `TIPO_PERSONAL` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(35) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TIPO_PRESENTACION`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE IF NOT EXISTS `TIPO_PRESENTACION` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(70) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`descripcion`),
  UNIQUE KEY `descripcion` (`descripcion`)
) DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-12-29 23:45:04
