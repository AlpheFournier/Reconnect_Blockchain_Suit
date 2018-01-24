var Stamping = require('../models/stamping');
var Agent = require('../models/agent');
var express = require('express');
var router = express.Router();
var otsManager = require('../utils/otsManager')

router.route('/')
    .get(function (req, res) {
        Stamping.find(
            {},
            function (err, stampings) {
                if (err) { res.status(err.statusCode || 500).json(err) } else {
                    res.json(stampings)
                }
            })
    })

router.route('/:namespace/:userId/:fileName')
    .get(function (req, res) {
        Agent.findOne(
            { namespace: req.params.namespace },
            function (err, agent) {
                if (err) { res.status(err.statusCode || 500).json(err) }
                else {
                    Stamping.findOne({
                        agentId: agent._id,
                        userId: req.params.userId,
                        fileName: req.params.fileName
                    }, function (err, stamping) {
                        if (err) { res.status(err.statusCode || 500).json(err) }
                        else if (stamping === null) {
                            res.status(404).json({ message: 'No corresponding stamping was found.' })
                        }
                        else {
                            res.json(stamping)
                        }
                    })
                }
            })
    })
    .delete(function (req, res) {
        Agent.findOne(
            { namespace: req.params.namespace },
            function (err, agent) {
                if (err) {
                    res.status(err.statusCode || 500).json(err)
                }
                else {
                    Stamping.remove({
                        agentId: agent._id,
                        userId: req.params.userId,
                        fileName: req.params.fileName
                    }, function (err, stamping) {
                        if (err) {
                            res.status(err.statusCode || 500).json(err)
                        }
                        else if (stamping === null) {
                            res.status(404).json({message: 'No corresponding stamping was found.'})
                        }
                        else {
                            res.json({message: 'Stamping of ' + req.params.fileName + ' was deleted.'})
                        }
                    })
                }
            })
    })

router.route('/:namespace/:userId')
    .post(function (req, res) {
        var stamping = new Stamping()
        if (req.body.file) {
            Agent.findOne(
                { namespace: req.params.namespace },
                function (err, agent) {
                    if (err) {
                        res.status(err.statusCode || 500).json(err)
                    } else {
                        stamping.agentId = agent._id
                        stamping.userId = req.params.userId
                        stamping.fileName = req.body.fileName // TODO : Récupérer le vrai nom du fichier
                        stamping.save(function (err) {
                            if (err) {
                                res.status(err.statusCode || 500).json(err)
                            }
                            else {
                                res.json({ message:
                                    'Your stamping of ' + stamping.fileName
                                    + ' has been created with id ' + stamping._id
                                    + ' by ' + agent.name
                                    + '.\n Stamping on OTS started. '
                                })
                                otsManager.stamp('README.md')
                                res.json({message: 'You created a stamping.'})
                            }
                        })
                    }
            })
        }
        else {
            res.status(400).json({ message: 'You have to provide a file.' })
            // TODO : Améliorer cette gestion d'exception, notamment si le fichier n'est pas au bon format
        }
    })

router.route('/:namespace/:userId/verify')
    .post(function (req, res) {
        if (req.body.file && req.body.otsFile) {
            Agent.findOne(
                {namespace: req.params.namespace},
                function (err, agent) {
                    if (err) {
                        res.status(err.statusCode || 500).json(err)
                    } else {
                        Stamping.findOne({
                            agentId: agent._id,
                            userId: req.params.userId,
                            fileName: req.body.fileName // TODO : Récupérer le vrai nom du fichier
                        }, function (err, stamping) {
                            if (err) {
                                res.status(err.statusCode || 500).json(err)
                            }
                            else if (stamping === null) {
                                res.status(404).json({ message: 'No corresponding stamping was found.' })
                            }
                            else {
                                otsManager.verify('README.md','README.md.ots');
                                res.json({ message: 'You are verifying your stamping.' })
                            }
                        })
                    }
                })
        } else {
            res.status(400).json({ message: 'You have to provide a file and an otsFile. '})
            // TODO : Améliorer cette gestion d'exception, notamment si le fichier n'est pas au bon format
        }
    })

module.exports = router