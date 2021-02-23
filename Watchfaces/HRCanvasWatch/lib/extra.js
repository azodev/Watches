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
function hasSomeParentTheClass(element, classname) {
    if (element.className != null && element.classList.length >0 && element.classList.contains(classname)) return true;
    return element.parentNode && hasSomeParentTheClass(element.parentNode, classname);
}
function showDropdownApp() {
	var event;
    event = document.createEvent('MouseEvents');
    console.log('test');
    var element = document.getElementById('testme');
    event.initMouseEvent('mousedown', true, true, window);
    //event.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
    element.dispatchEvent(event);
    //document.body.dispatchEvent(element);
}
