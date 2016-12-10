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
	var arr2D = [['State Code', 'State', 'Total Households']];
	for(var i = 0; i < res.length; i++) {
		var st = res[i]["State"];		
		try {
			arr2D.push([states[st]["Code"], st, res[i]["a"]]);
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
	  
    if(selectedArea){
		if(stateClause){
			stateClause = stateClause + ' AND Area="' + selectedArea + '"';
		}else{
			stateClause = stateClause + ' WHERE Area="' + selectedArea + '"';
		}
	}
	var res = alasql('SELECT SUM(Total::NUMBER) AS a,SUM(Bicycle::NUMBER) AS b,SUM(TwoWh::NUMBER) AS c,SUM(FourWh::NUMBER) AS d FROM ?' 
			+ stateClause ,[tableData]);
	var arr2D = [['Transit Asset', 'Number of households']];
	arr2D.push(['Total', res[0]["a"]]);
	arr2D.push(['Bicycle', res[0]["b"]]);
	arr2D.push(['Scooter/MotorCycle', res[0]["c"]]);
	arr2D.push(['Car/Jeep/Van', res[0]["d"]]);
  
	var data = google.visualization.arrayToDataTable(arr2D);
	var opts = {
		title: 'Households by type of transit assets ' + (selectedState ? ' (' + selectedState + ')' : ' (India)')
					+ (selectedArea ? ' (' + selectedArea + ')' : ' (Rural+Urban)'),
		legend: { position: 'none' },
		hAxis: {'title': 'Number of households'}
	  };
  
	var chart = new google.visualization.BarChart(
		document.getElementById('barViz'));
	chart.draw(data, opts);
  }
  
  function drawPieChart() {
	  
    var stateClause = selectedState ? ' WHERE State="' + selectedState + '"' : '';
	var res = alasql('SELECT Area, SUM(Total::NUMBER) AS a FROM ?' + stateClause + 'GROUP BY Area',[tableData]);
	var arr2D = [['Area', 'Number of Households']];
	for(var i = 0; i < res.length; i++) {
		arr2D.push([res[i]["Area"], res[i]["a"]]);
	}
	
	var data = google.visualization.arrayToDataTable(arr2D);
	  
    var opts = {
    	title: 'Households by Rural/Urban ' + (selectedState ? ' (' + selectedState + ')' : ' (India)')
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

	Tabletop.init( { key: '1gvTQNNV8S2IStDJ3V7tbt_JKMUDwLF_KPsETKRKZWDU',
		 callback: drawVisualization,
		 simpleSheet: true } );		 
};
