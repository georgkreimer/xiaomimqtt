const miio = require('miio');
const mqtt = require('mqtt');

const deviceNames = require('./config/deviceNames');
const {url, credentials, topic} = require('./config/mqtt');

const client = mqtt.connect(url, credentials);

client.on('connect', function() {
	console.log('connected to MQTT server');

	const devices = miio.devices({
		cacheTime: 60 // Default is 1800 seconds (30 minutes)
	});

	devices.on("available", reg => {
		const device = reg.device;

		if(! device) {
			console.log(`${reg.id} could not be connected to`);
			return;
		}

		if(device.model !== 'lumi.sensor_ht') {
			return;
		}

		console.log(`${device.model} is available`);

		const temperatureTopic = `${topic}/${deviceNames.climate[device.id]}/temperature`;
		const humidityTopic = `${topic}/${deviceNames.climate[device.id]}/humidity`;

		client.publish(temperatureTopic, device.temperature.toString());
		client.publish(humidityTopic, device.humidity.toString());

		return;
	});

	devices.on('unavailable', reg => {
		if(! reg.device) return;
		console.log(`${reg.id} is unavailable`);
	});

	devices.on('error', err => {
		// err.device points to info about the device
		console.log('Something went wrong connecting to device', err);
	});

});

client.on('error', console.error);
