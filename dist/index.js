(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('most')) :
	typeof define === 'function' && define.amd ? define(['exports', 'most'], factory) :
	(factory((global['async-iterable'] = global['async-iterable'] || {}),global.most));
}(this, (function (exports,most) { 'use strict';

function getAsyncIterator(asyncIterable) {
  if (!Symbol.asyncIterator) {
    throw new TypeError('Symbol.asyncIterator is not defined.');
  }
  return asyncIterable[Symbol.asyncIterator]();
}

/** @license MIT License (c) copyright 2016 original author or authors */

function AsyncIteratorProducer(asyncIterator, sink, scheduler) {
  this.asyncIterator = asyncIterator;
  this.sink = sink;
  this.scheduler = scheduler;
  this.active = true;

  var self = this;
  function err(e) {
    self.sink.error(self.scheduler.now(), e);
  }

  Promise.resolve(this).then(stepProducer).catch(err);
}

AsyncIteratorProducer.prototype.dispose = function () {
  this.active = false;
};

function stepProducer(producer) {
  return producer.asyncIterator.next().then(function (r) {
    if (r.done) {
      producer.sink.end(producer.scheduler.now(), r.value);
    } else {
      producer.sink.event(producer.scheduler.now(), r.value);
      if (producer.active) {
        return stepProducer(producer);
      }
    }
  });
}

function fromAsyncIterable(asyncIterable) {
  return new most.Stream(new AsyncIterableSource(asyncIterable));
}

function AsyncIterableSource(asyncIterable) {
  this.asyncIterable = asyncIterable;
}

AsyncIterableSource.prototype.run = function (sink, scheduler) {
  var asyncIterator = getAsyncIterator(this.asyncIterable);
  return new AsyncIteratorProducer(asyncIterator, sink, scheduler);
};

/**
 * Compute a stream using an *async* generator
 * @param f
 * @returns {Stream}
 */
function asyncGenerate(f /*, ...args */) {
  var args = Array.prototype.slice.call(arguments);
  args.shift();
  return new most.Stream(new AsyncGenerateSource(f, args));
}

function AsyncGenerateSource(f, args) {
  this.f = f;
  this.args = args;
}

AsyncGenerateSource.prototype.run = function (sink, scheduler) {
  var asyncIterable = this.f.apply(void 0, this.args);
  var asyncIterator = getAsyncIterator(asyncIterable);
  return new AsyncIteratorProducer(asyncIterator, sink, scheduler);
};

/** @license MIT License (c) copyright 2016 original author or authors */

exports.fromAsyncIterable = fromAsyncIterable;
exports.asyncGenerate = asyncGenerate;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
