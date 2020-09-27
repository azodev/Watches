importScripts("../weather/vForecast.class.js");

onmessage = function(e) {
    var url = e.data.url;
    var weatherInform = e.data.weatherInform;
    var mapping = e.data.mapping;
    var output, vForecasts, first;
	fetchWeather(url).then((json) => {
		
		output = json;
		vForecasts= new Array();
		let sunriseHour = roundMinutes(new Date( weatherInform.sys.sunrise*1000)).getHours();
		let sunsetHour = roundMinutes(new Date( weatherInform.sys.sunset*1000)).getHours();
		for (let i = 0, fll = output.list.length; i < fll ; i++ ){
			let hour = new Date( output.list[i].dt * 1000).getHours();
			
			let day = (
					hour >= sunriseHour
					&& hour < sunsetHour
					) ? true : false;
			output.list[i].city = weatherInform.name;
			output.list[i].day = day;
			vForecasts.push(new vForecast(output.list[i],mapping));
			if (i==0){
				first = output.list[i];
			}
			
		}
		output.lastWeatherCallDate = new Date();
		postMessage({
	        'output': output,
	        'vForecasts':vForecasts,
	        'first':first
	    });
		

	}).catch(e => {
			throw new Error('There has been a problem with your fetch operation: ' + e.message);
			
	});
    
};


function roundMinutes(date) {

    date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
    date.setMinutes(0);

    return date;
}


async function fetchWeather(url) {
	
	let response = await fetch(url);
	
	  if (!response.ok) {
	    throw new Error('HTTP error! status: '+response.status);
	  } else {
		  return await response.json();
	  }
}