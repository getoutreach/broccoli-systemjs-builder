var PersistentFilter = require('broccoli-persistent-filter'),
    RSVP = require('rsvp'),
    path = require('path'),
    fs = require('fs'),
    fsExtra = require('fs-extra'),
    Builder = require('systemjs-builder'),
    symlinkOrCopySync = require('symlink-or-copy').sync;

var isWin = process.platform.match(/^win/);
function toFileURL(path) {
  return 'file://' + (isWin ? '/' : '') + path.replace(/\\/g, '/');
};

function SystemJSBuilder ( inputNodes, baseURL, configPaths, fn ) {
  if (!(this instanceof SystemJSBuilder)) {
    return new SystemJSBuilder(inputNodes, baseURL, configPath, fn);
  }

  PersistentFilter.call(this, inputNodes);

  this.buildCount = 0;
  this.builder = new Builder();
  this.baseURL = baseURL;
  this.configPaths = configPaths;
  this.fn = fn;
};

SystemJSBuilder.prototype = Object.create(PersistentFilter.prototype);
SystemJSBuilder.prototype.constructor = SystemJSBuilder;

SystemJSBuilder.prototype.build = function() {
  var sourceDir = this.inputPaths[0],
      destDir = this.outputPath,
      configPaths = this.configPaths,
      baseURL = path.join(destDir, this.baseURL),
      builder = this.builder,
      fn = this.fn,
      self = this;

  return PersistentFilter.prototype.build.call(this).then(function() {
    if (self.buildCount++ === 0) {
      builder.config({
        baseURL: baseURL
      }, true, false);
      configPaths.forEach(function(configPath) {
        configPath = path.join(destDir, configPath);
        builder.loadConfigSync(configPath, true, true);
      });
    }

    var cwd = process.cwd();
    // XXX: Not currently a good way to configure the output directory
    process.chdir(destDir);
    return fn(builder, sourceDir, destDir).then(function() {
      process.chdir(cwd)
    }, function(err) {
      process.chdir(cwd);
      throw err;
    });
  });
};

SystemJSBuilder.prototype._handleFile = function(relativePath, srcDir, destDir, entry, outputPath, isChange, instrumentation) {
  var srcPath = path.join(srcDir, relativePath);
  // Copy since we could be injecting configuration
  if(entry.relativePath === this.configPath) {
    fsExtra.copySync(srcPath, outputPath);
    return;
  }
  instrumentation.linked++;
  if (isChange) {
    fs.unlinkSync(outputPath);
  }
  symlinkOrCopySync(srcPath, outputPath);
  if(this.buildCount > 0) {
    this.builder.invalidate(toFileURL(outputPath));
    // also invalidate any plugin syntax cases
    this.builder.invalidate(toFileURL(outputPath) + '!*');
  }
};

module.exports = SystemJSBuilder;
