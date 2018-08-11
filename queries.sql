CREATE TABLE `mobileApps`.`users` ( `email` VARCHAR(100) NOT NULL , `password` CHAR(60) NOT NULL , `firstName` VARCHAR(100) NOT NULL , `lastName` VARCHAR(100) NOT NULL , `gender` CHAR(15) NOT NULL , `insName` VARCHAR(100) NOT NULL , `policyID` VARCHAR(50) NOT NULL , `heightFt` INT(11) NOT NULL , `heightIn` INT(11) NOT NULL , `bodyType` VARCHAR(15) NOT NULL , `dob` VARCHAR(10) NOT NULL , `agreedToLegal` TINYINT(1) NOT NULL , PRIMARY KEY (`email`)) ENGINE = InnoDB;
CREATE TABLE `mobileApps`.`records` ( `user` VARCHAR(100) NOT NULL , `date` VARCHAR(10) NOT NULL , `weight` SMALLINT(6) NOT NULL , `bmi` DECIMAL(3,1) NOT NULL , `systolic` SMALLINT(6) , `diastolic` SMALLINT(6) ) ENGINE = InnoDB;
