class vEvent {
	constructor(array){
		this.eventArray = array[1];
		let i;
		this.location = null;
		for ( i=0 ;i<this.eventArray.length ; i++ ){
			switch (this.eventArray[i][0]) {
			case 'summary':
				this.title     = this.eventArray[i][3];
				break;
			case 'dtstart':
				this.startDate = new Date(this.eventArray[i][3]);
				break;
			case 'dtend':
				this.endDate   = new Date(this.eventArray[i][3]);
				break;
			case 'location':
				this.location  = this.eventArray[i][3];
				break;
			default:
				break;
			}
		}
		

	}
	getTitle(){
		return this.title;
	}
	getDates(){
		return {startDate:this.startDate,endDate:this.endDate};
	}
	getLocation(){
		return this.location;
	}
}