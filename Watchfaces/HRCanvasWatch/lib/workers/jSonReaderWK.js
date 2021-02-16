onmessage = function(e) {
    var url = e.data.url;
    var output;

    fetchJson(url).then((json) => {
		
		output = json;

		
		
		postMessage({
	        'output': output
	    });
		

	}).catch(e => {
			throw new Error('There has been a problem with your fetch operation: ' + e.message);
			
	});
    
};





async function fetchJson(url) {
	
	let response = await fetch(url);
	
	  if (!response.ok) {
	    throw new Error('HTTP error! status: '+response.status);
	  } else {
		  return await response.json();
	  }
}