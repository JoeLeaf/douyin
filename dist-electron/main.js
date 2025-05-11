import { app, ipcMain, BrowserWindow } from "electron";
import path$1 from "path";
import require$$7, { fileURLToPath } from "url";
import require$$0$4 from "events";
import require$$1$1 from "https";
import require$$2$1 from "http";
import require$$3 from "net";
import require$$4 from "tls";
import require$$1 from "crypto";
import require$$0$3 from "stream";
import require$$0$1 from "zlib";
import require$$0 from "fs";
import require$$2 from "os";
import require$$0$2 from "buffer";
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var bufferUtil$1 = { exports: {} };
const BINARY_TYPES$2 = ["nodebuffer", "arraybuffer", "fragments"];
const hasBlob$1 = typeof Blob !== "undefined";
if (hasBlob$1) BINARY_TYPES$2.push("blob");
var constants = {
  BINARY_TYPES: BINARY_TYPES$2,
  EMPTY_BUFFER: Buffer.alloc(0),
  GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
  hasBlob: hasBlob$1,
  kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
  kListener: Symbol("kListener"),
  kStatusCode: Symbol("status-code"),
  kWebSocket: Symbol("websocket"),
  NOOP: () => {
  }
};
var bufferutil = { exports: {} };
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var nodeGypBuild$1 = { exports: {} };
var nodeGypBuild;
var hasRequiredNodeGypBuild$1;
function requireNodeGypBuild$1() {
  if (hasRequiredNodeGypBuild$1) return nodeGypBuild;
  hasRequiredNodeGypBuild$1 = 1;
  var fs2 = require$$0;
  var path2 = path$1;
  var os = require$$2;
  var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
  var vars = process.config && process.config.variables || {};
  var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
  var abi = process.versions.modules;
  var runtime = isElectron() ? "electron" : isNwjs() ? "node-webkit" : "node";
  var arch = process.env.npm_config_arch || os.arch();
  var platform = process.env.npm_config_platform || os.platform();
  var libc = process.env.LIBC || (isAlpine(platform) ? "musl" : "glibc");
  var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
  var uv = (process.versions.uv || "").split(".")[0];
  nodeGypBuild = load2;
  function load2(dir) {
    return runtimeRequire(load2.resolve(dir));
  }
  load2.resolve = load2.path = function(dir) {
    dir = path2.resolve(dir || ".");
    try {
      var name = runtimeRequire(path2.join(dir, "package.json")).name.toUpperCase().replace(/-/g, "_");
      if (process.env[name + "_PREBUILD"]) dir = process.env[name + "_PREBUILD"];
    } catch (err) {
    }
    if (!prebuildsOnly) {
      var release = getFirst(path2.join(dir, "build/Release"), matchBuild);
      if (release) return release;
      var debug = getFirst(path2.join(dir, "build/Debug"), matchBuild);
      if (debug) return debug;
    }
    var prebuild = resolve(dir);
    if (prebuild) return prebuild;
    var nearby = resolve(path2.dirname(process.execPath));
    if (nearby) return nearby;
    var target = [
      "platform=" + platform,
      "arch=" + arch,
      "runtime=" + runtime,
      "abi=" + abi,
      "uv=" + uv,
      armv ? "armv=" + armv : "",
      "libc=" + libc,
      "node=" + process.versions.node,
      process.versions.electron ? "electron=" + process.versions.electron : "",
      typeof __webpack_require__ === "function" ? "webpack=true" : ""
      // eslint-disable-line
    ].filter(Boolean).join(" ");
    throw new Error("No native build was found for " + target + "\n    loaded from: " + dir + "\n");
    function resolve(dir2) {
      var tuples = readdirSync(path2.join(dir2, "prebuilds")).map(parseTuple);
      var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
      if (!tuple) return;
      var prebuilds = path2.join(dir2, "prebuilds", tuple.name);
      var parsed = readdirSync(prebuilds).map(parseTags);
      var candidates = parsed.filter(matchTags(runtime, abi));
      var winner = candidates.sort(compareTags(runtime))[0];
      if (winner) return path2.join(prebuilds, winner.file);
    }
  };
  function readdirSync(dir) {
    try {
      return fs2.readdirSync(dir);
    } catch (err) {
      return [];
    }
  }
  function getFirst(dir, filter) {
    var files = readdirSync(dir).filter(filter);
    return files[0] && path2.join(dir, files[0]);
  }
  function matchBuild(name) {
    return /\.node$/.test(name);
  }
  function parseTuple(name) {
    var arr = name.split("-");
    if (arr.length !== 2) return;
    var platform2 = arr[0];
    var architectures = arr[1].split("+");
    if (!platform2) return;
    if (!architectures.length) return;
    if (!architectures.every(Boolean)) return;
    return { name, platform: platform2, architectures };
  }
  function matchTuple(platform2, arch2) {
    return function(tuple) {
      if (tuple == null) return false;
      if (tuple.platform !== platform2) return false;
      return tuple.architectures.includes(arch2);
    };
  }
  function compareTuples(a, b) {
    return a.architectures.length - b.architectures.length;
  }
  function parseTags(file) {
    var arr = file.split(".");
    var extension2 = arr.pop();
    var tags = { file, specificity: 0 };
    if (extension2 !== "node") return;
    for (var i = 0; i < arr.length; i++) {
      var tag = arr[i];
      if (tag === "node" || tag === "electron" || tag === "node-webkit") {
        tags.runtime = tag;
      } else if (tag === "napi") {
        tags.napi = true;
      } else if (tag.slice(0, 3) === "abi") {
        tags.abi = tag.slice(3);
      } else if (tag.slice(0, 2) === "uv") {
        tags.uv = tag.slice(2);
      } else if (tag.slice(0, 4) === "armv") {
        tags.armv = tag.slice(4);
      } else if (tag === "glibc" || tag === "musl") {
        tags.libc = tag;
      } else {
        continue;
      }
      tags.specificity++;
    }
    return tags;
  }
  function matchTags(runtime2, abi2) {
    return function(tags) {
      if (tags == null) return false;
      if (tags.runtime && tags.runtime !== runtime2 && !runtimeAgnostic(tags)) return false;
      if (tags.abi && tags.abi !== abi2 && !tags.napi) return false;
      if (tags.uv && tags.uv !== uv) return false;
      if (tags.armv && tags.armv !== armv) return false;
      if (tags.libc && tags.libc !== libc) return false;
      return true;
    };
  }
  function runtimeAgnostic(tags) {
    return tags.runtime === "node" && tags.napi;
  }
  function compareTags(runtime2) {
    return function(a, b) {
      if (a.runtime !== b.runtime) {
        return a.runtime === runtime2 ? -1 : 1;
      } else if (a.abi !== b.abi) {
        return a.abi ? -1 : 1;
      } else if (a.specificity !== b.specificity) {
        return a.specificity > b.specificity ? -1 : 1;
      } else {
        return 0;
      }
    };
  }
  function isNwjs() {
    return !!(process.versions && process.versions.nw);
  }
  function isElectron() {
    if (process.versions && process.versions.electron) return true;
    if (process.env.ELECTRON_RUN_AS_NODE) return true;
    return typeof window !== "undefined" && window.process && window.process.type === "renderer";
  }
  function isAlpine(platform2) {
    return platform2 === "linux" && fs2.existsSync("/etc/alpine-release");
  }
  load2.parseTags = parseTags;
  load2.matchTags = matchTags;
  load2.compareTags = compareTags;
  load2.parseTuple = parseTuple;
  load2.matchTuple = matchTuple;
  load2.compareTuples = compareTuples;
  return nodeGypBuild;
}
var hasRequiredNodeGypBuild;
function requireNodeGypBuild() {
  if (hasRequiredNodeGypBuild) return nodeGypBuild$1.exports;
  hasRequiredNodeGypBuild = 1;
  const runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : commonjsRequire;
  if (typeof runtimeRequire.addon === "function") {
    nodeGypBuild$1.exports = runtimeRequire.addon.bind(runtimeRequire);
  } else {
    nodeGypBuild$1.exports = requireNodeGypBuild$1();
  }
  return nodeGypBuild$1.exports;
}
var fallback$1;
var hasRequiredFallback$1;
function requireFallback$1() {
  if (hasRequiredFallback$1) return fallback$1;
  hasRequiredFallback$1 = 1;
  const mask2 = (source, mask3, output, offset, length) => {
    for (var i = 0; i < length; i++) {
      output[offset + i] = source[i] ^ mask3[i & 3];
    }
  };
  const unmask2 = (buffer, mask3) => {
    const length = buffer.length;
    for (var i = 0; i < length; i++) {
      buffer[i] ^= mask3[i & 3];
    }
  };
  fallback$1 = { mask: mask2, unmask: unmask2 };
  return fallback$1;
}
var hasRequiredBufferutil;
function requireBufferutil() {
  if (hasRequiredBufferutil) return bufferutil.exports;
  hasRequiredBufferutil = 1;
  try {
    bufferutil.exports = requireNodeGypBuild()(__dirname);
  } catch (e) {
    bufferutil.exports = requireFallback$1();
  }
  return bufferutil.exports;
}
var unmask$1;
var mask;
const { EMPTY_BUFFER: EMPTY_BUFFER$3 } = constants;
const FastBuffer$2 = Buffer[Symbol.species];
function concat$1(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER$3;
  if (list.length === 1) return list[0];
  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;
  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    target.set(buf, offset);
    offset += buf.length;
  }
  if (offset < totalLength) {
    return new FastBuffer$2(target.buffer, target.byteOffset, offset);
  }
  return target;
}
function _mask(source, mask2, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask2[i & 3];
  }
}
function _unmask(buffer, mask2) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask2[i & 3];
  }
}
function toArrayBuffer$1(buf) {
  if (buf.length === buf.buffer.byteLength) {
    return buf.buffer;
  }
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
}
function toBuffer$2(data) {
  toBuffer$2.readOnly = true;
  if (Buffer.isBuffer(data)) return data;
  let buf;
  if (data instanceof ArrayBuffer) {
    buf = new FastBuffer$2(data);
  } else if (ArrayBuffer.isView(data)) {
    buf = new FastBuffer$2(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buf = Buffer.from(data);
    toBuffer$2.readOnly = false;
  }
  return buf;
}
bufferUtil$1.exports = {
  concat: concat$1,
  mask: _mask,
  toArrayBuffer: toArrayBuffer$1,
  toBuffer: toBuffer$2,
  unmask: _unmask
};
if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil2 = requireBufferutil();
    mask = bufferUtil$1.exports.mask = function(source, mask2, output, offset, length) {
      if (length < 48) _mask(source, mask2, output, offset, length);
      else bufferUtil2.mask(source, mask2, output, offset, length);
    };
    unmask$1 = bufferUtil$1.exports.unmask = function(buffer, mask2) {
      if (buffer.length < 32) _unmask(buffer, mask2);
      else bufferUtil2.unmask(buffer, mask2);
    };
  } catch (e) {
  }
}
var bufferUtilExports = bufferUtil$1.exports;
const kDone = Symbol("kDone");
const kRun = Symbol("kRun");
let Limiter$1 = class Limiter2 {
  /**
   * Creates a new `Limiter`.
   *
   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
   *     to run concurrently
   */
  constructor(concurrency) {
    this[kDone] = () => {
      this.pending--;
      this[kRun]();
    };
    this.concurrency = concurrency || Infinity;
    this.jobs = [];
    this.pending = 0;
  }
  /**
   * Adds a job to the queue.
   *
   * @param {Function} job The job to run
   * @public
   */
  add(job) {
    this.jobs.push(job);
    this[kRun]();
  }
  /**
   * Removes a job from the queue and runs it if possible.
   *
   * @private
   */
  [kRun]() {
    if (this.pending === this.concurrency) return;
    if (this.jobs.length) {
      const job = this.jobs.shift();
      this.pending++;
      job(this[kDone]);
    }
  }
};
var limiter = Limiter$1;
const zlib = require$$0$1;
const bufferUtil = bufferUtilExports;
const Limiter = limiter;
const { kStatusCode: kStatusCode$2 } = constants;
const FastBuffer$1 = Buffer[Symbol.species];
const TRAILER = Buffer.from([0, 0, 255, 255]);
const kPerMessageDeflate = Symbol("permessage-deflate");
const kTotalLength = Symbol("total-length");
const kCallback = Symbol("callback");
const kBuffers = Symbol("buffers");
const kError$1 = Symbol("error");
let zlibLimiter;
let PerMessageDeflate$3 = class PerMessageDeflate2 {
  /**
   * Creates a PerMessageDeflate instance.
   *
   * @param {Object} [options] Configuration options
   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
   *     for, or request, a custom client window size
   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
   *     acknowledge disabling of client context takeover
   * @param {Number} [options.concurrencyLimit=10] The number of concurrent
   *     calls to zlib
   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
   *     use of a custom server window size
   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
   *     disabling of server context takeover
   * @param {Number} [options.threshold=1024] Size (in bytes) below which
   *     messages should not be compressed if context takeover is disabled
   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
   *     deflate
   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
   *     inflate
   * @param {Boolean} [isServer=false] Create the instance in either server or
   *     client mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(options, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;
    this.params = null;
    if (!zlibLimiter) {
      const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }
  /**
   * @type {String}
   */
  static get extensionName() {
    return "permessage-deflate";
  }
  /**
   * Create an extension negotiation offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer() {
    const params = {};
    if (this._options.serverNoContextTakeover) {
      params.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      params.client_no_context_takeover = true;
    }
    if (this._options.serverMaxWindowBits) {
      params.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (this._options.clientMaxWindowBits) {
      params.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits == null) {
      params.client_max_window_bits = true;
    }
    return params;
  }
  /**
   * Accept an extension negotiation offer/response.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Object} Accepted configuration
   * @public
   */
  accept(configurations) {
    configurations = this.normalizeParams(configurations);
    this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
    return this.params;
  }
  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }
    if (this._deflate) {
      const callback = this._deflate[kCallback];
      this._deflate.close();
      this._deflate = null;
      if (callback) {
        callback(
          new Error(
            "The deflate stream was closed while data was being processed"
          )
        );
      }
    }
  }
  /**
   *  Accept an extension negotiation offer.
   *
   * @param {Array} offers The extension negotiation offers
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer(offers) {
    const opts = this._options;
    const accepted = offers.find((params) => {
      if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
        return false;
      }
      return true;
    });
    if (!accepted) {
      throw new Error("None of the extension offers can be accepted");
    }
    if (opts.serverNoContextTakeover) {
      accepted.server_no_context_takeover = true;
    }
    if (opts.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof opts.serverMaxWindowBits === "number") {
      accepted.server_max_window_bits = opts.serverMaxWindowBits;
    }
    if (typeof opts.clientMaxWindowBits === "number") {
      accepted.client_max_window_bits = opts.clientMaxWindowBits;
    } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
      delete accepted.client_max_window_bits;
    }
    return accepted;
  }
  /**
   * Accept the extension negotiation response.
   *
   * @param {Array} response The extension negotiation response
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient(response) {
    const params = response[0];
    if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }
    if (!params.client_max_window_bits) {
      if (typeof this._options.clientMaxWindowBits === "number") {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      }
    } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
      throw new Error(
        'Unexpected or invalid parameter "client_max_window_bits"'
      );
    }
    return params;
  }
  /**
   * Normalize parameters.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Array} The offers/response with normalized parameters
   * @private
   */
  normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((key) => {
        let value = params[key];
        if (value.length > 1) {
          throw new Error(`Parameter "${key}" must have only a single value`);
        }
        value = value[0];
        if (key === "client_max_window_bits") {
          if (value !== true) {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(
                `Invalid value for parameter "${key}": ${value}`
              );
            }
            value = num;
          } else if (!this._isServer) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else if (key === "server_max_window_bits") {
          const num = +value;
          if (!Number.isInteger(num) || num < 8 || num > 15) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
          value = num;
        } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
          if (value !== true) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else {
          throw new Error(`Unknown parameter "${key}"`);
        }
        params[key] = value;
      });
    });
    return configurations;
  }
  /**
   * Decompress data. Concurrency limited.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }
  /**
   * Compress data. Concurrency limited.
   *
   * @param {(Buffer|String)} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }
  /**
   * Decompress data.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? "client" : "server";
    if (!this._inflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on("error", inflateOnError);
      this._inflate.on("data", inflateOnData);
    }
    this._inflate[kCallback] = callback;
    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);
    this._inflate.flush(() => {
      const err = this._inflate[kError$1];
      if (err) {
        this._inflate.close();
        this._inflate = null;
        callback(err);
        return;
      }
      const data2 = bufferUtil.concat(
        this._inflate[kBuffers],
        this._inflate[kTotalLength]
      );
      if (this._inflate._readableState.endEmitted) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._inflate.reset();
        }
      }
      callback(null, data2);
    });
  }
  /**
   * Compress data.
   *
   * @param {(Buffer|String)} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _compress(data, fin, callback) {
    const endpoint = this._isServer ? "server" : "client";
    if (!this._deflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits
      });
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      this._deflate.on("data", deflateOnData);
    }
    this._deflate[kCallback] = callback;
    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) {
        return;
      }
      let data2 = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );
      if (fin) {
        data2 = new FastBuffer$1(data2.buffer, data2.byteOffset, data2.length - 4);
      }
      this._deflate[kCallback] = null;
      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];
      if (fin && this.params[`${endpoint}_no_context_takeover`]) {
        this._deflate.reset();
      }
      callback(null, data2);
    });
  }
};
var permessageDeflate = PerMessageDeflate$3;
function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}
function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;
  if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
    this[kBuffers].push(chunk);
    return;
  }
  this[kError$1] = new RangeError("Max payload size exceeded");
  this[kError$1].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
  this[kError$1][kStatusCode$2] = 1009;
  this.removeListener("data", inflateOnData);
  this.reset();
}
function inflateOnError(err) {
  this[kPerMessageDeflate]._inflate = null;
  if (this[kError$1]) {
    this[kCallback](this[kError$1]);
    return;
  }
  err[kStatusCode$2] = 1007;
  this[kCallback](err);
}
var validation = { exports: {} };
var utf8Validate = { exports: {} };
var fallback;
var hasRequiredFallback;
function requireFallback() {
  if (hasRequiredFallback) return fallback;
  hasRequiredFallback = 1;
  function isValidUTF82(buf) {
    const len = buf.length;
    let i = 0;
    while (i < len) {
      if ((buf[i] & 128) === 0) {
        i++;
      } else if ((buf[i] & 224) === 192) {
        if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
          return false;
        }
        i += 2;
      } else if ((buf[i] & 240) === 224) {
        if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // overlong
        buf[i] === 237 && (buf[i + 1] & 224) === 160) {
          return false;
        }
        i += 3;
      } else if ((buf[i] & 248) === 240) {
        if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // overlong
        buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
          return false;
        }
        i += 4;
      } else {
        return false;
      }
    }
    return true;
  }
  fallback = isValidUTF82;
  return fallback;
}
var hasRequiredUtf8Validate;
function requireUtf8Validate() {
  if (hasRequiredUtf8Validate) return utf8Validate.exports;
  hasRequiredUtf8Validate = 1;
  try {
    utf8Validate.exports = requireNodeGypBuild()(__dirname);
  } catch (e) {
    utf8Validate.exports = requireFallback();
  }
  return utf8Validate.exports;
}
var isValidUTF8_1;
const { isUtf8 } = require$$0$2;
const { hasBlob } = constants;
const tokenChars$2 = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  // 0 - 15
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  // 16 - 31
  0,
  1,
  0,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  1,
  1,
  0,
  1,
  1,
  0,
  // 32 - 47
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  // 48 - 63
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  // 64 - 79
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  1,
  1,
  // 80 - 95
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  // 96 - 111
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  1,
  0,
  1,
  0
  // 112 - 127
];
function isValidStatusCode$2(code) {
  return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
}
function _isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;
  while (i < len) {
    if ((buf[i] & 128) === 0) {
      i++;
    } else if ((buf[i] & 224) === 192) {
      if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
        return false;
      }
      i += 2;
    } else if ((buf[i] & 240) === 224) {
      if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
      buf[i] === 237 && (buf[i + 1] & 224) === 160) {
        return false;
      }
      i += 3;
    } else if ((buf[i] & 248) === 240) {
      if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
      buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
        return false;
      }
      i += 4;
    } else {
      return false;
    }
  }
  return true;
}
function isBlob$2(value) {
  return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
}
validation.exports = {
  isBlob: isBlob$2,
  isValidStatusCode: isValidStatusCode$2,
  isValidUTF8: _isValidUTF8,
  tokenChars: tokenChars$2
};
if (isUtf8) {
  isValidUTF8_1 = validation.exports.isValidUTF8 = function(buf) {
    return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
  };
} else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF82 = requireUtf8Validate();
    isValidUTF8_1 = validation.exports.isValidUTF8 = function(buf) {
      return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF82(buf);
    };
  } catch (e) {
  }
}
var validationExports = validation.exports;
const { Writable } = require$$0$3;
const PerMessageDeflate$2 = permessageDeflate;
const {
  BINARY_TYPES: BINARY_TYPES$1,
  EMPTY_BUFFER: EMPTY_BUFFER$2,
  kStatusCode: kStatusCode$1,
  kWebSocket: kWebSocket$3
} = constants;
const { concat, toArrayBuffer, unmask } = bufferUtilExports;
const { isValidStatusCode: isValidStatusCode$1, isValidUTF8 } = validationExports;
const FastBuffer = Buffer[Symbol.species];
const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;
const DEFER_EVENT = 6;
let Receiver$1 = class Receiver2 extends Writable {
  /**
   * Creates a Receiver instance.
   *
   * @param {Object} [options] Options object
   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
   *     multiple times in the same tick
   * @param {String} [options.binaryType=nodebuffer] The type for binary data
   * @param {Object} [options.extensions] An object containing the negotiated
   *     extensions
   * @param {Boolean} [options.isServer=false] Specifies whether to operate in
   *     client or server mode
   * @param {Number} [options.maxPayload=0] The maximum allowed message length
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   */
  constructor(options = {}) {
    super();
    this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
    this._binaryType = options.binaryType || BINARY_TYPES$1[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;
    this[kWebSocket$3] = void 0;
    this._bufferedBytes = 0;
    this._buffers = [];
    this._compressed = false;
    this._payloadLength = 0;
    this._mask = void 0;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._opcode = 0;
    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];
    this._errored = false;
    this._loop = false;
    this._state = GET_INFO;
  }
  /**
   * Implements `Writable.prototype._write()`.
   *
   * @param {Buffer} chunk The chunk of data to write
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} cb Callback
   * @private
   */
  _write(chunk, encoding, cb) {
    if (this._opcode === 8 && this._state == GET_INFO) return cb();
    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(cb);
  }
  /**
   * Consumes `n` bytes from the buffered data.
   *
   * @param {Number} n The number of bytes to consume
   * @return {Buffer} The consumed bytes
   * @private
   */
  consume(n) {
    this._bufferedBytes -= n;
    if (n === this._buffers[0].length) return this._buffers.shift();
    if (n < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = new FastBuffer(
        buf.buffer,
        buf.byteOffset + n,
        buf.length - n
      );
      return new FastBuffer(buf.buffer, buf.byteOffset, n);
    }
    const dst = Buffer.allocUnsafe(n);
    do {
      const buf = this._buffers[0];
      const offset = dst.length - n;
      if (n >= buf.length) {
        dst.set(this._buffers.shift(), offset);
      } else {
        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
        this._buffers[0] = new FastBuffer(
          buf.buffer,
          buf.byteOffset + n,
          buf.length - n
        );
      }
      n -= buf.length;
    } while (n > 0);
    return dst;
  }
  /**
   * Starts the parsing loop.
   *
   * @param {Function} cb Callback
   * @private
   */
  startLoop(cb) {
    this._loop = true;
    do {
      switch (this._state) {
        case GET_INFO:
          this.getInfo(cb);
          break;
        case GET_PAYLOAD_LENGTH_16:
          this.getPayloadLength16(cb);
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64(cb);
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          this.getData(cb);
          break;
        case INFLATING:
        case DEFER_EVENT:
          this._loop = false;
          return;
      }
    } while (this._loop);
    if (!this._errored) cb();
  }
  /**
   * Reads the first two bytes of a frame.
   *
   * @param {Function} cb Callback
   * @private
   */
  getInfo(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }
    const buf = this.consume(2);
    if ((buf[0] & 48) !== 0) {
      const error = this.createError(
        RangeError,
        "RSV2 and RSV3 must be clear",
        true,
        1002,
        "WS_ERR_UNEXPECTED_RSV_2_3"
      );
      cb(error);
      return;
    }
    const compressed = (buf[0] & 64) === 64;
    if (compressed && !this._extensions[PerMessageDeflate$2.extensionName]) {
      const error = this.createError(
        RangeError,
        "RSV1 must be clear",
        true,
        1002,
        "WS_ERR_UNEXPECTED_RSV_1"
      );
      cb(error);
      return;
    }
    this._fin = (buf[0] & 128) === 128;
    this._opcode = buf[0] & 15;
    this._payloadLength = buf[1] & 127;
    if (this._opcode === 0) {
      if (compressed) {
        const error = this.createError(
          RangeError,
          "RSV1 must be clear",
          true,
          1002,
          "WS_ERR_UNEXPECTED_RSV_1"
        );
        cb(error);
        return;
      }
      if (!this._fragmented) {
        const error = this.createError(
          RangeError,
          "invalid opcode 0",
          true,
          1002,
          "WS_ERR_INVALID_OPCODE"
        );
        cb(error);
        return;
      }
      this._opcode = this._fragmented;
    } else if (this._opcode === 1 || this._opcode === 2) {
      if (this._fragmented) {
        const error = this.createError(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          "WS_ERR_INVALID_OPCODE"
        );
        cb(error);
        return;
      }
      this._compressed = compressed;
    } else if (this._opcode > 7 && this._opcode < 11) {
      if (!this._fin) {
        const error = this.createError(
          RangeError,
          "FIN must be set",
          true,
          1002,
          "WS_ERR_EXPECTED_FIN"
        );
        cb(error);
        return;
      }
      if (compressed) {
        const error = this.createError(
          RangeError,
          "RSV1 must be clear",
          true,
          1002,
          "WS_ERR_UNEXPECTED_RSV_1"
        );
        cb(error);
        return;
      }
      if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
        const error = this.createError(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002,
          "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
        );
        cb(error);
        return;
      }
    } else {
      const error = this.createError(
        RangeError,
        `invalid opcode ${this._opcode}`,
        true,
        1002,
        "WS_ERR_INVALID_OPCODE"
      );
      cb(error);
      return;
    }
    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buf[1] & 128) === 128;
    if (this._isServer) {
      if (!this._masked) {
        const error = this.createError(
          RangeError,
          "MASK must be set",
          true,
          1002,
          "WS_ERR_EXPECTED_MASK"
        );
        cb(error);
        return;
      }
    } else if (this._masked) {
      const error = this.createError(
        RangeError,
        "MASK must be clear",
        true,
        1002,
        "WS_ERR_UNEXPECTED_MASK"
      );
      cb(error);
      return;
    }
    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else this.haveLength(cb);
  }
  /**
   * Gets extended payload length (7+16).
   *
   * @param {Function} cb Callback
   * @private
   */
  getPayloadLength16(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }
    this._payloadLength = this.consume(2).readUInt16BE(0);
    this.haveLength(cb);
  }
  /**
   * Gets extended payload length (7+64).
   *
   * @param {Function} cb Callback
   * @private
   */
  getPayloadLength64(cb) {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }
    const buf = this.consume(8);
    const num = buf.readUInt32BE(0);
    if (num > Math.pow(2, 53 - 32) - 1) {
      const error = this.createError(
        RangeError,
        "Unsupported WebSocket frame: payload length > 2^53 - 1",
        false,
        1009,
        "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
      );
      cb(error);
      return;
    }
    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    this.haveLength(cb);
  }
  /**
   * Payload length has been read.
   *
   * @param {Function} cb Callback
   * @private
   */
  haveLength(cb) {
    if (this._payloadLength && this._opcode < 8) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        const error = this.createError(
          RangeError,
          "Max payload size exceeded",
          false,
          1009,
          "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
        );
        cb(error);
        return;
      }
    }
    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }
  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }
    this._mask = this.consume(4);
    this._state = GET_DATA;
  }
  /**
   * Reads data bytes.
   *
   * @param {Function} cb Callback
   * @private
   */
  getData(cb) {
    let data = EMPTY_BUFFER$2;
    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }
      data = this.consume(this._payloadLength);
      if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
        unmask(data, this._mask);
      }
    }
    if (this._opcode > 7) {
      this.controlMessage(data, cb);
      return;
    }
    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, cb);
      return;
    }
    if (data.length) {
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }
    this.dataMessage(cb);
  }
  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @param {Function} cb Callback
   * @private
   */
  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate$2.extensionName];
    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) return cb(err);
      if (buf.length) {
        this._messageLength += buf.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          const error = this.createError(
            RangeError,
            "Max payload size exceeded",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
          );
          cb(error);
          return;
        }
        this._fragments.push(buf);
      }
      this.dataMessage(cb);
      if (this._state === GET_INFO) this.startLoop(cb);
    });
  }
  /**
   * Handles a data message.
   *
   * @param {Function} cb Callback
   * @private
   */
  dataMessage(cb) {
    if (!this._fin) {
      this._state = GET_INFO;
      return;
    }
    const messageLength = this._messageLength;
    const fragments = this._fragments;
    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragmented = 0;
    this._fragments = [];
    if (this._opcode === 2) {
      let data;
      if (this._binaryType === "nodebuffer") {
        data = concat(fragments, messageLength);
      } else if (this._binaryType === "arraybuffer") {
        data = toArrayBuffer(concat(fragments, messageLength));
      } else if (this._binaryType === "blob") {
        data = new Blob(fragments);
      } else {
        data = fragments;
      }
      if (this._allowSynchronousEvents) {
        this.emit("message", data, true);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit("message", data, true);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    } else {
      const buf = concat(fragments, messageLength);
      if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
        const error = this.createError(
          Error,
          "invalid UTF-8 sequence",
          true,
          1007,
          "WS_ERR_INVALID_UTF8"
        );
        cb(error);
        return;
      }
      if (this._state === INFLATING || this._allowSynchronousEvents) {
        this.emit("message", buf, false);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit("message", buf, false);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    }
  }
  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  controlMessage(data, cb) {
    if (this._opcode === 8) {
      if (data.length === 0) {
        this._loop = false;
        this.emit("conclude", 1005, EMPTY_BUFFER$2);
        this.end();
      } else {
        const code = data.readUInt16BE(0);
        if (!isValidStatusCode$1(code)) {
          const error = this.createError(
            RangeError,
            `invalid status code ${code}`,
            true,
            1002,
            "WS_ERR_INVALID_CLOSE_CODE"
          );
          cb(error);
          return;
        }
        const buf = new FastBuffer(
          data.buffer,
          data.byteOffset + 2,
          data.length - 2
        );
        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(
            Error,
            "invalid UTF-8 sequence",
            true,
            1007,
            "WS_ERR_INVALID_UTF8"
          );
          cb(error);
          return;
        }
        this._loop = false;
        this.emit("conclude", code, buf);
        this.end();
      }
      this._state = GET_INFO;
      return;
    }
    if (this._allowSynchronousEvents) {
      this.emit(this._opcode === 9 ? "ping" : "pong", data);
      this._state = GET_INFO;
    } else {
      this._state = DEFER_EVENT;
      setImmediate(() => {
        this.emit(this._opcode === 9 ? "ping" : "pong", data);
        this._state = GET_INFO;
        this.startLoop(cb);
      });
    }
  }
  /**
   * Builds an error object.
   *
   * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
   * @param {String} message The error message
   * @param {Boolean} prefix Specifies whether or not to add a default prefix to
   *     `message`
   * @param {Number} statusCode The status code
   * @param {String} errorCode The exposed error code
   * @return {(Error|RangeError)} The error
   * @private
   */
  createError(ErrorCtor, message2, prefix, statusCode, errorCode) {
    this._loop = false;
    this._errored = true;
    const err = new ErrorCtor(
      prefix ? `Invalid WebSocket frame: ${message2}` : message2
    );
    Error.captureStackTrace(err, this.createError);
    err.code = errorCode;
    err[kStatusCode$1] = statusCode;
    return err;
  }
};
var receiver = Receiver$1;
const { Duplex: Duplex$3 } = require$$0$3;
const { randomFillSync } = require$$1;
const PerMessageDeflate$1 = permessageDeflate;
const { EMPTY_BUFFER: EMPTY_BUFFER$1, kWebSocket: kWebSocket$2, NOOP: NOOP$1 } = constants;
const { isBlob: isBlob$1, isValidStatusCode } = validationExports;
const { mask: applyMask, toBuffer: toBuffer$1 } = bufferUtilExports;
const kByteLength = Symbol("kByteLength");
const maskBuffer = Buffer.alloc(4);
const RANDOM_POOL_SIZE = 8 * 1024;
let randomPool;
let randomPoolPointer = RANDOM_POOL_SIZE;
const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;
let Sender$1 = class Sender2 {
  /**
   * Creates a Sender instance.
   *
   * @param {Duplex} socket The connection socket
   * @param {Object} [extensions] An object containing the negotiated extensions
   * @param {Function} [generateMask] The function used to generate the masking
   *     key
   */
  constructor(socket, extensions, generateMask) {
    this._extensions = extensions || {};
    if (generateMask) {
      this._generateMask = generateMask;
      this._maskBuffer = Buffer.alloc(4);
    }
    this._socket = socket;
    this._firstFragment = true;
    this._compress = false;
    this._bufferedBytes = 0;
    this._queue = [];
    this._state = DEFAULT;
    this.onerror = NOOP$1;
    this[kWebSocket$2] = void 0;
  }
  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {(Buffer|String)} data The data to frame
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @return {(Buffer|String)[]} The framed data
   * @public
   */
  static frame(data, options) {
    let mask2;
    let merge = false;
    let offset = 2;
    let skipMasking = false;
    if (options.mask) {
      mask2 = options.maskBuffer || maskBuffer;
      if (options.generateMask) {
        options.generateMask(mask2);
      } else {
        if (randomPoolPointer === RANDOM_POOL_SIZE) {
          if (randomPool === void 0) {
            randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
          }
          randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
          randomPoolPointer = 0;
        }
        mask2[0] = randomPool[randomPoolPointer++];
        mask2[1] = randomPool[randomPoolPointer++];
        mask2[2] = randomPool[randomPoolPointer++];
        mask2[3] = randomPool[randomPoolPointer++];
      }
      skipMasking = (mask2[0] | mask2[1] | mask2[2] | mask2[3]) === 0;
      offset = 6;
    }
    let dataLength;
    if (typeof data === "string") {
      if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
        dataLength = options[kByteLength];
      } else {
        data = Buffer.from(data);
        dataLength = data.length;
      }
    } else {
      dataLength = data.length;
      merge = options.mask && options.readOnly && !skipMasking;
    }
    let payloadLength = dataLength;
    if (dataLength >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (dataLength > 125) {
      offset += 2;
      payloadLength = 126;
    }
    const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
    target[0] = options.fin ? options.opcode | 128 : options.opcode;
    if (options.rsv1) target[0] |= 64;
    target[1] = payloadLength;
    if (payloadLength === 126) {
      target.writeUInt16BE(dataLength, 2);
    } else if (payloadLength === 127) {
      target[2] = target[3] = 0;
      target.writeUIntBE(dataLength, 4, 6);
    }
    if (!options.mask) return [target, data];
    target[1] |= 128;
    target[offset - 4] = mask2[0];
    target[offset - 3] = mask2[1];
    target[offset - 2] = mask2[2];
    target[offset - 1] = mask2[3];
    if (skipMasking) return [target, data];
    if (merge) {
      applyMask(data, mask2, target, offset, dataLength);
      return [target];
    }
    applyMask(data, mask2, data, 0, dataLength);
    return [target, data];
  }
  /**
   * Sends a close message to the other peer.
   *
   * @param {Number} [code] The status code component of the body
   * @param {(String|Buffer)} [data] The message component of the body
   * @param {Boolean} [mask=false] Specifies whether or not to mask the message
   * @param {Function} [cb] Callback
   * @public
   */
  close(code, data, mask2, cb) {
    let buf;
    if (code === void 0) {
      buf = EMPTY_BUFFER$1;
    } else if (typeof code !== "number" || !isValidStatusCode(code)) {
      throw new TypeError("First argument must be a valid error code number");
    } else if (data === void 0 || !data.length) {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      const length = Buffer.byteLength(data);
      if (length > 123) {
        throw new RangeError("The message must not be greater than 123 bytes");
      }
      buf = Buffer.allocUnsafe(2 + length);
      buf.writeUInt16BE(code, 0);
      if (typeof data === "string") {
        buf.write(data, 2);
      } else {
        buf.set(data, 2);
      }
    }
    const options = {
      [kByteLength]: buf.length,
      fin: true,
      generateMask: this._generateMask,
      mask: mask2,
      maskBuffer: this._maskBuffer,
      opcode: 8,
      readOnly: false,
      rsv1: false
    };
    if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, buf, false, options, cb]);
    } else {
      this.sendFrame(Sender2.frame(buf, options), cb);
    }
  }
  /**
   * Sends a ping message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  ping(data, mask2, cb) {
    let byteLength;
    let readOnly;
    if (typeof data === "string") {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob$1(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer$1(data);
      byteLength = data.length;
      readOnly = toBuffer$1.readOnly;
    }
    if (byteLength > 125) {
      throw new RangeError("The data size must not be greater than 125 bytes");
    }
    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask: mask2,
      maskBuffer: this._maskBuffer,
      opcode: 9,
      readOnly,
      rsv1: false
    };
    if (isBlob$1(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, false, options, cb]);
      } else {
        this.getBlobData(data, false, options, cb);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, cb]);
    } else {
      this.sendFrame(Sender2.frame(data, options), cb);
    }
  }
  /**
   * Sends a pong message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  pong(data, mask2, cb) {
    let byteLength;
    let readOnly;
    if (typeof data === "string") {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob$1(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer$1(data);
      byteLength = data.length;
      readOnly = toBuffer$1.readOnly;
    }
    if (byteLength > 125) {
      throw new RangeError("The data size must not be greater than 125 bytes");
    }
    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask: mask2,
      maskBuffer: this._maskBuffer,
      opcode: 10,
      readOnly,
      rsv1: false
    };
    if (isBlob$1(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, false, options, cb]);
      } else {
        this.getBlobData(data, false, options, cb);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, cb]);
    } else {
      this.sendFrame(Sender2.frame(data, options), cb);
    }
  }
  /**
   * Sends a data message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
   *     or text
   * @param {Boolean} [options.compress=false] Specifies whether or not to
   *     compress `data`
   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Function} [cb] Callback
   * @public
   */
  send(data, options, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate$1.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = options.compress;
    let byteLength;
    let readOnly;
    if (typeof data === "string") {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob$1(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer$1(data);
      byteLength = data.length;
      readOnly = toBuffer$1.readOnly;
    }
    if (this._firstFragment) {
      this._firstFragment = false;
      if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
        rsv1 = byteLength >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }
    if (options.fin) this._firstFragment = true;
    const opts = {
      [kByteLength]: byteLength,
      fin: options.fin,
      generateMask: this._generateMask,
      mask: options.mask,
      maskBuffer: this._maskBuffer,
      opcode,
      readOnly,
      rsv1
    };
    if (isBlob$1(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
      } else {
        this.getBlobData(data, this._compress, opts, cb);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, this._compress, opts, cb]);
    } else {
      this.dispatch(data, this._compress, opts, cb);
    }
  }
  /**
   * Gets the contents of a blob as binary data.
   *
   * @param {Blob} blob The blob
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     the data
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  getBlobData(blob, compress, options, cb) {
    this._bufferedBytes += options[kByteLength];
    this._state = GET_BLOB_DATA;
    blob.arrayBuffer().then((arrayBuffer) => {
      if (this._socket.destroyed) {
        const err = new Error(
          "The socket was closed while the blob was being read"
        );
        process.nextTick(callCallbacks, this, err, cb);
        return;
      }
      this._bufferedBytes -= options[kByteLength];
      const data = toBuffer$1(arrayBuffer);
      if (!compress) {
        this._state = DEFAULT;
        this.sendFrame(Sender2.frame(data, options), cb);
        this.dequeue();
      } else {
        this.dispatch(data, compress, options, cb);
      }
    }).catch((err) => {
      process.nextTick(onError, this, err, cb);
    });
  }
  /**
   * Dispatches a message.
   *
   * @param {(Buffer|String)} data The message to send
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     `data`
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  dispatch(data, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender2.frame(data, options), cb);
      return;
    }
    const perMessageDeflate = this._extensions[PerMessageDeflate$1.extensionName];
    this._bufferedBytes += options[kByteLength];
    this._state = DEFLATING;
    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      if (this._socket.destroyed) {
        const err = new Error(
          "The socket was closed while data was being compressed"
        );
        callCallbacks(this, err, cb);
        return;
      }
      this._bufferedBytes -= options[kByteLength];
      this._state = DEFAULT;
      options.readOnly = false;
      this.sendFrame(Sender2.frame(buf, options), cb);
      this.dequeue();
    });
  }
  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue() {
    while (this._state === DEFAULT && this._queue.length) {
      const params = this._queue.shift();
      this._bufferedBytes -= params[3][kByteLength];
      Reflect.apply(params[0], this, params.slice(1));
    }
  }
  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue(params) {
    this._bufferedBytes += params[3][kByteLength];
    this._queue.push(params);
  }
  /**
   * Sends a frame.
   *
   * @param {(Buffer | String)[]} list The frame to send
   * @param {Function} [cb] Callback
   * @private
   */
  sendFrame(list, cb) {
    if (list.length === 2) {
      this._socket.cork();
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
      this._socket.uncork();
    } else {
      this._socket.write(list[0], cb);
    }
  }
};
var sender = Sender$1;
function callCallbacks(sender2, err, cb) {
  if (typeof cb === "function") cb(err);
  for (let i = 0; i < sender2._queue.length; i++) {
    const params = sender2._queue[i];
    const callback = params[params.length - 1];
    if (typeof callback === "function") callback(err);
  }
}
function onError(sender2, err, cb) {
  callCallbacks(sender2, err, cb);
  sender2.onerror(err);
}
const { kForOnEventAttribute: kForOnEventAttribute$1, kListener: kListener$1 } = constants;
const kCode = Symbol("kCode");
const kData = Symbol("kData");
const kError = Symbol("kError");
const kMessage = Symbol("kMessage");
const kReason = Symbol("kReason");
const kTarget = Symbol("kTarget");
const kType = Symbol("kType");
const kWasClean = Symbol("kWasClean");
class Event {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @throws {TypeError} If the `type` argument is not specified
   */
  constructor(type2) {
    this[kTarget] = null;
    this[kType] = type2;
  }
  /**
   * @type {*}
   */
  get target() {
    return this[kTarget];
  }
  /**
   * @type {String}
   */
  get type() {
    return this[kType];
  }
}
Object.defineProperty(Event.prototype, "target", { enumerable: true });
Object.defineProperty(Event.prototype, "type", { enumerable: true });
class CloseEvent extends Event {
  /**
   * Create a new `CloseEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {Number} [options.code=0] The status code explaining why the
   *     connection was closed
   * @param {String} [options.reason=''] A human-readable string explaining why
   *     the connection was closed
   * @param {Boolean} [options.wasClean=false] Indicates whether or not the
   *     connection was cleanly closed
   */
  constructor(type2, options = {}) {
    super(type2);
    this[kCode] = options.code === void 0 ? 0 : options.code;
    this[kReason] = options.reason === void 0 ? "" : options.reason;
    this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
  }
  /**
   * @type {Number}
   */
  get code() {
    return this[kCode];
  }
  /**
   * @type {String}
   */
  get reason() {
    return this[kReason];
  }
  /**
   * @type {Boolean}
   */
  get wasClean() {
    return this[kWasClean];
  }
}
Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
class ErrorEvent extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.error=null] The error that generated this event
   * @param {String} [options.message=''] The error message
   */
  constructor(type2, options = {}) {
    super(type2);
    this[kError] = options.error === void 0 ? null : options.error;
    this[kMessage] = options.message === void 0 ? "" : options.message;
  }
  /**
   * @type {*}
   */
  get error() {
    return this[kError];
  }
  /**
   * @type {String}
   */
  get message() {
    return this[kMessage];
  }
}
Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
class MessageEvent extends Event {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.data=null] The message content
   */
  constructor(type2, options = {}) {
    super(type2);
    this[kData] = options.data === void 0 ? null : options.data;
  }
  /**
   * @type {*}
   */
  get data() {
    return this[kData];
  }
}
Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
const EventTarget = {
  /**
   * Register an event listener.
   *
   * @param {String} type A string representing the event type to listen for
   * @param {(Function|Object)} handler The listener to add
   * @param {Object} [options] An options object specifies characteristics about
   *     the event listener
   * @param {Boolean} [options.once=false] A `Boolean` indicating that the
   *     listener should be invoked at most once after being added. If `true`,
   *     the listener would be automatically removed when invoked.
   * @public
   */
  addEventListener(type2, handler, options = {}) {
    for (const listener of this.listeners(type2)) {
      if (!options[kForOnEventAttribute$1] && listener[kListener$1] === handler && !listener[kForOnEventAttribute$1]) {
        return;
      }
    }
    let wrapper;
    if (type2 === "message") {
      wrapper = function onMessage(data, isBinary) {
        const event = new MessageEvent("message", {
          data: isBinary ? data : data.toString()
        });
        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type2 === "close") {
      wrapper = function onClose(code, message2) {
        const event = new CloseEvent("close", {
          code,
          reason: message2.toString(),
          wasClean: this._closeFrameReceived && this._closeFrameSent
        });
        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type2 === "error") {
      wrapper = function onError2(error) {
        const event = new ErrorEvent("error", {
          error,
          message: error.message
        });
        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type2 === "open") {
      wrapper = function onOpen() {
        const event = new Event("open");
        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else {
      return;
    }
    wrapper[kForOnEventAttribute$1] = !!options[kForOnEventAttribute$1];
    wrapper[kListener$1] = handler;
    if (options.once) {
      this.once(type2, wrapper);
    } else {
      this.on(type2, wrapper);
    }
  },
  /**
   * Remove an event listener.
   *
   * @param {String} type A string representing the event type to remove
   * @param {(Function|Object)} handler The listener to remove
   * @public
   */
  removeEventListener(type2, handler) {
    for (const listener of this.listeners(type2)) {
      if (listener[kListener$1] === handler && !listener[kForOnEventAttribute$1]) {
        this.removeListener(type2, listener);
        break;
      }
    }
  }
};
var eventTarget = {
  EventTarget
};
function callListener(listener, thisArg, event) {
  if (typeof listener === "object" && listener.handleEvent) {
    listener.handleEvent.call(listener, event);
  } else {
    listener.call(thisArg, event);
  }
}
const { tokenChars: tokenChars$1 } = validationExports;
function push(dest, name, elem) {
  if (dest[name] === void 0) dest[name] = [elem];
  else dest[name].push(elem);
}
function parse$2(header) {
  const offers = /* @__PURE__ */ Object.create(null);
  let params = /* @__PURE__ */ Object.create(null);
  let mustUnescape = false;
  let isEscaping = false;
  let inQuotes = false;
  let extensionName;
  let paramName;
  let start = -1;
  let code = -1;
  let end2 = -1;
  let i = 0;
  for (; i < header.length; i++) {
    code = header.charCodeAt(i);
    if (extensionName === void 0) {
      if (end2 === -1 && tokenChars$1[code] === 1) {
        if (start === -1) start = i;
      } else if (i !== 0 && (code === 32 || code === 9)) {
        if (end2 === -1 && start !== -1) end2 = i;
      } else if (code === 59 || code === 44) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (end2 === -1) end2 = i;
        const name = header.slice(start, end2);
        if (code === 44) {
          push(offers, name, params);
          params = /* @__PURE__ */ Object.create(null);
        } else {
          extensionName = name;
        }
        start = end2 = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else if (paramName === void 0) {
      if (end2 === -1 && tokenChars$1[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 32 || code === 9) {
        if (end2 === -1 && start !== -1) end2 = i;
      } else if (code === 59 || code === 44) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (end2 === -1) end2 = i;
        push(params, header.slice(start, end2), true);
        if (code === 44) {
          push(offers, extensionName, params);
          params = /* @__PURE__ */ Object.create(null);
          extensionName = void 0;
        }
        start = end2 = -1;
      } else if (code === 61 && start !== -1 && end2 === -1) {
        paramName = header.slice(start, i);
        start = end2 = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else {
      if (isEscaping) {
        if (tokenChars$1[code] !== 1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (start === -1) start = i;
        else if (!mustUnescape) mustUnescape = true;
        isEscaping = false;
      } else if (inQuotes) {
        if (tokenChars$1[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 34 && start !== -1) {
          inQuotes = false;
          end2 = i;
        } else if (code === 92) {
          isEscaping = true;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
        inQuotes = true;
      } else if (end2 === -1 && tokenChars$1[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 32 || code === 9)) {
        if (end2 === -1) end2 = i;
      } else if (code === 59 || code === 44) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (end2 === -1) end2 = i;
        let value = header.slice(start, end2);
        if (mustUnescape) {
          value = value.replace(/\\/g, "");
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 44) {
          push(offers, extensionName, params);
          params = /* @__PURE__ */ Object.create(null);
          extensionName = void 0;
        }
        paramName = void 0;
        start = end2 = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
  }
  if (start === -1 || inQuotes || code === 32 || code === 9) {
    throw new SyntaxError("Unexpected end of input");
  }
  if (end2 === -1) end2 = i;
  const token = header.slice(start, end2);
  if (extensionName === void 0) {
    push(offers, token, params);
  } else {
    if (paramName === void 0) {
      push(params, token, true);
    } else if (mustUnescape) {
      push(params, paramName, token.replace(/\\/g, ""));
    } else {
      push(params, paramName, token);
    }
    push(offers, extensionName, params);
  }
  return offers;
}
function format$1(extensions) {
  return Object.keys(extensions).map((extension2) => {
    let configurations = extensions[extension2];
    if (!Array.isArray(configurations)) configurations = [configurations];
    return configurations.map((params) => {
      return [extension2].concat(
        Object.keys(params).map((k) => {
          let values = params[k];
          if (!Array.isArray(values)) values = [values];
          return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
        })
      ).join("; ");
    }).join(", ");
  }).join(", ");
}
var extension = { format: format$1, parse: parse$2 };
const EventEmitter$1 = require$$0$4;
const https = require$$1$1;
const http = require$$2$1;
const net = require$$3;
const tls = require$$4;
const { randomBytes, createHash: createHash$1 } = require$$1;
const { Duplex: Duplex$2, Readable } = require$$0$3;
const { URL } = require$$7;
const PerMessageDeflate = permessageDeflate;
const Receiver = receiver;
const Sender = sender;
const { isBlob } = validationExports;
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  GUID: GUID$1,
  kForOnEventAttribute,
  kListener,
  kStatusCode,
  kWebSocket: kWebSocket$1,
  NOOP
} = constants;
const {
  EventTarget: { addEventListener, removeEventListener }
} = eventTarget;
const { format, parse: parse$1 } = extension;
const { toBuffer } = bufferUtilExports;
const closeTimeout = 30 * 1e3;
const kAborted = Symbol("kAborted");
const protocolVersions = [8, 13];
const readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
class WebSocket extends EventEmitter$1 {
  /**
   * Create a new `WebSocket`.
   *
   * @param {(String|URL)} address The URL to which to connect
   * @param {(String|String[])} [protocols] The subprotocols
   * @param {Object} [options] Connection options
   */
  constructor(address, protocols, options) {
    super();
    this._binaryType = BINARY_TYPES[0];
    this._closeCode = 1006;
    this._closeFrameReceived = false;
    this._closeFrameSent = false;
    this._closeMessage = EMPTY_BUFFER;
    this._closeTimer = null;
    this._errorEmitted = false;
    this._extensions = {};
    this._paused = false;
    this._protocol = "";
    this._readyState = WebSocket.CONNECTING;
    this._receiver = null;
    this._sender = null;
    this._socket = null;
    if (address !== null) {
      this._bufferedAmount = 0;
      this._isServer = false;
      this._redirects = 0;
      if (protocols === void 0) {
        protocols = [];
      } else if (!Array.isArray(protocols)) {
        if (typeof protocols === "object" && protocols !== null) {
          options = protocols;
          protocols = [];
        } else {
          protocols = [protocols];
        }
      }
      initAsClient(this, address, protocols, options);
    } else {
      this._autoPong = options.autoPong;
      this._isServer = true;
    }
  }
  /**
   * For historical reasons, the custom "nodebuffer" type is used by the default
   * instead of "blob".
   *
   * @type {String}
   */
  get binaryType() {
    return this._binaryType;
  }
  set binaryType(type2) {
    if (!BINARY_TYPES.includes(type2)) return;
    this._binaryType = type2;
    if (this._receiver) this._receiver._binaryType = type2;
  }
  /**
   * @type {Number}
   */
  get bufferedAmount() {
    if (!this._socket) return this._bufferedAmount;
    return this._socket._writableState.length + this._sender._bufferedBytes;
  }
  /**
   * @type {String}
   */
  get extensions() {
    return Object.keys(this._extensions).join();
  }
  /**
   * @type {Boolean}
   */
  get isPaused() {
    return this._paused;
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onclose() {
    return null;
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onerror() {
    return null;
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onopen() {
    return null;
  }
  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onmessage() {
    return null;
  }
  /**
   * @type {String}
   */
  get protocol() {
    return this._protocol;
  }
  /**
   * @type {Number}
   */
  get readyState() {
    return this._readyState;
  }
  /**
   * @type {String}
   */
  get url() {
    return this._url;
  }
  /**
   * Set up the socket and the internal resources.
   *
   * @param {Duplex} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Object} options Options object
   * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
   *     multiple times in the same tick
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Number} [options.maxPayload=0] The maximum allowed message size
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @private
   */
  setSocket(socket, head, options) {
    const receiver2 = new Receiver({
      allowSynchronousEvents: options.allowSynchronousEvents,
      binaryType: this.binaryType,
      extensions: this._extensions,
      isServer: this._isServer,
      maxPayload: options.maxPayload,
      skipUTF8Validation: options.skipUTF8Validation
    });
    const sender2 = new Sender(socket, this._extensions, options.generateMask);
    this._receiver = receiver2;
    this._sender = sender2;
    this._socket = socket;
    receiver2[kWebSocket$1] = this;
    sender2[kWebSocket$1] = this;
    socket[kWebSocket$1] = this;
    receiver2.on("conclude", receiverOnConclude);
    receiver2.on("drain", receiverOnDrain);
    receiver2.on("error", receiverOnError);
    receiver2.on("message", receiverOnMessage);
    receiver2.on("ping", receiverOnPing);
    receiver2.on("pong", receiverOnPong);
    sender2.onerror = senderOnError;
    if (socket.setTimeout) socket.setTimeout(0);
    if (socket.setNoDelay) socket.setNoDelay();
    if (head.length > 0) socket.unshift(head);
    socket.on("close", socketOnClose);
    socket.on("data", socketOnData);
    socket.on("end", socketOnEnd);
    socket.on("error", socketOnError);
    this._readyState = WebSocket.OPEN;
    this.emit("open");
  }
  /**
   * Emit the `'close'` event.
   *
   * @private
   */
  emitClose() {
    if (!this._socket) {
      this._readyState = WebSocket.CLOSED;
      this.emit("close", this._closeCode, this._closeMessage);
      return;
    }
    if (this._extensions[PerMessageDeflate.extensionName]) {
      this._extensions[PerMessageDeflate.extensionName].cleanup();
    }
    this._receiver.removeAllListeners();
    this._readyState = WebSocket.CLOSED;
    this.emit("close", this._closeCode, this._closeMessage);
  }
  /**
   * Start a closing handshake.
   *
   *          +----------+   +-----------+   +----------+
   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
   *    |     +----------+   +-----------+   +----------+     |
   *          +----------+   +-----------+         |
   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
   *          +----------+   +-----------+   |
   *    |           |                        |   +---+        |
   *                +------------------------+-->|fin| - - - -
   *    |         +---+                      |   +---+
   *     - - - - -|fin|<---------------------+
   *              +---+
   *
   * @param {Number} [code] Status code explaining why the connection is closing
   * @param {(String|Buffer)} [data] The reason why the connection is
   *     closing
   * @public
   */
  close(code, data) {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = "WebSocket was closed before the connection was established";
      abortHandshake(this, this._req, msg);
      return;
    }
    if (this.readyState === WebSocket.CLOSING) {
      if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
        this._socket.end();
      }
      return;
    }
    this._readyState = WebSocket.CLOSING;
    this._sender.close(code, data, !this._isServer, (err) => {
      if (err) return;
      this._closeFrameSent = true;
      if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
        this._socket.end();
      }
    });
    setCloseTimer(this);
  }
  /**
   * Pause the socket.
   *
   * @public
   */
  pause() {
    if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) {
      return;
    }
    this._paused = true;
    this._socket.pause();
  }
  /**
   * Send a ping.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the ping is sent
   * @public
   */
  ping(data, mask2, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
    }
    if (typeof data === "function") {
      cb = data;
      data = mask2 = void 0;
    } else if (typeof mask2 === "function") {
      cb = mask2;
      mask2 = void 0;
    }
    if (typeof data === "number") data = data.toString();
    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }
    if (mask2 === void 0) mask2 = !this._isServer;
    this._sender.ping(data || EMPTY_BUFFER, mask2, cb);
  }
  /**
   * Send a pong.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the pong is sent
   * @public
   */
  pong(data, mask2, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
    }
    if (typeof data === "function") {
      cb = data;
      data = mask2 = void 0;
    } else if (typeof mask2 === "function") {
      cb = mask2;
      mask2 = void 0;
    }
    if (typeof data === "number") data = data.toString();
    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }
    if (mask2 === void 0) mask2 = !this._isServer;
    this._sender.pong(data || EMPTY_BUFFER, mask2, cb);
  }
  /**
   * Resume the socket.
   *
   * @public
   */
  resume() {
    if (this.readyState === WebSocket.CONNECTING || this.readyState === WebSocket.CLOSED) {
      return;
    }
    this._paused = false;
    if (!this._receiver._writableState.needDrain) this._socket.resume();
  }
  /**
   * Send a data message.
   *
   * @param {*} data The message to send
   * @param {Object} [options] Options object
   * @param {Boolean} [options.binary] Specifies whether `data` is binary or
   *     text
   * @param {Boolean} [options.compress] Specifies whether or not to compress
   *     `data`
   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when data is written out
   * @public
   */
  send(data, options, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
    }
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    if (typeof data === "number") data = data.toString();
    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }
    const opts = {
      binary: typeof data !== "string",
      mask: !this._isServer,
      compress: true,
      fin: true,
      ...options
    };
    if (!this._extensions[PerMessageDeflate.extensionName]) {
      opts.compress = false;
    }
    this._sender.send(data || EMPTY_BUFFER, opts, cb);
  }
  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate() {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = "WebSocket was closed before the connection was established";
      abortHandshake(this, this._req, msg);
      return;
    }
    if (this._socket) {
      this._readyState = WebSocket.CLOSING;
      this._socket.destroy();
    }
  }
}
Object.defineProperty(WebSocket, "CONNECTING", {
  enumerable: true,
  value: readyStates.indexOf("CONNECTING")
});
Object.defineProperty(WebSocket.prototype, "CONNECTING", {
  enumerable: true,
  value: readyStates.indexOf("CONNECTING")
});
Object.defineProperty(WebSocket, "OPEN", {
  enumerable: true,
  value: readyStates.indexOf("OPEN")
});
Object.defineProperty(WebSocket.prototype, "OPEN", {
  enumerable: true,
  value: readyStates.indexOf("OPEN")
});
Object.defineProperty(WebSocket, "CLOSING", {
  enumerable: true,
  value: readyStates.indexOf("CLOSING")
});
Object.defineProperty(WebSocket.prototype, "CLOSING", {
  enumerable: true,
  value: readyStates.indexOf("CLOSING")
});
Object.defineProperty(WebSocket, "CLOSED", {
  enumerable: true,
  value: readyStates.indexOf("CLOSED")
});
Object.defineProperty(WebSocket.prototype, "CLOSED", {
  enumerable: true,
  value: readyStates.indexOf("CLOSED")
});
[
  "binaryType",
  "bufferedAmount",
  "extensions",
  "isPaused",
  "protocol",
  "readyState",
  "url"
].forEach((property) => {
  Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
});
["open", "error", "close", "message"].forEach((method2) => {
  Object.defineProperty(WebSocket.prototype, `on${method2}`, {
    enumerable: true,
    get() {
      for (const listener of this.listeners(method2)) {
        if (listener[kForOnEventAttribute]) return listener[kListener];
      }
      return null;
    },
    set(handler) {
      for (const listener of this.listeners(method2)) {
        if (listener[kForOnEventAttribute]) {
          this.removeListener(method2, listener);
          break;
        }
      }
      if (typeof handler !== "function") return;
      this.addEventListener(method2, handler, {
        [kForOnEventAttribute]: true
      });
    }
  });
});
WebSocket.prototype.addEventListener = addEventListener;
WebSocket.prototype.removeEventListener = removeEventListener;
var websocket = WebSocket;
function initAsClient(websocket2, address, protocols, options) {
  const opts = {
    allowSynchronousEvents: true,
    autoPong: true,
    protocolVersion: protocolVersions[1],
    maxPayload: 100 * 1024 * 1024,
    skipUTF8Validation: false,
    perMessageDeflate: true,
    followRedirects: false,
    maxRedirects: 10,
    ...options,
    socketPath: void 0,
    hostname: void 0,
    protocol: void 0,
    timeout: void 0,
    method: "GET",
    host: void 0,
    path: void 0,
    port: void 0
  };
  websocket2._autoPong = opts.autoPong;
  if (!protocolVersions.includes(opts.protocolVersion)) {
    throw new RangeError(
      `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
    );
  }
  let parsedUrl;
  if (address instanceof URL) {
    parsedUrl = address;
  } else {
    try {
      parsedUrl = new URL(address);
    } catch (e) {
      throw new SyntaxError(`Invalid URL: ${address}`);
    }
  }
  if (parsedUrl.protocol === "http:") {
    parsedUrl.protocol = "ws:";
  } else if (parsedUrl.protocol === "https:") {
    parsedUrl.protocol = "wss:";
  }
  websocket2._url = parsedUrl.href;
  const isSecure = parsedUrl.protocol === "wss:";
  const isIpcUrl = parsedUrl.protocol === "ws+unix:";
  let invalidUrlMessage;
  if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
    invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
  } else if (isIpcUrl && !parsedUrl.pathname) {
    invalidUrlMessage = "The URL's pathname is empty";
  } else if (parsedUrl.hash) {
    invalidUrlMessage = "The URL contains a fragment identifier";
  }
  if (invalidUrlMessage) {
    const err = new SyntaxError(invalidUrlMessage);
    if (websocket2._redirects === 0) {
      throw err;
    } else {
      emitErrorAndClose(websocket2, err);
      return;
    }
  }
  const defaultPort = isSecure ? 443 : 80;
  const key = randomBytes(16).toString("base64");
  const request = isSecure ? https.request : http.request;
  const protocolSet = /* @__PURE__ */ new Set();
  let perMessageDeflate;
  opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
  opts.defaultPort = opts.defaultPort || defaultPort;
  opts.port = parsedUrl.port || defaultPort;
  opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
  opts.headers = {
    ...opts.headers,
    "Sec-WebSocket-Version": opts.protocolVersion,
    "Sec-WebSocket-Key": key,
    Connection: "Upgrade",
    Upgrade: "websocket"
  };
  opts.path = parsedUrl.pathname + parsedUrl.search;
  opts.timeout = opts.handshakeTimeout;
  if (opts.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate(
      opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
      false,
      opts.maxPayload
    );
    opts.headers["Sec-WebSocket-Extensions"] = format({
      [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
    });
  }
  if (protocols.length) {
    for (const protocol of protocols) {
      if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
        throw new SyntaxError(
          "An invalid or duplicated subprotocol was specified"
        );
      }
      protocolSet.add(protocol);
    }
    opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
  }
  if (opts.origin) {
    if (opts.protocolVersion < 13) {
      opts.headers["Sec-WebSocket-Origin"] = opts.origin;
    } else {
      opts.headers.Origin = opts.origin;
    }
  }
  if (parsedUrl.username || parsedUrl.password) {
    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
  }
  if (isIpcUrl) {
    const parts = opts.path.split(":");
    opts.socketPath = parts[0];
    opts.path = parts[1];
  }
  let req;
  if (opts.followRedirects) {
    if (websocket2._redirects === 0) {
      websocket2._originalIpc = isIpcUrl;
      websocket2._originalSecure = isSecure;
      websocket2._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
      const headers = options && options.headers;
      options = { ...options, headers: {} };
      if (headers) {
        for (const [key2, value] of Object.entries(headers)) {
          options.headers[key2.toLowerCase()] = value;
        }
      }
    } else if (websocket2.listenerCount("redirect") === 0) {
      const isSameHost = isIpcUrl ? websocket2._originalIpc ? opts.socketPath === websocket2._originalHostOrSocketPath : false : websocket2._originalIpc ? false : parsedUrl.host === websocket2._originalHostOrSocketPath;
      if (!isSameHost || websocket2._originalSecure && !isSecure) {
        delete opts.headers.authorization;
        delete opts.headers.cookie;
        if (!isSameHost) delete opts.headers.host;
        opts.auth = void 0;
      }
    }
    if (opts.auth && !options.headers.authorization) {
      options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
    }
    req = websocket2._req = request(opts);
    if (websocket2._redirects) {
      websocket2.emit("redirect", websocket2.url, req);
    }
  } else {
    req = websocket2._req = request(opts);
  }
  if (opts.timeout) {
    req.on("timeout", () => {
      abortHandshake(websocket2, req, "Opening handshake has timed out");
    });
  }
  req.on("error", (err) => {
    if (req === null || req[kAborted]) return;
    req = websocket2._req = null;
    emitErrorAndClose(websocket2, err);
  });
  req.on("response", (res) => {
    const location = res.headers.location;
    const statusCode = res.statusCode;
    if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
      if (++websocket2._redirects > opts.maxRedirects) {
        abortHandshake(websocket2, req, "Maximum redirects exceeded");
        return;
      }
      req.abort();
      let addr;
      try {
        addr = new URL(location, address);
      } catch (e) {
        const err = new SyntaxError(`Invalid URL: ${location}`);
        emitErrorAndClose(websocket2, err);
        return;
      }
      initAsClient(websocket2, addr, protocols, options);
    } else if (!websocket2.emit("unexpected-response", req, res)) {
      abortHandshake(
        websocket2,
        req,
        `Unexpected server response: ${res.statusCode}`
      );
    }
  });
  req.on("upgrade", (res, socket, head) => {
    websocket2.emit("upgrade", res);
    if (websocket2.readyState !== WebSocket.CONNECTING) return;
    req = websocket2._req = null;
    const upgrade = res.headers.upgrade;
    if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
      abortHandshake(websocket2, socket, "Invalid Upgrade header");
      return;
    }
    const digest = createHash$1("sha1").update(key + GUID$1).digest("base64");
    if (res.headers["sec-websocket-accept"] !== digest) {
      abortHandshake(websocket2, socket, "Invalid Sec-WebSocket-Accept header");
      return;
    }
    const serverProt = res.headers["sec-websocket-protocol"];
    let protError;
    if (serverProt !== void 0) {
      if (!protocolSet.size) {
        protError = "Server sent a subprotocol but none was requested";
      } else if (!protocolSet.has(serverProt)) {
        protError = "Server sent an invalid subprotocol";
      }
    } else if (protocolSet.size) {
      protError = "Server sent no subprotocol";
    }
    if (protError) {
      abortHandshake(websocket2, socket, protError);
      return;
    }
    if (serverProt) websocket2._protocol = serverProt;
    const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
    if (secWebSocketExtensions !== void 0) {
      if (!perMessageDeflate) {
        const message2 = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
        abortHandshake(websocket2, socket, message2);
        return;
      }
      let extensions;
      try {
        extensions = parse$1(secWebSocketExtensions);
      } catch (err) {
        const message2 = "Invalid Sec-WebSocket-Extensions header";
        abortHandshake(websocket2, socket, message2);
        return;
      }
      const extensionNames = Object.keys(extensions);
      if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
        const message2 = "Server indicated an extension that was not requested";
        abortHandshake(websocket2, socket, message2);
        return;
      }
      try {
        perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
      } catch (err) {
        const message2 = "Invalid Sec-WebSocket-Extensions header";
        abortHandshake(websocket2, socket, message2);
        return;
      }
      websocket2._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
    }
    websocket2.setSocket(socket, head, {
      allowSynchronousEvents: opts.allowSynchronousEvents,
      generateMask: opts.generateMask,
      maxPayload: opts.maxPayload,
      skipUTF8Validation: opts.skipUTF8Validation
    });
  });
  if (opts.finishRequest) {
    opts.finishRequest(req, websocket2);
  } else {
    req.end();
  }
}
function emitErrorAndClose(websocket2, err) {
  websocket2._readyState = WebSocket.CLOSING;
  websocket2._errorEmitted = true;
  websocket2.emit("error", err);
  websocket2.emitClose();
}
function netConnect(options) {
  options.path = options.socketPath;
  return net.connect(options);
}
function tlsConnect(options) {
  options.path = void 0;
  if (!options.servername && options.servername !== "") {
    options.servername = net.isIP(options.host) ? "" : options.host;
  }
  return tls.connect(options);
}
function abortHandshake(websocket2, stream, message2) {
  websocket2._readyState = WebSocket.CLOSING;
  const err = new Error(message2);
  Error.captureStackTrace(err, abortHandshake);
  if (stream.setHeader) {
    stream[kAborted] = true;
    stream.abort();
    if (stream.socket && !stream.socket.destroyed) {
      stream.socket.destroy();
    }
    process.nextTick(emitErrorAndClose, websocket2, err);
  } else {
    stream.destroy(err);
    stream.once("error", websocket2.emit.bind(websocket2, "error"));
    stream.once("close", websocket2.emitClose.bind(websocket2));
  }
}
function sendAfterClose(websocket2, data, cb) {
  if (data) {
    const length = isBlob(data) ? data.size : toBuffer(data).length;
    if (websocket2._socket) websocket2._sender._bufferedBytes += length;
    else websocket2._bufferedAmount += length;
  }
  if (cb) {
    const err = new Error(
      `WebSocket is not open: readyState ${websocket2.readyState} (${readyStates[websocket2.readyState]})`
    );
    process.nextTick(cb, err);
  }
}
function receiverOnConclude(code, reason) {
  const websocket2 = this[kWebSocket$1];
  websocket2._closeFrameReceived = true;
  websocket2._closeMessage = reason;
  websocket2._closeCode = code;
  if (websocket2._socket[kWebSocket$1] === void 0) return;
  websocket2._socket.removeListener("data", socketOnData);
  process.nextTick(resume, websocket2._socket);
  if (code === 1005) websocket2.close();
  else websocket2.close(code, reason);
}
function receiverOnDrain() {
  const websocket2 = this[kWebSocket$1];
  if (!websocket2.isPaused) websocket2._socket.resume();
}
function receiverOnError(err) {
  const websocket2 = this[kWebSocket$1];
  if (websocket2._socket[kWebSocket$1] !== void 0) {
    websocket2._socket.removeListener("data", socketOnData);
    process.nextTick(resume, websocket2._socket);
    websocket2.close(err[kStatusCode]);
  }
  if (!websocket2._errorEmitted) {
    websocket2._errorEmitted = true;
    websocket2.emit("error", err);
  }
}
function receiverOnFinish() {
  this[kWebSocket$1].emitClose();
}
function receiverOnMessage(data, isBinary) {
  this[kWebSocket$1].emit("message", data, isBinary);
}
function receiverOnPing(data) {
  const websocket2 = this[kWebSocket$1];
  if (websocket2._autoPong) websocket2.pong(data, !this._isServer, NOOP);
  websocket2.emit("ping", data);
}
function receiverOnPong(data) {
  this[kWebSocket$1].emit("pong", data);
}
function resume(stream) {
  stream.resume();
}
function senderOnError(err) {
  const websocket2 = this[kWebSocket$1];
  if (websocket2.readyState === WebSocket.CLOSED) return;
  if (websocket2.readyState === WebSocket.OPEN) {
    websocket2._readyState = WebSocket.CLOSING;
    setCloseTimer(websocket2);
  }
  this._socket.end();
  if (!websocket2._errorEmitted) {
    websocket2._errorEmitted = true;
    websocket2.emit("error", err);
  }
}
function setCloseTimer(websocket2) {
  websocket2._closeTimer = setTimeout(
    websocket2._socket.destroy.bind(websocket2._socket),
    closeTimeout
  );
}
function socketOnClose() {
  const websocket2 = this[kWebSocket$1];
  this.removeListener("close", socketOnClose);
  this.removeListener("data", socketOnData);
  this.removeListener("end", socketOnEnd);
  websocket2._readyState = WebSocket.CLOSING;
  let chunk;
  if (!this._readableState.endEmitted && !websocket2._closeFrameReceived && !websocket2._receiver._writableState.errorEmitted && (chunk = websocket2._socket.read()) !== null) {
    websocket2._receiver.write(chunk);
  }
  websocket2._receiver.end();
  this[kWebSocket$1] = void 0;
  clearTimeout(websocket2._closeTimer);
  if (websocket2._receiver._writableState.finished || websocket2._receiver._writableState.errorEmitted) {
    websocket2.emitClose();
  } else {
    websocket2._receiver.on("error", receiverOnFinish);
    websocket2._receiver.on("finish", receiverOnFinish);
  }
}
function socketOnData(chunk) {
  if (!this[kWebSocket$1]._receiver.write(chunk)) {
    this.pause();
  }
}
function socketOnEnd() {
  const websocket2 = this[kWebSocket$1];
  websocket2._readyState = WebSocket.CLOSING;
  websocket2._receiver.end();
  this.end();
}
function socketOnError() {
  const websocket2 = this[kWebSocket$1];
  this.removeListener("error", socketOnError);
  this.on("error", NOOP);
  if (websocket2) {
    websocket2._readyState = WebSocket.CLOSING;
    this.destroy();
  }
}
const WebSocket$1 = /* @__PURE__ */ getDefaultExportFromCjs(websocket);
const { Duplex: Duplex$1 } = require$$0$3;
const { tokenChars } = validationExports;
const { Duplex } = require$$0$3;
const { createHash } = require$$1;
const { GUID, kWebSocket } = constants;
var src = { exports: {} };
var indexLight = { exports: {} };
var indexMinimal = {};
var minimal = {};
var aspromise = asPromise$1;
function asPromise$1(fn, ctx) {
  var params = new Array(arguments.length - 1), offset = 0, index = 2, pending = true;
  while (index < arguments.length)
    params[offset++] = arguments[index++];
  return new Promise(function executor(resolve, reject) {
    params[offset] = function callback(err) {
      if (pending) {
        pending = false;
        if (err)
          reject(err);
        else {
          var params2 = new Array(arguments.length - 1), offset2 = 0;
          while (offset2 < params2.length)
            params2[offset2++] = arguments[offset2];
          resolve.apply(null, params2);
        }
      }
    };
    try {
      fn.apply(ctx || null, params);
    } catch (err) {
      if (pending) {
        pending = false;
        reject(err);
      }
    }
  });
}
var base64$1 = {};
(function(exports) {
  var base642 = exports;
  base642.length = function length(string) {
    var p = string.length;
    if (!p)
      return 0;
    var n = 0;
    while (--p % 4 > 1 && string.charAt(p) === "=")
      ++n;
    return Math.ceil(string.length * 3) / 4 - n;
  };
  var b64 = new Array(64);
  var s64 = new Array(123);
  for (var i = 0; i < 64; )
    s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;
  base642.encode = function encode2(buffer, start, end2) {
    var parts = null, chunk = [];
    var i2 = 0, j = 0, t;
    while (start < end2) {
      var b = buffer[start++];
      switch (j) {
        case 0:
          chunk[i2++] = b64[b >> 2];
          t = (b & 3) << 4;
          j = 1;
          break;
        case 1:
          chunk[i2++] = b64[t | b >> 4];
          t = (b & 15) << 2;
          j = 2;
          break;
        case 2:
          chunk[i2++] = b64[t | b >> 6];
          chunk[i2++] = b64[b & 63];
          j = 0;
          break;
      }
      if (i2 > 8191) {
        (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
        i2 = 0;
      }
    }
    if (j) {
      chunk[i2++] = b64[t];
      chunk[i2++] = 61;
      if (j === 1)
        chunk[i2++] = 61;
    }
    if (parts) {
      if (i2)
        parts.push(String.fromCharCode.apply(String, chunk.slice(0, i2)));
      return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i2));
  };
  var invalidEncoding = "invalid encoding";
  base642.decode = function decode2(string, buffer, offset) {
    var start = offset;
    var j = 0, t;
    for (var i2 = 0; i2 < string.length; ) {
      var c = string.charCodeAt(i2++);
      if (c === 61 && j > 1)
        break;
      if ((c = s64[c]) === void 0)
        throw Error(invalidEncoding);
      switch (j) {
        case 0:
          t = c;
          j = 1;
          break;
        case 1:
          buffer[offset++] = t << 2 | (c & 48) >> 4;
          t = c;
          j = 2;
          break;
        case 2:
          buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
          t = c;
          j = 3;
          break;
        case 3:
          buffer[offset++] = (t & 3) << 6 | c;
          j = 0;
          break;
      }
    }
    if (j === 1)
      throw Error(invalidEncoding);
    return offset - start;
  };
  base642.test = function test(string) {
    return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string);
  };
})(base64$1);
var eventemitter = EventEmitter;
function EventEmitter() {
  this._listeners = {};
}
EventEmitter.prototype.on = function on(evt, fn, ctx) {
  (this._listeners[evt] || (this._listeners[evt] = [])).push({
    fn,
    ctx: ctx || this
  });
  return this;
};
EventEmitter.prototype.off = function off(evt, fn) {
  if (evt === void 0)
    this._listeners = {};
  else {
    if (fn === void 0)
      this._listeners[evt] = [];
    else {
      var listeners = this._listeners[evt];
      for (var i = 0; i < listeners.length; )
        if (listeners[i].fn === fn)
          listeners.splice(i, 1);
        else
          ++i;
    }
  }
  return this;
};
EventEmitter.prototype.emit = function emit(evt) {
  var listeners = this._listeners[evt];
  if (listeners) {
    var args = [], i = 1;
    for (; i < arguments.length; )
      args.push(arguments[i++]);
    for (i = 0; i < listeners.length; )
      listeners[i].fn.apply(listeners[i++].ctx, args);
  }
  return this;
};
var float = factory(factory);
function factory(exports) {
  if (typeof Float32Array !== "undefined") (function() {
    var f32 = new Float32Array([-0]), f8b = new Uint8Array(f32.buffer), le = f8b[3] === 128;
    function writeFloat_f32_cpy(val, buf, pos) {
      f32[0] = val;
      buf[pos] = f8b[0];
      buf[pos + 1] = f8b[1];
      buf[pos + 2] = f8b[2];
      buf[pos + 3] = f8b[3];
    }
    function writeFloat_f32_rev(val, buf, pos) {
      f32[0] = val;
      buf[pos] = f8b[3];
      buf[pos + 1] = f8b[2];
      buf[pos + 2] = f8b[1];
      buf[pos + 3] = f8b[0];
    }
    exports.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
    exports.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;
    function readFloat_f32_cpy(buf, pos) {
      f8b[0] = buf[pos];
      f8b[1] = buf[pos + 1];
      f8b[2] = buf[pos + 2];
      f8b[3] = buf[pos + 3];
      return f32[0];
    }
    function readFloat_f32_rev(buf, pos) {
      f8b[3] = buf[pos];
      f8b[2] = buf[pos + 1];
      f8b[1] = buf[pos + 2];
      f8b[0] = buf[pos + 3];
      return f32[0];
    }
    exports.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
    exports.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;
  })();
  else (function() {
    function writeFloat_ieee754(writeUint, val, buf, pos) {
      var sign = val < 0 ? 1 : 0;
      if (sign)
        val = -val;
      if (val === 0)
        writeUint(1 / val > 0 ? (
          /* positive */
          0
        ) : (
          /* negative 0 */
          2147483648
        ), buf, pos);
      else if (isNaN(val))
        writeUint(2143289344, buf, pos);
      else if (val > 34028234663852886e22)
        writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
      else if (val < 11754943508222875e-54)
        writeUint((sign << 31 | Math.round(val / 1401298464324817e-60)) >>> 0, buf, pos);
      else {
        var exponent = Math.floor(Math.log(val) / Math.LN2), mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
        writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
      }
    }
    exports.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
    exports.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);
    function readFloat_ieee754(readUint, buf, pos) {
      var uint = readUint(buf, pos), sign = (uint >> 31) * 2 + 1, exponent = uint >>> 23 & 255, mantissa = uint & 8388607;
      return exponent === 255 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 1401298464324817e-60 * mantissa : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
    }
    exports.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
    exports.readFloatBE = readFloat_ieee754.bind(null, readUintBE);
  })();
  if (typeof Float64Array !== "undefined") (function() {
    var f64 = new Float64Array([-0]), f8b = new Uint8Array(f64.buffer), le = f8b[7] === 128;
    function writeDouble_f64_cpy(val, buf, pos) {
      f64[0] = val;
      buf[pos] = f8b[0];
      buf[pos + 1] = f8b[1];
      buf[pos + 2] = f8b[2];
      buf[pos + 3] = f8b[3];
      buf[pos + 4] = f8b[4];
      buf[pos + 5] = f8b[5];
      buf[pos + 6] = f8b[6];
      buf[pos + 7] = f8b[7];
    }
    function writeDouble_f64_rev(val, buf, pos) {
      f64[0] = val;
      buf[pos] = f8b[7];
      buf[pos + 1] = f8b[6];
      buf[pos + 2] = f8b[5];
      buf[pos + 3] = f8b[4];
      buf[pos + 4] = f8b[3];
      buf[pos + 5] = f8b[2];
      buf[pos + 6] = f8b[1];
      buf[pos + 7] = f8b[0];
    }
    exports.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
    exports.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;
    function readDouble_f64_cpy(buf, pos) {
      f8b[0] = buf[pos];
      f8b[1] = buf[pos + 1];
      f8b[2] = buf[pos + 2];
      f8b[3] = buf[pos + 3];
      f8b[4] = buf[pos + 4];
      f8b[5] = buf[pos + 5];
      f8b[6] = buf[pos + 6];
      f8b[7] = buf[pos + 7];
      return f64[0];
    }
    function readDouble_f64_rev(buf, pos) {
      f8b[7] = buf[pos];
      f8b[6] = buf[pos + 1];
      f8b[5] = buf[pos + 2];
      f8b[4] = buf[pos + 3];
      f8b[3] = buf[pos + 4];
      f8b[2] = buf[pos + 5];
      f8b[1] = buf[pos + 6];
      f8b[0] = buf[pos + 7];
      return f64[0];
    }
    exports.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
    exports.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;
  })();
  else (function() {
    function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
      var sign = val < 0 ? 1 : 0;
      if (sign)
        val = -val;
      if (val === 0) {
        writeUint(0, buf, pos + off0);
        writeUint(1 / val > 0 ? (
          /* positive */
          0
        ) : (
          /* negative 0 */
          2147483648
        ), buf, pos + off1);
      } else if (isNaN(val)) {
        writeUint(0, buf, pos + off0);
        writeUint(2146959360, buf, pos + off1);
      } else if (val > 17976931348623157e292) {
        writeUint(0, buf, pos + off0);
        writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
      } else {
        var mantissa;
        if (val < 22250738585072014e-324) {
          mantissa = val / 5e-324;
          writeUint(mantissa >>> 0, buf, pos + off0);
          writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
        } else {
          var exponent = Math.floor(Math.log(val) / Math.LN2);
          if (exponent === 1024)
            exponent = 1023;
          mantissa = val * Math.pow(2, -exponent);
          writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
          writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
        }
      }
    }
    exports.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
    exports.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);
    function readDouble_ieee754(readUint, off0, off1, buf, pos) {
      var lo = readUint(buf, pos + off0), hi = readUint(buf, pos + off1);
      var sign = (hi >> 31) * 2 + 1, exponent = hi >>> 20 & 2047, mantissa = 4294967296 * (hi & 1048575) + lo;
      return exponent === 2047 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 5e-324 * mantissa : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
    }
    exports.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
    exports.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);
  })();
  return exports;
}
function writeUintLE(val, buf, pos) {
  buf[pos] = val & 255;
  buf[pos + 1] = val >>> 8 & 255;
  buf[pos + 2] = val >>> 16 & 255;
  buf[pos + 3] = val >>> 24;
}
function writeUintBE(val, buf, pos) {
  buf[pos] = val >>> 24;
  buf[pos + 1] = val >>> 16 & 255;
  buf[pos + 2] = val >>> 8 & 255;
  buf[pos + 3] = val & 255;
}
function readUintLE(buf, pos) {
  return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16 | buf[pos + 3] << 24) >>> 0;
}
function readUintBE(buf, pos) {
  return (buf[pos] << 24 | buf[pos + 1] << 16 | buf[pos + 2] << 8 | buf[pos + 3]) >>> 0;
}
var inquire_1 = inquire$1;
function inquire$1(moduleName) {
  try {
    var mod = eval("quire".replace(/^/, "re"))(moduleName);
    if (mod && (mod.length || Object.keys(mod).length))
      return mod;
  } catch (e) {
  }
  return null;
}
var utf8$2 = {};
(function(exports) {
  var utf82 = exports;
  utf82.length = function utf8_length(string) {
    var len = 0, c = 0;
    for (var i = 0; i < string.length; ++i) {
      c = string.charCodeAt(i);
      if (c < 128)
        len += 1;
      else if (c < 2048)
        len += 2;
      else if ((c & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
        ++i;
        len += 4;
      } else
        len += 3;
    }
    return len;
  };
  utf82.read = function utf8_read(buffer, start, end2) {
    var len = end2 - start;
    if (len < 1)
      return "";
    var parts = null, chunk = [], i = 0, t;
    while (start < end2) {
      t = buffer[start++];
      if (t < 128)
        chunk[i++] = t;
      else if (t > 191 && t < 224)
        chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
      else if (t > 239 && t < 365) {
        t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 65536;
        chunk[i++] = 55296 + (t >> 10);
        chunk[i++] = 56320 + (t & 1023);
      } else
        chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
      if (i > 8191) {
        (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
        i = 0;
      }
    }
    if (parts) {
      if (i)
        parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
      return parts.join("");
    }
    return String.fromCharCode.apply(String, chunk.slice(0, i));
  };
  utf82.write = function utf8_write(string, buffer, offset) {
    var start = offset, c1, c2;
    for (var i = 0; i < string.length; ++i) {
      c1 = string.charCodeAt(i);
      if (c1 < 128) {
        buffer[offset++] = c1;
      } else if (c1 < 2048) {
        buffer[offset++] = c1 >> 6 | 192;
        buffer[offset++] = c1 & 63 | 128;
      } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
        c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
        ++i;
        buffer[offset++] = c1 >> 18 | 240;
        buffer[offset++] = c1 >> 12 & 63 | 128;
        buffer[offset++] = c1 >> 6 & 63 | 128;
        buffer[offset++] = c1 & 63 | 128;
      } else {
        buffer[offset++] = c1 >> 12 | 224;
        buffer[offset++] = c1 >> 6 & 63 | 128;
        buffer[offset++] = c1 & 63 | 128;
      }
    }
    return offset - start;
  };
})(utf8$2);
var pool_1 = pool;
function pool(alloc2, slice, size) {
  var SIZE = size || 8192;
  var MAX = SIZE >>> 1;
  var slab = null;
  var offset = SIZE;
  return function pool_alloc(size2) {
    if (size2 < 1 || size2 > MAX)
      return alloc2(size2);
    if (offset + size2 > SIZE) {
      slab = alloc2(SIZE);
      offset = 0;
    }
    var buf = slice.call(slab, offset, offset += size2);
    if (offset & 7)
      offset = (offset | 7) + 1;
    return buf;
  };
}
var longbits;
var hasRequiredLongbits;
function requireLongbits() {
  if (hasRequiredLongbits) return longbits;
  hasRequiredLongbits = 1;
  longbits = LongBits2;
  var util2 = requireMinimal();
  function LongBits2(lo, hi) {
    this.lo = lo >>> 0;
    this.hi = hi >>> 0;
  }
  var zero = LongBits2.zero = new LongBits2(0, 0);
  zero.toNumber = function() {
    return 0;
  };
  zero.zzEncode = zero.zzDecode = function() {
    return this;
  };
  zero.length = function() {
    return 1;
  };
  var zeroHash = LongBits2.zeroHash = "\0\0\0\0\0\0\0\0";
  LongBits2.fromNumber = function fromNumber(value) {
    if (value === 0)
      return zero;
    var sign = value < 0;
    if (sign)
      value = -value;
    var lo = value >>> 0, hi = (value - lo) / 4294967296 >>> 0;
    if (sign) {
      hi = ~hi >>> 0;
      lo = ~lo >>> 0;
      if (++lo > 4294967295) {
        lo = 0;
        if (++hi > 4294967295)
          hi = 0;
      }
    }
    return new LongBits2(lo, hi);
  };
  LongBits2.from = function from(value) {
    if (typeof value === "number")
      return LongBits2.fromNumber(value);
    if (util2.isString(value)) {
      if (util2.Long)
        value = util2.Long.fromString(value);
      else
        return LongBits2.fromNumber(parseInt(value, 10));
    }
    return value.low || value.high ? new LongBits2(value.low >>> 0, value.high >>> 0) : zero;
  };
  LongBits2.prototype.toNumber = function toNumber(unsigned) {
    if (!unsigned && this.hi >>> 31) {
      var lo = ~this.lo + 1 >>> 0, hi = ~this.hi >>> 0;
      if (!lo)
        hi = hi + 1 >>> 0;
      return -(lo + hi * 4294967296);
    }
    return this.lo + this.hi * 4294967296;
  };
  LongBits2.prototype.toLong = function toLong(unsigned) {
    return util2.Long ? new util2.Long(this.lo | 0, this.hi | 0, Boolean(unsigned)) : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
  };
  var charCodeAt = String.prototype.charCodeAt;
  LongBits2.fromHash = function fromHash(hash) {
    if (hash === zeroHash)
      return zero;
    return new LongBits2(
      (charCodeAt.call(hash, 0) | charCodeAt.call(hash, 1) << 8 | charCodeAt.call(hash, 2) << 16 | charCodeAt.call(hash, 3) << 24) >>> 0,
      (charCodeAt.call(hash, 4) | charCodeAt.call(hash, 5) << 8 | charCodeAt.call(hash, 6) << 16 | charCodeAt.call(hash, 7) << 24) >>> 0
    );
  };
  LongBits2.prototype.toHash = function toHash() {
    return String.fromCharCode(
      this.lo & 255,
      this.lo >>> 8 & 255,
      this.lo >>> 16 & 255,
      this.lo >>> 24,
      this.hi & 255,
      this.hi >>> 8 & 255,
      this.hi >>> 16 & 255,
      this.hi >>> 24
    );
  };
  LongBits2.prototype.zzEncode = function zzEncode() {
    var mask2 = this.hi >> 31;
    this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask2) >>> 0;
    this.lo = (this.lo << 1 ^ mask2) >>> 0;
    return this;
  };
  LongBits2.prototype.zzDecode = function zzDecode() {
    var mask2 = -(this.lo & 1);
    this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask2) >>> 0;
    this.hi = (this.hi >>> 1 ^ mask2) >>> 0;
    return this;
  };
  LongBits2.prototype.length = function length() {
    var part0 = this.lo, part1 = (this.lo >>> 28 | this.hi << 4) >>> 0, part2 = this.hi >>> 24;
    return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
  };
  return longbits;
}
var hasRequiredMinimal;
function requireMinimal() {
  if (hasRequiredMinimal) return minimal;
  hasRequiredMinimal = 1;
  (function(exports) {
    var util2 = exports;
    util2.asPromise = aspromise;
    util2.base64 = base64$1;
    util2.EventEmitter = eventemitter;
    util2.float = float;
    util2.inquire = inquire_1;
    util2.utf8 = utf8$2;
    util2.pool = pool_1;
    util2.LongBits = requireLongbits();
    util2.isNode = Boolean(typeof commonjsGlobal !== "undefined" && commonjsGlobal && commonjsGlobal.process && commonjsGlobal.process.versions && commonjsGlobal.process.versions.node);
    util2.global = util2.isNode && commonjsGlobal || typeof window !== "undefined" && window || typeof self !== "undefined" && self || commonjsGlobal;
    util2.emptyArray = Object.freeze ? Object.freeze([]) : (
      /* istanbul ignore next */
      []
    );
    util2.emptyObject = Object.freeze ? Object.freeze({}) : (
      /* istanbul ignore next */
      {}
    );
    util2.isInteger = Number.isInteger || /* istanbul ignore next */
    function isInteger(value) {
      return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };
    util2.isString = function isString(value) {
      return typeof value === "string" || value instanceof String;
    };
    util2.isObject = function isObject(value) {
      return value && typeof value === "object";
    };
    util2.isset = /**
     * Checks if a property on a message is considered to be present.
     * @param {Object} obj Plain object or message instance
     * @param {string} prop Property name
     * @returns {boolean} `true` if considered to be present, otherwise `false`
     */
    util2.isSet = function isSet(obj, prop) {
      var value = obj[prop];
      if (value != null && obj.hasOwnProperty(prop))
        return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
      return false;
    };
    util2.Buffer = function() {
      try {
        var Buffer2 = util2.inquire("buffer").Buffer;
        return Buffer2.prototype.utf8Write ? Buffer2 : (
          /* istanbul ignore next */
          null
        );
      } catch (e) {
        return null;
      }
    }();
    util2._Buffer_from = null;
    util2._Buffer_allocUnsafe = null;
    util2.newBuffer = function newBuffer(sizeOrArray) {
      return typeof sizeOrArray === "number" ? util2.Buffer ? util2._Buffer_allocUnsafe(sizeOrArray) : new util2.Array(sizeOrArray) : util2.Buffer ? util2._Buffer_from(sizeOrArray) : typeof Uint8Array === "undefined" ? sizeOrArray : new Uint8Array(sizeOrArray);
    };
    util2.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    util2.Long = /* istanbul ignore next */
    util2.global.dcodeIO && /* istanbul ignore next */
    util2.global.dcodeIO.Long || /* istanbul ignore next */
    util2.global.Long || util2.inquire("long");
    util2.key2Re = /^true|false|0|1$/;
    util2.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
    util2.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
    util2.longToHash = function longToHash(value) {
      return value ? util2.LongBits.from(value).toHash() : util2.LongBits.zeroHash;
    };
    util2.longFromHash = function longFromHash(hash, unsigned) {
      var bits = util2.LongBits.fromHash(hash);
      if (util2.Long)
        return util2.Long.fromBits(bits.lo, bits.hi, unsigned);
      return bits.toNumber(Boolean(unsigned));
    };
    function merge(dst, src2, ifNotSet) {
      for (var keys = Object.keys(src2), i = 0; i < keys.length; ++i)
        if (dst[keys[i]] === void 0 || !ifNotSet)
          dst[keys[i]] = src2[keys[i]];
      return dst;
    }
    util2.merge = merge;
    util2.lcFirst = function lcFirst(str) {
      return str.charAt(0).toLowerCase() + str.substring(1);
    };
    function newError(name) {
      function CustomError(message2, properties) {
        if (!(this instanceof CustomError))
          return new CustomError(message2, properties);
        Object.defineProperty(this, "message", { get: function() {
          return message2;
        } });
        if (Error.captureStackTrace)
          Error.captureStackTrace(this, CustomError);
        else
          Object.defineProperty(this, "stack", { value: new Error().stack || "" });
        if (properties)
          merge(this, properties);
      }
      CustomError.prototype = Object.create(Error.prototype, {
        constructor: {
          value: CustomError,
          writable: true,
          enumerable: false,
          configurable: true
        },
        name: {
          get: function get2() {
            return name;
          },
          set: void 0,
          enumerable: false,
          // configurable: false would accurately preserve the behavior of
          // the original, but I'm guessing that was not intentional.
          // For an actual error subclass, this property would
          // be configurable.
          configurable: true
        },
        toString: {
          value: function value() {
            return this.name + ": " + this.message;
          },
          writable: true,
          enumerable: false,
          configurable: true
        }
      });
      return CustomError;
    }
    util2.newError = newError;
    util2.ProtocolError = newError("ProtocolError");
    util2.oneOfGetter = function getOneOf(fieldNames) {
      var fieldMap = {};
      for (var i = 0; i < fieldNames.length; ++i)
        fieldMap[fieldNames[i]] = 1;
      return function() {
        for (var keys = Object.keys(this), i2 = keys.length - 1; i2 > -1; --i2)
          if (fieldMap[keys[i2]] === 1 && this[keys[i2]] !== void 0 && this[keys[i2]] !== null)
            return keys[i2];
      };
    };
    util2.oneOfSetter = function setOneOf(fieldNames) {
      return function(name) {
        for (var i = 0; i < fieldNames.length; ++i)
          if (fieldNames[i] !== name)
            delete this[fieldNames[i]];
      };
    };
    util2.toJSONOptions = {
      longs: String,
      enums: String,
      bytes: String,
      json: true
    };
    util2._configure = function() {
      var Buffer2 = util2.Buffer;
      if (!Buffer2) {
        util2._Buffer_from = util2._Buffer_allocUnsafe = null;
        return;
      }
      util2._Buffer_from = Buffer2.from !== Uint8Array.from && Buffer2.from || /* istanbul ignore next */
      function Buffer_from(value, encoding) {
        return new Buffer2(value, encoding);
      };
      util2._Buffer_allocUnsafe = Buffer2.allocUnsafe || /* istanbul ignore next */
      function Buffer_allocUnsafe(size) {
        return new Buffer2(size);
      };
    };
  })(minimal);
  return minimal;
}
var writer = Writer$1;
var util$7 = requireMinimal();
var BufferWriter$1;
var LongBits$1 = util$7.LongBits, base64 = util$7.base64, utf8$1 = util$7.utf8;
function Op(fn, len, val) {
  this.fn = fn;
  this.len = len;
  this.next = void 0;
  this.val = val;
}
function noop() {
}
function State(writer2) {
  this.head = writer2.head;
  this.tail = writer2.tail;
  this.len = writer2.len;
  this.next = writer2.states;
}
function Writer$1() {
  this.len = 0;
  this.head = new Op(noop, 0, 0);
  this.tail = this.head;
  this.states = null;
}
var create$1 = function create2() {
  return util$7.Buffer ? function create_buffer_setup() {
    return (Writer$1.create = function create_buffer() {
      return new BufferWriter$1();
    })();
  } : function create_array3() {
    return new Writer$1();
  };
};
Writer$1.create = create$1();
Writer$1.alloc = function alloc(size) {
  return new util$7.Array(size);
};
if (util$7.Array !== Array)
  Writer$1.alloc = util$7.pool(Writer$1.alloc, util$7.Array.prototype.subarray);
Writer$1.prototype._push = function push2(fn, len, val) {
  this.tail = this.tail.next = new Op(fn, len, val);
  this.len += len;
  return this;
};
function writeByte(val, buf, pos) {
  buf[pos] = val & 255;
}
function writeVarint32(val, buf, pos) {
  while (val > 127) {
    buf[pos++] = val & 127 | 128;
    val >>>= 7;
  }
  buf[pos] = val;
}
function VarintOp(len, val) {
  this.len = len;
  this.next = void 0;
  this.val = val;
}
VarintOp.prototype = Object.create(Op.prototype);
VarintOp.prototype.fn = writeVarint32;
Writer$1.prototype.uint32 = function write_uint32(value) {
  this.len += (this.tail = this.tail.next = new VarintOp(
    (value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5,
    value
  )).len;
  return this;
};
Writer$1.prototype.int32 = function write_int32(value) {
  return value < 0 ? this._push(writeVarint64, 10, LongBits$1.fromNumber(value)) : this.uint32(value);
};
Writer$1.prototype.sint32 = function write_sint32(value) {
  return this.uint32((value << 1 ^ value >> 31) >>> 0);
};
function writeVarint64(val, buf, pos) {
  while (val.hi) {
    buf[pos++] = val.lo & 127 | 128;
    val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
    val.hi >>>= 7;
  }
  while (val.lo > 127) {
    buf[pos++] = val.lo & 127 | 128;
    val.lo = val.lo >>> 7;
  }
  buf[pos++] = val.lo;
}
Writer$1.prototype.uint64 = function write_uint64(value) {
  var bits = LongBits$1.from(value);
  return this._push(writeVarint64, bits.length(), bits);
};
Writer$1.prototype.int64 = Writer$1.prototype.uint64;
Writer$1.prototype.sint64 = function write_sint64(value) {
  var bits = LongBits$1.from(value).zzEncode();
  return this._push(writeVarint64, bits.length(), bits);
};
Writer$1.prototype.bool = function write_bool(value) {
  return this._push(writeByte, 1, value ? 1 : 0);
};
function writeFixed32(val, buf, pos) {
  buf[pos] = val & 255;
  buf[pos + 1] = val >>> 8 & 255;
  buf[pos + 2] = val >>> 16 & 255;
  buf[pos + 3] = val >>> 24;
}
Writer$1.prototype.fixed32 = function write_fixed32(value) {
  return this._push(writeFixed32, 4, value >>> 0);
};
Writer$1.prototype.sfixed32 = Writer$1.prototype.fixed32;
Writer$1.prototype.fixed64 = function write_fixed64(value) {
  var bits = LongBits$1.from(value);
  return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
};
Writer$1.prototype.sfixed64 = Writer$1.prototype.fixed64;
Writer$1.prototype.float = function write_float(value) {
  return this._push(util$7.float.writeFloatLE, 4, value);
};
Writer$1.prototype.double = function write_double(value) {
  return this._push(util$7.float.writeDoubleLE, 8, value);
};
var writeBytes = util$7.Array.prototype.set ? function writeBytes_set(val, buf, pos) {
  buf.set(val, pos);
} : function writeBytes_for(val, buf, pos) {
  for (var i = 0; i < val.length; ++i)
    buf[pos + i] = val[i];
};
Writer$1.prototype.bytes = function write_bytes(value) {
  var len = value.length >>> 0;
  if (!len)
    return this._push(writeByte, 1, 0);
  if (util$7.isString(value)) {
    var buf = Writer$1.alloc(len = base64.length(value));
    base64.decode(value, buf, 0);
    value = buf;
  }
  return this.uint32(len)._push(writeBytes, len, value);
};
Writer$1.prototype.string = function write_string(value) {
  var len = utf8$1.length(value);
  return len ? this.uint32(len)._push(utf8$1.write, len, value) : this._push(writeByte, 1, 0);
};
Writer$1.prototype.fork = function fork() {
  this.states = new State(this);
  this.head = this.tail = new Op(noop, 0, 0);
  this.len = 0;
  return this;
};
Writer$1.prototype.reset = function reset() {
  if (this.states) {
    this.head = this.states.head;
    this.tail = this.states.tail;
    this.len = this.states.len;
    this.states = this.states.next;
  } else {
    this.head = this.tail = new Op(noop, 0, 0);
    this.len = 0;
  }
  return this;
};
Writer$1.prototype.ldelim = function ldelim() {
  var head = this.head, tail = this.tail, len = this.len;
  this.reset().uint32(len);
  if (len) {
    this.tail.next = head.next;
    this.tail = tail;
    this.len += len;
  }
  return this;
};
Writer$1.prototype.finish = function finish() {
  var head = this.head.next, buf = this.constructor.alloc(this.len), pos = 0;
  while (head) {
    head.fn(head.val, buf, pos);
    pos += head.len;
    head = head.next;
  }
  return buf;
};
Writer$1._configure = function(BufferWriter_) {
  BufferWriter$1 = BufferWriter_;
  Writer$1.create = create$1();
  BufferWriter$1._configure();
};
var writer_buffer = BufferWriter;
var Writer = writer;
(BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;
var util$6 = requireMinimal();
function BufferWriter() {
  Writer.call(this);
}
BufferWriter._configure = function() {
  BufferWriter.alloc = util$6._Buffer_allocUnsafe;
  BufferWriter.writeBytesBuffer = util$6.Buffer && util$6.Buffer.prototype instanceof Uint8Array && util$6.Buffer.prototype.set.name === "set" ? function writeBytesBuffer_set(val, buf, pos) {
    buf.set(val, pos);
  } : function writeBytesBuffer_copy(val, buf, pos) {
    if (val.copy)
      val.copy(buf, pos, 0, val.length);
    else for (var i = 0; i < val.length; )
      buf[pos++] = val[i++];
  };
};
BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
  if (util$6.isString(value))
    value = util$6._Buffer_from(value, "base64");
  var len = value.length >>> 0;
  this.uint32(len);
  if (len)
    this._push(BufferWriter.writeBytesBuffer, len, value);
  return this;
};
function writeStringBuffer(val, buf, pos) {
  if (val.length < 40)
    util$6.utf8.write(val, buf, pos);
  else if (buf.utf8Write)
    buf.utf8Write(val, pos);
  else
    buf.write(val, pos);
}
BufferWriter.prototype.string = function write_string_buffer(value) {
  var len = util$6.Buffer.byteLength(value);
  this.uint32(len);
  if (len)
    this._push(writeStringBuffer, len, value);
  return this;
};
BufferWriter._configure();
var reader = Reader$1;
var util$5 = requireMinimal();
var BufferReader$1;
var LongBits = util$5.LongBits, utf8 = util$5.utf8;
function indexOutOfRange(reader2, writeLength) {
  return RangeError("index out of range: " + reader2.pos + " + " + (writeLength || 1) + " > " + reader2.len);
}
function Reader$1(buffer) {
  this.buf = buffer;
  this.pos = 0;
  this.len = buffer.length;
}
var create_array = typeof Uint8Array !== "undefined" ? function create_typed_array(buffer) {
  if (buffer instanceof Uint8Array || Array.isArray(buffer))
    return new Reader$1(buffer);
  throw Error("illegal buffer");
} : function create_array2(buffer) {
  if (Array.isArray(buffer))
    return new Reader$1(buffer);
  throw Error("illegal buffer");
};
var create = function create3() {
  return util$5.Buffer ? function create_buffer_setup(buffer) {
    return (Reader$1.create = function create_buffer(buffer2) {
      return util$5.Buffer.isBuffer(buffer2) ? new BufferReader$1(buffer2) : create_array(buffer2);
    })(buffer);
  } : create_array;
};
Reader$1.create = create();
Reader$1.prototype._slice = util$5.Array.prototype.subarray || /* istanbul ignore next */
util$5.Array.prototype.slice;
Reader$1.prototype.uint32 = /* @__PURE__ */ function read_uint32_setup() {
  var value = 4294967295;
  return function read_uint32() {
    value = (this.buf[this.pos] & 127) >>> 0;
    if (this.buf[this.pos++] < 128) return value;
    value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
    if (this.buf[this.pos++] < 128) return value;
    value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
    if (this.buf[this.pos++] < 128) return value;
    value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
    if (this.buf[this.pos++] < 128) return value;
    value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
    if (this.buf[this.pos++] < 128) return value;
    if ((this.pos += 5) > this.len) {
      this.pos = this.len;
      throw indexOutOfRange(this, 10);
    }
    return value;
  };
}();
Reader$1.prototype.int32 = function read_int32() {
  return this.uint32() | 0;
};
Reader$1.prototype.sint32 = function read_sint32() {
  var value = this.uint32();
  return value >>> 1 ^ -(value & 1) | 0;
};
function readLongVarint() {
  var bits = new LongBits(0, 0);
  var i = 0;
  if (this.len - this.pos > 4) {
    for (; i < 4; ++i) {
      bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
      if (this.buf[this.pos++] < 128)
        return bits;
    }
    bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
    bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
    if (this.buf[this.pos++] < 128)
      return bits;
    i = 0;
  } else {
    for (; i < 3; ++i) {
      if (this.pos >= this.len)
        throw indexOutOfRange(this);
      bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
      if (this.buf[this.pos++] < 128)
        return bits;
    }
    bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
    return bits;
  }
  if (this.len - this.pos > 4) {
    for (; i < 5; ++i) {
      bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
      if (this.buf[this.pos++] < 128)
        return bits;
    }
  } else {
    for (; i < 5; ++i) {
      if (this.pos >= this.len)
        throw indexOutOfRange(this);
      bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
      if (this.buf[this.pos++] < 128)
        return bits;
    }
  }
  throw Error("invalid varint encoding");
}
Reader$1.prototype.bool = function read_bool() {
  return this.uint32() !== 0;
};
function readFixed32_end(buf, end2) {
  return (buf[end2 - 4] | buf[end2 - 3] << 8 | buf[end2 - 2] << 16 | buf[end2 - 1] << 24) >>> 0;
}
Reader$1.prototype.fixed32 = function read_fixed32() {
  if (this.pos + 4 > this.len)
    throw indexOutOfRange(this, 4);
  return readFixed32_end(this.buf, this.pos += 4);
};
Reader$1.prototype.sfixed32 = function read_sfixed32() {
  if (this.pos + 4 > this.len)
    throw indexOutOfRange(this, 4);
  return readFixed32_end(this.buf, this.pos += 4) | 0;
};
function readFixed64() {
  if (this.pos + 8 > this.len)
    throw indexOutOfRange(this, 8);
  return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
}
Reader$1.prototype.float = function read_float() {
  if (this.pos + 4 > this.len)
    throw indexOutOfRange(this, 4);
  var value = util$5.float.readFloatLE(this.buf, this.pos);
  this.pos += 4;
  return value;
};
Reader$1.prototype.double = function read_double() {
  if (this.pos + 8 > this.len)
    throw indexOutOfRange(this, 4);
  var value = util$5.float.readDoubleLE(this.buf, this.pos);
  this.pos += 8;
  return value;
};
Reader$1.prototype.bytes = function read_bytes() {
  var length = this.uint32(), start = this.pos, end2 = this.pos + length;
  if (end2 > this.len)
    throw indexOutOfRange(this, length);
  this.pos += length;
  if (Array.isArray(this.buf))
    return this.buf.slice(start, end2);
  if (start === end2) {
    var nativeBuffer = util$5.Buffer;
    return nativeBuffer ? nativeBuffer.alloc(0) : new this.buf.constructor(0);
  }
  return this._slice.call(this.buf, start, end2);
};
Reader$1.prototype.string = function read_string() {
  var bytes = this.bytes();
  return utf8.read(bytes, 0, bytes.length);
};
Reader$1.prototype.skip = function skip(length) {
  if (typeof length === "number") {
    if (this.pos + length > this.len)
      throw indexOutOfRange(this, length);
    this.pos += length;
  } else {
    do {
      if (this.pos >= this.len)
        throw indexOutOfRange(this);
    } while (this.buf[this.pos++] & 128);
  }
  return this;
};
Reader$1.prototype.skipType = function(wireType) {
  switch (wireType) {
    case 0:
      this.skip();
      break;
    case 1:
      this.skip(8);
      break;
    case 2:
      this.skip(this.uint32());
      break;
    case 3:
      while ((wireType = this.uint32() & 7) !== 4) {
        this.skipType(wireType);
      }
      break;
    case 5:
      this.skip(4);
      break;
    default:
      throw Error("invalid wire type " + wireType + " at offset " + this.pos);
  }
  return this;
};
Reader$1._configure = function(BufferReader_) {
  BufferReader$1 = BufferReader_;
  Reader$1.create = create();
  BufferReader$1._configure();
  var fn = util$5.Long ? "toLong" : (
    /* istanbul ignore next */
    "toNumber"
  );
  util$5.merge(Reader$1.prototype, {
    int64: function read_int64() {
      return readLongVarint.call(this)[fn](false);
    },
    uint64: function read_uint64() {
      return readLongVarint.call(this)[fn](true);
    },
    sint64: function read_sint64() {
      return readLongVarint.call(this).zzDecode()[fn](false);
    },
    fixed64: function read_fixed64() {
      return readFixed64.call(this)[fn](true);
    },
    sfixed64: function read_sfixed64() {
      return readFixed64.call(this)[fn](false);
    }
  });
};
var reader_buffer = BufferReader;
var Reader = reader;
(BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;
var util$4 = requireMinimal();
function BufferReader(buffer) {
  Reader.call(this, buffer);
}
BufferReader._configure = function() {
  if (util$4.Buffer)
    BufferReader.prototype._slice = util$4.Buffer.prototype.slice;
};
BufferReader.prototype.string = function read_string_buffer() {
  var len = this.uint32();
  return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
};
BufferReader._configure();
var rpc = {};
var service$1 = Service$1;
var util$3 = requireMinimal();
(Service$1.prototype = Object.create(util$3.EventEmitter.prototype)).constructor = Service$1;
function Service$1(rpcImpl, requestDelimited, responseDelimited) {
  if (typeof rpcImpl !== "function")
    throw TypeError("rpcImpl must be a function");
  util$3.EventEmitter.call(this);
  this.rpcImpl = rpcImpl;
  this.requestDelimited = Boolean(requestDelimited);
  this.responseDelimited = Boolean(responseDelimited);
}
Service$1.prototype.rpcCall = function rpcCall(method2, requestCtor, responseCtor, request, callback) {
  if (!request)
    throw TypeError("request must be specified");
  var self2 = this;
  if (!callback)
    return util$3.asPromise(rpcCall, self2, method2, requestCtor, responseCtor, request);
  if (!self2.rpcImpl) {
    setTimeout(function() {
      callback(Error("already ended"));
    }, 0);
    return void 0;
  }
  try {
    return self2.rpcImpl(
      method2,
      requestCtor[self2.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
      function rpcCallback(err, response) {
        if (err) {
          self2.emit("error", err, method2);
          return callback(err);
        }
        if (response === null) {
          self2.end(
            /* endedByRPC */
            true
          );
          return void 0;
        }
        if (!(response instanceof responseCtor)) {
          try {
            response = responseCtor[self2.responseDelimited ? "decodeDelimited" : "decode"](response);
          } catch (err2) {
            self2.emit("error", err2, method2);
            return callback(err2);
          }
        }
        self2.emit("data", response, method2);
        return callback(null, response);
      }
    );
  } catch (err) {
    self2.emit("error", err, method2);
    setTimeout(function() {
      callback(err);
    }, 0);
    return void 0;
  }
};
Service$1.prototype.end = function end(endedByRPC) {
  if (this.rpcImpl) {
    if (!endedByRPC)
      this.rpcImpl(null, null, null);
    this.rpcImpl = null;
    this.emit("end").off();
  }
  return this;
};
(function(exports) {
  var rpc2 = exports;
  rpc2.Service = service$1;
})(rpc);
var roots = {};
(function(exports) {
  var protobuf2 = exports;
  protobuf2.build = "minimal";
  protobuf2.Writer = writer;
  protobuf2.BufferWriter = writer_buffer;
  protobuf2.Reader = reader;
  protobuf2.BufferReader = reader_buffer;
  protobuf2.util = requireMinimal();
  protobuf2.rpc = rpc;
  protobuf2.roots = roots;
  protobuf2.configure = configure;
  function configure() {
    protobuf2.util._configure();
    protobuf2.Writer._configure(protobuf2.BufferWriter);
    protobuf2.Reader._configure(protobuf2.BufferReader);
  }
  configure();
})(indexMinimal);
var types$1 = {};
var util$2 = { exports: {} };
var codegen_1 = codegen;
function codegen(functionParams, functionName) {
  if (typeof functionParams === "string") {
    functionName = functionParams;
    functionParams = void 0;
  }
  var body = [];
  function Codegen(formatStringOrScope) {
    if (typeof formatStringOrScope !== "string") {
      var source = toString();
      if (codegen.verbose)
        console.log("codegen: " + source);
      source = "return " + source;
      if (formatStringOrScope) {
        var scopeKeys = Object.keys(formatStringOrScope), scopeParams = new Array(scopeKeys.length + 1), scopeValues = new Array(scopeKeys.length), scopeOffset = 0;
        while (scopeOffset < scopeKeys.length) {
          scopeParams[scopeOffset] = scopeKeys[scopeOffset];
          scopeValues[scopeOffset] = formatStringOrScope[scopeKeys[scopeOffset++]];
        }
        scopeParams[scopeOffset] = source;
        return Function.apply(null, scopeParams).apply(null, scopeValues);
      }
      return Function(source)();
    }
    var formatParams = new Array(arguments.length - 1), formatOffset = 0;
    while (formatOffset < formatParams.length)
      formatParams[formatOffset] = arguments[++formatOffset];
    formatOffset = 0;
    formatStringOrScope = formatStringOrScope.replace(/%([%dfijs])/g, function replace($0, $1) {
      var value = formatParams[formatOffset++];
      switch ($1) {
        case "d":
        case "f":
          return String(Number(value));
        case "i":
          return String(Math.floor(value));
        case "j":
          return JSON.stringify(value);
        case "s":
          return String(value);
      }
      return "%";
    });
    if (formatOffset !== formatParams.length)
      throw Error("parameter count mismatch");
    body.push(formatStringOrScope);
    return Codegen;
  }
  function toString(functionNameOverride) {
    return "function " + (functionNameOverride || functionName || "") + "(" + (functionParams && functionParams.join(",") || "") + "){\n  " + body.join("\n  ") + "\n}";
  }
  Codegen.toString = toString;
  return Codegen;
}
codegen.verbose = false;
var fetch_1 = fetch;
var asPromise = aspromise, inquire = inquire_1;
var fs = inquire("fs");
function fetch(filename, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  } else if (!options)
    options = {};
  if (!callback)
    return asPromise(fetch, this, filename, options);
  if (!options.xhr && fs && fs.readFile)
    return fs.readFile(filename, function fetchReadFileCallback(err, contents) {
      return err && typeof XMLHttpRequest !== "undefined" ? fetch.xhr(filename, options, callback) : err ? callback(err) : callback(null, options.binary ? contents : contents.toString("utf8"));
    });
  return fetch.xhr(filename, options, callback);
}
fetch.xhr = function fetch_xhr(filename, options, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function fetchOnReadyStateChange() {
    if (xhr.readyState !== 4)
      return void 0;
    if (xhr.status !== 0 && xhr.status !== 200)
      return callback(Error("status " + xhr.status));
    if (options.binary) {
      var buffer = xhr.response;
      if (!buffer) {
        buffer = [];
        for (var i = 0; i < xhr.responseText.length; ++i)
          buffer.push(xhr.responseText.charCodeAt(i) & 255);
      }
      return callback(null, typeof Uint8Array !== "undefined" ? new Uint8Array(buffer) : buffer);
    }
    return callback(null, xhr.responseText);
  };
  if (options.binary) {
    if ("overrideMimeType" in xhr)
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
    xhr.responseType = "arraybuffer";
  }
  xhr.open("GET", filename);
  xhr.send();
};
var path = {};
(function(exports) {
  var path2 = exports;
  var isAbsolute = (
    /**
     * Tests if the specified path is absolute.
     * @param {string} path Path to test
     * @returns {boolean} `true` if path is absolute
     */
    path2.isAbsolute = function isAbsolute2(path3) {
      return /^(?:\/|\w+:)/.test(path3);
    }
  );
  var normalize = (
    /**
     * Normalizes the specified path.
     * @param {string} path Path to normalize
     * @returns {string} Normalized path
     */
    path2.normalize = function normalize2(path3) {
      path3 = path3.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
      var parts = path3.split("/"), absolute = isAbsolute(path3), prefix = "";
      if (absolute)
        prefix = parts.shift() + "/";
      for (var i = 0; i < parts.length; ) {
        if (parts[i] === "..") {
          if (i > 0 && parts[i - 1] !== "..")
            parts.splice(--i, 2);
          else if (absolute)
            parts.splice(i, 1);
          else
            ++i;
        } else if (parts[i] === ".")
          parts.splice(i, 1);
        else
          ++i;
      }
      return prefix + parts.join("/");
    }
  );
  path2.resolve = function resolve(originPath, includePath, alreadyNormalized) {
    if (!alreadyNormalized)
      includePath = normalize(includePath);
    if (isAbsolute(includePath))
      return includePath;
    if (!alreadyNormalized)
      originPath = normalize(originPath);
    return (originPath = originPath.replace(/(?:\/|^)[^/]+$/, "")).length ? normalize(originPath + "/" + includePath) : includePath;
  };
})(path);
var namespace;
var hasRequiredNamespace;
function requireNamespace() {
  if (hasRequiredNamespace) return namespace;
  hasRequiredNamespace = 1;
  namespace = Namespace;
  var ReflectionObject2 = requireObject();
  ((Namespace.prototype = Object.create(ReflectionObject2.prototype)).constructor = Namespace).className = "Namespace";
  var Field2 = requireField(), util2 = requireUtil(), OneOf2 = requireOneof();
  var Type2, Service2, Enum2;
  Namespace.fromJSON = function fromJSON(name, json) {
    return new Namespace(name, json.options).addJSON(json.nested);
  };
  function arrayToJSON(array, toJSONOptions) {
    if (!(array && array.length))
      return void 0;
    var obj = {};
    for (var i = 0; i < array.length; ++i)
      obj[array[i].name] = array[i].toJSON(toJSONOptions);
    return obj;
  }
  Namespace.arrayToJSON = arrayToJSON;
  Namespace.isReservedId = function isReservedId(reserved, id) {
    if (reserved) {
      for (var i = 0; i < reserved.length; ++i)
        if (typeof reserved[i] !== "string" && reserved[i][0] <= id && reserved[i][1] > id)
          return true;
    }
    return false;
  };
  Namespace.isReservedName = function isReservedName(reserved, name) {
    if (reserved) {
      for (var i = 0; i < reserved.length; ++i)
        if (reserved[i] === name)
          return true;
    }
    return false;
  };
  function Namespace(name, options) {
    ReflectionObject2.call(this, name, options);
    this.nested = void 0;
    this._nestedArray = null;
    this._lookupCache = {};
    this._needsRecursiveFeatureResolution = true;
  }
  function clearCache(namespace2) {
    namespace2._nestedArray = null;
    namespace2._lookupCache = {};
    var parent = namespace2;
    while (parent = parent.parent) {
      parent._lookupCache = {};
    }
    return namespace2;
  }
  Object.defineProperty(Namespace.prototype, "nestedArray", {
    get: function() {
      return this._nestedArray || (this._nestedArray = util2.toArray(this.nested));
    }
  });
  Namespace.prototype.toJSON = function toJSON2(toJSONOptions) {
    return util2.toObject([
      "options",
      this.options,
      "nested",
      arrayToJSON(this.nestedArray, toJSONOptions)
    ]);
  };
  Namespace.prototype.addJSON = function addJSON(nestedJson) {
    var ns = this;
    if (nestedJson) {
      for (var names = Object.keys(nestedJson), i = 0, nested; i < names.length; ++i) {
        nested = nestedJson[names[i]];
        ns.add(
          // most to least likely
          (nested.fields !== void 0 ? Type2.fromJSON : nested.values !== void 0 ? Enum2.fromJSON : nested.methods !== void 0 ? Service2.fromJSON : nested.id !== void 0 ? Field2.fromJSON : Namespace.fromJSON)(names[i], nested)
        );
      }
    }
    return this;
  };
  Namespace.prototype.get = function get2(name) {
    return this.nested && this.nested[name] || null;
  };
  Namespace.prototype.getEnum = function getEnum(name) {
    if (this.nested && this.nested[name] instanceof Enum2)
      return this.nested[name].values;
    throw Error("no such enum: " + name);
  };
  Namespace.prototype.add = function add(object2) {
    if (!(object2 instanceof Field2 && object2.extend !== void 0 || object2 instanceof Type2 || object2 instanceof OneOf2 || object2 instanceof Enum2 || object2 instanceof Service2 || object2 instanceof Namespace))
      throw TypeError("object must be a valid nested object");
    if (!this.nested)
      this.nested = {};
    else {
      var prev = this.get(object2.name);
      if (prev) {
        if (prev instanceof Namespace && object2 instanceof Namespace && !(prev instanceof Type2 || prev instanceof Service2)) {
          var nested = prev.nestedArray;
          for (var i = 0; i < nested.length; ++i)
            object2.add(nested[i]);
          this.remove(prev);
          if (!this.nested)
            this.nested = {};
          object2.setOptions(prev.options, true);
        } else
          throw Error("duplicate name '" + object2.name + "' in " + this);
      }
    }
    this.nested[object2.name] = object2;
    if (!(this instanceof Type2 || this instanceof Service2 || this instanceof Enum2 || this instanceof Field2)) {
      if (!object2._edition) {
        object2._edition = object2._defaultEdition;
      }
    }
    this._needsRecursiveFeatureResolution = true;
    var parent = this;
    while (parent = parent.parent) {
      parent._needsRecursiveFeatureResolution = true;
    }
    object2.onAdd(this);
    return clearCache(this);
  };
  Namespace.prototype.remove = function remove(object2) {
    if (!(object2 instanceof ReflectionObject2))
      throw TypeError("object must be a ReflectionObject");
    if (object2.parent !== this)
      throw Error(object2 + " is not a member of " + this);
    delete this.nested[object2.name];
    if (!Object.keys(this.nested).length)
      this.nested = void 0;
    object2.onRemove(this);
    return clearCache(this);
  };
  Namespace.prototype.define = function define(path2, json) {
    if (util2.isString(path2))
      path2 = path2.split(".");
    else if (!Array.isArray(path2))
      throw TypeError("illegal path");
    if (path2 && path2.length && path2[0] === "")
      throw Error("path must be relative");
    var ptr = this;
    while (path2.length > 0) {
      var part = path2.shift();
      if (ptr.nested && ptr.nested[part]) {
        ptr = ptr.nested[part];
        if (!(ptr instanceof Namespace))
          throw Error("path conflicts with non-namespace objects");
      } else
        ptr.add(ptr = new Namespace(part));
    }
    if (json)
      ptr.addJSON(json);
    return ptr;
  };
  Namespace.prototype.resolveAll = function resolveAll() {
    var nested = this.nestedArray, i = 0;
    this.resolve();
    while (i < nested.length)
      if (nested[i] instanceof Namespace)
        nested[i++].resolveAll();
      else
        nested[i++].resolve();
    return this;
  };
  Namespace.prototype._resolveFeaturesRecursive = function _resolveFeaturesRecursive(edition) {
    if (!this._needsRecursiveFeatureResolution) return this;
    this._needsRecursiveFeatureResolution = false;
    edition = this._edition || edition;
    ReflectionObject2.prototype._resolveFeaturesRecursive.call(this, edition);
    this.nestedArray.forEach((nested) => {
      nested._resolveFeaturesRecursive(edition);
    });
    return this;
  };
  Namespace.prototype.lookup = function lookup(path2, filterTypes, parentAlreadyChecked) {
    if (typeof filterTypes === "boolean") {
      parentAlreadyChecked = filterTypes;
      filterTypes = void 0;
    } else if (filterTypes && !Array.isArray(filterTypes))
      filterTypes = [filterTypes];
    if (util2.isString(path2) && path2.length) {
      if (path2 === ".")
        return this.root;
      path2 = path2.split(".");
    } else if (!path2.length)
      return this;
    if (path2[0] === "")
      return this.root.lookup(path2.slice(1), filterTypes);
    var found = this._lookupImpl(path2);
    if (found && (!filterTypes || filterTypes.indexOf(found.constructor) > -1)) {
      return found;
    }
    if (this.parent === null || parentAlreadyChecked)
      return null;
    return this.parent.lookup(path2, filterTypes);
  };
  Namespace.prototype._lookupImpl = function lookup(path2) {
    var flatPath = path2.join(".");
    if (Object.prototype.hasOwnProperty.call(this._lookupCache, flatPath)) {
      return this._lookupCache[flatPath];
    }
    var found = this.get(path2[0]);
    var exact = null;
    if (found) {
      if (path2.length === 1) {
        exact = found;
      } else if (found instanceof Namespace && (found = found._lookupImpl(path2.slice(1))))
        exact = found;
    } else {
      for (var i = 0; i < this.nestedArray.length; ++i)
        if (this._nestedArray[i] instanceof Namespace && (found = this._nestedArray[i]._lookupImpl(path2)))
          exact = found;
    }
    this._lookupCache[flatPath] = exact;
    return exact;
  };
  Namespace.prototype.lookupType = function lookupType(path2) {
    var found = this.lookup(path2, [Type2]);
    if (!found)
      throw Error("no such type: " + path2);
    return found;
  };
  Namespace.prototype.lookupEnum = function lookupEnum(path2) {
    var found = this.lookup(path2, [Enum2]);
    if (!found)
      throw Error("no such Enum '" + path2 + "' in " + this);
    return found;
  };
  Namespace.prototype.lookupTypeOrEnum = function lookupTypeOrEnum(path2) {
    var found = this.lookup(path2, [Type2, Enum2]);
    if (!found)
      throw Error("no such Type or Enum '" + path2 + "' in " + this);
    return found;
  };
  Namespace.prototype.lookupService = function lookupService(path2) {
    var found = this.lookup(path2, [Service2]);
    if (!found)
      throw Error("no such Service '" + path2 + "' in " + this);
    return found;
  };
  Namespace._configure = function(Type_, Service_, Enum_) {
    Type2 = Type_;
    Service2 = Service_;
    Enum2 = Enum_;
  };
  return namespace;
}
var mapfield;
var hasRequiredMapfield;
function requireMapfield() {
  if (hasRequiredMapfield) return mapfield;
  hasRequiredMapfield = 1;
  mapfield = MapField2;
  var Field2 = requireField();
  ((MapField2.prototype = Object.create(Field2.prototype)).constructor = MapField2).className = "MapField";
  var types2 = requireTypes(), util2 = requireUtil();
  function MapField2(name, id, keyType, type2, options, comment) {
    Field2.call(this, name, id, type2, void 0, void 0, options, comment);
    if (!util2.isString(keyType))
      throw TypeError("keyType must be a string");
    this.keyType = keyType;
    this.resolvedKeyType = null;
    this.map = true;
  }
  MapField2.fromJSON = function fromJSON(name, json) {
    return new MapField2(name, json.id, json.keyType, json.type, json.options, json.comment);
  };
  MapField2.prototype.toJSON = function toJSON2(toJSONOptions) {
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util2.toObject([
      "keyType",
      this.keyType,
      "type",
      this.type,
      "id",
      this.id,
      "extend",
      this.extend,
      "options",
      this.options,
      "comment",
      keepComments ? this.comment : void 0
    ]);
  };
  MapField2.prototype.resolve = function resolve() {
    if (this.resolved)
      return this;
    if (types2.mapKey[this.keyType] === void 0)
      throw Error("invalid key type: " + this.keyType);
    return Field2.prototype.resolve.call(this);
  };
  MapField2.d = function decorateMapField(fieldId, fieldKeyType, fieldValueType) {
    if (typeof fieldValueType === "function")
      fieldValueType = util2.decorateType(fieldValueType).name;
    else if (fieldValueType && typeof fieldValueType === "object")
      fieldValueType = util2.decorateEnum(fieldValueType).name;
    return function mapFieldDecorator(prototype, fieldName) {
      util2.decorateType(prototype.constructor).add(new MapField2(fieldName, fieldId, fieldKeyType, fieldValueType));
    };
  };
  return mapfield;
}
var method;
var hasRequiredMethod;
function requireMethod() {
  if (hasRequiredMethod) return method;
  hasRequiredMethod = 1;
  method = Method2;
  var ReflectionObject2 = requireObject();
  ((Method2.prototype = Object.create(ReflectionObject2.prototype)).constructor = Method2).className = "Method";
  var util2 = requireUtil();
  function Method2(name, type2, requestType, responseType, requestStream, responseStream, options, comment, parsedOptions) {
    if (util2.isObject(requestStream)) {
      options = requestStream;
      requestStream = responseStream = void 0;
    } else if (util2.isObject(responseStream)) {
      options = responseStream;
      responseStream = void 0;
    }
    if (!(type2 === void 0 || util2.isString(type2)))
      throw TypeError("type must be a string");
    if (!util2.isString(requestType))
      throw TypeError("requestType must be a string");
    if (!util2.isString(responseType))
      throw TypeError("responseType must be a string");
    ReflectionObject2.call(this, name, options);
    this.type = type2 || "rpc";
    this.requestType = requestType;
    this.requestStream = requestStream ? true : void 0;
    this.responseType = responseType;
    this.responseStream = responseStream ? true : void 0;
    this.resolvedRequestType = null;
    this.resolvedResponseType = null;
    this.comment = comment;
    this.parsedOptions = parsedOptions;
  }
  Method2.fromJSON = function fromJSON(name, json) {
    return new Method2(name, json.type, json.requestType, json.responseType, json.requestStream, json.responseStream, json.options, json.comment, json.parsedOptions);
  };
  Method2.prototype.toJSON = function toJSON2(toJSONOptions) {
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util2.toObject([
      "type",
      this.type !== "rpc" && /* istanbul ignore next */
      this.type || void 0,
      "requestType",
      this.requestType,
      "requestStream",
      this.requestStream,
      "responseType",
      this.responseType,
      "responseStream",
      this.responseStream,
      "options",
      this.options,
      "comment",
      keepComments ? this.comment : void 0,
      "parsedOptions",
      this.parsedOptions
    ]);
  };
  Method2.prototype.resolve = function resolve() {
    if (this.resolved)
      return this;
    this.resolvedRequestType = this.parent.lookupType(this.requestType);
    this.resolvedResponseType = this.parent.lookupType(this.responseType);
    return ReflectionObject2.prototype.resolve.call(this);
  };
  return method;
}
var service;
var hasRequiredService;
function requireService() {
  if (hasRequiredService) return service;
  hasRequiredService = 1;
  service = Service2;
  var Namespace = requireNamespace();
  ((Service2.prototype = Object.create(Namespace.prototype)).constructor = Service2).className = "Service";
  var Method2 = requireMethod(), util2 = requireUtil(), rpc$1 = rpc;
  function Service2(name, options) {
    Namespace.call(this, name, options);
    this.methods = {};
    this._methodsArray = null;
  }
  Service2.fromJSON = function fromJSON(name, json) {
    var service2 = new Service2(name, json.options);
    if (json.methods)
      for (var names = Object.keys(json.methods), i = 0; i < names.length; ++i)
        service2.add(Method2.fromJSON(names[i], json.methods[names[i]]));
    if (json.nested)
      service2.addJSON(json.nested);
    if (json.edition)
      service2._edition = json.edition;
    service2.comment = json.comment;
    service2._defaultEdition = "proto3";
    return service2;
  };
  Service2.prototype.toJSON = function toJSON2(toJSONOptions) {
    var inherited = Namespace.prototype.toJSON.call(this, toJSONOptions);
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util2.toObject([
      "edition",
      this._editionToJSON(),
      "options",
      inherited && inherited.options || void 0,
      "methods",
      Namespace.arrayToJSON(this.methodsArray, toJSONOptions) || /* istanbul ignore next */
      {},
      "nested",
      inherited && inherited.nested || void 0,
      "comment",
      keepComments ? this.comment : void 0
    ]);
  };
  Object.defineProperty(Service2.prototype, "methodsArray", {
    get: function() {
      return this._methodsArray || (this._methodsArray = util2.toArray(this.methods));
    }
  });
  function clearCache(service2) {
    service2._methodsArray = null;
    return service2;
  }
  Service2.prototype.get = function get2(name) {
    return this.methods[name] || Namespace.prototype.get.call(this, name);
  };
  Service2.prototype.resolveAll = function resolveAll() {
    Namespace.prototype.resolve.call(this);
    var methods = this.methodsArray;
    for (var i = 0; i < methods.length; ++i)
      methods[i].resolve();
    return this;
  };
  Service2.prototype._resolveFeaturesRecursive = function _resolveFeaturesRecursive(edition) {
    if (!this._needsRecursiveFeatureResolution) return this;
    edition = this._edition || edition;
    Namespace.prototype._resolveFeaturesRecursive.call(this, edition);
    this.methodsArray.forEach((method2) => {
      method2._resolveFeaturesRecursive(edition);
    });
    return this;
  };
  Service2.prototype.add = function add(object2) {
    if (this.get(object2.name))
      throw Error("duplicate name '" + object2.name + "' in " + this);
    if (object2 instanceof Method2) {
      this.methods[object2.name] = object2;
      object2.parent = this;
      return clearCache(this);
    }
    return Namespace.prototype.add.call(this, object2);
  };
  Service2.prototype.remove = function remove(object2) {
    if (object2 instanceof Method2) {
      if (this.methods[object2.name] !== object2)
        throw Error(object2 + " is not a member of " + this);
      delete this.methods[object2.name];
      object2.parent = null;
      return clearCache(this);
    }
    return Namespace.prototype.remove.call(this, object2);
  };
  Service2.prototype.create = function create5(rpcImpl, requestDelimited, responseDelimited) {
    var rpcService = new rpc$1.Service(rpcImpl, requestDelimited, responseDelimited);
    for (var i = 0, method2; i < /* initializes */
    this.methodsArray.length; ++i) {
      var methodName = util2.lcFirst((method2 = this._methodsArray[i]).resolve().name).replace(/[^$\w_]/g, "");
      rpcService[methodName] = util2.codegen(["r", "c"], util2.isReserved(methodName) ? methodName + "_" : methodName)("return this.rpcCall(m,q,s,r,c)")({
        m: method2,
        q: method2.resolvedRequestType.ctor,
        s: method2.resolvedResponseType.ctor
      });
    }
    return rpcService;
  };
  return service;
}
var message = Message;
var util$1 = requireMinimal();
function Message(properties) {
  if (properties)
    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
      this[keys[i]] = properties[keys[i]];
}
Message.create = function create4(properties) {
  return this.$type.create(properties);
};
Message.encode = function encode(message2, writer2) {
  return this.$type.encode(message2, writer2);
};
Message.encodeDelimited = function encodeDelimited(message2, writer2) {
  return this.$type.encodeDelimited(message2, writer2);
};
Message.decode = function decode(reader2) {
  return this.$type.decode(reader2);
};
Message.decodeDelimited = function decodeDelimited(reader2) {
  return this.$type.decodeDelimited(reader2);
};
Message.verify = function verify(message2) {
  return this.$type.verify(message2);
};
Message.fromObject = function fromObject(object2) {
  return this.$type.fromObject(object2);
};
Message.toObject = function toObject(message2, options) {
  return this.$type.toObject(message2, options);
};
Message.prototype.toJSON = function toJSON() {
  return this.$type.toObject(this, util$1.toJSONOptions);
};
var decoder_1;
var hasRequiredDecoder;
function requireDecoder() {
  if (hasRequiredDecoder) return decoder_1;
  hasRequiredDecoder = 1;
  decoder_1 = decoder;
  var Enum2 = require_enum(), types2 = requireTypes(), util2 = requireUtil();
  function missing(field2) {
    return "missing required '" + field2.name + "'";
  }
  function decoder(mtype) {
    var gen = util2.codegen(["r", "l", "e"], mtype.name + "$decode")("if(!(r instanceof Reader))")("r=Reader.create(r)")("var c=l===undefined?r.len:r.pos+l,m=new this.ctor" + (mtype.fieldsArray.filter(function(field3) {
      return field3.map;
    }).length ? ",k,value" : ""))("while(r.pos<c){")("var t=r.uint32()")("if(t===e)")("break")("switch(t>>>3){");
    var i = 0;
    for (; i < /* initializes */
    mtype.fieldsArray.length; ++i) {
      var field2 = mtype._fieldsArray[i].resolve(), type2 = field2.resolvedType instanceof Enum2 ? "int32" : field2.type, ref = "m" + util2.safeProp(field2.name);
      gen("case %i: {", field2.id);
      if (field2.map) {
        gen("if(%s===util.emptyObject)", ref)("%s={}", ref)("var c2 = r.uint32()+r.pos");
        if (types2.defaults[field2.keyType] !== void 0) gen("k=%j", types2.defaults[field2.keyType]);
        else gen("k=null");
        if (types2.defaults[type2] !== void 0) gen("value=%j", types2.defaults[type2]);
        else gen("value=null");
        gen("while(r.pos<c2){")("var tag2=r.uint32()")("switch(tag2>>>3){")("case 1: k=r.%s(); break", field2.keyType)("case 2:");
        if (types2.basic[type2] === void 0) gen("value=types[%i].decode(r,r.uint32())", i);
        else gen("value=r.%s()", type2);
        gen("break")("default:")("r.skipType(tag2&7)")("break")("}")("}");
        if (types2.long[field2.keyType] !== void 0) gen('%s[typeof k==="object"?util.longToHash(k):k]=value', ref);
        else gen("%s[k]=value", ref);
      } else if (field2.repeated) {
        gen("if(!(%s&&%s.length))", ref, ref)("%s=[]", ref);
        if (types2.packed[type2] !== void 0) gen("if((t&7)===2){")("var c2=r.uint32()+r.pos")("while(r.pos<c2)")("%s.push(r.%s())", ref, type2)("}else");
        if (types2.basic[type2] === void 0) gen(field2.delimited ? "%s.push(types[%i].decode(r,undefined,((t&~7)|4)))" : "%s.push(types[%i].decode(r,r.uint32()))", ref, i);
        else gen("%s.push(r.%s())", ref, type2);
      } else if (types2.basic[type2] === void 0) gen(field2.delimited ? "%s=types[%i].decode(r,undefined,((t&~7)|4))" : "%s=types[%i].decode(r,r.uint32())", ref, i);
      else gen("%s=r.%s()", ref, type2);
      gen("break")("}");
    }
    gen("default:")("r.skipType(t&7)")("break")("}")("}");
    for (i = 0; i < mtype._fieldsArray.length; ++i) {
      var rfield = mtype._fieldsArray[i];
      if (rfield.required) gen("if(!m.hasOwnProperty(%j))", rfield.name)("throw util.ProtocolError(%j,{instance:m})", missing(rfield));
    }
    return gen("return m");
  }
  return decoder_1;
}
var verifier_1;
var hasRequiredVerifier;
function requireVerifier() {
  if (hasRequiredVerifier) return verifier_1;
  hasRequiredVerifier = 1;
  verifier_1 = verifier;
  var Enum2 = require_enum(), util2 = requireUtil();
  function invalid(field2, expected) {
    return field2.name + ": " + expected + (field2.repeated && expected !== "array" ? "[]" : field2.map && expected !== "object" ? "{k:" + field2.keyType + "}" : "") + " expected";
  }
  function genVerifyValue(gen, field2, fieldIndex, ref) {
    if (field2.resolvedType) {
      if (field2.resolvedType instanceof Enum2) {
        gen("switch(%s){", ref)("default:")("return%j", invalid(field2, "enum value"));
        for (var keys = Object.keys(field2.resolvedType.values), j = 0; j < keys.length; ++j) gen("case %i:", field2.resolvedType.values[keys[j]]);
        gen("break")("}");
      } else {
        gen("{")("var e=types[%i].verify(%s);", fieldIndex, ref)("if(e)")("return%j+e", field2.name + ".")("}");
      }
    } else {
      switch (field2.type) {
        case "int32":
        case "uint32":
        case "sint32":
        case "fixed32":
        case "sfixed32":
          gen("if(!util.isInteger(%s))", ref)("return%j", invalid(field2, "integer"));
          break;
        case "int64":
        case "uint64":
        case "sint64":
        case "fixed64":
        case "sfixed64":
          gen("if(!util.isInteger(%s)&&!(%s&&util.isInteger(%s.low)&&util.isInteger(%s.high)))", ref, ref, ref, ref)("return%j", invalid(field2, "integer|Long"));
          break;
        case "float":
        case "double":
          gen('if(typeof %s!=="number")', ref)("return%j", invalid(field2, "number"));
          break;
        case "bool":
          gen('if(typeof %s!=="boolean")', ref)("return%j", invalid(field2, "boolean"));
          break;
        case "string":
          gen("if(!util.isString(%s))", ref)("return%j", invalid(field2, "string"));
          break;
        case "bytes":
          gen('if(!(%s&&typeof %s.length==="number"||util.isString(%s)))', ref, ref, ref)("return%j", invalid(field2, "buffer"));
          break;
      }
    }
    return gen;
  }
  function genVerifyKey(gen, field2, ref) {
    switch (field2.keyType) {
      case "int32":
      case "uint32":
      case "sint32":
      case "fixed32":
      case "sfixed32":
        gen("if(!util.key32Re.test(%s))", ref)("return%j", invalid(field2, "integer key"));
        break;
      case "int64":
      case "uint64":
      case "sint64":
      case "fixed64":
      case "sfixed64":
        gen("if(!util.key64Re.test(%s))", ref)("return%j", invalid(field2, "integer|Long key"));
        break;
      case "bool":
        gen("if(!util.key2Re.test(%s))", ref)("return%j", invalid(field2, "boolean key"));
        break;
    }
    return gen;
  }
  function verifier(mtype) {
    var gen = util2.codegen(["m"], mtype.name + "$verify")('if(typeof m!=="object"||m===null)')("return%j", "object expected");
    var oneofs = mtype.oneofsArray, seenFirstField = {};
    if (oneofs.length) gen("var p={}");
    for (var i = 0; i < /* initializes */
    mtype.fieldsArray.length; ++i) {
      var field2 = mtype._fieldsArray[i].resolve(), ref = "m" + util2.safeProp(field2.name);
      if (field2.optional) gen("if(%s!=null&&m.hasOwnProperty(%j)){", ref, field2.name);
      if (field2.map) {
        gen("if(!util.isObject(%s))", ref)("return%j", invalid(field2, "object"))("var k=Object.keys(%s)", ref)("for(var i=0;i<k.length;++i){");
        genVerifyKey(gen, field2, "k[i]");
        genVerifyValue(gen, field2, i, ref + "[k[i]]")("}");
      } else if (field2.repeated) {
        gen("if(!Array.isArray(%s))", ref)("return%j", invalid(field2, "array"))("for(var i=0;i<%s.length;++i){", ref);
        genVerifyValue(gen, field2, i, ref + "[i]")("}");
      } else {
        if (field2.partOf) {
          var oneofProp = util2.safeProp(field2.partOf.name);
          if (seenFirstField[field2.partOf.name] === 1) gen("if(p%s===1)", oneofProp)("return%j", field2.partOf.name + ": multiple values");
          seenFirstField[field2.partOf.name] = 1;
          gen("p%s=1", oneofProp);
        }
        genVerifyValue(gen, field2, i, ref);
      }
      if (field2.optional) gen("}");
    }
    return gen("return null");
  }
  return verifier_1;
}
var converter = {};
var hasRequiredConverter;
function requireConverter() {
  if (hasRequiredConverter) return converter;
  hasRequiredConverter = 1;
  (function(exports) {
    var converter2 = exports;
    var Enum2 = require_enum(), util2 = requireUtil();
    function genValuePartial_fromObject(gen, field2, fieldIndex, prop) {
      var defaultAlreadyEmitted = false;
      if (field2.resolvedType) {
        if (field2.resolvedType instanceof Enum2) {
          gen("switch(d%s){", prop);
          for (var values = field2.resolvedType.values, keys = Object.keys(values), i = 0; i < keys.length; ++i) {
            if (values[keys[i]] === field2.typeDefault && !defaultAlreadyEmitted) {
              gen("default:")('if(typeof(d%s)==="number"){m%s=d%s;break}', prop, prop, prop);
              if (!field2.repeated) gen("break");
              defaultAlreadyEmitted = true;
            }
            gen("case%j:", keys[i])("case %i:", values[keys[i]])("m%s=%j", prop, values[keys[i]])("break");
          }
          gen("}");
        } else gen('if(typeof d%s!=="object")', prop)("throw TypeError(%j)", field2.fullName + ": object expected")("m%s=types[%i].fromObject(d%s)", prop, fieldIndex, prop);
      } else {
        var isUnsigned = false;
        switch (field2.type) {
          case "double":
          case "float":
            gen("m%s=Number(d%s)", prop, prop);
            break;
          case "uint32":
          case "fixed32":
            gen("m%s=d%s>>>0", prop, prop);
            break;
          case "int32":
          case "sint32":
          case "sfixed32":
            gen("m%s=d%s|0", prop, prop);
            break;
          case "uint64":
            isUnsigned = true;
          case "int64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            gen("if(util.Long)")("(m%s=util.Long.fromValue(d%s)).unsigned=%j", prop, prop, isUnsigned)('else if(typeof d%s==="string")', prop)("m%s=parseInt(d%s,10)", prop, prop)('else if(typeof d%s==="number")', prop)("m%s=d%s", prop, prop)('else if(typeof d%s==="object")', prop)("m%s=new util.LongBits(d%s.low>>>0,d%s.high>>>0).toNumber(%s)", prop, prop, prop, isUnsigned ? "true" : "");
            break;
          case "bytes":
            gen('if(typeof d%s==="string")', prop)("util.base64.decode(d%s,m%s=util.newBuffer(util.base64.length(d%s)),0)", prop, prop, prop)("else if(d%s.length >= 0)", prop)("m%s=d%s", prop, prop);
            break;
          case "string":
            gen("m%s=String(d%s)", prop, prop);
            break;
          case "bool":
            gen("m%s=Boolean(d%s)", prop, prop);
            break;
        }
      }
      return gen;
    }
    converter2.fromObject = function fromObject2(mtype) {
      var fields = mtype.fieldsArray;
      var gen = util2.codegen(["d"], mtype.name + "$fromObject")("if(d instanceof this.ctor)")("return d");
      if (!fields.length) return gen("return new this.ctor");
      gen("var m=new this.ctor");
      for (var i = 0; i < fields.length; ++i) {
        var field2 = fields[i].resolve(), prop = util2.safeProp(field2.name);
        if (field2.map) {
          gen("if(d%s){", prop)('if(typeof d%s!=="object")', prop)("throw TypeError(%j)", field2.fullName + ": object expected")("m%s={}", prop)("for(var ks=Object.keys(d%s),i=0;i<ks.length;++i){", prop);
          genValuePartial_fromObject(
            gen,
            field2,
            /* not sorted */
            i,
            prop + "[ks[i]]"
          )("}")("}");
        } else if (field2.repeated) {
          gen("if(d%s){", prop)("if(!Array.isArray(d%s))", prop)("throw TypeError(%j)", field2.fullName + ": array expected")("m%s=[]", prop)("for(var i=0;i<d%s.length;++i){", prop);
          genValuePartial_fromObject(
            gen,
            field2,
            /* not sorted */
            i,
            prop + "[i]"
          )("}")("}");
        } else {
          if (!(field2.resolvedType instanceof Enum2)) gen("if(d%s!=null){", prop);
          genValuePartial_fromObject(
            gen,
            field2,
            /* not sorted */
            i,
            prop
          );
          if (!(field2.resolvedType instanceof Enum2)) gen("}");
        }
      }
      return gen("return m");
    };
    function genValuePartial_toObject(gen, field2, fieldIndex, prop) {
      if (field2.resolvedType) {
        if (field2.resolvedType instanceof Enum2) gen("d%s=o.enums===String?(types[%i].values[m%s]===undefined?m%s:types[%i].values[m%s]):m%s", prop, fieldIndex, prop, prop, fieldIndex, prop, prop);
        else gen("d%s=types[%i].toObject(m%s,o)", prop, fieldIndex, prop);
      } else {
        var isUnsigned = false;
        switch (field2.type) {
          case "double":
          case "float":
            gen("d%s=o.json&&!isFinite(m%s)?String(m%s):m%s", prop, prop, prop, prop);
            break;
          case "uint64":
            isUnsigned = true;
          case "int64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            gen('if(typeof m%s==="number")', prop)("d%s=o.longs===String?String(m%s):m%s", prop, prop, prop)("else")("d%s=o.longs===String?util.Long.prototype.toString.call(m%s):o.longs===Number?new util.LongBits(m%s.low>>>0,m%s.high>>>0).toNumber(%s):m%s", prop, prop, prop, prop, isUnsigned ? "true" : "", prop);
            break;
          case "bytes":
            gen("d%s=o.bytes===String?util.base64.encode(m%s,0,m%s.length):o.bytes===Array?Array.prototype.slice.call(m%s):m%s", prop, prop, prop, prop, prop);
            break;
          default:
            gen("d%s=m%s", prop, prop);
            break;
        }
      }
      return gen;
    }
    converter2.toObject = function toObject2(mtype) {
      var fields = mtype.fieldsArray.slice().sort(util2.compareFieldsById);
      if (!fields.length)
        return util2.codegen()("return {}");
      var gen = util2.codegen(["m", "o"], mtype.name + "$toObject")("if(!o)")("o={}")("var d={}");
      var repeatedFields = [], mapFields = [], normalFields = [], i = 0;
      for (; i < fields.length; ++i)
        if (!fields[i].partOf)
          (fields[i].resolve().repeated ? repeatedFields : fields[i].map ? mapFields : normalFields).push(fields[i]);
      if (repeatedFields.length) {
        gen("if(o.arrays||o.defaults){");
        for (i = 0; i < repeatedFields.length; ++i) gen("d%s=[]", util2.safeProp(repeatedFields[i].name));
        gen("}");
      }
      if (mapFields.length) {
        gen("if(o.objects||o.defaults){");
        for (i = 0; i < mapFields.length; ++i) gen("d%s={}", util2.safeProp(mapFields[i].name));
        gen("}");
      }
      if (normalFields.length) {
        gen("if(o.defaults){");
        for (i = 0; i < normalFields.length; ++i) {
          var field2 = normalFields[i], prop = util2.safeProp(field2.name);
          if (field2.resolvedType instanceof Enum2) gen("d%s=o.enums===String?%j:%j", prop, field2.resolvedType.valuesById[field2.typeDefault], field2.typeDefault);
          else if (field2.long) gen("if(util.Long){")("var n=new util.Long(%i,%i,%j)", field2.typeDefault.low, field2.typeDefault.high, field2.typeDefault.unsigned)("d%s=o.longs===String?n.toString():o.longs===Number?n.toNumber():n", prop)("}else")("d%s=o.longs===String?%j:%i", prop, field2.typeDefault.toString(), field2.typeDefault.toNumber());
          else if (field2.bytes) {
            var arrayDefault = "[" + Array.prototype.slice.call(field2.typeDefault).join(",") + "]";
            gen("if(o.bytes===String)d%s=%j", prop, String.fromCharCode.apply(String, field2.typeDefault))("else{")("d%s=%s", prop, arrayDefault)("if(o.bytes!==Array)d%s=util.newBuffer(d%s)", prop, prop)("}");
          } else gen("d%s=%j", prop, field2.typeDefault);
        }
        gen("}");
      }
      var hasKs2 = false;
      for (i = 0; i < fields.length; ++i) {
        var field2 = fields[i], index = mtype._fieldsArray.indexOf(field2), prop = util2.safeProp(field2.name);
        if (field2.map) {
          if (!hasKs2) {
            hasKs2 = true;
            gen("var ks2");
          }
          gen("if(m%s&&(ks2=Object.keys(m%s)).length){", prop, prop)("d%s={}", prop)("for(var j=0;j<ks2.length;++j){");
          genValuePartial_toObject(
            gen,
            field2,
            /* sorted */
            index,
            prop + "[ks2[j]]"
          )("}");
        } else if (field2.repeated) {
          gen("if(m%s&&m%s.length){", prop, prop)("d%s=[]", prop)("for(var j=0;j<m%s.length;++j){", prop);
          genValuePartial_toObject(
            gen,
            field2,
            /* sorted */
            index,
            prop + "[j]"
          )("}");
        } else {
          gen("if(m%s!=null&&m.hasOwnProperty(%j)){", prop, field2.name);
          genValuePartial_toObject(
            gen,
            field2,
            /* sorted */
            index,
            prop
          );
          if (field2.partOf) gen("if(o.oneofs)")("d%s=%j", util2.safeProp(field2.partOf.name), field2.name);
        }
        gen("}");
      }
      return gen("return d");
    };
  })(converter);
  return converter;
}
var wrappers = {};
(function(exports) {
  var wrappers2 = exports;
  var Message2 = message;
  wrappers2[".google.protobuf.Any"] = {
    fromObject: function(object2) {
      if (object2 && object2["@type"]) {
        var name = object2["@type"].substring(object2["@type"].lastIndexOf("/") + 1);
        var type2 = this.lookup(name);
        if (type2) {
          var type_url = object2["@type"].charAt(0) === "." ? object2["@type"].slice(1) : object2["@type"];
          if (type_url.indexOf("/") === -1) {
            type_url = "/" + type_url;
          }
          return this.create({
            type_url,
            value: type2.encode(type2.fromObject(object2)).finish()
          });
        }
      }
      return this.fromObject(object2);
    },
    toObject: function(message2, options) {
      var googleApi = "type.googleapis.com/";
      var prefix = "";
      var name = "";
      if (options && options.json && message2.type_url && message2.value) {
        name = message2.type_url.substring(message2.type_url.lastIndexOf("/") + 1);
        prefix = message2.type_url.substring(0, message2.type_url.lastIndexOf("/") + 1);
        var type2 = this.lookup(name);
        if (type2)
          message2 = type2.decode(message2.value);
      }
      if (!(message2 instanceof this.ctor) && message2 instanceof Message2) {
        var object2 = message2.$type.toObject(message2, options);
        var messageName = message2.$type.fullName[0] === "." ? message2.$type.fullName.slice(1) : message2.$type.fullName;
        if (prefix === "") {
          prefix = googleApi;
        }
        name = prefix + messageName;
        object2["@type"] = name;
        return object2;
      }
      return this.toObject(message2, options);
    }
  };
})(wrappers);
var type;
var hasRequiredType;
function requireType() {
  if (hasRequiredType) return type;
  hasRequiredType = 1;
  type = Type2;
  var Namespace = requireNamespace();
  ((Type2.prototype = Object.create(Namespace.prototype)).constructor = Type2).className = "Type";
  var Enum2 = require_enum(), OneOf2 = requireOneof(), Field2 = requireField(), MapField2 = requireMapfield(), Service2 = requireService(), Message2 = message, Reader2 = reader, Writer2 = writer, util2 = requireUtil(), encoder = requireEncoder(), decoder = requireDecoder(), verifier = requireVerifier(), converter2 = requireConverter(), wrappers$1 = wrappers;
  function Type2(name, options) {
    Namespace.call(this, name, options);
    this.fields = {};
    this.oneofs = void 0;
    this.extensions = void 0;
    this.reserved = void 0;
    this.group = void 0;
    this._fieldsById = null;
    this._fieldsArray = null;
    this._oneofsArray = null;
    this._ctor = null;
  }
  Object.defineProperties(Type2.prototype, {
    /**
     * Message fields by id.
     * @name Type#fieldsById
     * @type {Object.<number,Field>}
     * @readonly
     */
    fieldsById: {
      get: function() {
        if (this._fieldsById)
          return this._fieldsById;
        this._fieldsById = {};
        for (var names = Object.keys(this.fields), i = 0; i < names.length; ++i) {
          var field2 = this.fields[names[i]], id = field2.id;
          if (this._fieldsById[id])
            throw Error("duplicate id " + id + " in " + this);
          this._fieldsById[id] = field2;
        }
        return this._fieldsById;
      }
    },
    /**
     * Fields of this message as an array for iteration.
     * @name Type#fieldsArray
     * @type {Field[]}
     * @readonly
     */
    fieldsArray: {
      get: function() {
        return this._fieldsArray || (this._fieldsArray = util2.toArray(this.fields));
      }
    },
    /**
     * Oneofs of this message as an array for iteration.
     * @name Type#oneofsArray
     * @type {OneOf[]}
     * @readonly
     */
    oneofsArray: {
      get: function() {
        return this._oneofsArray || (this._oneofsArray = util2.toArray(this.oneofs));
      }
    },
    /**
     * The registered constructor, if any registered, otherwise a generic constructor.
     * Assigning a function replaces the internal constructor. If the function does not extend {@link Message} yet, its prototype will be setup accordingly and static methods will be populated. If it already extends {@link Message}, it will just replace the internal constructor.
     * @name Type#ctor
     * @type {Constructor<{}>}
     */
    ctor: {
      get: function() {
        return this._ctor || (this.ctor = Type2.generateConstructor(this)());
      },
      set: function(ctor) {
        var prototype = ctor.prototype;
        if (!(prototype instanceof Message2)) {
          (ctor.prototype = new Message2()).constructor = ctor;
          util2.merge(ctor.prototype, prototype);
        }
        ctor.$type = ctor.prototype.$type = this;
        util2.merge(ctor, Message2, true);
        this._ctor = ctor;
        var i = 0;
        for (; i < /* initializes */
        this.fieldsArray.length; ++i)
          this._fieldsArray[i].resolve();
        var ctorProperties = {};
        for (i = 0; i < /* initializes */
        this.oneofsArray.length; ++i)
          ctorProperties[this._oneofsArray[i].resolve().name] = {
            get: util2.oneOfGetter(this._oneofsArray[i].oneof),
            set: util2.oneOfSetter(this._oneofsArray[i].oneof)
          };
        if (i)
          Object.defineProperties(ctor.prototype, ctorProperties);
      }
    }
  });
  Type2.generateConstructor = function generateConstructor(mtype) {
    var gen = util2.codegen(["p"], mtype.name);
    for (var i = 0, field2; i < mtype.fieldsArray.length; ++i)
      if ((field2 = mtype._fieldsArray[i]).map) gen("this%s={}", util2.safeProp(field2.name));
      else if (field2.repeated) gen("this%s=[]", util2.safeProp(field2.name));
    return gen("if(p)for(var ks=Object.keys(p),i=0;i<ks.length;++i)if(p[ks[i]]!=null)")("this[ks[i]]=p[ks[i]]");
  };
  function clearCache(type2) {
    type2._fieldsById = type2._fieldsArray = type2._oneofsArray = null;
    delete type2.encode;
    delete type2.decode;
    delete type2.verify;
    return type2;
  }
  Type2.fromJSON = function fromJSON(name, json) {
    var type2 = new Type2(name, json.options);
    type2.extensions = json.extensions;
    type2.reserved = json.reserved;
    var names = Object.keys(json.fields), i = 0;
    for (; i < names.length; ++i)
      type2.add(
        (typeof json.fields[names[i]].keyType !== "undefined" ? MapField2.fromJSON : Field2.fromJSON)(names[i], json.fields[names[i]])
      );
    if (json.oneofs)
      for (names = Object.keys(json.oneofs), i = 0; i < names.length; ++i)
        type2.add(OneOf2.fromJSON(names[i], json.oneofs[names[i]]));
    if (json.nested)
      for (names = Object.keys(json.nested), i = 0; i < names.length; ++i) {
        var nested = json.nested[names[i]];
        type2.add(
          // most to least likely
          (nested.id !== void 0 ? Field2.fromJSON : nested.fields !== void 0 ? Type2.fromJSON : nested.values !== void 0 ? Enum2.fromJSON : nested.methods !== void 0 ? Service2.fromJSON : Namespace.fromJSON)(names[i], nested)
        );
      }
    if (json.extensions && json.extensions.length)
      type2.extensions = json.extensions;
    if (json.reserved && json.reserved.length)
      type2.reserved = json.reserved;
    if (json.group)
      type2.group = true;
    if (json.comment)
      type2.comment = json.comment;
    if (json.edition)
      type2._edition = json.edition;
    type2._defaultEdition = "proto3";
    return type2;
  };
  Type2.prototype.toJSON = function toJSON2(toJSONOptions) {
    var inherited = Namespace.prototype.toJSON.call(this, toJSONOptions);
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util2.toObject([
      "edition",
      this._editionToJSON(),
      "options",
      inherited && inherited.options || void 0,
      "oneofs",
      Namespace.arrayToJSON(this.oneofsArray, toJSONOptions),
      "fields",
      Namespace.arrayToJSON(this.fieldsArray.filter(function(obj) {
        return !obj.declaringField;
      }), toJSONOptions) || {},
      "extensions",
      this.extensions && this.extensions.length ? this.extensions : void 0,
      "reserved",
      this.reserved && this.reserved.length ? this.reserved : void 0,
      "group",
      this.group || void 0,
      "nested",
      inherited && inherited.nested || void 0,
      "comment",
      keepComments ? this.comment : void 0
    ]);
  };
  Type2.prototype.resolveAll = function resolveAll() {
    Namespace.prototype.resolveAll.call(this);
    var oneofs = this.oneofsArray;
    i = 0;
    while (i < oneofs.length)
      oneofs[i++].resolve();
    var fields = this.fieldsArray, i = 0;
    while (i < fields.length)
      fields[i++].resolve();
    return this;
  };
  Type2.prototype._resolveFeaturesRecursive = function _resolveFeaturesRecursive(edition) {
    if (!this._needsRecursiveFeatureResolution) return this;
    edition = this._edition || edition;
    Namespace.prototype._resolveFeaturesRecursive.call(this, edition);
    this.oneofsArray.forEach((oneof2) => {
      oneof2._resolveFeatures(edition);
    });
    this.fieldsArray.forEach((field2) => {
      field2._resolveFeatures(edition);
    });
    return this;
  };
  Type2.prototype.get = function get2(name) {
    return this.fields[name] || this.oneofs && this.oneofs[name] || this.nested && this.nested[name] || null;
  };
  Type2.prototype.add = function add(object2) {
    if (this.get(object2.name))
      throw Error("duplicate name '" + object2.name + "' in " + this);
    if (object2 instanceof Field2 && object2.extend === void 0) {
      if (this._fieldsById ? (
        /* istanbul ignore next */
        this._fieldsById[object2.id]
      ) : this.fieldsById[object2.id])
        throw Error("duplicate id " + object2.id + " in " + this);
      if (this.isReservedId(object2.id))
        throw Error("id " + object2.id + " is reserved in " + this);
      if (this.isReservedName(object2.name))
        throw Error("name '" + object2.name + "' is reserved in " + this);
      if (object2.parent)
        object2.parent.remove(object2);
      this.fields[object2.name] = object2;
      object2.message = this;
      object2.onAdd(this);
      return clearCache(this);
    }
    if (object2 instanceof OneOf2) {
      if (!this.oneofs)
        this.oneofs = {};
      this.oneofs[object2.name] = object2;
      object2.onAdd(this);
      return clearCache(this);
    }
    return Namespace.prototype.add.call(this, object2);
  };
  Type2.prototype.remove = function remove(object2) {
    if (object2 instanceof Field2 && object2.extend === void 0) {
      if (!this.fields || this.fields[object2.name] !== object2)
        throw Error(object2 + " is not a member of " + this);
      delete this.fields[object2.name];
      object2.parent = null;
      object2.onRemove(this);
      return clearCache(this);
    }
    if (object2 instanceof OneOf2) {
      if (!this.oneofs || this.oneofs[object2.name] !== object2)
        throw Error(object2 + " is not a member of " + this);
      delete this.oneofs[object2.name];
      object2.parent = null;
      object2.onRemove(this);
      return clearCache(this);
    }
    return Namespace.prototype.remove.call(this, object2);
  };
  Type2.prototype.isReservedId = function isReservedId(id) {
    return Namespace.isReservedId(this.reserved, id);
  };
  Type2.prototype.isReservedName = function isReservedName(name) {
    return Namespace.isReservedName(this.reserved, name);
  };
  Type2.prototype.create = function create5(properties) {
    return new this.ctor(properties);
  };
  Type2.prototype.setup = function setup() {
    var fullName = this.fullName, types2 = [];
    for (var i = 0; i < /* initializes */
    this.fieldsArray.length; ++i)
      types2.push(this._fieldsArray[i].resolve().resolvedType);
    this.encode = encoder(this)({
      Writer: Writer2,
      types: types2,
      util: util2
    });
    this.decode = decoder(this)({
      Reader: Reader2,
      types: types2,
      util: util2
    });
    this.verify = verifier(this)({
      types: types2,
      util: util2
    });
    this.fromObject = converter2.fromObject(this)({
      types: types2,
      util: util2
    });
    this.toObject = converter2.toObject(this)({
      types: types2,
      util: util2
    });
    var wrapper = wrappers$1[fullName];
    if (wrapper) {
      var originalThis = Object.create(this);
      originalThis.fromObject = this.fromObject;
      this.fromObject = wrapper.fromObject.bind(originalThis);
      originalThis.toObject = this.toObject;
      this.toObject = wrapper.toObject.bind(originalThis);
    }
    return this;
  };
  Type2.prototype.encode = function encode_setup(message2, writer2) {
    return this.setup().encode(message2, writer2);
  };
  Type2.prototype.encodeDelimited = function encodeDelimited2(message2, writer2) {
    return this.encode(message2, writer2 && writer2.len ? writer2.fork() : writer2).ldelim();
  };
  Type2.prototype.decode = function decode_setup(reader2, length) {
    return this.setup().decode(reader2, length);
  };
  Type2.prototype.decodeDelimited = function decodeDelimited2(reader2) {
    if (!(reader2 instanceof Reader2))
      reader2 = Reader2.create(reader2);
    return this.decode(reader2, reader2.uint32());
  };
  Type2.prototype.verify = function verify_setup(message2) {
    return this.setup().verify(message2);
  };
  Type2.prototype.fromObject = function fromObject2(object2) {
    return this.setup().fromObject(object2);
  };
  Type2.prototype.toObject = function toObject2(message2, options) {
    return this.setup().toObject(message2, options);
  };
  Type2.d = function decorateType(typeName) {
    return function typeDecorator(target) {
      util2.decorateType(target, typeName);
    };
  };
  return type;
}
var root$1;
var hasRequiredRoot;
function requireRoot() {
  if (hasRequiredRoot) return root$1;
  hasRequiredRoot = 1;
  root$1 = Root2;
  var Namespace = requireNamespace();
  ((Root2.prototype = Object.create(Namespace.prototype)).constructor = Root2).className = "Root";
  var Field2 = requireField(), Enum2 = require_enum(), OneOf2 = requireOneof(), util2 = requireUtil();
  var Type2, parse2, common2;
  function Root2(options) {
    Namespace.call(this, "", options);
    this.deferred = [];
    this.files = [];
    this._edition = "proto2";
  }
  Root2.fromJSON = function fromJSON(json, root2) {
    if (!root2)
      root2 = new Root2();
    if (json.options)
      root2.setOptions(json.options);
    return root2.addJSON(json.nested)._resolveFeaturesRecursive();
  };
  Root2.prototype.resolvePath = util2.path.resolve;
  Root2.prototype.fetch = util2.fetch;
  function SYNC() {
  }
  Root2.prototype.load = function load2(filename, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = void 0;
    }
    var self2 = this;
    if (!callback) {
      return util2.asPromise(load2, self2, filename, options);
    }
    var sync = callback === SYNC;
    function finish2(err, root2) {
      if (root2) {
        root2._resolveFeaturesRecursive();
      }
      if (!callback) {
        return;
      }
      if (sync) {
        throw err;
      }
      var cb = callback;
      callback = null;
      cb(err, root2);
    }
    function getBundledFileName(filename2) {
      var idx = filename2.lastIndexOf("google/protobuf/");
      if (idx > -1) {
        var altname = filename2.substring(idx);
        if (altname in common2) return altname;
      }
      return null;
    }
    function process2(filename2, source) {
      try {
        if (util2.isString(source) && source.charAt(0) === "{")
          source = JSON.parse(source);
        if (!util2.isString(source))
          self2.setOptions(source.options).addJSON(source.nested);
        else {
          parse2.filename = filename2;
          var parsed = parse2(source, self2, options), resolved2, i2 = 0;
          if (parsed.imports) {
            for (; i2 < parsed.imports.length; ++i2)
              if (resolved2 = getBundledFileName(parsed.imports[i2]) || self2.resolvePath(filename2, parsed.imports[i2]))
                fetch2(resolved2);
          }
          if (parsed.weakImports) {
            for (i2 = 0; i2 < parsed.weakImports.length; ++i2)
              if (resolved2 = getBundledFileName(parsed.weakImports[i2]) || self2.resolvePath(filename2, parsed.weakImports[i2]))
                fetch2(resolved2, true);
          }
        }
      } catch (err) {
        finish2(err);
      }
      if (!sync && !queued) {
        finish2(null, self2);
      }
    }
    function fetch2(filename2, weak) {
      filename2 = getBundledFileName(filename2) || filename2;
      if (self2.files.indexOf(filename2) > -1) {
        return;
      }
      self2.files.push(filename2);
      if (filename2 in common2) {
        if (sync) {
          process2(filename2, common2[filename2]);
        } else {
          ++queued;
          setTimeout(function() {
            --queued;
            process2(filename2, common2[filename2]);
          });
        }
        return;
      }
      if (sync) {
        var source;
        try {
          source = util2.fs.readFileSync(filename2).toString("utf8");
        } catch (err) {
          if (!weak)
            finish2(err);
          return;
        }
        process2(filename2, source);
      } else {
        ++queued;
        self2.fetch(filename2, function(err, source2) {
          --queued;
          if (!callback) {
            return;
          }
          if (err) {
            if (!weak)
              finish2(err);
            else if (!queued)
              finish2(null, self2);
            return;
          }
          process2(filename2, source2);
        });
      }
    }
    var queued = 0;
    if (util2.isString(filename)) {
      filename = [filename];
    }
    for (var i = 0, resolved; i < filename.length; ++i)
      if (resolved = self2.resolvePath("", filename[i]))
        fetch2(resolved);
    if (sync) {
      self2._resolveFeaturesRecursive();
      return self2;
    }
    if (!queued) {
      finish2(null, self2);
    }
    return self2;
  };
  Root2.prototype.loadSync = function loadSync2(filename, options) {
    if (!util2.isNode)
      throw Error("not supported");
    return this.load(filename, options, SYNC);
  };
  Root2.prototype.resolveAll = function resolveAll() {
    if (this.deferred.length)
      throw Error("unresolvable extensions: " + this.deferred.map(function(field2) {
        return "'extend " + field2.extend + "' in " + field2.parent.fullName;
      }).join(", "));
    this._resolveFeaturesRecursive(this._edition);
    return Namespace.prototype.resolveAll.call(this);
  };
  var exposeRe = /^[A-Z]/;
  function tryHandleExtension(root2, field2) {
    var extendedType = field2.parent.lookup(field2.extend);
    if (extendedType) {
      var sisterField = new Field2(field2.fullName, field2.id, field2.type, field2.rule, void 0, field2.options);
      if (extendedType.get(sisterField.name)) {
        return true;
      }
      sisterField.declaringField = field2;
      field2.extensionField = sisterField;
      extendedType.add(sisterField);
      return true;
    }
    return false;
  }
  Root2.prototype._handleAdd = function _handleAdd(object2) {
    if (object2 instanceof Field2) {
      if (
        /* an extension field (implies not part of a oneof) */
        object2.extend !== void 0 && /* not already handled */
        !object2.extensionField
      ) {
        if (!tryHandleExtension(this, object2))
          this.deferred.push(object2);
      }
    } else if (object2 instanceof Enum2) {
      if (exposeRe.test(object2.name))
        object2.parent[object2.name] = object2.values;
    } else if (!(object2 instanceof OneOf2)) {
      if (object2 instanceof Type2)
        for (var i = 0; i < this.deferred.length; )
          if (tryHandleExtension(this, this.deferred[i]))
            this.deferred.splice(i, 1);
          else
            ++i;
      for (var j = 0; j < /* initializes */
      object2.nestedArray.length; ++j)
        this._handleAdd(object2._nestedArray[j]);
      if (exposeRe.test(object2.name))
        object2.parent[object2.name] = object2;
    }
  };
  Root2.prototype._handleRemove = function _handleRemove(object2) {
    if (object2 instanceof Field2) {
      if (
        /* an extension field */
        object2.extend !== void 0
      ) {
        if (
          /* already handled */
          object2.extensionField
        ) {
          object2.extensionField.parent.remove(object2.extensionField);
          object2.extensionField = null;
        } else {
          var index = this.deferred.indexOf(object2);
          if (index > -1)
            this.deferred.splice(index, 1);
        }
      }
    } else if (object2 instanceof Enum2) {
      if (exposeRe.test(object2.name))
        delete object2.parent[object2.name];
    } else if (object2 instanceof Namespace) {
      for (var i = 0; i < /* initializes */
      object2.nestedArray.length; ++i)
        this._handleRemove(object2._nestedArray[i]);
      if (exposeRe.test(object2.name))
        delete object2.parent[object2.name];
    }
  };
  Root2._configure = function(Type_, parse_, common_) {
    Type2 = Type_;
    parse2 = parse_;
    common2 = common_;
  };
  return root$1;
}
var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) return util$2.exports;
  hasRequiredUtil = 1;
  var util2 = util$2.exports = requireMinimal();
  var roots$1 = roots;
  var Type2, Enum2;
  util2.codegen = codegen_1;
  util2.fetch = fetch_1;
  util2.path = path;
  util2.fs = util2.inquire("fs");
  util2.toArray = function toArray(object2) {
    if (object2) {
      var keys = Object.keys(object2), array = new Array(keys.length), index = 0;
      while (index < keys.length)
        array[index] = object2[keys[index++]];
      return array;
    }
    return [];
  };
  util2.toObject = function toObject2(array) {
    var object2 = {}, index = 0;
    while (index < array.length) {
      var key = array[index++], val = array[index++];
      if (val !== void 0)
        object2[key] = val;
    }
    return object2;
  };
  var safePropBackslashRe = /\\/g, safePropQuoteRe = /"/g;
  util2.isReserved = function isReserved(name) {
    return /^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/.test(name);
  };
  util2.safeProp = function safeProp(prop) {
    if (!/^[$\w_]+$/.test(prop) || util2.isReserved(prop))
      return '["' + prop.replace(safePropBackslashRe, "\\\\").replace(safePropQuoteRe, '\\"') + '"]';
    return "." + prop;
  };
  util2.ucFirst = function ucFirst(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  };
  var camelCaseRe = /_([a-z])/g;
  util2.camelCase = function camelCase(str) {
    return str.substring(0, 1) + str.substring(1).replace(camelCaseRe, function($0, $1) {
      return $1.toUpperCase();
    });
  };
  util2.compareFieldsById = function compareFieldsById(a, b) {
    return a.id - b.id;
  };
  util2.decorateType = function decorateType(ctor, typeName) {
    if (ctor.$type) {
      if (typeName && ctor.$type.name !== typeName) {
        util2.decorateRoot.remove(ctor.$type);
        ctor.$type.name = typeName;
        util2.decorateRoot.add(ctor.$type);
      }
      return ctor.$type;
    }
    if (!Type2)
      Type2 = requireType();
    var type2 = new Type2(typeName || ctor.name);
    util2.decorateRoot.add(type2);
    type2.ctor = ctor;
    Object.defineProperty(ctor, "$type", { value: type2, enumerable: false });
    Object.defineProperty(ctor.prototype, "$type", { value: type2, enumerable: false });
    return type2;
  };
  var decorateEnumIndex = 0;
  util2.decorateEnum = function decorateEnum(object2) {
    if (object2.$type)
      return object2.$type;
    if (!Enum2)
      Enum2 = require_enum();
    var enm = new Enum2("Enum" + decorateEnumIndex++, object2);
    util2.decorateRoot.add(enm);
    Object.defineProperty(object2, "$type", { value: enm, enumerable: false });
    return enm;
  };
  util2.setProperty = function setProperty(dst, path2, value, ifNotSet) {
    function setProp(dst2, path3, value2) {
      var part = path3.shift();
      if (part === "__proto__" || part === "prototype") {
        return dst2;
      }
      if (path3.length > 0) {
        dst2[part] = setProp(dst2[part] || {}, path3, value2);
      } else {
        var prevValue = dst2[part];
        if (prevValue && ifNotSet)
          return dst2;
        if (prevValue)
          value2 = [].concat(prevValue).concat(value2);
        dst2[part] = value2;
      }
      return dst2;
    }
    if (typeof dst !== "object")
      throw TypeError("dst must be an object");
    if (!path2)
      throw TypeError("path must be specified");
    path2 = path2.split(".");
    return setProp(dst, path2, value);
  };
  Object.defineProperty(util2, "decorateRoot", {
    get: function() {
      return roots$1["decorated"] || (roots$1["decorated"] = new (requireRoot())());
    }
  });
  return util$2.exports;
}
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes) return types$1;
  hasRequiredTypes = 1;
  (function(exports) {
    var types2 = exports;
    var util2 = requireUtil();
    var s = [
      "double",
      // 0
      "float",
      // 1
      "int32",
      // 2
      "uint32",
      // 3
      "sint32",
      // 4
      "fixed32",
      // 5
      "sfixed32",
      // 6
      "int64",
      // 7
      "uint64",
      // 8
      "sint64",
      // 9
      "fixed64",
      // 10
      "sfixed64",
      // 11
      "bool",
      // 12
      "string",
      // 13
      "bytes"
      // 14
    ];
    function bake(values, offset) {
      var i = 0, o = {};
      offset |= 0;
      while (i < values.length) o[s[i + offset]] = values[i++];
      return o;
    }
    types2.basic = bake([
      /* double   */
      1,
      /* float    */
      5,
      /* int32    */
      0,
      /* uint32   */
      0,
      /* sint32   */
      0,
      /* fixed32  */
      5,
      /* sfixed32 */
      5,
      /* int64    */
      0,
      /* uint64   */
      0,
      /* sint64   */
      0,
      /* fixed64  */
      1,
      /* sfixed64 */
      1,
      /* bool     */
      0,
      /* string   */
      2,
      /* bytes    */
      2
    ]);
    types2.defaults = bake([
      /* double   */
      0,
      /* float    */
      0,
      /* int32    */
      0,
      /* uint32   */
      0,
      /* sint32   */
      0,
      /* fixed32  */
      0,
      /* sfixed32 */
      0,
      /* int64    */
      0,
      /* uint64   */
      0,
      /* sint64   */
      0,
      /* fixed64  */
      0,
      /* sfixed64 */
      0,
      /* bool     */
      false,
      /* string   */
      "",
      /* bytes    */
      util2.emptyArray,
      /* message  */
      null
    ]);
    types2.long = bake([
      /* int64    */
      0,
      /* uint64   */
      0,
      /* sint64   */
      0,
      /* fixed64  */
      1,
      /* sfixed64 */
      1
    ], 7);
    types2.mapKey = bake([
      /* int32    */
      0,
      /* uint32   */
      0,
      /* sint32   */
      0,
      /* fixed32  */
      5,
      /* sfixed32 */
      5,
      /* int64    */
      0,
      /* uint64   */
      0,
      /* sint64   */
      0,
      /* fixed64  */
      1,
      /* sfixed64 */
      1,
      /* bool     */
      0,
      /* string   */
      2
    ], 2);
    types2.packed = bake([
      /* double   */
      1,
      /* float    */
      5,
      /* int32    */
      0,
      /* uint32   */
      0,
      /* sint32   */
      0,
      /* fixed32  */
      5,
      /* sfixed32 */
      5,
      /* int64    */
      0,
      /* uint64   */
      0,
      /* sint64   */
      0,
      /* fixed64  */
      1,
      /* sfixed64 */
      1,
      /* bool     */
      0
    ]);
  })(types$1);
  return types$1;
}
var field;
var hasRequiredField;
function requireField() {
  if (hasRequiredField) return field;
  hasRequiredField = 1;
  field = Field2;
  var ReflectionObject2 = requireObject();
  ((Field2.prototype = Object.create(ReflectionObject2.prototype)).constructor = Field2).className = "Field";
  var Enum2 = require_enum(), types2 = requireTypes(), util2 = requireUtil();
  var Type2;
  var ruleRe = /^required|optional|repeated$/;
  Field2.fromJSON = function fromJSON(name, json) {
    var field2 = new Field2(name, json.id, json.type, json.rule, json.extend, json.options, json.comment);
    if (json.edition)
      field2._edition = json.edition;
    field2._defaultEdition = "proto3";
    return field2;
  };
  function Field2(name, id, type2, rule, extend, options, comment) {
    if (util2.isObject(rule)) {
      comment = extend;
      options = rule;
      rule = extend = void 0;
    } else if (util2.isObject(extend)) {
      comment = options;
      options = extend;
      extend = void 0;
    }
    ReflectionObject2.call(this, name, options);
    if (!util2.isInteger(id) || id < 0)
      throw TypeError("id must be a non-negative integer");
    if (!util2.isString(type2))
      throw TypeError("type must be a string");
    if (rule !== void 0 && !ruleRe.test(rule = rule.toString().toLowerCase()))
      throw TypeError("rule must be a string rule");
    if (extend !== void 0 && !util2.isString(extend))
      throw TypeError("extend must be a string");
    if (rule === "proto3_optional") {
      rule = "optional";
    }
    this.rule = rule && rule !== "optional" ? rule : void 0;
    this.type = type2;
    this.id = id;
    this.extend = extend || void 0;
    this.repeated = rule === "repeated";
    this.map = false;
    this.message = null;
    this.partOf = null;
    this.typeDefault = null;
    this.defaultValue = null;
    this.long = util2.Long ? types2.long[type2] !== void 0 : (
      /* istanbul ignore next */
      false
    );
    this.bytes = type2 === "bytes";
    this.resolvedType = null;
    this.extensionField = null;
    this.declaringField = null;
    this.comment = comment;
  }
  Object.defineProperty(Field2.prototype, "required", {
    get: function() {
      return this._features.field_presence === "LEGACY_REQUIRED";
    }
  });
  Object.defineProperty(Field2.prototype, "optional", {
    get: function() {
      return !this.required;
    }
  });
  Object.defineProperty(Field2.prototype, "delimited", {
    get: function() {
      return this.resolvedType instanceof Type2 && this._features.message_encoding === "DELIMITED";
    }
  });
  Object.defineProperty(Field2.prototype, "packed", {
    get: function() {
      return this._features.repeated_field_encoding === "PACKED";
    }
  });
  Object.defineProperty(Field2.prototype, "hasPresence", {
    get: function() {
      if (this.repeated || this.map) {
        return false;
      }
      return this.partOf || // oneofs
      this.declaringField || this.extensionField || // extensions
      this._features.field_presence !== "IMPLICIT";
    }
  });
  Field2.prototype.setOption = function setOption(name, value, ifNotSet) {
    return ReflectionObject2.prototype.setOption.call(this, name, value, ifNotSet);
  };
  Field2.prototype.toJSON = function toJSON2(toJSONOptions) {
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util2.toObject([
      "edition",
      this._editionToJSON(),
      "rule",
      this.rule !== "optional" && this.rule || void 0,
      "type",
      this.type,
      "id",
      this.id,
      "extend",
      this.extend,
      "options",
      this.options,
      "comment",
      keepComments ? this.comment : void 0
    ]);
  };
  Field2.prototype.resolve = function resolve() {
    if (this.resolved)
      return this;
    if ((this.typeDefault = types2.defaults[this.type]) === void 0) {
      this.resolvedType = (this.declaringField ? this.declaringField.parent : this.parent).lookupTypeOrEnum(this.type);
      if (this.resolvedType instanceof Type2)
        this.typeDefault = null;
      else
        this.typeDefault = this.resolvedType.values[Object.keys(this.resolvedType.values)[0]];
    } else if (this.options && this.options.proto3_optional) {
      this.typeDefault = null;
    }
    if (this.options && this.options["default"] != null) {
      this.typeDefault = this.options["default"];
      if (this.resolvedType instanceof Enum2 && typeof this.typeDefault === "string")
        this.typeDefault = this.resolvedType.values[this.typeDefault];
    }
    if (this.options) {
      if (this.options.packed !== void 0 && this.resolvedType && !(this.resolvedType instanceof Enum2))
        delete this.options.packed;
      if (!Object.keys(this.options).length)
        this.options = void 0;
    }
    if (this.long) {
      this.typeDefault = util2.Long.fromNumber(this.typeDefault, this.type.charAt(0) === "u");
      if (Object.freeze)
        Object.freeze(this.typeDefault);
    } else if (this.bytes && typeof this.typeDefault === "string") {
      var buf;
      if (util2.base64.test(this.typeDefault))
        util2.base64.decode(this.typeDefault, buf = util2.newBuffer(util2.base64.length(this.typeDefault)), 0);
      else
        util2.utf8.write(this.typeDefault, buf = util2.newBuffer(util2.utf8.length(this.typeDefault)), 0);
      this.typeDefault = buf;
    }
    if (this.map)
      this.defaultValue = util2.emptyObject;
    else if (this.repeated)
      this.defaultValue = util2.emptyArray;
    else
      this.defaultValue = this.typeDefault;
    if (this.parent instanceof Type2)
      this.parent.ctor.prototype[this.name] = this.defaultValue;
    return ReflectionObject2.prototype.resolve.call(this);
  };
  Field2.prototype._inferLegacyProtoFeatures = function _inferLegacyProtoFeatures(edition) {
    if (edition !== "proto2" && edition !== "proto3") {
      return {};
    }
    var features = {};
    if (this.rule === "required") {
      features.field_presence = "LEGACY_REQUIRED";
    }
    if (this.parent && types2.defaults[this.type] === void 0) {
      var type2 = this.parent.get(this.type.split(".").pop());
      if (type2 && type2 instanceof Type2 && type2.group) {
        features.message_encoding = "DELIMITED";
      }
    }
    if (this.getOption("packed") === true) {
      features.repeated_field_encoding = "PACKED";
    } else if (this.getOption("packed") === false) {
      features.repeated_field_encoding = "EXPANDED";
    }
    return features;
  };
  Field2.prototype._resolveFeatures = function _resolveFeatures(edition) {
    return ReflectionObject2.prototype._resolveFeatures.call(this, this._edition || edition);
  };
  Field2.d = function decorateField(fieldId, fieldType, fieldRule, defaultValue) {
    if (typeof fieldType === "function")
      fieldType = util2.decorateType(fieldType).name;
    else if (fieldType && typeof fieldType === "object")
      fieldType = util2.decorateEnum(fieldType).name;
    return function fieldDecorator(prototype, fieldName) {
      util2.decorateType(prototype.constructor).add(new Field2(fieldName, fieldId, fieldType, fieldRule, { "default": defaultValue }));
    };
  };
  Field2._configure = function configure(Type_) {
    Type2 = Type_;
  };
  return field;
}
var oneof;
var hasRequiredOneof;
function requireOneof() {
  if (hasRequiredOneof) return oneof;
  hasRequiredOneof = 1;
  oneof = OneOf2;
  var ReflectionObject2 = requireObject();
  ((OneOf2.prototype = Object.create(ReflectionObject2.prototype)).constructor = OneOf2).className = "OneOf";
  var Field2 = requireField(), util2 = requireUtil();
  function OneOf2(name, fieldNames, options, comment) {
    if (!Array.isArray(fieldNames)) {
      options = fieldNames;
      fieldNames = void 0;
    }
    ReflectionObject2.call(this, name, options);
    if (!(fieldNames === void 0 || Array.isArray(fieldNames)))
      throw TypeError("fieldNames must be an Array");
    this.oneof = fieldNames || [];
    this.fieldsArray = [];
    this.comment = comment;
  }
  OneOf2.fromJSON = function fromJSON(name, json) {
    return new OneOf2(name, json.oneof, json.options, json.comment);
  };
  OneOf2.prototype.toJSON = function toJSON2(toJSONOptions) {
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util2.toObject([
      "options",
      this.options,
      "oneof",
      this.oneof,
      "comment",
      keepComments ? this.comment : void 0
    ]);
  };
  function addFieldsToParent(oneof2) {
    if (oneof2.parent) {
      for (var i = 0; i < oneof2.fieldsArray.length; ++i)
        if (!oneof2.fieldsArray[i].parent)
          oneof2.parent.add(oneof2.fieldsArray[i]);
    }
  }
  OneOf2.prototype.add = function add(field2) {
    if (!(field2 instanceof Field2))
      throw TypeError("field must be a Field");
    if (field2.parent && field2.parent !== this.parent)
      field2.parent.remove(field2);
    this.oneof.push(field2.name);
    this.fieldsArray.push(field2);
    field2.partOf = this;
    addFieldsToParent(this);
    return this;
  };
  OneOf2.prototype.remove = function remove(field2) {
    if (!(field2 instanceof Field2))
      throw TypeError("field must be a Field");
    var index = this.fieldsArray.indexOf(field2);
    if (index < 0)
      throw Error(field2 + " is not a member of " + this);
    this.fieldsArray.splice(index, 1);
    index = this.oneof.indexOf(field2.name);
    if (index > -1)
      this.oneof.splice(index, 1);
    field2.partOf = null;
    return this;
  };
  OneOf2.prototype.onAdd = function onAdd(parent) {
    ReflectionObject2.prototype.onAdd.call(this, parent);
    var self2 = this;
    for (var i = 0; i < this.oneof.length; ++i) {
      var field2 = parent.get(this.oneof[i]);
      if (field2 && !field2.partOf) {
        field2.partOf = self2;
        self2.fieldsArray.push(field2);
      }
    }
    addFieldsToParent(this);
  };
  OneOf2.prototype.onRemove = function onRemove(parent) {
    for (var i = 0, field2; i < this.fieldsArray.length; ++i)
      if ((field2 = this.fieldsArray[i]).parent)
        field2.parent.remove(field2);
    ReflectionObject2.prototype.onRemove.call(this, parent);
  };
  Object.defineProperty(OneOf2.prototype, "isProto3Optional", {
    get: function() {
      if (this.fieldsArray == null || this.fieldsArray.length !== 1) {
        return false;
      }
      var field2 = this.fieldsArray[0];
      return field2.options != null && field2.options["proto3_optional"] === true;
    }
  });
  OneOf2.d = function decorateOneOf() {
    var fieldNames = new Array(arguments.length), index = 0;
    while (index < arguments.length)
      fieldNames[index] = arguments[index++];
    return function oneOfDecorator(prototype, oneofName) {
      util2.decorateType(prototype.constructor).add(new OneOf2(oneofName, fieldNames));
      Object.defineProperty(prototype, oneofName, {
        get: util2.oneOfGetter(fieldNames),
        set: util2.oneOfSetter(fieldNames)
      });
    };
  };
  return oneof;
}
var object;
var hasRequiredObject;
function requireObject() {
  if (hasRequiredObject) return object;
  hasRequiredObject = 1;
  object = ReflectionObject2;
  ReflectionObject2.className = "ReflectionObject";
  const OneOf2 = requireOneof();
  var util2 = requireUtil();
  var Root2;
  var editions2023Defaults = { enum_type: "OPEN", field_presence: "EXPLICIT", json_format: "ALLOW", message_encoding: "LENGTH_PREFIXED", repeated_field_encoding: "PACKED", utf8_validation: "VERIFY" };
  var proto2Defaults = { enum_type: "CLOSED", field_presence: "EXPLICIT", json_format: "LEGACY_BEST_EFFORT", message_encoding: "LENGTH_PREFIXED", repeated_field_encoding: "EXPANDED", utf8_validation: "NONE" };
  var proto3Defaults = { enum_type: "OPEN", field_presence: "IMPLICIT", json_format: "ALLOW", message_encoding: "LENGTH_PREFIXED", repeated_field_encoding: "PACKED", utf8_validation: "VERIFY" };
  function ReflectionObject2(name, options) {
    if (!util2.isString(name))
      throw TypeError("name must be a string");
    if (options && !util2.isObject(options))
      throw TypeError("options must be an object");
    this.options = options;
    this.parsedOptions = null;
    this.name = name;
    this._edition = null;
    this._defaultEdition = "proto2";
    this._features = {};
    this._featuresResolved = false;
    this.parent = null;
    this.resolved = false;
    this.comment = null;
    this.filename = null;
  }
  Object.defineProperties(ReflectionObject2.prototype, {
    /**
     * Reference to the root namespace.
     * @name ReflectionObject#root
     * @type {Root}
     * @readonly
     */
    root: {
      get: function() {
        var ptr = this;
        while (ptr.parent !== null)
          ptr = ptr.parent;
        return ptr;
      }
    },
    /**
     * Full name including leading dot.
     * @name ReflectionObject#fullName
     * @type {string}
     * @readonly
     */
    fullName: {
      get: function() {
        var path2 = [this.name], ptr = this.parent;
        while (ptr) {
          path2.unshift(ptr.name);
          ptr = ptr.parent;
        }
        return path2.join(".");
      }
    }
  });
  ReflectionObject2.prototype.toJSON = /* istanbul ignore next */
  function toJSON2() {
    throw Error();
  };
  ReflectionObject2.prototype.onAdd = function onAdd(parent) {
    if (this.parent && this.parent !== parent)
      this.parent.remove(this);
    this.parent = parent;
    this.resolved = false;
    var root2 = parent.root;
    if (root2 instanceof Root2)
      root2._handleAdd(this);
  };
  ReflectionObject2.prototype.onRemove = function onRemove(parent) {
    var root2 = parent.root;
    if (root2 instanceof Root2)
      root2._handleRemove(this);
    this.parent = null;
    this.resolved = false;
  };
  ReflectionObject2.prototype.resolve = function resolve() {
    if (this.resolved)
      return this;
    if (this.root instanceof Root2)
      this.resolved = true;
    return this;
  };
  ReflectionObject2.prototype._resolveFeaturesRecursive = function _resolveFeaturesRecursive(edition) {
    return this._resolveFeatures(this._edition || edition);
  };
  ReflectionObject2.prototype._resolveFeatures = function _resolveFeatures(edition) {
    if (this._featuresResolved) {
      return;
    }
    var defaults = {};
    if (!edition) {
      throw new Error("Unknown edition for " + this.fullName);
    }
    var protoFeatures = Object.assign(
      this.options ? Object.assign({}, this.options.features) : {},
      this._inferLegacyProtoFeatures(edition)
    );
    if (this._edition) {
      if (edition === "proto2") {
        defaults = Object.assign({}, proto2Defaults);
      } else if (edition === "proto3") {
        defaults = Object.assign({}, proto3Defaults);
      } else if (edition === "2023") {
        defaults = Object.assign({}, editions2023Defaults);
      } else {
        throw new Error("Unknown edition: " + edition);
      }
      this._features = Object.assign(defaults, protoFeatures || {});
      this._featuresResolved = true;
      return;
    }
    if (this.partOf instanceof OneOf2) {
      var lexicalParentFeaturesCopy = Object.assign({}, this.partOf._features);
      this._features = Object.assign(lexicalParentFeaturesCopy, protoFeatures || {});
    } else if (this.declaringField) ;
    else if (this.parent) {
      var parentFeaturesCopy = Object.assign({}, this.parent._features);
      this._features = Object.assign(parentFeaturesCopy, protoFeatures || {});
    } else {
      throw new Error("Unable to find a parent for " + this.fullName);
    }
    if (this.extensionField) {
      this.extensionField._features = this._features;
    }
    this._featuresResolved = true;
  };
  ReflectionObject2.prototype._inferLegacyProtoFeatures = function _inferLegacyProtoFeatures() {
    return {};
  };
  ReflectionObject2.prototype.getOption = function getOption(name) {
    if (this.options)
      return this.options[name];
    return void 0;
  };
  ReflectionObject2.prototype.setOption = function setOption(name, value, ifNotSet) {
    if (!this.options)
      this.options = {};
    if (/^features\./.test(name)) {
      util2.setProperty(this.options, name, value, ifNotSet);
    } else if (!ifNotSet || this.options[name] === void 0) {
      if (this.getOption(name) !== value) this.resolved = false;
      this.options[name] = value;
    }
    return this;
  };
  ReflectionObject2.prototype.setParsedOption = function setParsedOption(name, value, propName) {
    if (!this.parsedOptions) {
      this.parsedOptions = [];
    }
    var parsedOptions = this.parsedOptions;
    if (propName) {
      var opt = parsedOptions.find(function(opt2) {
        return Object.prototype.hasOwnProperty.call(opt2, name);
      });
      if (opt) {
        var newValue = opt[name];
        util2.setProperty(newValue, propName, value);
      } else {
        opt = {};
        opt[name] = util2.setProperty({}, propName, value);
        parsedOptions.push(opt);
      }
    } else {
      var newOpt = {};
      newOpt[name] = value;
      parsedOptions.push(newOpt);
    }
    return this;
  };
  ReflectionObject2.prototype.setOptions = function setOptions(options, ifNotSet) {
    if (options)
      for (var keys = Object.keys(options), i = 0; i < keys.length; ++i)
        this.setOption(keys[i], options[keys[i]], ifNotSet);
    return this;
  };
  ReflectionObject2.prototype.toString = function toString() {
    var className = this.constructor.className, fullName = this.fullName;
    if (fullName.length)
      return className + " " + fullName;
    return className;
  };
  ReflectionObject2.prototype._editionToJSON = function _editionToJSON() {
    if (!this._edition || this._edition === "proto3") {
      return void 0;
    }
    return this._edition;
  };
  ReflectionObject2._configure = function(Root_) {
    Root2 = Root_;
  };
  return object;
}
var _enum;
var hasRequired_enum;
function require_enum() {
  if (hasRequired_enum) return _enum;
  hasRequired_enum = 1;
  _enum = Enum2;
  var ReflectionObject2 = requireObject();
  ((Enum2.prototype = Object.create(ReflectionObject2.prototype)).constructor = Enum2).className = "Enum";
  var Namespace = requireNamespace(), util2 = requireUtil();
  function Enum2(name, values, options, comment, comments, valuesOptions) {
    ReflectionObject2.call(this, name, options);
    if (values && typeof values !== "object")
      throw TypeError("values must be an object");
    this.valuesById = {};
    this.values = Object.create(this.valuesById);
    this.comment = comment;
    this.comments = comments || {};
    this.valuesOptions = valuesOptions;
    this._valuesFeatures = {};
    this.reserved = void 0;
    if (values) {
      for (var keys = Object.keys(values), i = 0; i < keys.length; ++i)
        if (typeof values[keys[i]] === "number")
          this.valuesById[this.values[keys[i]] = values[keys[i]]] = keys[i];
    }
  }
  Enum2.prototype._resolveFeatures = function _resolveFeatures(edition) {
    edition = this._edition || edition;
    ReflectionObject2.prototype._resolveFeatures.call(this, edition);
    Object.keys(this.values).forEach((key) => {
      var parentFeaturesCopy = Object.assign({}, this._features);
      this._valuesFeatures[key] = Object.assign(parentFeaturesCopy, this.valuesOptions && this.valuesOptions[key] && this.valuesOptions[key].features);
    });
    return this;
  };
  Enum2.fromJSON = function fromJSON(name, json) {
    var enm = new Enum2(name, json.values, json.options, json.comment, json.comments);
    enm.reserved = json.reserved;
    if (json.edition)
      enm._edition = json.edition;
    enm._defaultEdition = "proto3";
    return enm;
  };
  Enum2.prototype.toJSON = function toJSON2(toJSONOptions) {
    var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
    return util2.toObject([
      "edition",
      this._editionToJSON(),
      "options",
      this.options,
      "valuesOptions",
      this.valuesOptions,
      "values",
      this.values,
      "reserved",
      this.reserved && this.reserved.length ? this.reserved : void 0,
      "comment",
      keepComments ? this.comment : void 0,
      "comments",
      keepComments ? this.comments : void 0
    ]);
  };
  Enum2.prototype.add = function add(name, id, comment, options) {
    if (!util2.isString(name))
      throw TypeError("name must be a string");
    if (!util2.isInteger(id))
      throw TypeError("id must be an integer");
    if (this.values[name] !== void 0)
      throw Error("duplicate name '" + name + "' in " + this);
    if (this.isReservedId(id))
      throw Error("id " + id + " is reserved in " + this);
    if (this.isReservedName(name))
      throw Error("name '" + name + "' is reserved in " + this);
    if (this.valuesById[id] !== void 0) {
      if (!(this.options && this.options.allow_alias))
        throw Error("duplicate id " + id + " in " + this);
      this.values[name] = id;
    } else
      this.valuesById[this.values[name] = id] = name;
    if (options) {
      if (this.valuesOptions === void 0)
        this.valuesOptions = {};
      this.valuesOptions[name] = options || null;
    }
    this.comments[name] = comment || null;
    return this;
  };
  Enum2.prototype.remove = function remove(name) {
    if (!util2.isString(name))
      throw TypeError("name must be a string");
    var val = this.values[name];
    if (val == null)
      throw Error("name '" + name + "' does not exist in " + this);
    delete this.valuesById[val];
    delete this.values[name];
    delete this.comments[name];
    if (this.valuesOptions)
      delete this.valuesOptions[name];
    return this;
  };
  Enum2.prototype.isReservedId = function isReservedId(id) {
    return Namespace.isReservedId(this.reserved, id);
  };
  Enum2.prototype.isReservedName = function isReservedName(name) {
    return Namespace.isReservedName(this.reserved, name);
  };
  return _enum;
}
var encoder_1;
var hasRequiredEncoder;
function requireEncoder() {
  if (hasRequiredEncoder) return encoder_1;
  hasRequiredEncoder = 1;
  encoder_1 = encoder;
  var Enum2 = require_enum(), types2 = requireTypes(), util2 = requireUtil();
  function genTypePartial(gen, field2, fieldIndex, ref) {
    return field2.delimited ? gen("types[%i].encode(%s,w.uint32(%i)).uint32(%i)", fieldIndex, ref, (field2.id << 3 | 3) >>> 0, (field2.id << 3 | 4) >>> 0) : gen("types[%i].encode(%s,w.uint32(%i).fork()).ldelim()", fieldIndex, ref, (field2.id << 3 | 2) >>> 0);
  }
  function encoder(mtype) {
    var gen = util2.codegen(["m", "w"], mtype.name + "$encode")("if(!w)")("w=Writer.create()");
    var i, ref;
    var fields = (
      /* initializes */
      mtype.fieldsArray.slice().sort(util2.compareFieldsById)
    );
    for (var i = 0; i < fields.length; ++i) {
      var field2 = fields[i].resolve(), index = mtype._fieldsArray.indexOf(field2), type2 = field2.resolvedType instanceof Enum2 ? "int32" : field2.type, wireType = types2.basic[type2];
      ref = "m" + util2.safeProp(field2.name);
      if (field2.map) {
        gen("if(%s!=null&&Object.hasOwnProperty.call(m,%j)){", ref, field2.name)("for(var ks=Object.keys(%s),i=0;i<ks.length;++i){", ref)("w.uint32(%i).fork().uint32(%i).%s(ks[i])", (field2.id << 3 | 2) >>> 0, 8 | types2.mapKey[field2.keyType], field2.keyType);
        if (wireType === void 0) gen("types[%i].encode(%s[ks[i]],w.uint32(18).fork()).ldelim().ldelim()", index, ref);
        else gen(".uint32(%i).%s(%s[ks[i]]).ldelim()", 16 | wireType, type2, ref);
        gen("}")("}");
      } else if (field2.repeated) {
        gen("if(%s!=null&&%s.length){", ref, ref);
        if (field2.packed && types2.packed[type2] !== void 0) {
          gen("w.uint32(%i).fork()", (field2.id << 3 | 2) >>> 0)("for(var i=0;i<%s.length;++i)", ref)("w.%s(%s[i])", type2, ref)("w.ldelim()");
        } else {
          gen("for(var i=0;i<%s.length;++i)", ref);
          if (wireType === void 0)
            genTypePartial(gen, field2, index, ref + "[i]");
          else gen("w.uint32(%i).%s(%s[i])", (field2.id << 3 | wireType) >>> 0, type2, ref);
        }
        gen("}");
      } else {
        if (field2.optional) gen("if(%s!=null&&Object.hasOwnProperty.call(m,%j))", ref, field2.name);
        if (wireType === void 0)
          genTypePartial(gen, field2, index, ref);
        else gen("w.uint32(%i).%s(%s)", (field2.id << 3 | wireType) >>> 0, type2, ref);
      }
    }
    return gen("return w");
  }
  return encoder_1;
}
var protobuf$2 = indexLight.exports = indexMinimal;
protobuf$2.build = "light";
function load(filename, root2, callback) {
  if (typeof root2 === "function") {
    callback = root2;
    root2 = new protobuf$2.Root();
  } else if (!root2)
    root2 = new protobuf$2.Root();
  return root2.load(filename, callback);
}
protobuf$2.load = load;
function loadSync(filename, root2) {
  if (!root2)
    root2 = new protobuf$2.Root();
  return root2.loadSync(filename);
}
protobuf$2.loadSync = loadSync;
protobuf$2.encoder = requireEncoder();
protobuf$2.decoder = requireDecoder();
protobuf$2.verifier = requireVerifier();
protobuf$2.converter = requireConverter();
protobuf$2.ReflectionObject = requireObject();
protobuf$2.Namespace = requireNamespace();
protobuf$2.Root = requireRoot();
protobuf$2.Enum = require_enum();
protobuf$2.Type = requireType();
protobuf$2.Field = requireField();
protobuf$2.OneOf = requireOneof();
protobuf$2.MapField = requireMapfield();
protobuf$2.Service = requireService();
protobuf$2.Method = requireMethod();
protobuf$2.Message = message;
protobuf$2.wrappers = wrappers;
protobuf$2.types = requireTypes();
protobuf$2.util = requireUtil();
protobuf$2.ReflectionObject._configure(protobuf$2.Root);
protobuf$2.Namespace._configure(protobuf$2.Type, protobuf$2.Service, protobuf$2.Enum);
protobuf$2.Root._configure(protobuf$2.Type);
protobuf$2.Field._configure(protobuf$2.Type);
var indexLightExports = indexLight.exports;
var tokenize_1 = tokenize$1;
var delimRe = /[\s{}=;:[\],'"()<>]/g, stringDoubleRe = /(?:"([^"\\]*(?:\\.[^"\\]*)*)")/g, stringSingleRe = /(?:'([^'\\]*(?:\\.[^'\\]*)*)')/g;
var setCommentRe = /^ *[*/]+ */, setCommentAltRe = /^\s*\*?\/*/, setCommentSplitRe = /\n/g, whitespaceRe = /\s/, unescapeRe = /\\(.?)/g;
var unescapeMap = {
  "0": "\0",
  "r": "\r",
  "n": "\n",
  "t": "	"
};
function unescape(str) {
  return str.replace(unescapeRe, function($0, $1) {
    switch ($1) {
      case "\\":
      case "":
        return $1;
      default:
        return unescapeMap[$1] || "";
    }
  });
}
tokenize$1.unescape = unescape;
function tokenize$1(source, alternateCommentMode) {
  source = source.toString();
  var offset = 0, length = source.length, line = 1, lastCommentLine = 0, comments = {};
  var stack = [];
  var stringDelim = null;
  function illegal(subject) {
    return Error("illegal " + subject + " (line " + line + ")");
  }
  function readString() {
    var re = stringDelim === "'" ? stringSingleRe : stringDoubleRe;
    re.lastIndex = offset - 1;
    var match = re.exec(source);
    if (!match)
      throw illegal("string");
    offset = re.lastIndex;
    push3(stringDelim);
    stringDelim = null;
    return unescape(match[1]);
  }
  function charAt(pos) {
    return source.charAt(pos);
  }
  function setComment(start, end2, isLeading) {
    var comment = {
      type: source.charAt(start++),
      lineEmpty: false,
      leading: isLeading
    };
    var lookback;
    if (alternateCommentMode) {
      lookback = 2;
    } else {
      lookback = 3;
    }
    var commentOffset = start - lookback, c;
    do {
      if (--commentOffset < 0 || (c = source.charAt(commentOffset)) === "\n") {
        comment.lineEmpty = true;
        break;
      }
    } while (c === " " || c === "	");
    var lines = source.substring(start, end2).split(setCommentSplitRe);
    for (var i = 0; i < lines.length; ++i)
      lines[i] = lines[i].replace(alternateCommentMode ? setCommentAltRe : setCommentRe, "").trim();
    comment.text = lines.join("\n").trim();
    comments[line] = comment;
    lastCommentLine = line;
  }
  function isDoubleSlashCommentLine(startOffset) {
    var endOffset = findEndOfLine(startOffset);
    var lineText = source.substring(startOffset, endOffset);
    var isComment = /^\s*\/\//.test(lineText);
    return isComment;
  }
  function findEndOfLine(cursor) {
    var endOffset = cursor;
    while (endOffset < length && charAt(endOffset) !== "\n") {
      endOffset++;
    }
    return endOffset;
  }
  function next() {
    if (stack.length > 0)
      return stack.shift();
    if (stringDelim)
      return readString();
    var repeat, prev, curr, start, isDoc, isLeadingComment = offset === 0;
    do {
      if (offset === length)
        return null;
      repeat = false;
      while (whitespaceRe.test(curr = charAt(offset))) {
        if (curr === "\n") {
          isLeadingComment = true;
          ++line;
        }
        if (++offset === length)
          return null;
      }
      if (charAt(offset) === "/") {
        if (++offset === length) {
          throw illegal("comment");
        }
        if (charAt(offset) === "/") {
          if (!alternateCommentMode) {
            isDoc = charAt(start = offset + 1) === "/";
            while (charAt(++offset) !== "\n") {
              if (offset === length) {
                return null;
              }
            }
            ++offset;
            if (isDoc) {
              setComment(start, offset - 1, isLeadingComment);
              isLeadingComment = true;
            }
            ++line;
            repeat = true;
          } else {
            start = offset;
            isDoc = false;
            if (isDoubleSlashCommentLine(offset - 1)) {
              isDoc = true;
              do {
                offset = findEndOfLine(offset);
                if (offset === length) {
                  break;
                }
                offset++;
                if (!isLeadingComment) {
                  break;
                }
              } while (isDoubleSlashCommentLine(offset));
            } else {
              offset = Math.min(length, findEndOfLine(offset) + 1);
            }
            if (isDoc) {
              setComment(start, offset, isLeadingComment);
              isLeadingComment = true;
            }
            line++;
            repeat = true;
          }
        } else if ((curr = charAt(offset)) === "*") {
          start = offset + 1;
          isDoc = alternateCommentMode || charAt(start) === "*";
          do {
            if (curr === "\n") {
              ++line;
            }
            if (++offset === length) {
              throw illegal("comment");
            }
            prev = curr;
            curr = charAt(offset);
          } while (prev !== "*" || curr !== "/");
          ++offset;
          if (isDoc) {
            setComment(start, offset - 2, isLeadingComment);
            isLeadingComment = true;
          }
          repeat = true;
        } else {
          return "/";
        }
      }
    } while (repeat);
    var end2 = offset;
    delimRe.lastIndex = 0;
    var delim = delimRe.test(charAt(end2++));
    if (!delim)
      while (end2 < length && !delimRe.test(charAt(end2)))
        ++end2;
    var token = source.substring(offset, offset = end2);
    if (token === '"' || token === "'")
      stringDelim = token;
    return token;
  }
  function push3(token) {
    stack.push(token);
  }
  function peek() {
    if (!stack.length) {
      var token = next();
      if (token === null)
        return null;
      push3(token);
    }
    return stack[0];
  }
  function skip2(expected, optional) {
    var actual = peek(), equals = actual === expected;
    if (equals) {
      next();
      return true;
    }
    if (!optional)
      throw illegal("token '" + actual + "', '" + expected + "' expected");
    return false;
  }
  function cmnt(trailingLine) {
    var ret = null;
    var comment;
    if (trailingLine === void 0) {
      comment = comments[line - 1];
      delete comments[line - 1];
      if (comment && (alternateCommentMode || comment.type === "*" || comment.lineEmpty)) {
        ret = comment.leading ? comment.text : null;
      }
    } else {
      if (lastCommentLine < trailingLine) {
        peek();
      }
      comment = comments[trailingLine];
      delete comments[trailingLine];
      if (comment && !comment.lineEmpty && (alternateCommentMode || comment.type === "/")) {
        ret = comment.leading ? null : comment.text;
      }
    }
    return ret;
  }
  return Object.defineProperty({
    next,
    peek,
    push: push3,
    skip: skip2,
    cmnt
  }, "line", {
    get: function() {
      return line;
    }
  });
}
var parse_1 = parse;
parse.filename = null;
parse.defaults = { keepCase: false };
var tokenize = tokenize_1, Root = requireRoot(), Type = requireType(), Field = requireField(), MapField = requireMapfield(), OneOf = requireOneof(), Enum = require_enum(), Service = requireService(), Method = requireMethod(), ReflectionObject = requireObject(), types = requireTypes(), util = requireUtil();
var base10Re = /^[1-9][0-9]*$/, base10NegRe = /^-?[1-9][0-9]*$/, base16Re = /^0[x][0-9a-fA-F]+$/, base16NegRe = /^-?0[x][0-9a-fA-F]+$/, base8Re = /^0[0-7]+$/, base8NegRe = /^-?0[0-7]+$/, numberRe = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/, nameRe = /^[a-zA-Z_][a-zA-Z_0-9]*$/, typeRefRe = /^(?:\.?[a-zA-Z_][a-zA-Z_0-9]*)(?:\.[a-zA-Z_][a-zA-Z_0-9]*)*$/;
function parse(source, root2, options) {
  if (!(root2 instanceof Root)) {
    options = root2;
    root2 = new Root();
  }
  if (!options)
    options = parse.defaults;
  var preferTrailingComment = options.preferTrailingComment || false;
  var tn = tokenize(source, options.alternateCommentMode || false), next = tn.next, push3 = tn.push, peek = tn.peek, skip2 = tn.skip, cmnt = tn.cmnt;
  var head = true, pkg, imports, weakImports, edition = "proto2";
  var ptr = root2;
  var topLevelObjects = [];
  var topLevelOptions = {};
  var applyCase = options.keepCase ? function(name) {
    return name;
  } : util.camelCase;
  function resolveFileFeatures() {
    topLevelObjects.forEach((obj) => {
      obj._edition = edition;
      Object.keys(topLevelOptions).forEach((opt) => {
        if (obj.getOption(opt) !== void 0) return;
        obj.setOption(opt, topLevelOptions[opt], true);
      });
    });
  }
  function illegal(token2, name, insideTryCatch) {
    var filename = parse.filename;
    if (!insideTryCatch)
      parse.filename = null;
    return Error("illegal " + (name || "token") + " '" + token2 + "' (" + (filename ? filename + ", " : "") + "line " + tn.line + ")");
  }
  function readString() {
    var values = [], token2;
    do {
      if ((token2 = next()) !== '"' && token2 !== "'")
        throw illegal(token2);
      values.push(next());
      skip2(token2);
      token2 = peek();
    } while (token2 === '"' || token2 === "'");
    return values.join("");
  }
  function readValue(acceptTypeRef) {
    var token2 = next();
    switch (token2) {
      case "'":
      case '"':
        push3(token2);
        return readString();
      case "true":
      case "TRUE":
        return true;
      case "false":
      case "FALSE":
        return false;
    }
    try {
      return parseNumber(
        token2,
        /* insideTryCatch */
        true
      );
    } catch (e) {
      if (typeRefRe.test(token2))
        return token2;
      throw illegal(token2, "value");
    }
  }
  function readRanges(target, acceptStrings) {
    var token2, start;
    do {
      if (acceptStrings && ((token2 = peek()) === '"' || token2 === "'")) {
        var str = readString();
        target.push(str);
        if (edition >= 2023) {
          throw illegal(str, "id");
        }
      } else {
        try {
          target.push([start = parseId(next()), skip2("to", true) ? parseId(next()) : start]);
        } catch (err) {
          if (acceptStrings && typeRefRe.test(token2) && edition >= 2023) {
            target.push(token2);
          } else {
            throw err;
          }
        }
      }
    } while (skip2(",", true));
    var dummy = { options: void 0 };
    dummy.setOption = function(name, value) {
      if (this.options === void 0) this.options = {};
      this.options[name] = value;
    };
    ifBlock(
      dummy,
      function parseRange_block(token3) {
        if (token3 === "option") {
          parseOption(dummy, token3);
          skip2(";");
        } else
          throw illegal(token3);
      },
      function parseRange_line() {
        parseInlineOptions(dummy);
      }
    );
  }
  function parseNumber(token2, insideTryCatch) {
    var sign = 1;
    if (token2.charAt(0) === "-") {
      sign = -1;
      token2 = token2.substring(1);
    }
    switch (token2) {
      case "inf":
      case "INF":
      case "Inf":
        return sign * Infinity;
      case "nan":
      case "NAN":
      case "Nan":
      case "NaN":
        return NaN;
      case "0":
        return 0;
    }
    if (base10Re.test(token2))
      return sign * parseInt(token2, 10);
    if (base16Re.test(token2))
      return sign * parseInt(token2, 16);
    if (base8Re.test(token2))
      return sign * parseInt(token2, 8);
    if (numberRe.test(token2))
      return sign * parseFloat(token2);
    throw illegal(token2, "number", insideTryCatch);
  }
  function parseId(token2, acceptNegative) {
    switch (token2) {
      case "max":
      case "MAX":
      case "Max":
        return 536870911;
      case "0":
        return 0;
    }
    if (!acceptNegative && token2.charAt(0) === "-")
      throw illegal(token2, "id");
    if (base10NegRe.test(token2))
      return parseInt(token2, 10);
    if (base16NegRe.test(token2))
      return parseInt(token2, 16);
    if (base8NegRe.test(token2))
      return parseInt(token2, 8);
    throw illegal(token2, "id");
  }
  function parsePackage() {
    if (pkg !== void 0)
      throw illegal("package");
    pkg = next();
    if (!typeRefRe.test(pkg))
      throw illegal(pkg, "name");
    ptr = ptr.define(pkg);
    skip2(";");
  }
  function parseImport() {
    var token2 = peek();
    var whichImports;
    switch (token2) {
      case "weak":
        whichImports = weakImports || (weakImports = []);
        next();
        break;
      case "public":
        next();
      default:
        whichImports = imports || (imports = []);
        break;
    }
    token2 = readString();
    skip2(";");
    whichImports.push(token2);
  }
  function parseSyntax() {
    skip2("=");
    edition = readString();
    if (edition < 2023)
      throw illegal(edition, "syntax");
    skip2(";");
  }
  function parseEdition() {
    skip2("=");
    edition = readString();
    const supportedEditions = ["2023"];
    if (!supportedEditions.includes(edition))
      throw illegal(edition, "edition");
    skip2(";");
  }
  function parseCommon(parent, token2) {
    switch (token2) {
      case "option":
        parseOption(parent, token2);
        skip2(";");
        return true;
      case "message":
        parseType(parent, token2);
        return true;
      case "enum":
        parseEnum(parent, token2);
        return true;
      case "service":
        parseService(parent, token2);
        return true;
      case "extend":
        parseExtension(parent, token2);
        return true;
    }
    return false;
  }
  function ifBlock(obj, fnIf, fnElse) {
    var trailingLine = tn.line;
    if (obj) {
      if (typeof obj.comment !== "string") {
        obj.comment = cmnt();
      }
      obj.filename = parse.filename;
    }
    if (skip2("{", true)) {
      var token2;
      while ((token2 = next()) !== "}")
        fnIf(token2);
      skip2(";", true);
    } else {
      if (fnElse)
        fnElse();
      skip2(";");
      if (obj && (typeof obj.comment !== "string" || preferTrailingComment))
        obj.comment = cmnt(trailingLine) || obj.comment;
    }
  }
  function parseType(parent, token2) {
    if (!nameRe.test(token2 = next()))
      throw illegal(token2, "type name");
    var type2 = new Type(token2);
    ifBlock(type2, function parseType_block(token3) {
      if (parseCommon(type2, token3))
        return;
      switch (token3) {
        case "map":
          parseMapField(type2);
          break;
        case "required":
          if (edition !== "proto2")
            throw illegal(token3);
        case "repeated":
          parseField(type2, token3);
          break;
        case "optional":
          if (edition === "proto3") {
            parseField(type2, "proto3_optional");
          } else if (edition !== "proto2") {
            throw illegal(token3);
          } else {
            parseField(type2, "optional");
          }
          break;
        case "oneof":
          parseOneOf(type2, token3);
          break;
        case "extensions":
          readRanges(type2.extensions || (type2.extensions = []));
          break;
        case "reserved":
          readRanges(type2.reserved || (type2.reserved = []), true);
          break;
        default:
          if (edition === "proto2" || !typeRefRe.test(token3)) {
            throw illegal(token3);
          }
          push3(token3);
          parseField(type2, "optional");
          break;
      }
    });
    parent.add(type2);
    if (parent === ptr) {
      topLevelObjects.push(type2);
    }
  }
  function parseField(parent, rule, extend) {
    var type2 = next();
    if (type2 === "group") {
      parseGroup(parent, rule);
      return;
    }
    while (type2.endsWith(".") || peek().startsWith(".")) {
      type2 += next();
    }
    if (!typeRefRe.test(type2))
      throw illegal(type2, "type");
    var name = next();
    if (!nameRe.test(name))
      throw illegal(name, "name");
    name = applyCase(name);
    skip2("=");
    var field2 = new Field(name, parseId(next()), type2, rule, extend);
    ifBlock(field2, function parseField_block(token2) {
      if (token2 === "option") {
        parseOption(field2, token2);
        skip2(";");
      } else
        throw illegal(token2);
    }, function parseField_line() {
      parseInlineOptions(field2);
    });
    if (rule === "proto3_optional") {
      var oneof2 = new OneOf("_" + name);
      field2.setOption("proto3_optional", true);
      oneof2.add(field2);
      parent.add(oneof2);
    } else {
      parent.add(field2);
    }
    if (parent === ptr) {
      topLevelObjects.push(field2);
    }
  }
  function parseGroup(parent, rule) {
    if (edition >= 2023) {
      throw illegal("group");
    }
    var name = next();
    if (!nameRe.test(name))
      throw illegal(name, "name");
    var fieldName = util.lcFirst(name);
    if (name === fieldName)
      name = util.ucFirst(name);
    skip2("=");
    var id = parseId(next());
    var type2 = new Type(name);
    type2.group = true;
    var field2 = new Field(fieldName, id, name, rule);
    field2.filename = parse.filename;
    ifBlock(type2, function parseGroup_block(token2) {
      switch (token2) {
        case "option":
          parseOption(type2, token2);
          skip2(";");
          break;
        case "required":
        case "repeated":
          parseField(type2, token2);
          break;
        case "optional":
          if (edition === "proto3") {
            parseField(type2, "proto3_optional");
          } else {
            parseField(type2, "optional");
          }
          break;
        case "message":
          parseType(type2, token2);
          break;
        case "enum":
          parseEnum(type2, token2);
          break;
        case "reserved":
          readRanges(type2.reserved || (type2.reserved = []), true);
          break;
        default:
          throw illegal(token2);
      }
    });
    parent.add(type2).add(field2);
  }
  function parseMapField(parent) {
    skip2("<");
    var keyType = next();
    if (types.mapKey[keyType] === void 0)
      throw illegal(keyType, "type");
    skip2(",");
    var valueType = next();
    if (!typeRefRe.test(valueType))
      throw illegal(valueType, "type");
    skip2(">");
    var name = next();
    if (!nameRe.test(name))
      throw illegal(name, "name");
    skip2("=");
    var field2 = new MapField(applyCase(name), parseId(next()), keyType, valueType);
    ifBlock(field2, function parseMapField_block(token2) {
      if (token2 === "option") {
        parseOption(field2, token2);
        skip2(";");
      } else
        throw illegal(token2);
    }, function parseMapField_line() {
      parseInlineOptions(field2);
    });
    parent.add(field2);
  }
  function parseOneOf(parent, token2) {
    if (!nameRe.test(token2 = next()))
      throw illegal(token2, "name");
    var oneof2 = new OneOf(applyCase(token2));
    ifBlock(oneof2, function parseOneOf_block(token3) {
      if (token3 === "option") {
        parseOption(oneof2, token3);
        skip2(";");
      } else {
        push3(token3);
        parseField(oneof2, "optional");
      }
    });
    parent.add(oneof2);
  }
  function parseEnum(parent, token2) {
    if (!nameRe.test(token2 = next()))
      throw illegal(token2, "name");
    var enm = new Enum(token2);
    ifBlock(enm, function parseEnum_block(token3) {
      switch (token3) {
        case "option":
          parseOption(enm, token3);
          skip2(";");
          break;
        case "reserved":
          readRanges(enm.reserved || (enm.reserved = []), true);
          if (enm.reserved === void 0) enm.reserved = [];
          break;
        default:
          parseEnumValue(enm, token3);
      }
    });
    parent.add(enm);
    if (parent === ptr) {
      topLevelObjects.push(enm);
    }
  }
  function parseEnumValue(parent, token2) {
    if (!nameRe.test(token2))
      throw illegal(token2, "name");
    skip2("=");
    var value = parseId(next(), true), dummy = {
      options: void 0
    };
    dummy.getOption = function(name) {
      return this.options[name];
    };
    dummy.setOption = function(name, value2) {
      ReflectionObject.prototype.setOption.call(dummy, name, value2);
    };
    dummy.setParsedOption = function() {
      return void 0;
    };
    ifBlock(dummy, function parseEnumValue_block(token3) {
      if (token3 === "option") {
        parseOption(dummy, token3);
        skip2(";");
      } else
        throw illegal(token3);
    }, function parseEnumValue_line() {
      parseInlineOptions(dummy);
    });
    parent.add(token2, value, dummy.comment, dummy.parsedOptions || dummy.options);
  }
  function parseOption(parent, token2) {
    var option;
    var propName;
    var isOption = true;
    if (token2 === "option") {
      token2 = next();
    }
    while (token2 !== "=") {
      if (token2 === "(") {
        var parensValue = next();
        skip2(")");
        token2 = "(" + parensValue + ")";
      }
      if (isOption) {
        isOption = false;
        if (token2.includes(".") && !token2.includes("(")) {
          var tokens = token2.split(".");
          option = tokens[0] + ".";
          token2 = tokens[1];
          continue;
        }
        option = token2;
      } else {
        propName = propName ? propName += token2 : token2;
      }
      token2 = next();
    }
    var name = propName ? option.concat(propName) : option;
    var optionValue = parseOptionValue(parent, name);
    propName = propName && propName[0] === "." ? propName.slice(1) : propName;
    option = option && option[option.length - 1] === "." ? option.slice(0, -1) : option;
    setParsedOption(parent, option, optionValue, propName);
  }
  function parseOptionValue(parent, name) {
    if (skip2("{", true)) {
      var objectResult = {};
      while (!skip2("}", true)) {
        if (!nameRe.test(token = next())) {
          throw illegal(token, "name");
        }
        if (token === null) {
          throw illegal(token, "end of input");
        }
        var value;
        var propName = token;
        skip2(":", true);
        if (peek() === "{") {
          value = parseOptionValue(parent, name + "." + token);
        } else if (peek() === "[") {
          value = [];
          var lastValue;
          if (skip2("[", true)) {
            do {
              lastValue = readValue();
              value.push(lastValue);
            } while (skip2(",", true));
            skip2("]");
            if (typeof lastValue !== "undefined") {
              setOption(parent, name + "." + token, lastValue);
            }
          }
        } else {
          value = readValue();
          setOption(parent, name + "." + token, value);
        }
        var prevValue = objectResult[propName];
        if (prevValue)
          value = [].concat(prevValue).concat(value);
        objectResult[propName] = value;
        skip2(",", true);
        skip2(";", true);
      }
      return objectResult;
    }
    var simpleValue = readValue();
    setOption(parent, name, simpleValue);
    return simpleValue;
  }
  function setOption(parent, name, value) {
    if (ptr === parent && /^features\./.test(name)) {
      topLevelOptions[name] = value;
      return;
    }
    if (parent.setOption)
      parent.setOption(name, value);
  }
  function setParsedOption(parent, name, value, propName) {
    if (parent.setParsedOption)
      parent.setParsedOption(name, value, propName);
  }
  function parseInlineOptions(parent) {
    if (skip2("[", true)) {
      do {
        parseOption(parent, "option");
      } while (skip2(",", true));
      skip2("]");
    }
    return parent;
  }
  function parseService(parent, token2) {
    if (!nameRe.test(token2 = next()))
      throw illegal(token2, "service name");
    var service2 = new Service(token2);
    ifBlock(service2, function parseService_block(token3) {
      if (parseCommon(service2, token3)) {
        return;
      }
      if (token3 === "rpc")
        parseMethod(service2, token3);
      else
        throw illegal(token3);
    });
    parent.add(service2);
    if (parent === ptr) {
      topLevelObjects.push(service2);
    }
  }
  function parseMethod(parent, token2) {
    var commentText = cmnt();
    var type2 = token2;
    if (!nameRe.test(token2 = next()))
      throw illegal(token2, "name");
    var name = token2, requestType, requestStream, responseType, responseStream;
    skip2("(");
    if (skip2("stream", true))
      requestStream = true;
    if (!typeRefRe.test(token2 = next()))
      throw illegal(token2);
    requestType = token2;
    skip2(")");
    skip2("returns");
    skip2("(");
    if (skip2("stream", true))
      responseStream = true;
    if (!typeRefRe.test(token2 = next()))
      throw illegal(token2);
    responseType = token2;
    skip2(")");
    var method2 = new Method(name, type2, requestType, responseType, requestStream, responseStream);
    method2.comment = commentText;
    ifBlock(method2, function parseMethod_block(token3) {
      if (token3 === "option") {
        parseOption(method2, token3);
        skip2(";");
      } else
        throw illegal(token3);
    });
    parent.add(method2);
  }
  function parseExtension(parent, token2) {
    if (!typeRefRe.test(token2 = next()))
      throw illegal(token2, "reference");
    var reference = token2;
    ifBlock(null, function parseExtension_block(token3) {
      switch (token3) {
        case "required":
        case "repeated":
          parseField(parent, token3, reference);
          break;
        case "optional":
          if (edition === "proto3") {
            parseField(parent, "proto3_optional", reference);
          } else {
            parseField(parent, "optional", reference);
          }
          break;
        default:
          if (edition === "proto2" || !typeRefRe.test(token3))
            throw illegal(token3);
          push3(token3);
          parseField(parent, "optional", reference);
          break;
      }
    });
  }
  var token;
  while ((token = next()) !== null) {
    switch (token) {
      case "package":
        if (!head)
          throw illegal(token);
        parsePackage();
        break;
      case "import":
        if (!head)
          throw illegal(token);
        parseImport();
        break;
      case "syntax":
        if (!head)
          throw illegal(token);
        parseSyntax();
        break;
      case "edition":
        if (!head)
          throw illegal(token);
        parseEdition();
        break;
      case "option":
        parseOption(ptr, token);
        skip2(";", true);
        break;
      default:
        if (parseCommon(ptr, token)) {
          head = false;
          continue;
        }
        throw illegal(token);
    }
  }
  resolveFileFeatures();
  parse.filename = null;
  return {
    "package": pkg,
    "imports": imports,
    weakImports,
    root: root2
  };
}
var common_1 = common;
var commonRe = /\/|\./;
function common(name, json) {
  if (!commonRe.test(name)) {
    name = "google/protobuf/" + name + ".proto";
    json = { nested: { google: { nested: { protobuf: { nested: json } } } } };
  }
  common[name] = json;
}
common("any", {
  /**
   * Properties of a google.protobuf.Any message.
   * @interface IAny
   * @type {Object}
   * @property {string} [typeUrl]
   * @property {Uint8Array} [bytes]
   * @memberof common
   */
  Any: {
    fields: {
      type_url: {
        type: "string",
        id: 1
      },
      value: {
        type: "bytes",
        id: 2
      }
    }
  }
});
var timeType;
common("duration", {
  /**
   * Properties of a google.protobuf.Duration message.
   * @interface IDuration
   * @type {Object}
   * @property {number|Long} [seconds]
   * @property {number} [nanos]
   * @memberof common
   */
  Duration: timeType = {
    fields: {
      seconds: {
        type: "int64",
        id: 1
      },
      nanos: {
        type: "int32",
        id: 2
      }
    }
  }
});
common("timestamp", {
  /**
   * Properties of a google.protobuf.Timestamp message.
   * @interface ITimestamp
   * @type {Object}
   * @property {number|Long} [seconds]
   * @property {number} [nanos]
   * @memberof common
   */
  Timestamp: timeType
});
common("empty", {
  /**
   * Properties of a google.protobuf.Empty message.
   * @interface IEmpty
   * @memberof common
   */
  Empty: {
    fields: {}
  }
});
common("struct", {
  /**
   * Properties of a google.protobuf.Struct message.
   * @interface IStruct
   * @type {Object}
   * @property {Object.<string,IValue>} [fields]
   * @memberof common
   */
  Struct: {
    fields: {
      fields: {
        keyType: "string",
        type: "Value",
        id: 1
      }
    }
  },
  /**
   * Properties of a google.protobuf.Value message.
   * @interface IValue
   * @type {Object}
   * @property {string} [kind]
   * @property {0} [nullValue]
   * @property {number} [numberValue]
   * @property {string} [stringValue]
   * @property {boolean} [boolValue]
   * @property {IStruct} [structValue]
   * @property {IListValue} [listValue]
   * @memberof common
   */
  Value: {
    oneofs: {
      kind: {
        oneof: [
          "nullValue",
          "numberValue",
          "stringValue",
          "boolValue",
          "structValue",
          "listValue"
        ]
      }
    },
    fields: {
      nullValue: {
        type: "NullValue",
        id: 1
      },
      numberValue: {
        type: "double",
        id: 2
      },
      stringValue: {
        type: "string",
        id: 3
      },
      boolValue: {
        type: "bool",
        id: 4
      },
      structValue: {
        type: "Struct",
        id: 5
      },
      listValue: {
        type: "ListValue",
        id: 6
      }
    }
  },
  NullValue: {
    values: {
      NULL_VALUE: 0
    }
  },
  /**
   * Properties of a google.protobuf.ListValue message.
   * @interface IListValue
   * @type {Object}
   * @property {Array.<IValue>} [values]
   * @memberof common
   */
  ListValue: {
    fields: {
      values: {
        rule: "repeated",
        type: "Value",
        id: 1
      }
    }
  }
});
common("wrappers", {
  /**
   * Properties of a google.protobuf.DoubleValue message.
   * @interface IDoubleValue
   * @type {Object}
   * @property {number} [value]
   * @memberof common
   */
  DoubleValue: {
    fields: {
      value: {
        type: "double",
        id: 1
      }
    }
  },
  /**
   * Properties of a google.protobuf.FloatValue message.
   * @interface IFloatValue
   * @type {Object}
   * @property {number} [value]
   * @memberof common
   */
  FloatValue: {
    fields: {
      value: {
        type: "float",
        id: 1
      }
    }
  },
  /**
   * Properties of a google.protobuf.Int64Value message.
   * @interface IInt64Value
   * @type {Object}
   * @property {number|Long} [value]
   * @memberof common
   */
  Int64Value: {
    fields: {
      value: {
        type: "int64",
        id: 1
      }
    }
  },
  /**
   * Properties of a google.protobuf.UInt64Value message.
   * @interface IUInt64Value
   * @type {Object}
   * @property {number|Long} [value]
   * @memberof common
   */
  UInt64Value: {
    fields: {
      value: {
        type: "uint64",
        id: 1
      }
    }
  },
  /**
   * Properties of a google.protobuf.Int32Value message.
   * @interface IInt32Value
   * @type {Object}
   * @property {number} [value]
   * @memberof common
   */
  Int32Value: {
    fields: {
      value: {
        type: "int32",
        id: 1
      }
    }
  },
  /**
   * Properties of a google.protobuf.UInt32Value message.
   * @interface IUInt32Value
   * @type {Object}
   * @property {number} [value]
   * @memberof common
   */
  UInt32Value: {
    fields: {
      value: {
        type: "uint32",
        id: 1
      }
    }
  },
  /**
   * Properties of a google.protobuf.BoolValue message.
   * @interface IBoolValue
   * @type {Object}
   * @property {boolean} [value]
   * @memberof common
   */
  BoolValue: {
    fields: {
      value: {
        type: "bool",
        id: 1
      }
    }
  },
  /**
   * Properties of a google.protobuf.StringValue message.
   * @interface IStringValue
   * @type {Object}
   * @property {string} [value]
   * @memberof common
   */
  StringValue: {
    fields: {
      value: {
        type: "string",
        id: 1
      }
    }
  },
  /**
   * Properties of a google.protobuf.BytesValue message.
   * @interface IBytesValue
   * @type {Object}
   * @property {Uint8Array} [value]
   * @memberof common
   */
  BytesValue: {
    fields: {
      value: {
        type: "bytes",
        id: 1
      }
    }
  }
});
common("field_mask", {
  /**
   * Properties of a google.protobuf.FieldMask message.
   * @interface IDoubleValue
   * @type {Object}
   * @property {number} [value]
   * @memberof common
   */
  FieldMask: {
    fields: {
      paths: {
        rule: "repeated",
        type: "string",
        id: 1
      }
    }
  }
});
common.get = function get(file) {
  return common[file] || null;
};
var protobuf$1 = src.exports = indexLightExports;
protobuf$1.build = "full";
protobuf$1.tokenize = tokenize_1;
protobuf$1.parse = parse_1;
protobuf$1.common = common_1;
protobuf$1.Root._configure(protobuf$1.Type, protobuf$1.parse, protobuf$1.common);
var srcExports = src.exports;
var protobufjs = srcExports;
const protobuf = /* @__PURE__ */ getDefaultExportFromCjs(protobufjs);
const __filename = fileURLToPath(import.meta.url);
const __dirname$1 = path$1.dirname(__filename);
const protoPath = path$1.join(__dirname$1, "../src/assets/douyin.proto");
let root = null;
try {
  const protoContent = require$$0.readFileSync(protoPath, "utf-8");
  root = protobuf.parse(protoContent).root;
  console.log("Proto 文件加载成功");
} catch (err) {
  console.error("加载 proto 文件失败:", err);
}
let mainWindow = null;
let webviewWindow = null;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path$1.join(__dirname$1, "preload.mjs")
      // 确保路径正确
    }
  });
  mainWindow.webContents.openDevTools();
  mainWindow.loadFile("public/index.html");
}
function createWebviewWindow(url) {
  webviewWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webviewTag: false,
      // 禁用 webviewTag，直接使用 BrowserWindow
      preload: path$1.join(__dirname$1, "preload.mjs")
    }
  });
  webviewWindow.webContents.openDevTools();
  webviewWindow.loadURL(url);
  const { webRequest } = webviewWindow.webContents.session;
  webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.startsWith("wss://")) {
      console.log("拦截到 wss 请求:", details.url);
      const ws = new WebSocket$1(details.url, {
        headers: details.requestHeaders
      });
      ws.binaryType = "arraybuffer";
      ws.on("open", () => {
        console.log("WebSocket 连接已建立:", details.url);
        ws.send(Buffer.from("3a026862", "hex"));
      });
      ws.on("message", (data) => {
        if (data instanceof ArrayBuffer) {
          const buffer = Buffer.from(data);
          console.log("收到 WebSocket 消息 (二进制):", buffer.toString("hex"));
          if (root) {
            try {
              const Response = root.lookupType("douyin.Response");
              const decodedMessage = Response.decode(buffer);
              console.log("解码后的消息:", JSON.stringify(decodedMessage, null, 2));
            } catch (decodeError) {
              console.error("解码 proto 消息失败:", decodeError);
            }
          } else {
            console.error("Proto 文件尚未加载，无法解码消息");
          }
        } else if (Buffer.isBuffer(data)) {
          console.log("收到 WebSocket 消息 (二进制):", data.toString("hex"));
        } else {
          console.log("收到 WebSocket 消息 (文本):", data.toString());
        }
      });
      ws.on("close", () => {
        console.log("WebSocket 连接已关闭:", details.url);
      });
      ws.on("error", (error) => {
        console.error("WebSocket 错误:", error);
      });
      webviewWindow == null ? void 0 : webviewWindow.close();
      return callback({ cancel: true });
    }
    callback({ cancel: false });
  });
}
app.whenReady().then(() => {
  createMainWindow();
  ipcMain.handle("start-intercept", (_, url) => {
    createWebviewWindow(url);
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
