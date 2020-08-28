function setClassAndWaitForTransition(node, newClass, prop) {
	return new Promise(function(resolve) {
		function handler(event) {
			if (event.target == node && event.propertyName == prop) { 
				node.removeEventListener('transitionend', handler);
				resolve();
			}
		}
		node.addEventListener('transitionend', handler);
		node.setAttribute('class', newClass);
	});
}
function fancyTimeFormat(time)
{   
	var ret= '';
	var array = {
			hours: ~~(time / 3600),
			minutes: ~~((time % 3600) / 60)
			
			};
	
    // Hours, minutes and seconds
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);

    // Output like "1:01" or "4:03:59" or "123:03:59"
    

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    if (mins > 0)  {
    	ret += "" + mins;
    }
    return ret;
}