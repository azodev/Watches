importScripts("../comlink.min.js");

const fetcher = {
  name: null,	
  setName(name){
	  this.name  = name;
  },
  async doFetch(callback) {
    
    

    fetchCalendar(this.name).then((json) => {
		
		return  callback(json);
		

	}).catch(e => {
			throw new Error('There has been a problem with your fetch operation: ' + e.message);
			
	});
    
  }
}





async function fetchCalendar(name) {
	let url = 'https://cloud.anthony-zorzetto.fr/clrs/'+name+'.json';
	let response = await fetch(url);
	
	  if (!response.ok) {
	    throw new Error('HTTP error! status: '+response.status);
	  } else {
		  return await response.json();
	  }
}

Comlink.expose(fetcher, self);