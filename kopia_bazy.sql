-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: it_assets_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '79a4d41f-fa88-11f0-8d43-d843ae6ad709:1-530';

--
-- Table structure for table `assethistories`
--

DROP TABLE IF EXISTS `assethistories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assethistories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(255) NOT NULL,
  `description` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `AssetId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `AssetId` (`AssetId`),
  CONSTRAINT `assethistories_ibfk_1` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_10` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_11` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_12` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_13` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_14` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_15` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_16` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_17` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_18` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_19` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_2` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_20` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_21` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_22` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_23` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_24` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_25` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_26` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_3` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_4` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_5` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_6` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_7` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_8` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assethistories_ibfk_9` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assethistories`
--

LOCK TABLES `assethistories` WRITE;
/*!40000 ALTER TABLE `assethistories` DISABLE KEYS */;
INSERT INTO `assethistories` VALUES (1,'UTWORZENIE','Dodano sprzęt: HP EliteBook (AVAILABLE)','2026-02-03 20:25:39','2026-02-03 20:25:39',NULL),(2,'EDYCJA','Zmiana statusu: AVAILABLE -> ASSIGNED','2026-02-03 20:29:06','2026-02-03 20:29:06',NULL),(3,'UTWORZENIE','Dodano sprzęt: asdawd (ASSIGNED)','2026-02-03 20:35:55','2026-02-03 20:35:55',NULL),(4,'EDYCJA','Zmiana statusu: ASSIGNED -> AVAILABLE','2026-02-03 20:36:02','2026-02-03 20:36:02',NULL),(5,'EDYCJA','Zmiana statusu: AVAILABLE -> ASSIGNED','2026-02-03 21:27:08','2026-02-03 21:27:08',NULL),(6,'EDYCJA','Zaktualizowano dane.','2026-02-03 21:31:57','2026-02-03 21:31:57',NULL),(7,'EDYCJA','Zaktualizowano dane. (Przypisano do: Jakub Cieślak)','2026-02-03 21:40:06','2026-02-03 21:40:06',NULL),(8,'EDYCJA','Zaktualizowano dane. (Przypisano do: Jan Kowalski)','2026-02-03 21:40:55','2026-02-03 21:40:55',NULL),(9,'UTWORZENIE','Dodano sprzęt: Lenovo T14 (BROKEN)','2026-02-03 23:03:07','2026-02-03 23:03:07',8),(10,'EDYCJA','Zmiana statusu: BROKEN -> AVAILABLE','2026-02-03 23:03:17','2026-02-03 23:03:17',8),(11,'EDYCJA','Zmiana statusu: AVAILABLE -> ASSIGNED (Przypisano do: )','2026-02-03 23:03:27','2026-02-03 23:03:27',8),(12,'EDYCJA','Zaktualizowano dane. (Przypisano do: Jan Kowalski)','2026-02-03 23:03:30','2026-02-03 23:03:30',8),(13,'EDYCJA','Zmiana statusu: ASSIGNED -> AVAILABLE','2026-02-03 23:03:34','2026-02-03 23:03:34',8),(14,'EDYCJA','Zmiana statusu: AVAILABLE -> ASSIGNED (Przypisano do: Jakub Cieślak)','2026-02-03 23:03:38','2026-02-03 23:03:38',8),(15,'UTWORZENIE','Dodano sprzęt: asda (ASSIGNED)','2026-02-03 23:07:25','2026-02-03 23:07:25',NULL),(16,'UTWORZENIE','Dodano sprzęt: asd (AVAILABLE)','2026-02-03 23:07:29','2026-02-03 23:07:29',NULL),(17,'EDYCJA','Zmiana statusu: AVAILABLE -> ASSIGNED (Przypisano do: Jan Kowalski)','2026-02-03 23:07:41','2026-02-03 23:07:41',NULL),(18,'EDYCJA','Zmiana statusu: ASSIGNED -> AVAILABLE (Przypisano do: Brak), Zmiana użytkownika: Jakub Cieślak -> null','2026-02-05 14:48:56','2026-02-05 14:48:56',8),(19,'UTWORZENIE','Dodano: undefined Lenovo ThinkPad T14 (ASSIGNED)','2026-02-05 14:52:22','2026-02-05 14:52:22',13),(20,'EDYCJA','Zmiana statusu: ASSIGNED -> AVAILABLE (Przypisano do: Brak), Zmiana użytkownika: Jakub Cieślak -> null','2026-02-05 14:52:34','2026-02-05 14:52:34',13),(21,'UTWORZENIE','Dodano: undefined Dell P2422H (AVAILABLE)','2026-02-05 14:57:14','2026-02-05 14:57:14',NULL),(22,'UTWORZENIE','Dodano: undefined Lenovo ThinkPad T14 (AVAILABLE)','2026-02-05 15:02:00','2026-02-05 15:02:00',15),(23,'UTWORZENIE','Dodano: undefined HP EliteBook 840 (AVAILABLE)','2026-02-05 15:02:16','2026-02-05 15:02:16',16),(24,'UTWORZENIE','Dodano: undefined Dell P2422H (AVAILABLE)','2026-02-05 15:02:39','2026-02-05 15:02:39',17),(25,'UTWORZENIE','Dodano: undefined Apple iPhone 15 (AVAILABLE)','2026-02-05 15:02:47','2026-02-05 15:02:47',18),(26,'UTWORZENIE','Dodano: undefined Lenovo ThinkPad Universal USB-C Dock (ASSIGNED)','2026-02-05 15:03:05','2026-02-05 15:03:05',19),(27,'EDYCJA','Zmiana statusu: AVAILABLE -> ASSIGNED (Przypisano do: Jan Kowalski), Zmiana użytkownika: null -> Jan Kowalski','2026-02-05 15:03:10','2026-02-05 15:03:10',13),(28,'EDYCJA','Zmiana statusu: AVAILABLE -> ASSIGNED (Przypisano do: Jan Kowalski), Zmiana użytkownika: null -> Jan Kowalski','2026-02-05 15:03:19','2026-02-05 15:03:19',18);
/*!40000 ALTER TABLE `assethistories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `serialNumber` varchar(255) NOT NULL,
  `status` enum('AVAILABLE','ASSIGNED','BROKEN') DEFAULT 'AVAILABLE',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `assignedTo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serialNumber` (`serialNumber`),
  UNIQUE KEY `serialNumber_2` (`serialNumber`),
  UNIQUE KEY `serialNumber_3` (`serialNumber`),
  UNIQUE KEY `serialNumber_4` (`serialNumber`),
  UNIQUE KEY `serialNumber_5` (`serialNumber`),
  UNIQUE KEY `serialNumber_6` (`serialNumber`),
  UNIQUE KEY `serialNumber_7` (`serialNumber`),
  UNIQUE KEY `serialNumber_8` (`serialNumber`),
  UNIQUE KEY `serialNumber_9` (`serialNumber`),
  UNIQUE KEY `serialNumber_10` (`serialNumber`),
  UNIQUE KEY `serialNumber_11` (`serialNumber`),
  UNIQUE KEY `serialNumber_12` (`serialNumber`),
  UNIQUE KEY `serialNumber_13` (`serialNumber`),
  UNIQUE KEY `serialNumber_14` (`serialNumber`),
  UNIQUE KEY `serialNumber_15` (`serialNumber`),
  UNIQUE KEY `serialNumber_16` (`serialNumber`),
  UNIQUE KEY `serialNumber_17` (`serialNumber`),
  UNIQUE KEY `serialNumber_18` (`serialNumber`),
  UNIQUE KEY `serialNumber_19` (`serialNumber`),
  UNIQUE KEY `serialNumber_20` (`serialNumber`),
  UNIQUE KEY `serialNumber_21` (`serialNumber`),
  UNIQUE KEY `serialNumber_22` (`serialNumber`),
  UNIQUE KEY `serialNumber_23` (`serialNumber`),
  UNIQUE KEY `serialNumber_24` (`serialNumber`),
  UNIQUE KEY `serialNumber_25` (`serialNumber`),
  UNIQUE KEY `serialNumber_26` (`serialNumber`),
  UNIQUE KEY `serialNumber_27` (`serialNumber`),
  UNIQUE KEY `serialNumber_28` (`serialNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (8,'Lenovo T14','SN-XXXXX','AVAILABLE','2026-02-03 23:03:07','2026-02-05 14:48:56',NULL),(13,'Lenovo ThinkPad T14','SN-PF2RD45','ASSIGNED','2026-02-05 14:52:22','2026-02-05 15:03:10','Jan Kowalski'),(15,'Lenovo ThinkPad T14','PF2REASD','AVAILABLE','2026-02-05 15:02:00','2026-02-05 15:02:00',NULL),(16,'HP EliteBook 840','NB43DSA','AVAILABLE','2026-02-05 15:02:16','2026-02-05 15:02:16',NULL),(17,'Dell P2422H','asdwads','AVAILABLE','2026-02-05 15:02:39','2026-02-05 15:02:39',NULL),(18,'Apple iPhone 15','wadsaf','ASSIGNED','2026-02-05 15:02:47','2026-02-05 15:03:19','Jan Kowalski'),(19,'Lenovo ThinkPad Universal USB-C Dock','awdasdaw','ASSIGNED','2026-02-05 15:03:05','2026-02-05 15:03:05','Jan Kowalski');
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fullName` (`fullName`),
  UNIQUE KEY `fullName_2` (`fullName`),
  UNIQUE KEY `fullName_3` (`fullName`),
  UNIQUE KEY `fullName_4` (`fullName`),
  UNIQUE KEY `fullName_5` (`fullName`),
  UNIQUE KEY `fullName_6` (`fullName`),
  UNIQUE KEY `fullName_7` (`fullName`),
  UNIQUE KEY `fullName_8` (`fullName`),
  UNIQUE KEY `fullName_9` (`fullName`),
  UNIQUE KEY `fullName_10` (`fullName`),
  UNIQUE KEY `fullName_11` (`fullName`),
  UNIQUE KEY `fullName_12` (`fullName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issues`
--

DROP TABLE IF EXISTS `issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `priority` enum('LOW','NORMAL','HIGH') DEFAULT 'NORMAL',
  `status` enum('OPEN','IN_PROGRESS','CLOSED') DEFAULT 'OPEN',
  `reportedBy` varchar(255) NOT NULL,
  `userEmail` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `AssetId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `AssetId` (`AssetId`),
  CONSTRAINT `issues_ibfk_1` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `issues_ibfk_2` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `issues_ibfk_3` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `issues_ibfk_4` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `issues_ibfk_5` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `issues_ibfk_6` FOREIGN KEY (`AssetId`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issues`
--

LOCK TABLES `issues` WRITE;
/*!40000 ALTER TABLE `issues` DISABLE KEYS */;
/*!40000 ALTER TABLE `issues` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-05 17:21:59
