/*
 * gulp-bliss
 *
 * Copyright (c) 2014 ngConsulti LLC <contact@ngConsulti.com>
 * Licensed under the MIT license.
 */

/*jshint node:true */
'use strict';

var PluginError = require('gulp-util').PluginError;
var through     = require('through2');
var Bliss       = require('bliss');
// var html        = require('html');
var gutil       = require('gulp-util');
var ext         = gutil.replaceExtension;

function doCompile(file, opts){
  var contents = String(file.contents);
  var bliss = new Bliss( {context: opts.context} );
  return bliss.compile(contents, opts)(opts.locals || opts.data);
}

function doExtension(filepath, opts){
  return ext(filepath, '.html');
}

module.exports = function(options){
  var opts = options || {};
  opts.context = opts.context || {};
  if (!opts.context.Html) {
    opts.context.Html = {
      'Partial': function(template, data) {
        var context = opts.context || {};
        context.data = data || opts.context.data || {};

        return new Bliss({context: context}).render(template);
      }
    };
  }

  function compile(file, enc, cb){
    opts.filename = file.path;
    file.path = doExtension(file.path, opts);

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-bliss', 'Streaming not supported'));
      return cb();
    }

    if (file.isBuffer()) {
      try {
        file.contents = new Buffer( doCompile(file, opts) );
      } catch (err) {
        this.emit('error', err);
      }
    }

    this.push(file);
    cb();
  }

  return through.obj(compile);
};
