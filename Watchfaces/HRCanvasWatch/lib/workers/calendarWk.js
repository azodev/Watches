onmessage = function(e) {
    var name = e.data.name;
    var output;

    fetchCalendar(name).then((json) => {
		
		output = json;

		postMessage({
	        'output': output
	    });
		

	}).catch(e => {
			throw new Error('There has been a problem with your fetch operation: ' + e.message);
			
	});
    
};





async function fetchCalendar(name) {
	let url = '';
	let response = await fetch(url);
	
	  if (!response.ok) {
	    throw new Error('HTTP error! status: '+response.status);
	  } else {
		  return await response.json();
	   
	  }
}