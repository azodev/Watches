onmessage = function(e) {
    var url = e.data.url;
    var output;

    fetchJson(url).then((json) => {
		
		output = JSON.parse(json);

		
		
		postMessage({
	        'json': output
	    });
		

	}).catch(e => {
			throw new Error('There has been a problem with your fetch operation: ' + e.message);
			
	});
    
};



/*

async function fetchJson(url) {
	
	let response = await fetch(url);
	
	  if (!response.ok) {
	    throw new Error('HTTP error! status: '+response.status);
	  } else {
		  return await response.json();
	  }
}*/
async function  fetchJson(url) {
	  return new Promise(function(resolve, reject) {
	    var xhr = new XMLHttpRequest();
	    xhr.onload = function() {
	      resolve(xhr.responseText, {status: xhr.status});
	    }
	    xhr.onerror = function() { 
	      reject(new TypeError('Local request failed'));
	    }
	    xhr.open('GET', url);
	    xhr.send(null);
	  });
}