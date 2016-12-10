google.load('visualization', '1', {'packages': ['geochart', 'corechart']});
google.setOnLoadCallback(init);

var selParam;
var tableData;
var selectedState;


  function drawVisualization(data, tabletop) {
	tableData = data;
	selectedState = '';
	
	var res = alasql('SELECT State, SUM(Accidents::NUMBER) AS a FROM ? GROUP BY State',[data]);
	var arr2D = [['State Code', 'State', 'Accidents']];
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
	drawCharts();	
  }	  
  
  function drawCharts() {
	var stateClause = selectedState ? ' WHERE State="' + selectedState + '" ' : ' ';
	if(selectedState == 'Andhra Pradesh + Telangana'){
		stateClause = ' WHERE State="Andhra Pradesh" OR State="Telangana" ';
	}
	var res = alasql('SELECT Parameter, SUM(Accidents::NUMBER) AS a FROM ?' + stateClause + 'GROUP BY Parameter ORDER BY a DESC',[tableData]);
	var arr2D = [['Parameter', 'Accidents']];
	for(var i = 0; i < res.length; i++) {
		arr2D.push([res[i]["Parameter"], res[i]["a"]]);
	}	
	drawPieChart(arr2D);
	
	res = alasql('SELECT Parameter, SUM(Killed::NUMBER) AS a FROM ?' + stateClause + 'GROUP BY Parameter ORDER BY a DESC',[tableData]);
	arr2D = [['Parameter', 'Killed']];
	for(var i = 0; i < res.length; i++) {
		arr2D.push([res[i]["Parameter"], res[i]["a"]]);
	}	
	drawBarChart(arr2D);  
	
	res = alasql('SELECT Parameter, SUM(Injured::NUMBER) AS a FROM ?' + stateClause + 'GROUP BY Parameter ORDER BY a DESC',[tableData]);
	arr2D = [['Parameter', 'Injured']];
	for(var i = 0; i < res.length; i++) {
		arr2D.push([res[i]["Parameter"], res[i]["a"]]);
	}	
	drawBarChart1(arr2D);  
  }
  
  function drawBarChart(barChartData) {
  
	var data = google.visualization.arrayToDataTable(barChartData);
	var opts = {
		title: 'People killed by ' + selParam + (selectedState ? ' (' + selectedState + ')' : ' (India)'),
		legend: { position: 'none' },
		colors: ['red'],
		hAxis: {'title': 'Number of people'},
		explorer: {
			keepInBounds: true,
			maxZoomOut: 2
		}
	  };
  
	var chart = new google.visualization.BarChart(
		document.getElementById('barViz'));
	chart.draw(data, opts);
  }
  
  function drawBarChart1(barChartData) {
  
	var data = google.visualization.arrayToDataTable(barChartData);
	var opts = {
		title: 'People injured by ' + selParam + (selectedState ? ' (' + selectedState + ')' : ' (India)'),
		legend: { position: 'none' },
		hAxis: {'title': 'Number of people'},
		explorer: {
			keepInBounds: true,
			maxZoomOut: 2
		}
	  };
  
	var chart = new google.visualization.BarChart(
		document.getElementById('barViz1'));
	chart.draw(data, opts);
  }
  
  function drawPieChart(pieChartData) {
	
	var data = google.visualization.arrayToDataTable(pieChartData);
	  
	  var opts = {
	  title: 'Road accidents by ' + selParam + (selectedState ? ' (' + selectedState + ')' : ' (India)'),
	  is3D: true,
	};
	var chart = new google.visualization.PieChart(
		document.getElementById('pieViz'));
	chart.draw(data, opts);		
  }
  
  
  function drawGeoMap(geoMapData) {
	var data = google.visualization.arrayToDataTable(geoMapData);
  
	  var opts = {
		backgroundColor: '#87ceeb',
		region: 'IN',
		displayMode: 'regions',
		resolution: 'provinces',
		domain: 'IN',
		colorAxis: {colors: ['#ffe1e6', 'red']}
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
			drawCharts();
		  }
		});
		
  }
  
  function populateDropdown(data, tabletop) {
	var $select = $("#selectbasic");
	$select.append('<option value="">-------</option>');
	
	for(var i = 0; i < data.length; i++) {
		$select.append('<option value=' + data[i]["Key"] + '>' + data[i]["Name"] + '</option>');
	}	
	
	//populateContent($select);
  }
  
  function populateContent(elem) {
    selParam = $("option:selected", elem).html();
	$("#paramTopic").html("Classification according to " + selParam);
	Tabletop.init( { key: $("option:selected", elem).val(),
					 callback: drawVisualization,
					 simpleSheet: true } );	 	
  }

function init() {
	$('#selectbasic').on('change', function() {
		if($("option:selected", this).val()){
			$("#mainContent").hide();
			$("#spinner").show();
			populateContent(this);
		}		
	});

	Tabletop.init( { key: '1Gp6vZFMxUDtb3xgqhZTl2xGewbJnDktcNIN0H4hWVJM',
					 callback: populateDropdown,
					 simpleSheet: true } );	  	 	 
};
