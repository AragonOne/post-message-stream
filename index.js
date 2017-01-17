const Duplex = require('readable-stream').Duplex
const inherits = require('util').inherits

module.exports = PostMessageStream

inherits(PostMessageStream, Duplex)

function PostMessageStream (opts) {
  Duplex.call(this, {
    objectMode: true,
  })

  this._name = opts.name
  this._target = opts.target
  this._targetWindow = opts.targetWindow

  window.addEventListener('message', this._onMessage.bind(this), false)
}

// private

PostMessageStream.prototype._onMessage = function (event) {
  var msg = event.data

  // validate message
  if (!this._targetWindow && event.origin !== location.origin) return
  if (typeof msg !== 'object') return
  if (msg.target !== this._name) return
  if (!msg.data) return

  // forward message
  try {
    this.push(msg.data)
  } catch (err) {
    this.emit('error', err)
  }
}

// stream plumbing

PostMessageStream.prototype._read = noop

PostMessageStream.prototype._write = function (data, encoding, cb) {

  var message = {
    target: this._target,
    data: data,
  }
  var origin = (this._targetWindow) ? '*' : location.origin
  var targetWindow = this._targetWindow || window
  targetWindow.postMessage(message, origin)
  cb()
}

// util

function noop () {}
