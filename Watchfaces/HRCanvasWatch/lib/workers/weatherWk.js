onmessage = function(e) {
    var url = e.data.url;
    var output;
    var day, now;
	fetchWeather(url).then((json) => {
		
		output = json;

		now = Math.round(Date.now() / 1000);
		
		day = (now >= output.sys.sunrise && now <= output.sys.sunset) ? true : false;
		// Gets icon code from information
		output.day = day; 
		output.lastWeatherCallDate = now;
		//console.debug(output);
		// Gets weather string from information
		
		postMessage({
	        'output': output
	    });
		

	}).catch(e => {
			throw new Error('There has been a problem with your fetch operation: ' + e.message);
			
	});
    
};





async function fetchWeather(url) {
	
	let response = await fetch(url);
	
	  if (!response.ok) {
	    throw new Error('HTTP error! status: '+response.status);
	  } else {
		  return await response.json();
	  }
}