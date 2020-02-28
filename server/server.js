require('newrelic');
const express = require('express');
const axios = require('axios');

const app = express();
const morgan = require('morgan');
app.use(morgan('dev'));

const dirPath = `${__dirname}/../public/dist/`;
app.use(express.static(dirPath));

const { routes } = require('../proxyconfig.json');

app.get('/api/:room_id', (req, res) => {
	const { room_id } = req.params;
	Promise.all([
		axios.get(`${routes['listings'].address}/${room_id}`).then(data => data.data).catch(e => e),
		axios.get(`${routes['morehomes'].address}/${room_id}`).then(data => data.data).catch(e => e),
		axios.get(`${routes['reviews'].address}/${room_id}`).then(data => data.data).catch(e => e),
	])
	.then( (...args) => {
		const data = {};
		data['listings'] = args[0];
		data['morehomes'] = args[1];
		data['reviews'] = args[2];
		res.status(200).send(data);
	})
	.catch(e => {
		console.log(e);
		res.status(500).send('Error');
	});
});

app.get('/api/:component/:room_id', (req, res) => {
  const { component, room_id } = req.params;
  axios.get(`${routes[component].address}/${room_id}`)
    .then(data => res.status(200).send(data.data))
    .catch(e => {
      console.log(e);
      res.status(500).send('Error');
    });
});


app.listen(3000, () => console.log('Listening on port: 3000'));
