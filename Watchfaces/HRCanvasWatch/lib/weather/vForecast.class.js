class vForecast {
	constructor(array){
		this.date = new Date(array['dt']*1000);
		this.main = array['main'];
		this.weather = array['weather'][0];
		this.wind = array['wind'];
		this.day = array['day'];

	}
	
	
	getDate(){
		return this.date;
	}

}