google.load('visualization', '1', {'packages': ['geochart', 'corechart']});
google.setOnLoadCallback(init);

var tableData;
var selectedState;
var selectedArea;


  function drawVisualization(data, tabletop) {
	tableData = data;
	selectedState = '';
	selectedArea = '';
	
	var res = alasql('SELECT State, SUM(Total::NUMBER) AS a FROM ? GROUP BY State',[data]);
	var arr2D = [['State Code', 'State', 'Total Road length']];
	for(var i = 0; i < res.length; i++) {
		var st = res[i]["State"];		
		try {
			if(st == 'Telangana'){
				arr2D[1][2]= arr2D[1][2] + res[i]["a"];
			}else{
				arr2D.push([states[st]["Code"], ((st == 'Andhra Pradesh') ? st + ' + Telangana' : st), res[i]["a"]]);
			}
		}
		catch(err) {
			console.log(err.message);
			console.log(st);
		}		
	}	
	
	$("#spinner").hide();
	$("#mainContent").show();
	$('html, body').animate({
        	scrollTop: $("#mainContent").offset().top
    	}, 500);
	drawGeoMap(arr2D);
	drawPieChart();	
	drawBarChart();
  }	  
  
  
  function drawBarChart() {
	  
	var stateClause = selectedState ? ' WHERE State="' + selectedState + '"' : '';
	if(selectedState == 'Andhra Pradesh + Telangana'){
		stateClause = ' WHERE State="Andhra Pradesh" OR State="Telangana" ';
	}
	  
    if(selectedArea){
		if(stateClause){
			stateClause = stateClause + ' AND Category="' + selectedArea + '"';
		}else{
			stateClause = stateClause + ' WHERE Category="' + selectedArea + '"';
		}
	}
	var res = alasql('SELECT SUM(Surfaced::NUMBER) AS a,SUM(Unsurfaced::NUMBER) AS b FROM ?' 
			+ stateClause ,[tableData]);
	var arr2D = [['Surface', 'Road length']];
	arr2D.push(['Surfaced', res[0]["a"]]);
	arr2D.push(['Unsurfaced', res[0]["b"]]);
  
	var data = google.visualization.arrayToDataTable(arr2D);
	var opts = {
		title: 'Road length by type of surface ' + (selectedState ? ' (' + selectedState + ')' : ' (India)')
					+ (selectedArea ? ' (' + selectedArea + ')' : ' (All Categories)'),
		legend: { position: 'none' },
		hAxis: {'title': 'Length (KM)'}
	  };
  
	var chart = new google.visualization.BarChart(
		document.getElementById('barViz'));
	chart.draw(data, opts);
  }
  
  function drawPieChart() {
	  
    var stateClause = selectedState ? ' WHERE State="' + selectedState + '"' : '';
    if(selectedState == 'Andhra Pradesh + Telangana'){
		stateClause = ' WHERE State="Andhra Pradesh" OR State="Telangana" ';
	}
    
	var res = alasql('SELECT Category, SUM(Total::NUMBER) AS a FROM ?' + stateClause + 'GROUP BY Category',[tableData]);
	var arr2D = [['Category', 'Road length']];
	for(var i = 0; i < res.length; i++) {
		arr2D.push([res[i]["Category"], res[i]["a"]]);
	}
	
	var data = google.visualization.arrayToDataTable(arr2D);
	  
    var opts = {
    	title: 'Road length by Category ' + (selectedState ? ' (' + selectedState + ')' : ' (India)')
    };
	var chart = new google.visualization.PieChart(
		document.getElementById('pieViz'));
	chart.draw(data, opts);		
	
	google.visualization.events.addListener(chart, 'select',
		function() {
		  var selectedItem = chart.getSelection()[0];
		  var prevArea = selectedArea;
		  if (selectedItem) {
			  selectedArea = data.getValue(selectedItem.row, 0);
		  }else{
			  selectedArea =  '';
		  }
		  
		  if(selectedArea != prevArea){
			  drawBarChart();
		  }
	});
  }
  
  
  function drawGeoMap(geoMapData) {
	var data = google.visualization.arrayToDataTable(geoMapData);
  
	  var opts = {
		backgroundColor: '#87ceeb',
		region: 'IN',
		displayMode: 'regions',
		resolution: 'provinces',
		domain: 'IN'
	  };
	  var geochart = new google.visualization.GeoChart(
		  document.getElementById('geomapViz'));
	  geochart.draw(data, opts);
	  
	  google.visualization.events.addListener(geochart, 'select',
		function() {
		  var selectedItem = geochart.getSelection()[0];
		  var prevState = selectedState;
		  if (selectedItem) {
			selectedState = data.getValue(selectedItem.row, 1);
		  }else{
			selectedState =  '';
		  }
		  
		  if(selectedState != prevState){
			  selectedArea = '';
			  drawPieChart();
			  drawBarChart();
		  }
		});
		
  }

function init() {

	Tabletop.init( { key: '1ndsi2JGUCc95pkjQCL1tq1JsUuhE7NWUMM16ZejiSfc',
		 callback: drawVisualization,
		 simpleSheet: true } );		 
};
