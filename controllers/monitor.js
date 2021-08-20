let Monitor = require('../models/monitor');
var monitoringService = require('../services/monitoring')

// Get all monitors
exports.getAll = (req, res, next) => {
	Monitor.find({owner: req.user._id}).populate('events heartbeats')
		.then(monitors => {
			res.json(monitors);
		})
		.catch(err => {
			res.status(422).send(err.errors);
		});
};

// Create monitor
exports.create = (req, res, next) => {
	const {name, interval, enabled, type, config} = req.body
	const {user} = req
	console.log(req.body)
	var newMonitor = new Monitor({
		name: name,
		interval: interval,
		enabled: enabled,
		type: type,
		config: config,
		owner: user._id
	})
	newMonitor.save()
		.then(monitor => {
			monitoringService.startMonitor(monitor._id)
			res.json(monitor);
		})
		.catch(err => {
			res.status(422).send(err.errors);
		});
};

// Read one monitor
exports.getOne = (req, res, next) => {
  Monitor.findOne({_id: req.params.monitorId, owner: req.user._id})
		.then(monitor => {
			res.json(monitor);
		})
		.catch(err => {
			res.status(422).send(err.errors);
		});
};

// Update one monitor
exports.update = (req, res, next) => {
	console.log(req.body)
  Monitor.findByIdAndUpdate({_id: req.params.monitorId, owner: req.user._id}, req.body, {new: true})
		.then(monitor => {
			monitoringService.updateMonitor(monitor._id)
			res.json(monitor);
		})
		.catch(err => {
			res.status(422).send(err.errors);
		});
};

// Delete one monitor
exports.delete = (req, res, next) => {
	// delete doesn't return an object id and we need it to stop monitor
	Monitor.findOne({_id: req.params.monitorId, owner: req.user._id})
		.then(monitor => {
			monitoringService.stopMonitor(monitor._id)
		})
		.catch(err => {
			res.status(422).send(err.errors);
		});

	// delete monitor
	Monitor.deleteOne({_id: req.params.monitorId})
		.then(deleteResult => {
			res.json(deleteResult);
		})
		.catch(err => {
			res.status(422).send(err.errors);
		});
};
