/**
 * module.js - The core of module loader
 */

var cachedMods = {}

function Module() {
}

// Execute a module
Module.prototype.exec = function () {
  var mod = this

  // When module is executed, DO NOT execute it again. When module
  // is being executed, just return `module.exports` too, for avoiding
  // circularly calling
  if (this.execed) {
    return mod.exports
  }
  this.execed = true;

  function require(id) {
    return Module.get(id).exec()
  }

  // Exec factory
  var factory = mod.factory

  var exports = isFunction(factory) ?
      factory(require, mod.exports = {}, mod) :
      factory

  if (exports === undefined) {
    exports = mod.exports
  }

  // Reduce memory leak
  delete mod.factory

  mod.exports = exports

  return exports
}

// Define a module
define = function (id, deps, factory) {
  var meta = {
    id: id,
    deps: deps,
    factory: factory
  }

  Module.save(meta)
}

// Save meta data to cachedMods
Module.save = function(meta) {
  var mod = Module.get(meta.id)

  mod.id = meta.id
  mod.dependencies = meta.deps
  mod.factory = meta.factory
}

// Get an existed module or create a new one
Module.get = function(id) {
  return cachedMods[id] || (cachedMods[id] = new Module())
}

// Public API

require = function(id) {
  var mod = Module.get(id)
  if(!mod.execed) {
    mod.exec()
  }
  return mod.exports
}