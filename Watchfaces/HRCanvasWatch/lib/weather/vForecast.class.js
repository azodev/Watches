class vForecast {
	constructor(array,mapping){
		this.date = new Date(array['dt']*1000);
		this.main = array['main'];
		this.weather = array['weather'][0];
		this.wind = array['wind'];
		this.day = array['day'];
		this.mapping = mapping;
	}
	
	
	getDate(){
		return this.date;
	}
	getMapping(id, dayNightBool) {
		if (!weatherFound){
			return DEFAULT_ICON;
		}
		if (this.mapping.map[id]) {
			if (!dayNightBool) {
				if (this.mapping.map[id+'n']){
					return this.mapping.map[id+'n'];
				}
			} 
			return this.mapping.map[id];

		} else {
			return DEFAULT_ICON;
		}
	}

}