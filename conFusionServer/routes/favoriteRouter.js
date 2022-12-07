const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');
const Users = require('../models/user');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
})
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Favorites.findOne({user: req.user._id})
  .populate('user')
  .populate('dishes')
  .then((favorite) => {
    if (favorite) {
      var id1 = req.user._id;
      var id2 = favorite.user._id;
      if (id1.equals(id2)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
      } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
      }
    } else {
      err = new Error('Favorites not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Favorites.findOne({user: req.user._id})
  .then((favorite) => {
    if (favorite) {
      var id1 = req.user._id;
      var id2 = favorite.user._id;
      if (id1.equals(id2)) {
        if (req.body) {
          for (item of req.body) {
            if (favorite.dishes.indexOf(item._id) === -1) {
              favorite.dishes.push(item._id);
            }
          }
        }
        favorite.save()
        .then((favorite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        });
      } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
      }
    } else {
      Favorites.create({user: req.user._id})
      .then((favorite) => {
        if (req.body) {
          for (item of req.body) {
            favorite.dishes.push(item._id);
          }
        }
        favorite.save()
        .then((favorite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        });
      }, (err) => next(err))
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Favorites.findOne({user: req.user._id})
  .then((favorite) => {
    if (favorite) {
      var id1 = req.user._id;
      var id2 = favorite.user._id;
      if (id1.equals(id2)) {
        Favorites.deleteOne({user: req.user._id})
        .then((resp) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(resp);
        }, (err) => next(err))
      } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
      }
    } else {
      err = new Error('Favorites not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  res.statusCode = 403;
  res.end(`GET operation not supported on /favorites/${req.params.dishId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Favorites.findOne({user: req.user._id})
  .then((favorite) => {    
    if (favorite) {
      var id1 = req.user._id;
      var id2 = favorite.user._id;
      if (id1.equals(id2)) {
        if (favorite.dishes.indexOf(req.params.dishId) === -1) {
          favorite.dishes.push(req.params.dishId);
        } else {
          var err = new Error(`Dish ${req.params.dishId} already in favorites!`);
          err.status = 403;
          return next(err);
        }
        favorite.save()
        .then((favorite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        });
      } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
      }
    } else {
      Favorites.create({user: req.user._id})
      .then((favorite) => {
        favorite.dishes.push(req.params.dishId);
        favorite.save()
        .then((favorite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        });
      }, (err) => next(err))
    }
  }, (err) => next(err))
  .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  res.statusCode = 403;
  res.end(`PUT operation not supported on /favorites/${req.params.dishId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
  Favorites.findOne({user: req.user._id})
  .then((favorite) => {
    if (favorite) {
      var id1 = req.user._id;
      var id2 = favorite.user._id;
      if (id1.equals(id2)) {
        if (favorite.dishes.indexOf(req.params.dishId) !== -1) {
          favorite.dishes.remove(req.params.dishId);
          favorite.save()
          .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          }, (err) => next(err))
        } else {
          err = new Error(`Dish ${req.params.dishId} not found in favorites!`);
          err.status = 404;
          return next(err);
        }
      } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
      }
    } else {
      err = new Error('Favorites not found');
      err.status = 404;
      return next(err);
    }
  }, (err) => next(err))
  .catch((err) => next(err));
});

module.exports = favoriteRouter;