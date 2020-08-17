class vEvent {
	constructor(array){
		let i;
		this.location = null;
		this.fullDay = false
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
	isDuplicate ( vEvents){
		let dup = false;
		console.log(vEvents);
		try {
			if (vEvents.length > 0){
				vEvents.forEach(function(el){
					if (el.title == this.title && el.startDate.toString() == this.startDate.toString() && el.endDate.toString() == this.endDate.toString()) {
						throw Exception;
					}
				});
			}
			
		}
		catch (e) {
			  console.log(e);
			  dup= true;
			}
		console.log('not dup');
		return dup;
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