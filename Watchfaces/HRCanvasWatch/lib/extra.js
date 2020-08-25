function setClassAndWaitForTransition(node, newClass, prop) {
	return new Promise(function(resolve) {
		function handler(event) {
			console.log(event);
			if (event.target == node && event.propertyName == prop) { 
				node.removeEventListener('transitionend', handler);
				resolve();
			}
		}
		node.addEventListener('transitionend', handler);
		node.setAttribute('class', newClass);
	});
}