class vEvent {
	constructor(array){
		let i;
		this.location = null;
		for ( i=0 ;i<array[1].length ; i++ ){
			switch (array[1][i][0]) {
			case 'summary':
				this.title     = array[1][i][3];
				break;
			case 'dtstart':
				this.startDate = new Date(array[1][i][3]);
				break;
			case 'dtend':
				this.endDate   = new Date(array[1][i][3]);
				break;
			case 'location':
				this.location  = array[1][i][3];
				break;
			case 'uid':
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