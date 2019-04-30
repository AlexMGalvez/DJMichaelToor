CREATE TABLE gigs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT,
    event VARCHAR(255),
    start_date DATETIME,
    end_date DATETIME DEFAULT NULL,
    FOREIGN KEY(location_id) REFERENCES locations(id)
);

CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    place VARCHAR(255),
    address VARCHAR(255),
    map_url VARCHAR(255)
);

INSERT INTO locations (place, address, map_url)
VALUES  ("Phil's Grandson's Place", "220 King Street North Waterloo, ON, N2J 2Y7 Canada", "https://www.google.com/maps?q=220+King+Street+North+Waterloo,+ON,+N2J+2Y7+Canada"),
        ("District Nightclub", "667 King Street West Kitchener, ON, N2G 1C9 Canada", "https://www.google.com/maps?q=667+King+Street+West+Kitchener,+ON,+N2G+1C9+Canada"),
        ("St. Benedict Catholic Secondary School", "50 Saginaw Parkway Cambridge, ON, N1T 1Z2 Canada", "https://www.google.com/maps?q=50+Saginaw+Parkway+Cambridge,+ON,+N1T+1Z2+Canada")

INSERT INTO gigs (location_id, event, start_date, end_date)
VALUES  (1, "Ladies Night", "2016-08-27 21:30:00", "2016-08-28 02:30:00"),
        (2, "White Room", "2016-09-03 22:00:00", "2016-09-04 02:30:00")
        
SELECT gigs.id, place, event, DATE_FORMAT(start_date, '%M %D, %Y') AS start_date, DATE_FORMAT(end_date, '%M %D, %Y') AS end_date FROM gigs
LEFT JOIN locations
    ON gigs.location_id = locations.id
ORDER BY start_date DESC;

SELECT gigs.id, place, event, DATE_FORMAT(start_date, '%M %D, %Y') AS start_date, DATE_FORMAT(end_date, '%M %D, %Y') AS end_date, address, map_url FROM gigs
LEFT JOIN locations
    ON gigs.location_id = locations.id
where gigs.id = id;

SELECT gigs.id, place, event, DATE_FORMAT(start_date, '%m') AS start_month, DATE_FORMAT(start_date, '%d') AS start_day, DATE_FORMAT(start_date, '%y') AS start_year, DATE_FORMAT(end_date, '%M %D, %Y') AS end_date FROM gigs LEFT JOIN locations ON gigs.location_id = locations.id ORDER BY start_date DESC;

-- select locations
SELECT id, place, address, map_url FROM locations

-- EXAMPLE
INSERT INTO gigs (location_id, event, start_date, end_date)
               VALUES  (2, "TEST", STR_TO_DATE("04/12/19 14:34:00", "%d-%m-%Y %H:%i:%s"), STR_TO_DATE("04/12/19 02:13:00", "%d-%m-%Y %H:%i:%s"))