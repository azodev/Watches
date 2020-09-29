
	var currentMotion = {
			accelerationIncludingGravity : null
		};

	var sensorService = null, motionSensor= null;
	var isStarted = false;

	var options = null;
	var onSensorChange = function (SensorAccelerationData){
		currentMotion.accelerationIncludingGravity = {
				x : SensorAccelerationData.x,
				y : SensorAccelerationData.y,
				z : SensorAccelerationData.z
			};
		postMessage({
			'type':'CHANGE',
	        'output': currentMotion
	    });
	} ;
	onmessage = function(e) {
		
		console.log(e);
		if (e.data.message == 'INIT') {
			try {
				options= e.data.options;
				sensorService = e.data.sensor;
				console.log(sensorService);
				motionSensor = sensorService.getDefaultSensor('ACCELERATION');
				// motionSensor.getMotionSensorData(setCurrentMotionValue);
				motionSensor.setChangeListener(onSensorChange, options.sampleInterval, options.maxBatchCount);

			} catch (error) {
					throw new Error('There has been a problem with : ' + error);
			}

			postMessage('INITIALIZED');
		}
		if (e.data.message == 'START') {
			motionSensor.start(onSensorStartSuccess, onSensorStartError);

			postMessage('STARTED');
		}
		if (e.data.message == 'STOP') {
			motionSensor.stop();
			isStarted = false;
			postMessage('STOPPED');
		}
		if (e.data.message == 'LISTEN') {
			postMessage({
		        'output': currentMotion
		    });
		}

	}


/*
function setCurrentMotionValue(data) {
	currentMotion.accelerationIncludingGravity.x = data.x;
	currentMotion.accelerationIncludingGravity.y = data.y;
	currentMotion.accelerationIncludingGravity.z = data.z;
}*/
/*
function onSensorChange(SensorAccelerationData) {

	currentMotion.accelerationIncludingGravity = {
		x : SensorAccelerationData.x,
		y : SensorAccelerationData.y,
		z : SensorAccelerationData.z
	};
	/*updateAverageMotion(currentMotion);
	if (!found) {
		found = true;
	}
	e.fire('change', getSensorValueAvg());
}
*/
function onSensorStartSuccess() {
	isStarted = true;
	//
}

function onSensorStartError(e) {
	//console.error('Motion sensor start error: ', e);

}
