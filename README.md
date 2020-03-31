## RoadFacts

Visualization of Indian road statistics based on multiple parameters. 
Available visualizations: 

1. Road accidents analysis
2. Road statistics
3. Transit assets statistics
 

## Data Sources

1. Road Accidents  - https://data.gov.in/catalog/road-accidents-india-classified-according-various-parameters
2. Road statistics - http://morth.nic.in/showfile.asp?lid=2445
3. Household transit assets - http://www.censusindia.gov.in/2011census/Hlo-series/HH12.html
	
	
## Tools/Libraries Used: 

1. [Google charts](https://developers.google.com/chart) for Visualization
2. This is a completely client-side application with no server component. Google spreadsheets is used as backend datastore. 
3. [Tabletop](https://github.com/jsoma/tabletop) used for getting JSON data from Google Spreadsheet. 
4. JavaScript SQL Library [alasql](https://github.com/agershun/alasql) for filtering, grouping, sorting data fetched from spreadsheet.



