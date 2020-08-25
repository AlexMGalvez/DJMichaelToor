-- MySQL dump 10.13  Distrib 8.0.16, for Win64 (x86_64)
--
-- Host: us-cdbr-iron-east-02.cleardb.net    Database: heroku_4b0085b1b13bf5b
-- ------------------------------------------------------
-- Server version	5.5.62-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `place` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `map_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locations`
--

LOCK TABLES `locations` WRITE;
/*!40000 ALTER TABLE `locations` DISABLE KEYS */;
INSERT INTO `locations` VALUES (1,'Phil\'s Grandson\'s Place','220 King Street North Waterloo, ON, N2J 2Y7 Canada','https://www.google.com/maps?q=220+King+Street+North+Waterloo,+ON,+N2J+2Y7+Canada'),(2,'District Nightclub','667 King Street West Kitchener, ON, N2G 1C9 Canada','https://www.google.com/maps?q=667+King+Street+West+Kitchener,+ON,+N2G+1C9+Canada'),(3,'St. Benedict Catholic Secondary School','50 Saginaw Parkway Cambridge, ON, N1T 1Z2 Canada','https://www.google.com/maps?q=50+Saginaw+Parkway+Cambridge,+ON,+N1T+1Z2+Canada'),(4,'Hillcrest Mall','9350 Yonge Street Richmond Hill, ON, L4C 5G2','https://www.google.com/maps/place/9350+Yonge+St,+Richmond+Hill,+ON+L4C+5G2/@43.8548902,-79.4370661,17z/data=!3m1!4b1!4m5!3m4!1s0x882b2ba371f66c69:0x85425b8632dcd10d!8m2!3d43.8548902!4d-79.4348774'),(5,'Stone Road Mall','435 Stone Road West Guelph, ON, N1G 2Y6 Canada','https://www.google.com/maps?q=435+Stone+Road+West+Guelph,+ON,+N1G+2Y6+Canada'),(6,'CF Markville','5000 Highway 7 Markham, ON, L3R 4M9 Canada','https://www.google.com/maps?q=5000+Highway+7+Markham,+ON,+L3R+4M9+Canada'),(9,'Erin Mills Town Centre','5100 Erin Mills Parkway Mississauga, ON, L5M 4Z5 Canada','https://www.google.com/maps?q=5100+Erin+Mills+Parkway+Mississauga,+ON,+L5M+4Z5+Canada'),(10,'Upper Canada Mall','17600 Yonge Street Newmarket, ON, L3Y 4Z1 Canada','https://www.google.com/maps?q=17600+Yonge+Street+Newmarket,+ON,+L3Y+4Z1+Canada'),(11,'Olive \'R Twist','130 King Street London, ON, N6A 1C3 Canada','https://www.google.com/maps?q=130+King+Street+London,+ON,+N6A+1C3+Canada'),(12,'Red Rose Convention Centre','1233 Derry Road East Mississauga, ON, L5T 1B6 Canada','https://www.google.com/maps?q=1233+Derry+Road+East+Mississauga,+ON,+L5T+1B6+Canada'),(13,'Turkey Point Hotel','93 Cedar Drive Turkey Point, ON, N0E 1T0 Canada','https://www.google.com/maps?q=93+Cedar+Drive+Turkey+Point,+ON,+N0E+1T0+Canada'),(14,'Private Residence','Green Acres Drive Waterloo, ON, N2K Canada','https://www.google.com/maps?q=Green+Acres+Drive+Waterloo,+ON,+N2K+Canada'),(15,'The Bombshelter Pub','200 University Avenue West Waterloo, ON, N2L 3G1 Canada','https://www.google.com/maps?q=200+University+Avenue+West+Waterloo,+ON,+N2L+3G1+Canada'),(16,'White Carnation Banquet Hall','79867 Parr Line Clinton, ON, N0M 1L0 Canada','https://www.google.com/maps?q=79867+Parr+Line+Clinton,+ON,+N0M+1L0+Canada'),(17,'Trappers Alley','98 Carden Street Guelph, ON, N1H 3A3 Canada','https://www.google.com/maps?q=98+Carden+Street+Guelph,+ON,+N1H+3A3+Canada'),(18,'Beertown Public House Cambridge','561 Hespeler Road #1A Cambridge, ON, N1R 6J4 Canada','https://www.google.com/maps?q=561+Hespeler+Road+#1A%20Cambridge,%20ON,%20N1R%206J4%20Canada'),(19,'Promenade Shopping Centre','1 Promenade Circle Thornhill, ON, L4J 4P8 Canada','http://maps.google.com/?q=1%20Promenade%20Circle%20Thornhill,%20ON,%20L4J%204P8%20Canada'),(20,'The Turret','75 University Avenue West Waterloo, ON, N2L 3C5 Canada','https://www.google.com/maps?q=75+University+Avenue+West+Waterloo,+ON,+N2L+3C5+Canada'),(21,'Wax Nightclub','123 King Street West Kitchener, ON, N2G 1A7 Canada','https://www.google.com/maps?q=123+King+Street+West+Kitchener,+ON,+N2G+1A7+Canada'),(22,'Private Residence','866140 Township Road 10 Bright, ON, N0J 1B0 Canada','https://www.google.com/maps/place/866140+Township+Rd+10,+Bright,+ON+N0J+1B0/@43.256439,-80.673732,17z/data=!3m1!4b1!4m5!3m4!1s0x882c05330f9dbf6d:0x5526c344c20d3fae!8m2!3d43.256439!4d-80.6715433'),(23,'CF Sherway Gardens','25 The West Mall Etobicoke, ON, M9C 1B8 Canada','https://www.google.com/maps?q=25+The+West+Mall+Etobicoke,+ON,+M9C+1B8+Canada'),(24,'The Lakeview','180 Van Wagners Beach Rd, Hamilton, ON L8E 3L8 Canada','https://www.google.ca/search?q=the%20lakeview&rlz=1C1CHBF_enCA741CA741&oq=the+lake&aqs=chrome.2.69i57j0l5.4648j0j7&sourceid=chrome&ie=UTF-8&npsic=0&rflfq=1&rlha=0&rllag=43455844,-79594362,25700&tbm=lcl&rldimm=3880685674772455403&ved=2ahUKEwiJ0-CJx4XiAhUOX'),(25,'Burl\'s Creek Event Grounds','240 8 Line South Oro Station, ON, L0L 2E0 Canada','https://www.google.com/maps?q=240+8+Line+South+Oro+Station,+ON,+L0L+2E0+Canada'),(26,'Ace Ping Pong Lounge','9 King St N Waterloo, ON, N2J 2W6 Canada','https://www.google.com/maps/place/9+King+St+N,+Waterloo,+ON+N2J+2W6/@43.4654091,-80.5248717,17z/data=!3m1!4b1!4m5!3m4!1s0x882bf40d415c8e61:0x5d9947cc8bc35047!8m2!3d43.4654091!4d-80.522683'),(27,'Yorkdale Shopping Centre','3401 Dufferin Street North York, ON, M6A 2T9 Canada','https://www.google.com/maps?q=3401+Dufferin+Street+North+York,+ON,+M6A+2T9+Canada'),(28,'The Pub On King','77 King Street North Waterloo, ON, N2J 2X3, Canada','https://www.google.com/maps/place/77+King+St+N,+Waterloo,+ON+N2J+2X3/@43.4678094,-80.5255956,17z/data=!3m1!4b1!4m5!3m4!1s0x882bf40ceeb2519f:0xb2f2a7e88b2f736e!8m2!3d43.4678094!4d-80.5234069'),(29,'MATCH Eatery & Public House','2000 Venetian Boulevard Point Edward, ON, N7T 8G4 Canada','https://www.google.com/maps?q=2000+Venetian+Boulevard+Point+Edward,+ON,+N7T+8G4+Canada'),(30,'Bramalea City Centre','25 Peel Centre Drive Brampton, ON, L6T 3R5 Canada','https://www.google.com/maps?q=25+Peel+Centre+Drive+Brampton,+ON,+L6T+3R5+Canada'),(31,'Highland Glen Golf Club','305455 Southline A Priceville, ON, N0C 1K0 Canada','https://www.google.com/maps?q=305455+Southline+A+Priceville,+ON,+N0C+1K0+Canada'),(32,'CF Fairview Mall','1800 Sheppard Avenue East Toronto, ON, M2J 5A7 Canada','https://www.google.com/maps?q=1800+Sheppard+Avenue+East+Toronto,+ON,+M2J+5A7+Canada');
/*!40000 ALTER TABLE `locations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-05-20 14:55:18
