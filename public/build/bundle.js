
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function _mergeNamespaces(n, m) {
        m.forEach(function (e) {
            e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
                if (k !== 'default' && !(k in n)) {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        });
        return Object.freeze(n);
    }

    function noop$2() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$2,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$2;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    // generated by genversion
    const version$6 = '1.29.1';

    // constants.ts
    const DEFAULT_HEADERS$4 = { 'X-Client-Info': `supabase-js/${version$6}` };
    const STORAGE_KEY$1 = 'supabase.auth.token';

    // helpers.ts
    function stripTrailingSlash(url) {
        return url.replace(/\/$/, '');
    }
    const isBrowser$1 = () => typeof window !== 'undefined';

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var browserPonyfill = createCommonjsModule(function (module, exports) {
    var global = typeof self !== 'undefined' ? self : commonjsGlobal;
    var __self__ = (function () {
    function F() {
    this.fetch = false;
    this.DOMException = global.DOMException;
    }
    F.prototype = global;
    return new F();
    })();
    (function(self) {

    ((function (exports) {

      var support = {
        searchParams: 'URLSearchParams' in self,
        iterable: 'Symbol' in self && 'iterator' in Symbol,
        blob:
          'FileReader' in self &&
          'Blob' in self &&
          (function() {
            try {
              new Blob();
              return true
            } catch (e) {
              return false
            }
          })(),
        formData: 'FormData' in self,
        arrayBuffer: 'ArrayBuffer' in self
      };

      function isDataView(obj) {
        return obj && DataView.prototype.isPrototypeOf(obj)
      }

      if (support.arrayBuffer) {
        var viewClasses = [
          '[object Int8Array]',
          '[object Uint8Array]',
          '[object Uint8ClampedArray]',
          '[object Int16Array]',
          '[object Uint16Array]',
          '[object Int32Array]',
          '[object Uint32Array]',
          '[object Float32Array]',
          '[object Float64Array]'
        ];

        var isArrayBufferView =
          ArrayBuffer.isView ||
          function(obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
          };
      }

      function normalizeName(name) {
        if (typeof name !== 'string') {
          name = String(name);
        }
        if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
          throw new TypeError('Invalid character in header field name')
        }
        return name.toLowerCase()
      }

      function normalizeValue(value) {
        if (typeof value !== 'string') {
          value = String(value);
        }
        return value
      }

      // Build a destructive iterator for the value list
      function iteratorFor(items) {
        var iterator = {
          next: function() {
            var value = items.shift();
            return {done: value === undefined, value: value}
          }
        };

        if (support.iterable) {
          iterator[Symbol.iterator] = function() {
            return iterator
          };
        }

        return iterator
      }

      function Headers(headers) {
        this.map = {};

        if (headers instanceof Headers) {
          headers.forEach(function(value, name) {
            this.append(name, value);
          }, this);
        } else if (Array.isArray(headers)) {
          headers.forEach(function(header) {
            this.append(header[0], header[1]);
          }, this);
        } else if (headers) {
          Object.getOwnPropertyNames(headers).forEach(function(name) {
            this.append(name, headers[name]);
          }, this);
        }
      }

      Headers.prototype.append = function(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this.map[name];
        this.map[name] = oldValue ? oldValue + ', ' + value : value;
      };

      Headers.prototype['delete'] = function(name) {
        delete this.map[normalizeName(name)];
      };

      Headers.prototype.get = function(name) {
        name = normalizeName(name);
        return this.has(name) ? this.map[name] : null
      };

      Headers.prototype.has = function(name) {
        return this.map.hasOwnProperty(normalizeName(name))
      };

      Headers.prototype.set = function(name, value) {
        this.map[normalizeName(name)] = normalizeValue(value);
      };

      Headers.prototype.forEach = function(callback, thisArg) {
        for (var name in this.map) {
          if (this.map.hasOwnProperty(name)) {
            callback.call(thisArg, this.map[name], name, this);
          }
        }
      };

      Headers.prototype.keys = function() {
        var items = [];
        this.forEach(function(value, name) {
          items.push(name);
        });
        return iteratorFor(items)
      };

      Headers.prototype.values = function() {
        var items = [];
        this.forEach(function(value) {
          items.push(value);
        });
        return iteratorFor(items)
      };

      Headers.prototype.entries = function() {
        var items = [];
        this.forEach(function(value, name) {
          items.push([name, value]);
        });
        return iteratorFor(items)
      };

      if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
      }

      function consumed(body) {
        if (body.bodyUsed) {
          return Promise.reject(new TypeError('Already read'))
        }
        body.bodyUsed = true;
      }

      function fileReaderReady(reader) {
        return new Promise(function(resolve, reject) {
          reader.onload = function() {
            resolve(reader.result);
          };
          reader.onerror = function() {
            reject(reader.error);
          };
        })
      }

      function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsArrayBuffer(blob);
        return promise
      }

      function readBlobAsText(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsText(blob);
        return promise
      }

      function readArrayBufferAsText(buf) {
        var view = new Uint8Array(buf);
        var chars = new Array(view.length);

        for (var i = 0; i < view.length; i++) {
          chars[i] = String.fromCharCode(view[i]);
        }
        return chars.join('')
      }

      function bufferClone(buf) {
        if (buf.slice) {
          return buf.slice(0)
        } else {
          var view = new Uint8Array(buf.byteLength);
          view.set(new Uint8Array(buf));
          return view.buffer
        }
      }

      function Body() {
        this.bodyUsed = false;

        this._initBody = function(body) {
          this._bodyInit = body;
          if (!body) {
            this._bodyText = '';
          } else if (typeof body === 'string') {
            this._bodyText = body;
          } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body;
          } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
            this._bodyFormData = body;
          } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this._bodyText = body.toString();
          } else if (support.arrayBuffer && support.blob && isDataView(body)) {
            this._bodyArrayBuffer = bufferClone(body.buffer);
            // IE 10-11 can't handle a DataView body.
            this._bodyInit = new Blob([this._bodyArrayBuffer]);
          } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
            this._bodyArrayBuffer = bufferClone(body);
          } else {
            this._bodyText = body = Object.prototype.toString.call(body);
          }

          if (!this.headers.get('content-type')) {
            if (typeof body === 'string') {
              this.headers.set('content-type', 'text/plain;charset=UTF-8');
            } else if (this._bodyBlob && this._bodyBlob.type) {
              this.headers.set('content-type', this._bodyBlob.type);
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
            }
          }
        };

        if (support.blob) {
          this.blob = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected
            }

            if (this._bodyBlob) {
              return Promise.resolve(this._bodyBlob)
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(new Blob([this._bodyArrayBuffer]))
            } else if (this._bodyFormData) {
              throw new Error('could not read FormData body as blob')
            } else {
              return Promise.resolve(new Blob([this._bodyText]))
            }
          };

          this.arrayBuffer = function() {
            if (this._bodyArrayBuffer) {
              return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
            } else {
              return this.blob().then(readBlobAsArrayBuffer)
            }
          };
        }

        this.text = function() {
          var rejected = consumed(this);
          if (rejected) {
            return rejected
          }

          if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob)
          } else if (this._bodyArrayBuffer) {
            return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
          } else if (this._bodyFormData) {
            throw new Error('could not read FormData body as text')
          } else {
            return Promise.resolve(this._bodyText)
          }
        };

        if (support.formData) {
          this.formData = function() {
            return this.text().then(decode)
          };
        }

        this.json = function() {
          return this.text().then(JSON.parse)
        };

        return this
      }

      // HTTP methods whose capitalization should be normalized
      var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

      function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return methods.indexOf(upcased) > -1 ? upcased : method
      }

      function Request(input, options) {
        options = options || {};
        var body = options.body;

        if (input instanceof Request) {
          if (input.bodyUsed) {
            throw new TypeError('Already read')
          }
          this.url = input.url;
          this.credentials = input.credentials;
          if (!options.headers) {
            this.headers = new Headers(input.headers);
          }
          this.method = input.method;
          this.mode = input.mode;
          this.signal = input.signal;
          if (!body && input._bodyInit != null) {
            body = input._bodyInit;
            input.bodyUsed = true;
          }
        } else {
          this.url = String(input);
        }

        this.credentials = options.credentials || this.credentials || 'same-origin';
        if (options.headers || !this.headers) {
          this.headers = new Headers(options.headers);
        }
        this.method = normalizeMethod(options.method || this.method || 'GET');
        this.mode = options.mode || this.mode || null;
        this.signal = options.signal || this.signal;
        this.referrer = null;

        if ((this.method === 'GET' || this.method === 'HEAD') && body) {
          throw new TypeError('Body not allowed for GET or HEAD requests')
        }
        this._initBody(body);
      }

      Request.prototype.clone = function() {
        return new Request(this, {body: this._bodyInit})
      };

      function decode(body) {
        var form = new FormData();
        body
          .trim()
          .split('&')
          .forEach(function(bytes) {
            if (bytes) {
              var split = bytes.split('=');
              var name = split.shift().replace(/\+/g, ' ');
              var value = split.join('=').replace(/\+/g, ' ');
              form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
          });
        return form
      }

      function parseHeaders(rawHeaders) {
        var headers = new Headers();
        // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
        // https://tools.ietf.org/html/rfc7230#section-3.2
        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
        preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
          var parts = line.split(':');
          var key = parts.shift().trim();
          if (key) {
            var value = parts.join(':').trim();
            headers.append(key, value);
          }
        });
        return headers
      }

      Body.call(Request.prototype);

      function Response(bodyInit, options) {
        if (!options) {
          options = {};
        }

        this.type = 'default';
        this.status = options.status === undefined ? 200 : options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = 'statusText' in options ? options.statusText : 'OK';
        this.headers = new Headers(options.headers);
        this.url = options.url || '';
        this._initBody(bodyInit);
      }

      Body.call(Response.prototype);

      Response.prototype.clone = function() {
        return new Response(this._bodyInit, {
          status: this.status,
          statusText: this.statusText,
          headers: new Headers(this.headers),
          url: this.url
        })
      };

      Response.error = function() {
        var response = new Response(null, {status: 0, statusText: ''});
        response.type = 'error';
        return response
      };

      var redirectStatuses = [301, 302, 303, 307, 308];

      Response.redirect = function(url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
          throw new RangeError('Invalid status code')
        }

        return new Response(null, {status: status, headers: {location: url}})
      };

      exports.DOMException = self.DOMException;
      try {
        new exports.DOMException();
      } catch (err) {
        exports.DOMException = function(message, name) {
          this.message = message;
          this.name = name;
          var error = Error(message);
          this.stack = error.stack;
        };
        exports.DOMException.prototype = Object.create(Error.prototype);
        exports.DOMException.prototype.constructor = exports.DOMException;
      }

      function fetch(input, init) {
        return new Promise(function(resolve, reject) {
          var request = new Request(input, init);

          if (request.signal && request.signal.aborted) {
            return reject(new exports.DOMException('Aborted', 'AbortError'))
          }

          var xhr = new XMLHttpRequest();

          function abortXhr() {
            xhr.abort();
          }

          xhr.onload = function() {
            var options = {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: parseHeaders(xhr.getAllResponseHeaders() || '')
            };
            options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
            var body = 'response' in xhr ? xhr.response : xhr.responseText;
            resolve(new Response(body, options));
          };

          xhr.onerror = function() {
            reject(new TypeError('Network request failed'));
          };

          xhr.ontimeout = function() {
            reject(new TypeError('Network request failed'));
          };

          xhr.onabort = function() {
            reject(new exports.DOMException('Aborted', 'AbortError'));
          };

          xhr.open(request.method, request.url, true);

          if (request.credentials === 'include') {
            xhr.withCredentials = true;
          } else if (request.credentials === 'omit') {
            xhr.withCredentials = false;
          }

          if ('responseType' in xhr && support.blob) {
            xhr.responseType = 'blob';
          }

          request.headers.forEach(function(value, name) {
            xhr.setRequestHeader(name, value);
          });

          if (request.signal) {
            request.signal.addEventListener('abort', abortXhr);

            xhr.onreadystatechange = function() {
              // DONE (success or failure)
              if (xhr.readyState === 4) {
                request.signal.removeEventListener('abort', abortXhr);
              }
            };
          }

          xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
        })
      }

      fetch.polyfill = true;

      if (!self.fetch) {
        self.fetch = fetch;
        self.Headers = Headers;
        self.Request = Request;
        self.Response = Response;
      }

      exports.Headers = Headers;
      exports.Request = Request;
      exports.Response = Response;
      exports.fetch = fetch;

      Object.defineProperty(exports, '__esModule', { value: true });

      return exports;

    })({}));
    })(__self__);
    __self__.fetch.ponyfill = true;
    // Remove "polyfill" property added by whatwg-fetch
    delete __self__.fetch.polyfill;
    // Choose between native implementation (global) or custom implementation (__self__)
    // var ctx = global.fetch ? global : __self__;
    var ctx = __self__; // this line disable service worker support temporarily
    exports = ctx.fetch; // To enable: import fetch from 'cross-fetch'
    exports.default = ctx.fetch; // For TypeScript consumers without esModuleInterop.
    exports.fetch = ctx.fetch; // To enable: import {fetch} from 'cross-fetch'
    exports.Headers = ctx.Headers;
    exports.Request = ctx.Request;
    exports.Response = ctx.Response;
    module.exports = exports;
    });

    var fetch$1 = /*@__PURE__*/getDefaultExportFromCjs(browserPonyfill);

    var __awaiter$8 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const _getErrorMessage$1 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    const handleError$1 = (error, reject) => {
        if (typeof error.json !== 'function') {
            return reject(error);
        }
        error.json().then((err) => {
            return reject({
                message: _getErrorMessage$1(err),
                status: (error === null || error === void 0 ? void 0 : error.status) || 500,
            });
        });
    };
    const _getRequestParams$1 = (method, options, body) => {
        const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
        if (method === 'GET') {
            return params;
        }
        params.headers = Object.assign({ 'Content-Type': 'text/plain;charset=UTF-8' }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
        return params;
    };
    function _handleRequest$1(fetcher = fetch$1, method, url, options, body) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fetcher(url, _getRequestParams$1(method, options, body))
                    .then((result) => {
                    if (!result.ok)
                        throw result;
                    if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                        return resolve;
                    return result.json();
                })
                    .then((data) => resolve(data))
                    .catch((error) => handleError$1(error, reject));
            });
        });
    }
    function get$1(fetcher, url, options) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'GET', url, options);
        });
    }
    function post$1(fetcher, url, body, options) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'POST', url, options, body);
        });
    }
    function put$1(fetcher, url, body, options) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'PUT', url, options, body);
        });
    }
    function remove$1(fetcher, url, body, options) {
        return __awaiter$8(this, void 0, void 0, function* () {
            return _handleRequest$1(fetcher, 'DELETE', url, options, body);
        });
    }

    // generated by genversion
    const version$5 = '1.21.7';

    const GOTRUE_URL = 'http://localhost:9999';
    const DEFAULT_HEADERS$3 = { 'X-Client-Info': `gotrue-js/${version$5}` };
    const STORAGE_KEY = 'supabase.auth.token';
    const COOKIE_OPTIONS = {
        name: 'sb:token',
        lifetime: 60 * 60 * 8,
        domain: '',
        path: '/',
        sameSite: 'lax',
    };

    /**
     * Serialize data into a cookie header.
     */
    function serialize(name, val, options) {
        const opt = options || {};
        const enc = encodeURIComponent;
        /* eslint-disable-next-line no-control-regex */
        const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        if (typeof enc !== 'function') {
            throw new TypeError('option encode is invalid');
        }
        if (!fieldContentRegExp.test(name)) {
            throw new TypeError('argument name is invalid');
        }
        const value = enc(val);
        if (value && !fieldContentRegExp.test(value)) {
            throw new TypeError('argument val is invalid');
        }
        let str = name + '=' + value;
        if (null != opt.maxAge) {
            const maxAge = opt.maxAge - 0;
            if (isNaN(maxAge) || !isFinite(maxAge)) {
                throw new TypeError('option maxAge is invalid');
            }
            str += '; Max-Age=' + Math.floor(maxAge);
        }
        if (opt.domain) {
            if (!fieldContentRegExp.test(opt.domain)) {
                throw new TypeError('option domain is invalid');
            }
            str += '; Domain=' + opt.domain;
        }
        if (opt.path) {
            if (!fieldContentRegExp.test(opt.path)) {
                throw new TypeError('option path is invalid');
            }
            str += '; Path=' + opt.path;
        }
        if (opt.expires) {
            if (typeof opt.expires.toUTCString !== 'function') {
                throw new TypeError('option expires is invalid');
            }
            str += '; Expires=' + opt.expires.toUTCString();
        }
        if (opt.httpOnly) {
            str += '; HttpOnly';
        }
        if (opt.secure) {
            str += '; Secure';
        }
        if (opt.sameSite) {
            const sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite;
            switch (sameSite) {
                case 'lax':
                    str += '; SameSite=Lax';
                    break;
                case 'strict':
                    str += '; SameSite=Strict';
                    break;
                case 'none':
                    str += '; SameSite=None';
                    break;
                default:
                    throw new TypeError('option sameSite is invalid');
            }
        }
        return str;
    }
    /**
     * Based on the environment and the request we know if a secure cookie can be set.
     */
    function isSecureEnvironment(req) {
        if (!req || !req.headers || !req.headers.host) {
            throw new Error('The "host" request header is not available');
        }
        const host = (req.headers.host.indexOf(':') > -1 && req.headers.host.split(':')[0]) || req.headers.host;
        if (['localhost', '127.0.0.1'].indexOf(host) > -1 || host.endsWith('.local')) {
            return false;
        }
        return true;
    }
    /**
     * Serialize a cookie to a string.
     */
    function serializeCookie(cookie, secure) {
        var _a, _b, _c;
        return serialize(cookie.name, cookie.value, {
            maxAge: cookie.maxAge,
            expires: new Date(Date.now() + cookie.maxAge * 1000),
            httpOnly: true,
            secure,
            path: (_a = cookie.path) !== null && _a !== void 0 ? _a : '/',
            domain: (_b = cookie.domain) !== null && _b !== void 0 ? _b : '',
            sameSite: (_c = cookie.sameSite) !== null && _c !== void 0 ? _c : 'lax',
        });
    }
    /**
     * Set one or more cookies.
     */
    function setCookies(req, res, cookies) {
        const strCookies = cookies.map((c) => serializeCookie(c, isSecureEnvironment(req)));
        const previousCookies = res.getHeader('Set-Cookie');
        if (previousCookies) {
            if (previousCookies instanceof Array) {
                Array.prototype.push.apply(strCookies, previousCookies);
            }
            else if (typeof previousCookies === 'string') {
                strCookies.push(previousCookies);
            }
        }
        res.setHeader('Set-Cookie', strCookies);
    }
    /**
     * Set one or more cookies.
     */
    function setCookie(req, res, cookie) {
        setCookies(req, res, [cookie]);
    }
    function deleteCookie(req, res, name) {
        setCookie(req, res, {
            name,
            value: '',
            maxAge: -1,
        });
    }

    function expiresAt(expiresIn) {
        const timeNow = Math.round(Date.now() / 1000);
        return timeNow + expiresIn;
    }
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    const isBrowser = () => typeof window !== 'undefined';
    function getParameterByName(name, url) {
        var _a;
        if (!url)
            url = ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.href) || '';
        // eslint-disable-next-line no-useless-escape
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&#]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    var __awaiter$7 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class GoTrueApi {
        constructor({ url = '', headers = {}, cookieOptions, fetch, }) {
            this.url = url;
            this.headers = headers;
            this.cookieOptions = Object.assign(Object.assign({}, COOKIE_OPTIONS), cookieOptions);
            this.fetch = fetch;
        }
        /**
         * Creates a new user.
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         *
         * @param attributes The data you want to create the user with.
         * @param jwt A valid JWT. Must be a full-access API key (e.g. service_role key).
         */
        createUser(attributes) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield post$1(this.fetch, `${this.url}/admin/users`, attributes, {
                        headers: this.headers,
                    });
                    return { data, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Get a list of users.
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         */
        listUsers() {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield get$1(this.fetch, `${this.url}/admin/users`, {
                        headers: this.headers,
                    });
                    return { data: data.users, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Creates a new user using their email address.
         * @param email The email address of the user.
         * @param password The password of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param data Optional user metadata.
         *
         * @returns A logged-in session if the server has "autoconfirm" ON
         * @returns A user if the server has "autoconfirm" OFF
         */
        signUpWithEmail(email, password, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString = '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post$1(this.fetch, `${this.url}/signup${queryString}`, { email, password, data: options.data }, { headers });
                    const session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Logs in an existing user using their email address.
         * @param email The email address of the user.
         * @param password The password of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        signInWithEmail(email, password, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const headers = Object.assign({}, this.headers);
                    let queryString = '?grant_type=password';
                    if (options.redirectTo) {
                        queryString += '&redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post$1(this.fetch, `${this.url}/token${queryString}`, { email, password }, { headers });
                    const session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Signs up a new user using their phone number and a password.
         * @param phone The phone number of the user.
         * @param password The password of the user.
         * @param data Optional user metadata.
         */
        signUpWithPhone(phone, password, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const headers = Object.assign({}, this.headers);
                    const data = yield post$1(this.fetch, `${this.url}/signup`, { phone, password, data: options.data }, { headers });
                    const session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Logs in an existing user using their phone number and password.
         * @param phone The phone number of the user.
         * @param password The password of the user.
         */
        signInWithPhone(phone, password) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const headers = Object.assign({}, this.headers);
                    const queryString = '?grant_type=password';
                    const data = yield post$1(this.fetch, `${this.url}/token${queryString}`, { phone, password }, { headers });
                    const session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Sends a magic login link to an email address.
         * @param email The email address of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        sendMagicLinkEmail(email, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString += '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post$1(this.fetch, `${this.url}/magiclink${queryString}`, { email }, { headers });
                    return { data, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Sends a mobile OTP via SMS. Will register the account if it doesn't already exist
         * @param phone The user's phone number WITH international prefix
         */
        sendMobileOTP(phone) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const headers = Object.assign({}, this.headers);
                    const data = yield post$1(this.fetch, `${this.url}/otp`, { phone }, { headers });
                    return { data, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Send User supplied Mobile OTP to be verified
         * @param phone The user's phone number WITH international prefix
         * @param token token that user was sent to their mobile phone
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        verifyMobileOTP(phone, token, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const headers = Object.assign({}, this.headers);
                    const data = yield post$1(this.fetch, `${this.url}/verify`, { phone, token, type: 'sms', redirect_to: options.redirectTo }, { headers });
                    return { data, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Sends an invite link to an email address.
         * @param email The email address of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param data Optional user metadata
         */
        inviteUserByEmail(email, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString += '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post$1(this.fetch, `${this.url}/invite${queryString}`, { email, data: options.data }, { headers });
                    return { data, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Sends a reset request to an email address.
         * @param email The email address of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        resetPasswordForEmail(email, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString += '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post$1(this.fetch, `${this.url}/recover${queryString}`, { email }, { headers });
                    return { data, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Create a temporary object with all configured headers and
         * adds the Authorization token to be used on request methods
         * @param jwt A valid, logged-in JWT.
         */
        _createRequestHeaders(jwt) {
            const headers = Object.assign({}, this.headers);
            headers['Authorization'] = `Bearer ${jwt}`;
            return headers;
        }
        /**
         * Removes a logged-in session.
         * @param jwt A valid, logged-in JWT.
         */
        signOut(jwt) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    yield post$1(this.fetch, `${this.url}/logout`, {}, { headers: this._createRequestHeaders(jwt), noResolveJson: true });
                    return { error: null };
                }
                catch (e) {
                    return { error: e };
                }
            });
        }
        /**
         * Generates the relevant login URL for a third-party provider.
         * @param provider One of the providers supported by GoTrue.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param scopes A space-separated list of scopes granted to the OAuth application.
         */
        getUrlForProvider(provider, options) {
            const urlParams = [`provider=${encodeURIComponent(provider)}`];
            if (options === null || options === void 0 ? void 0 : options.redirectTo) {
                urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
            }
            if (options === null || options === void 0 ? void 0 : options.scopes) {
                urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
            }
            return `${this.url}/authorize?${urlParams.join('&')}`;
        }
        /**
         * Gets the user details.
         * @param jwt A valid, logged-in JWT.
         */
        getUser(jwt) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield get$1(this.fetch, `${this.url}/user`, {
                        headers: this._createRequestHeaders(jwt),
                    });
                    return { user: data, data, error: null };
                }
                catch (e) {
                    return { user: null, data: null, error: e };
                }
            });
        }
        /**
         * Updates the user data.
         * @param jwt A valid, logged-in JWT.
         * @param attributes The data you want to update.
         */
        updateUser(jwt, attributes) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield put$1(this.fetch, `${this.url}/user`, attributes, {
                        headers: this._createRequestHeaders(jwt),
                    });
                    return { user: data, data, error: null };
                }
                catch (e) {
                    return { user: null, data: null, error: e };
                }
            });
        }
        /**
         * Delete a user. Requires a `service_role` key.
         *
         * This function should only be called on a server. Never expose your `service_role` key in the browser.
         *
         * @param uid The user uid you want to remove.
         * @param jwt A valid JWT. Must be a full-access API key (e.g. service_role key).
         */
        deleteUser(uid, jwt) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield remove$1(this.fetch, `${this.url}/admin/users/${uid}`, {}, {
                        headers: this._createRequestHeaders(jwt),
                    });
                    return { user: data, data, error: null };
                }
                catch (e) {
                    return { user: null, data: null, error: e };
                }
            });
        }
        /**
         * Generates a new JWT.
         * @param refreshToken A valid refresh token that was returned on login.
         */
        refreshAccessToken(refreshToken) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield post$1(this.fetch, `${this.url}/token?grant_type=refresh_token`, { refresh_token: refreshToken }, { headers: this.headers });
                    const session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Set/delete the auth cookie based on the AuthChangeEvent.
         * Works for Next.js & Express (requires cookie-parser middleware).
         */
        setAuthCookie(req, res) {
            if (req.method !== 'POST') {
                res.setHeader('Allow', 'POST');
                res.status(405).end('Method Not Allowed');
            }
            const { event, session } = req.body;
            if (!event)
                throw new Error('Auth event missing!');
            if (event === 'SIGNED_IN') {
                if (!session)
                    throw new Error('Auth session missing!');
                setCookie(req, res, {
                    name: this.cookieOptions.name,
                    value: session.access_token,
                    domain: this.cookieOptions.domain,
                    maxAge: this.cookieOptions.lifetime,
                    path: this.cookieOptions.path,
                    sameSite: this.cookieOptions.sameSite,
                });
            }
            if (event === 'SIGNED_OUT')
                deleteCookie(req, res, this.cookieOptions.name);
            res.status(200).json({});
        }
        /**
         * Get user by reading the cookie from the request.
         * Works for Next.js & Express (requires cookie-parser middleware).
         */
        getUserByCookie(req) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    if (!req.cookies) {
                        throw new Error('Not able to parse cookies! When using Express make sure the cookie-parser middleware is in use!');
                    }
                    if (!req.cookies[this.cookieOptions.name]) {
                        throw new Error('No cookie found!');
                    }
                    const token = req.cookies[this.cookieOptions.name];
                    const { user, error } = yield this.getUser(token);
                    if (error)
                        throw error;
                    return { token, user, data: user, error: null };
                }
                catch (e) {
                    return { token: null, user: null, data: null, error: e };
                }
            });
        }
        /**
         * Generates links to be sent via email or other.
         * @param type The link type ("signup" or "magiclink" or "recovery" or "invite").
         * @param email The user's email.
         * @param password User password. For signup only.
         * @param data Optional user metadata. For signup only.
         * @param redirectTo The link type ("signup" or "magiclink" or "recovery" or "invite").
         */
        generateLink(type, email, options = {}) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield post$1(this.fetch, `${this.url}/admin/generate_link`, {
                        type,
                        email,
                        password: options.password,
                        data: options.data,
                        redirect_to: options.redirectTo,
                    }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
    }

    /**
     * https://mathiasbynens.be/notes/globalthis
     */
    function polyfillGlobalThis() {
        if (typeof globalThis === 'object')
            return;
        try {
            Object.defineProperty(Object.prototype, '__magic__', {
                get: function () {
                    return this;
                },
                configurable: true,
            });
            // @ts-expect-error 'Allow access to magic'
            __magic__.globalThis = __magic__;
            // @ts-expect-error 'Allow access to magic'
            delete Object.prototype.__magic__;
        }
        catch (e) {
            if (typeof self !== 'undefined') {
                // @ts-expect-error 'Allow access to globals'
                self.globalThis = self;
            }
        }
    }

    var __awaiter$6 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    polyfillGlobalThis(); // Make "globalThis" available
    const DEFAULT_OPTIONS$1 = {
        url: GOTRUE_URL,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        multiTab: true,
        headers: DEFAULT_HEADERS$3,
    };
    class GoTrueClient {
        /**
         * Create a new client for use in the browser.
         * @param options.url The URL of the GoTrue server.
         * @param options.headers Any additional headers to send to the GoTrue server.
         * @param options.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
         * @param options.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
         * @param options.persistSession Set to "true" if you want to automatically save the user session into local storage.
         * @param options.localStorage Provide your own local storage implementation to use instead of the browser's local storage.
         * @param options.multiTab Set to "false" if you want to disable multi-tab/window events.
         * @param options.cookieOptions
         * @param options.fetch A custom fetch implementation.
         */
        constructor(options) {
            this.stateChangeEmitters = new Map();
            const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS$1), options);
            this.currentUser = null;
            this.currentSession = null;
            this.autoRefreshToken = settings.autoRefreshToken;
            this.persistSession = settings.persistSession;
            this.multiTab = settings.multiTab;
            this.localStorage = settings.localStorage || globalThis.localStorage;
            this.api = new GoTrueApi({
                url: settings.url,
                headers: settings.headers,
                cookieOptions: settings.cookieOptions,
                fetch: settings.fetch,
            });
            this._recoverSession();
            this._recoverAndRefresh();
            this._listenForMultiTabEvents();
            if (settings.detectSessionInUrl && isBrowser() && !!getParameterByName('access_token')) {
                // Handle the OAuth redirect
                this.getSessionFromUrl({ storeSession: true }).then(({ error }) => {
                    if (error) {
                        console.error('Error getting session from URL.', error);
                    }
                });
            }
        }
        /**
         * Creates a new user.
         * @type UserCredentials
         * @param email The user's email address.
         * @param password The user's password.
         * @param phone The user's phone number.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param data Optional user metadata.
         */
        signUp({ email, password, phone }, options = {}) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    this._removeSession();
                    const { data, error } = phone && password
                        ? yield this.api.signUpWithPhone(phone, password, {
                            data: options.data,
                        })
                        : yield this.api.signUpWithEmail(email, password, {
                            redirectTo: options.redirectTo,
                            data: options.data,
                        });
                    if (error) {
                        throw error;
                    }
                    if (!data) {
                        throw 'An error occurred on sign up.';
                    }
                    let session = null;
                    let user = null;
                    if (data.access_token) {
                        session = data;
                        user = session.user;
                        this._saveSession(session);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                    if (data.id) {
                        user = data;
                    }
                    return { user, session, error: null };
                }
                catch (e) {
                    return { user: null, session: null, error: e };
                }
            });
        }
        /**
         * Log in an existing user, or login via a third-party provider.
         * @type UserCredentials
         * @param email The user's email address.
         * @param password The user's password.
         * @param refreshToken A valid refresh token that was returned on login.
         * @param provider One of the providers supported by GoTrue.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param scopes A space-separated list of scopes granted to the OAuth application.
         */
        signIn({ email, phone, password, refreshToken, provider }, options = {}) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    this._removeSession();
                    if (email && !password) {
                        const { error } = yield this.api.sendMagicLinkEmail(email, {
                            redirectTo: options.redirectTo,
                        });
                        return { user: null, session: null, error };
                    }
                    if (email && password) {
                        return this._handleEmailSignIn(email, password, {
                            redirectTo: options.redirectTo,
                        });
                    }
                    if (phone && !password) {
                        const { error } = yield this.api.sendMobileOTP(phone);
                        return { user: null, session: null, error };
                    }
                    if (phone && password) {
                        return this._handlePhoneSignIn(phone, password);
                    }
                    if (refreshToken) {
                        // currentSession and currentUser will be updated to latest on _callRefreshToken using the passed refreshToken
                        const { error } = yield this._callRefreshToken(refreshToken);
                        if (error)
                            throw error;
                        return {
                            user: this.currentUser,
                            session: this.currentSession,
                            error: null,
                        };
                    }
                    if (provider) {
                        return this._handleProviderSignIn(provider, {
                            redirectTo: options.redirectTo,
                            scopes: options.scopes,
                        });
                    }
                    throw new Error(`You must provide either an email, phone number or a third-party provider.`);
                }
                catch (e) {
                    return { user: null, session: null, error: e };
                }
            });
        }
        /**
         * Log in a user given a User supplied OTP received via mobile.
         * @param phone The user's phone number.
         * @param token The user's password.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        verifyOTP({ phone, token }, options = {}) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    this._removeSession();
                    const { data, error } = yield this.api.verifyMobileOTP(phone, token, options);
                    if (error) {
                        throw error;
                    }
                    if (!data) {
                        throw 'An error occurred on token verification.';
                    }
                    let session = null;
                    let user = null;
                    if (data.access_token) {
                        session = data;
                        user = session.user;
                        this._saveSession(session);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                    if (data.id) {
                        user = data;
                    }
                    return { user, session, error: null };
                }
                catch (e) {
                    return { user: null, session: null, error: e };
                }
            });
        }
        /**
         * Inside a browser context, `user()` will return the user data, if there is a logged in user.
         *
         * For server-side management, you can get a user through `auth.api.getUserByCookie()`
         */
        user() {
            return this.currentUser;
        }
        /**
         * Returns the session data, if there is an active session.
         */
        session() {
            return this.currentSession;
        }
        /**
         * Force refreshes the session including the user data in case it was updated in a different session.
         */
        refreshSession() {
            var _a;
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    if (!((_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token))
                        throw new Error('Not logged in.');
                    // currentSession and currentUser will be updated to latest on _callRefreshToken
                    const { error } = yield this._callRefreshToken();
                    if (error)
                        throw error;
                    return { data: this.currentSession, user: this.currentUser, error: null };
                }
                catch (e) {
                    return { data: null, user: null, error: e };
                }
            });
        }
        /**
         * Updates user data, if there is a logged in user.
         */
        update(attributes) {
            var _a;
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    if (!((_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token))
                        throw new Error('Not logged in.');
                    const { user, error } = yield this.api.updateUser(this.currentSession.access_token, attributes);
                    if (error)
                        throw error;
                    if (!user)
                        throw Error('Invalid user data.');
                    const session = Object.assign(Object.assign({}, this.currentSession), { user });
                    this._saveSession(session);
                    this._notifyAllSubscribers('USER_UPDATED');
                    return { data: user, user, error: null };
                }
                catch (e) {
                    return { data: null, user: null, error: e };
                }
            });
        }
        /**
         * Sets the session data from refresh_token and returns current Session and Error
         * @param refresh_token a JWT token
         */
        setSession(refresh_token) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    if (!refresh_token) {
                        throw new Error('No current session.');
                    }
                    const { data, error } = yield this.api.refreshAccessToken(refresh_token);
                    if (error) {
                        return { session: null, error: error };
                    }
                    this._saveSession(data);
                    this._notifyAllSubscribers('SIGNED_IN');
                    return { session: data, error: null };
                }
                catch (e) {
                    return { error: e, session: null };
                }
            });
        }
        /**
         * Overrides the JWT on the current client. The JWT will then be sent in all subsequent network requests.
         * @param access_token a jwt access token
         */
        setAuth(access_token) {
            this.currentSession = Object.assign(Object.assign({}, this.currentSession), { access_token, token_type: 'bearer', user: null });
            return this.currentSession;
        }
        /**
         * Gets the session data from a URL string
         * @param options.storeSession Optionally store the session in the browser
         */
        getSessionFromUrl(options) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    if (!isBrowser())
                        throw new Error('No browser detected.');
                    const error_description = getParameterByName('error_description');
                    if (error_description)
                        throw new Error(error_description);
                    const provider_token = getParameterByName('provider_token');
                    const access_token = getParameterByName('access_token');
                    if (!access_token)
                        throw new Error('No access_token detected.');
                    const expires_in = getParameterByName('expires_in');
                    if (!expires_in)
                        throw new Error('No expires_in detected.');
                    const refresh_token = getParameterByName('refresh_token');
                    if (!refresh_token)
                        throw new Error('No refresh_token detected.');
                    const token_type = getParameterByName('token_type');
                    if (!token_type)
                        throw new Error('No token_type detected.');
                    const timeNow = Math.round(Date.now() / 1000);
                    const expires_at = timeNow + parseInt(expires_in);
                    const { user, error } = yield this.api.getUser(access_token);
                    if (error)
                        throw error;
                    const session = {
                        provider_token,
                        access_token,
                        expires_in: parseInt(expires_in),
                        expires_at,
                        refresh_token,
                        token_type,
                        user: user,
                    };
                    if (options === null || options === void 0 ? void 0 : options.storeSession) {
                        this._saveSession(session);
                        const recoveryMode = getParameterByName('type');
                        this._notifyAllSubscribers('SIGNED_IN');
                        if (recoveryMode === 'recovery') {
                            this._notifyAllSubscribers('PASSWORD_RECOVERY');
                        }
                    }
                    // Remove tokens from URL
                    window.location.hash = '';
                    return { data: session, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        /**
         * Inside a browser context, `signOut()` will remove the logged in user from the browser session
         * and log them out - removing all items from localstorage and then trigger a "SIGNED_OUT" event.
         *
         * For server-side management, you can disable sessions by passing a JWT through to `auth.api.signOut(JWT: string)`
         */
        signOut() {
            var _a;
            return __awaiter$6(this, void 0, void 0, function* () {
                const accessToken = (_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token;
                this._removeSession();
                this._notifyAllSubscribers('SIGNED_OUT');
                if (accessToken) {
                    const { error } = yield this.api.signOut(accessToken);
                    if (error)
                        return { error };
                }
                return { error: null };
            });
        }
        /**
         * Receive a notification every time an auth event happens.
         * @returns {Subscription} A subscription object which can be used to unsubscribe itself.
         */
        onAuthStateChange(callback) {
            try {
                const id = uuid();
                const subscription = {
                    id,
                    callback,
                    unsubscribe: () => {
                        this.stateChangeEmitters.delete(id);
                    },
                };
                this.stateChangeEmitters.set(id, subscription);
                return { data: subscription, error: null };
            }
            catch (e) {
                return { data: null, error: e };
            }
        }
        _handleEmailSignIn(email, password, options = {}) {
            var _a, _b;
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const { data, error } = yield this.api.signInWithEmail(email, password, {
                        redirectTo: options.redirectTo,
                    });
                    if (error || !data)
                        return { data: null, user: null, session: null, error };
                    if (((_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.confirmed_at) || ((_b = data === null || data === void 0 ? void 0 : data.user) === null || _b === void 0 ? void 0 : _b.email_confirmed_at)) {
                        this._saveSession(data);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                    return { data, user: data.user, session: data, error: null };
                }
                catch (e) {
                    return { data: null, user: null, session: null, error: e };
                }
            });
        }
        _handlePhoneSignIn(phone, password) {
            var _a;
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const { data, error } = yield this.api.signInWithPhone(phone, password);
                    if (error || !data)
                        return { data: null, user: null, session: null, error };
                    if ((_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.phone_confirmed_at) {
                        this._saveSession(data);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                    return { data, user: data.user, session: data, error: null };
                }
                catch (e) {
                    return { data: null, user: null, session: null, error: e };
                }
            });
        }
        _handleProviderSignIn(provider, options = {}) {
            const url = this.api.getUrlForProvider(provider, {
                redirectTo: options.redirectTo,
                scopes: options.scopes,
            });
            try {
                // try to open on the browser
                if (isBrowser()) {
                    window.location.href = url;
                }
                return { provider, url, data: null, session: null, user: null, error: null };
            }
            catch (e) {
                // fallback to returning the URL
                if (url)
                    return { provider, url, data: null, session: null, user: null, error: null };
                return { data: null, user: null, session: null, error: e };
            }
        }
        /**
         * Attempts to get the session from LocalStorage
         * Note: this should never be async (even for React Native), as we need it to return immediately in the constructor.
         */
        _recoverSession() {
            var _a;
            try {
                const json = isBrowser() && ((_a = this.localStorage) === null || _a === void 0 ? void 0 : _a.getItem(STORAGE_KEY));
                if (!json || typeof json !== 'string') {
                    return null;
                }
                const data = JSON.parse(json);
                const { currentSession, expiresAt } = data;
                const timeNow = Math.round(Date.now() / 1000);
                if (expiresAt >= timeNow && (currentSession === null || currentSession === void 0 ? void 0 : currentSession.user)) {
                    this._saveSession(currentSession);
                    this._notifyAllSubscribers('SIGNED_IN');
                }
            }
            catch (error) {
                console.log('error', error);
            }
        }
        /**
         * Recovers the session from LocalStorage and refreshes
         * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
         */
        _recoverAndRefresh() {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const json = isBrowser() && (yield this.localStorage.getItem(STORAGE_KEY));
                    if (!json) {
                        return null;
                    }
                    const data = JSON.parse(json);
                    const { currentSession, expiresAt } = data;
                    const timeNow = Math.round(Date.now() / 1000);
                    if (expiresAt < timeNow) {
                        if (this.autoRefreshToken && currentSession.refresh_token) {
                            const { error } = yield this._callRefreshToken(currentSession.refresh_token);
                            if (error) {
                                console.log(error.message);
                                yield this._removeSession();
                            }
                        }
                        else {
                            this._removeSession();
                        }
                    }
                    else if (!currentSession || !currentSession.user) {
                        console.log('Current session is missing data.');
                        this._removeSession();
                    }
                    else {
                        // should be handled on _recoverSession method already
                        // But we still need the code here to accommodate for AsyncStorage e.g. in React native
                        this._saveSession(currentSession);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                }
                catch (err) {
                    console.error(err);
                    return null;
                }
            });
        }
        _callRefreshToken(refresh_token) {
            var _a;
            if (refresh_token === void 0) { refresh_token = (_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.refresh_token; }
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    if (!refresh_token) {
                        throw new Error('No current session.');
                    }
                    const { data, error } = yield this.api.refreshAccessToken(refresh_token);
                    if (error)
                        throw error;
                    if (!data)
                        throw Error('Invalid session data.');
                    this._saveSession(data);
                    this._notifyAllSubscribers('TOKEN_REFRESHED');
                    this._notifyAllSubscribers('SIGNED_IN');
                    return { data, error: null };
                }
                catch (e) {
                    return { data: null, error: e };
                }
            });
        }
        _notifyAllSubscribers(event) {
            this.stateChangeEmitters.forEach((x) => x.callback(event, this.currentSession));
        }
        /**
         * set currentSession and currentUser
         * process to _startAutoRefreshToken if possible
         */
        _saveSession(session) {
            this.currentSession = session;
            this.currentUser = session.user;
            const expiresAt = session.expires_at;
            if (expiresAt) {
                const timeNow = Math.round(Date.now() / 1000);
                const expiresIn = expiresAt - timeNow;
                const refreshDurationBeforeExpires = expiresIn > 60 ? 60 : 0.5;
                this._startAutoRefreshToken((expiresIn - refreshDurationBeforeExpires) * 1000);
            }
            // Do we need any extra check before persist session
            // access_token or user ?
            if (this.persistSession && session.expires_at) {
                this._persistSession(this.currentSession);
            }
        }
        _persistSession(currentSession) {
            const data = { currentSession, expiresAt: currentSession.expires_at };
            isBrowser() && this.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        _removeSession() {
            return __awaiter$6(this, void 0, void 0, function* () {
                this.currentSession = null;
                this.currentUser = null;
                if (this.refreshTokenTimer)
                    clearTimeout(this.refreshTokenTimer);
                isBrowser() && (yield this.localStorage.removeItem(STORAGE_KEY));
            });
        }
        /**
         * Clear and re-create refresh token timer
         * @param value time intervals in milliseconds
         */
        _startAutoRefreshToken(value) {
            if (this.refreshTokenTimer)
                clearTimeout(this.refreshTokenTimer);
            if (value <= 0 || !this.autoRefreshToken)
                return;
            this.refreshTokenTimer = setTimeout(() => this._callRefreshToken(), value);
            if (typeof this.refreshTokenTimer.unref === 'function')
                this.refreshTokenTimer.unref();
        }
        /**
         * Listens for changes to LocalStorage and updates the current session.
         */
        _listenForMultiTabEvents() {
            if (!this.multiTab || !isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
                // console.debug('Auth multi-tab support is disabled.')
                return false;
            }
            try {
                window === null || window === void 0 ? void 0 : window.addEventListener('storage', (e) => {
                    var _a;
                    if (e.key === STORAGE_KEY) {
                        const newSession = JSON.parse(String(e.newValue));
                        if ((_a = newSession === null || newSession === void 0 ? void 0 : newSession.currentSession) === null || _a === void 0 ? void 0 : _a.access_token) {
                            this._recoverAndRefresh();
                            this._notifyAllSubscribers('SIGNED_IN');
                        }
                        else {
                            this._removeSession();
                            this._notifyAllSubscribers('SIGNED_OUT');
                        }
                    }
                });
            }
            catch (error) {
                console.error('_listenForMultiTabEvents', error);
            }
        }
    }

    class SupabaseAuthClient extends GoTrueClient {
        constructor(options) {
            super(options);
        }
    }

    var __awaiter$5 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class PostgrestBuilder {
        constructor(builder) {
            this.shouldThrowOnError = false;
            Object.assign(this, builder);
            this.fetch = builder.fetch || fetch$1;
        }
        /**
         * If there's an error with the query, throwOnError will reject the promise by
         * throwing the error instead of returning it as part of a successful response.
         *
         * {@link https://github.com/supabase/supabase-js/issues/92}
         */
        throwOnError() {
            this.shouldThrowOnError = true;
            return this;
        }
        then(onfulfilled, onrejected) {
            // https://postgrest.org/en/stable/api.html#switching-schemas
            if (typeof this.schema === 'undefined') ;
            else if (['GET', 'HEAD'].includes(this.method)) {
                this.headers['Accept-Profile'] = this.schema;
            }
            else {
                this.headers['Content-Profile'] = this.schema;
            }
            if (this.method !== 'GET' && this.method !== 'HEAD') {
                this.headers['Content-Type'] = 'application/json';
            }
            let res = this.fetch(this.url.toString(), {
                method: this.method,
                headers: this.headers,
                body: JSON.stringify(this.body),
                signal: this.signal,
            }).then((res) => __awaiter$5(this, void 0, void 0, function* () {
                var _a, _b, _c;
                let error = null;
                let data = null;
                let count = null;
                if (res.ok) {
                    const isReturnMinimal = (_a = this.headers['Prefer']) === null || _a === void 0 ? void 0 : _a.split(',').includes('return=minimal');
                    if (this.method !== 'HEAD' && !isReturnMinimal) {
                        const text = yield res.text();
                        if (!text) ;
                        else if (this.headers['Accept'] === 'text/csv') {
                            data = text;
                        }
                        else {
                            data = JSON.parse(text);
                        }
                    }
                    const countHeader = (_b = this.headers['Prefer']) === null || _b === void 0 ? void 0 : _b.match(/count=(exact|planned|estimated)/);
                    const contentRange = (_c = res.headers.get('content-range')) === null || _c === void 0 ? void 0 : _c.split('/');
                    if (countHeader && contentRange && contentRange.length > 1) {
                        count = parseInt(contentRange[1]);
                    }
                }
                else {
                    error = yield res.json();
                    if (error && this.shouldThrowOnError) {
                        throw error;
                    }
                }
                const postgrestResponse = {
                    error,
                    data,
                    count,
                    status: res.status,
                    statusText: res.statusText,
                    body: data,
                };
                return postgrestResponse;
            }));
            if (!this.shouldThrowOnError) {
                res = res.catch((fetchError) => ({
                    error: {
                        message: `FetchError: ${fetchError.message}`,
                        details: '',
                        hint: '',
                        code: fetchError.code || '',
                    },
                    data: null,
                    body: null,
                    count: null,
                    status: 400,
                    statusText: 'Bad Request',
                }));
            }
            return res.then(onfulfilled, onrejected);
        }
    }

    /**
     * Post-filters (transforms)
     */
    class PostgrestTransformBuilder extends PostgrestBuilder {
        /**
         * Performs vertical filtering with SELECT.
         *
         * @param columns  The columns to retrieve, separated by commas.
         */
        select(columns = '*') {
            // Remove whitespaces except when quoted
            let quoted = false;
            const cleanedColumns = columns
                .split('')
                .map((c) => {
                if (/\s/.test(c) && !quoted) {
                    return '';
                }
                if (c === '"') {
                    quoted = !quoted;
                }
                return c;
            })
                .join('');
            this.url.searchParams.set('select', cleanedColumns);
            return this;
        }
        /**
         * Orders the result with the specified `column`.
         *
         * @param column  The column to order on.
         * @param ascending  If `true`, the result will be in ascending order.
         * @param nullsFirst  If `true`, `null`s appear first.
         * @param foreignTable  The foreign table to use (if `column` is a foreign column).
         */
        order(column, { ascending = true, nullsFirst = false, foreignTable, } = {}) {
            const key = typeof foreignTable === 'undefined' ? 'order' : `${foreignTable}.order`;
            const existingOrder = this.url.searchParams.get(key);
            this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ''}${column}.${ascending ? 'asc' : 'desc'}.${nullsFirst ? 'nullsfirst' : 'nullslast'}`);
            return this;
        }
        /**
         * Limits the result with the specified `count`.
         *
         * @param count  The maximum no. of rows to limit to.
         * @param foreignTable  The foreign table to use (for foreign columns).
         */
        limit(count, { foreignTable } = {}) {
            const key = typeof foreignTable === 'undefined' ? 'limit' : `${foreignTable}.limit`;
            this.url.searchParams.set(key, `${count}`);
            return this;
        }
        /**
         * Limits the result to rows within the specified range, inclusive.
         *
         * @param from  The starting index from which to limit the result, inclusive.
         * @param to  The last index to which to limit the result, inclusive.
         * @param foreignTable  The foreign table to use (for foreign columns).
         */
        range(from, to, { foreignTable } = {}) {
            const keyOffset = typeof foreignTable === 'undefined' ? 'offset' : `${foreignTable}.offset`;
            const keyLimit = typeof foreignTable === 'undefined' ? 'limit' : `${foreignTable}.limit`;
            this.url.searchParams.set(keyOffset, `${from}`);
            // Range is inclusive, so add 1
            this.url.searchParams.set(keyLimit, `${to - from + 1}`);
            return this;
        }
        /**
         * Sets the AbortSignal for the fetch request.
         */
        abortSignal(signal) {
            this.signal = signal;
            return this;
        }
        /**
         * Retrieves only one row from the result. Result must be one row (e.g. using
         * `limit`), otherwise this will result in an error.
         */
        single() {
            this.headers['Accept'] = 'application/vnd.pgrst.object+json';
            return this;
        }
        /**
         * Retrieves at most one row from the result. Result must be at most one row
         * (e.g. using `eq` on a UNIQUE column), otherwise this will result in an
         * error.
         */
        maybeSingle() {
            this.headers['Accept'] = 'application/vnd.pgrst.object+json';
            const _this = new PostgrestTransformBuilder(this);
            _this.then = ((onfulfilled, onrejected) => this.then((res) => {
                var _a, _b;
                if ((_b = (_a = res.error) === null || _a === void 0 ? void 0 : _a.details) === null || _b === void 0 ? void 0 : _b.includes('Results contain 0 rows')) {
                    return onfulfilled({
                        error: null,
                        data: null,
                        count: res.count,
                        status: 200,
                        statusText: 'OK',
                        body: null,
                    });
                }
                return onfulfilled(res);
            }, onrejected));
            return _this;
        }
        /**
         * Set the response type to CSV.
         */
        csv() {
            this.headers['Accept'] = 'text/csv';
            return this;
        }
    }

    class PostgrestFilterBuilder extends PostgrestTransformBuilder {
        constructor() {
            super(...arguments);
            /** @deprecated Use `contains()` instead. */
            this.cs = this.contains;
            /** @deprecated Use `containedBy()` instead. */
            this.cd = this.containedBy;
            /** @deprecated Use `rangeLt()` instead. */
            this.sl = this.rangeLt;
            /** @deprecated Use `rangeGt()` instead. */
            this.sr = this.rangeGt;
            /** @deprecated Use `rangeGte()` instead. */
            this.nxl = this.rangeGte;
            /** @deprecated Use `rangeLte()` instead. */
            this.nxr = this.rangeLte;
            /** @deprecated Use `rangeAdjacent()` instead. */
            this.adj = this.rangeAdjacent;
            /** @deprecated Use `overlaps()` instead. */
            this.ov = this.overlaps;
        }
        /**
         * Finds all rows which doesn't satisfy the filter.
         *
         * @param column  The column to filter on.
         * @param operator  The operator to filter with.
         * @param value  The value to filter with.
         */
        not(column, operator, value) {
            this.url.searchParams.append(`${column}`, `not.${operator}.${value}`);
            return this;
        }
        /**
         * Finds all rows satisfying at least one of the filters.
         *
         * @param filters  The filters to use, separated by commas.
         * @param foreignTable  The foreign table to use (if `column` is a foreign column).
         */
        or(filters, { foreignTable } = {}) {
            const key = typeof foreignTable === 'undefined' ? 'or' : `${foreignTable}.or`;
            this.url.searchParams.append(key, `(${filters})`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` exactly matches the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        eq(column, value) {
            this.url.searchParams.append(`${column}`, `eq.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` doesn't match the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        neq(column, value) {
            this.url.searchParams.append(`${column}`, `neq.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is greater than the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        gt(column, value) {
            this.url.searchParams.append(`${column}`, `gt.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is greater than or
         * equal to the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        gte(column, value) {
            this.url.searchParams.append(`${column}`, `gte.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is less than the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        lt(column, value) {
            this.url.searchParams.append(`${column}`, `lt.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is less than or equal
         * to the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        lte(column, value) {
            this.url.searchParams.append(`${column}`, `lte.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value in the stated `column` matches the supplied
         * `pattern` (case sensitive).
         *
         * @param column  The column to filter on.
         * @param pattern  The pattern to filter with.
         */
        like(column, pattern) {
            this.url.searchParams.append(`${column}`, `like.${pattern}`);
            return this;
        }
        /**
         * Finds all rows whose value in the stated `column` matches the supplied
         * `pattern` (case insensitive).
         *
         * @param column  The column to filter on.
         * @param pattern  The pattern to filter with.
         */
        ilike(column, pattern) {
            this.url.searchParams.append(`${column}`, `ilike.${pattern}`);
            return this;
        }
        /**
         * A check for exact equality (null, true, false), finds all rows whose
         * value on the stated `column` exactly match the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        is(column, value) {
            this.url.searchParams.append(`${column}`, `is.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is found on the
         * specified `values`.
         *
         * @param column  The column to filter on.
         * @param values  The values to filter with.
         */
        in(column, values) {
            const cleanedValues = values
                .map((s) => {
                // handle postgrest reserved characters
                // https://postgrest.org/en/v7.0.0/api.html#reserved-characters
                if (typeof s === 'string' && new RegExp('[,()]').test(s))
                    return `"${s}"`;
                else
                    return `${s}`;
            })
                .join(',');
            this.url.searchParams.append(`${column}`, `in.(${cleanedValues})`);
            return this;
        }
        /**
         * Finds all rows whose json, array, or range value on the stated `column`
         * contains the values specified in `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        contains(column, value) {
            if (typeof value === 'string') {
                // range types can be inclusive '[', ']' or exclusive '(', ')' so just
                // keep it simple and accept a string
                this.url.searchParams.append(`${column}`, `cs.${value}`);
            }
            else if (Array.isArray(value)) {
                // array
                this.url.searchParams.append(`${column}`, `cs.{${value.join(',')}}`);
            }
            else {
                // json
                this.url.searchParams.append(`${column}`, `cs.${JSON.stringify(value)}`);
            }
            return this;
        }
        /**
         * Finds all rows whose json, array, or range value on the stated `column` is
         * contained by the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        containedBy(column, value) {
            if (typeof value === 'string') {
                // range
                this.url.searchParams.append(`${column}`, `cd.${value}`);
            }
            else if (Array.isArray(value)) {
                // array
                this.url.searchParams.append(`${column}`, `cd.{${value.join(',')}}`);
            }
            else {
                // json
                this.url.searchParams.append(`${column}`, `cd.${JSON.stringify(value)}`);
            }
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` is strictly to the
         * left of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeLt(column, range) {
            this.url.searchParams.append(`${column}`, `sl.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` is strictly to
         * the right of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeGt(column, range) {
            this.url.searchParams.append(`${column}`, `sr.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` does not extend
         * to the left of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeGte(column, range) {
            this.url.searchParams.append(`${column}`, `nxl.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` does not extend
         * to the right of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeLte(column, range) {
            this.url.searchParams.append(`${column}`, `nxr.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` is adjacent to
         * the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeAdjacent(column, range) {
            this.url.searchParams.append(`${column}`, `adj.${range}`);
            return this;
        }
        /**
         * Finds all rows whose array or range value on the stated `column` overlaps
         * (has a value in common) with the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        overlaps(column, value) {
            if (typeof value === 'string') {
                // range
                this.url.searchParams.append(`${column}`, `ov.${value}`);
            }
            else {
                // array
                this.url.searchParams.append(`${column}`, `ov.{${value.join(',')}}`);
            }
            return this;
        }
        /**
         * Finds all rows whose text or tsvector value on the stated `column` matches
         * the tsquery in `query`.
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         * @param type  The type of tsquery conversion to use on `query`.
         */
        textSearch(column, query, { config, type = null, } = {}) {
            let typePart = '';
            if (type === 'plain') {
                typePart = 'pl';
            }
            else if (type === 'phrase') {
                typePart = 'ph';
            }
            else if (type === 'websearch') {
                typePart = 'w';
            }
            const configPart = config === undefined ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `${typePart}fts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * to_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` instead.
         */
        fts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `fts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * plainto_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` with `type: 'plain'` instead.
         */
        plfts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `plfts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * phraseto_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` with `type: 'phrase'` instead.
         */
        phfts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `phfts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * websearch_to_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` with `type: 'websearch'` instead.
         */
        wfts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `wfts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose `column` satisfies the filter.
         *
         * @param column  The column to filter on.
         * @param operator  The operator to filter with.
         * @param value  The value to filter with.
         */
        filter(column, operator, value) {
            this.url.searchParams.append(`${column}`, `${operator}.${value}`);
            return this;
        }
        /**
         * Finds all rows whose columns match the specified `query` object.
         *
         * @param query  The object to filter with, with column names as keys mapped
         *               to their filter values.
         */
        match(query) {
            Object.keys(query).forEach((key) => {
                this.url.searchParams.append(`${key}`, `eq.${query[key]}`);
            });
            return this;
        }
    }

    class PostgrestQueryBuilder extends PostgrestBuilder {
        constructor(url, { headers = {}, schema, fetch, } = {}) {
            super({ fetch });
            this.url = new URL(url);
            this.headers = Object.assign({}, headers);
            this.schema = schema;
        }
        /**
         * Performs vertical filtering with SELECT.
         *
         * @param columns  The columns to retrieve, separated by commas.
         * @param head  When set to true, select will void data.
         * @param count  Count algorithm to use to count rows in a table.
         */
        select(columns = '*', { head = false, count = null, } = {}) {
            this.method = 'GET';
            // Remove whitespaces except when quoted
            let quoted = false;
            const cleanedColumns = columns
                .split('')
                .map((c) => {
                if (/\s/.test(c) && !quoted) {
                    return '';
                }
                if (c === '"') {
                    quoted = !quoted;
                }
                return c;
            })
                .join('');
            this.url.searchParams.set('select', cleanedColumns);
            if (count) {
                this.headers['Prefer'] = `count=${count}`;
            }
            if (head) {
                this.method = 'HEAD';
            }
            return new PostgrestFilterBuilder(this);
        }
        insert(values, { upsert = false, onConflict, returning = 'representation', count = null, } = {}) {
            this.method = 'POST';
            const prefersHeaders = [`return=${returning}`];
            if (upsert)
                prefersHeaders.push('resolution=merge-duplicates');
            if (upsert && onConflict !== undefined)
                this.url.searchParams.set('on_conflict', onConflict);
            this.body = values;
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            if (Array.isArray(values)) {
                const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
                if (columns.length > 0) {
                    const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
                    this.url.searchParams.set('columns', uniqueColumns.join(','));
                }
            }
            return new PostgrestFilterBuilder(this);
        }
        /**
         * Performs an UPSERT into the table.
         *
         * @param values  The values to insert.
         * @param onConflict  By specifying the `on_conflict` query parameter, you can make UPSERT work on a column(s) that has a UNIQUE constraint.
         * @param returning  By default the new record is returned. Set this to 'minimal' if you don't need this value.
         * @param count  Count algorithm to use to count rows in a table.
         * @param ignoreDuplicates  Specifies if duplicate rows should be ignored and not inserted.
         */
        upsert(values, { onConflict, returning = 'representation', count = null, ignoreDuplicates = false, } = {}) {
            this.method = 'POST';
            const prefersHeaders = [
                `resolution=${ignoreDuplicates ? 'ignore' : 'merge'}-duplicates`,
                `return=${returning}`,
            ];
            if (onConflict !== undefined)
                this.url.searchParams.set('on_conflict', onConflict);
            this.body = values;
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder(this);
        }
        /**
         * Performs an UPDATE on the table.
         *
         * @param values  The values to update.
         * @param returning  By default the updated record is returned. Set this to 'minimal' if you don't need this value.
         * @param count  Count algorithm to use to count rows in a table.
         */
        update(values, { returning = 'representation', count = null, } = {}) {
            this.method = 'PATCH';
            const prefersHeaders = [`return=${returning}`];
            this.body = values;
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder(this);
        }
        /**
         * Performs a DELETE on the table.
         *
         * @param returning  If `true`, return the deleted row(s) in the response.
         * @param count  Count algorithm to use to count rows in a table.
         */
        delete({ returning = 'representation', count = null, } = {}) {
            this.method = 'DELETE';
            const prefersHeaders = [`return=${returning}`];
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder(this);
        }
    }

    class PostgrestRpcBuilder extends PostgrestBuilder {
        constructor(url, { headers = {}, schema, fetch, } = {}) {
            super({ fetch });
            this.url = new URL(url);
            this.headers = Object.assign({}, headers);
            this.schema = schema;
        }
        /**
         * Perform a function call.
         */
        rpc(params, { head = false, count = null, } = {}) {
            if (head) {
                this.method = 'HEAD';
                if (params) {
                    Object.entries(params).forEach(([name, value]) => {
                        this.url.searchParams.append(name, value);
                    });
                }
            }
            else {
                this.method = 'POST';
                this.body = params;
            }
            if (count) {
                if (this.headers['Prefer'] !== undefined)
                    this.headers['Prefer'] += `,count=${count}`;
                else
                    this.headers['Prefer'] = `count=${count}`;
            }
            return new PostgrestFilterBuilder(this);
        }
    }

    // generated by genversion
    const version$4 = '0.35.0';

    const DEFAULT_HEADERS$2 = { 'X-Client-Info': `postgrest-js/${version$4}` };

    class PostgrestClient {
        /**
         * Creates a PostgREST client.
         *
         * @param url  URL of the PostgREST endpoint.
         * @param headers  Custom headers.
         * @param schema  Postgres schema to switch to.
         */
        constructor(url, { headers = {}, schema, fetch, } = {}) {
            this.url = url;
            this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$2), headers);
            this.schema = schema;
            this.fetch = fetch;
        }
        /**
         * Authenticates the request with JWT.
         *
         * @param token  The JWT token to use.
         */
        auth(token) {
            this.headers['Authorization'] = `Bearer ${token}`;
            return this;
        }
        /**
         * Perform a table operation.
         *
         * @param table  The table name to operate on.
         */
        from(table) {
            const url = `${this.url}/${table}`;
            return new PostgrestQueryBuilder(url, {
                headers: this.headers,
                schema: this.schema,
                fetch: this.fetch,
            });
        }
        /**
         * Perform a function call.
         *
         * @param fn  The function name to call.
         * @param params  The parameters to pass to the function call.
         * @param head  When set to true, no data will be returned.
         * @param count  Count algorithm to use to count rows in a table.
         */
        rpc(fn, params, { head = false, count = null, } = {}) {
            const url = `${this.url}/rpc/${fn}`;
            return new PostgrestRpcBuilder(url, {
                headers: this.headers,
                schema: this.schema,
                fetch: this.fetch,
            }).rpc(params, { head, count });
        }
    }

    /**
     * Helpers to convert the change Payload into native JS types.
     */
    // Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
    // 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
    var PostgresTypes;
    (function (PostgresTypes) {
        PostgresTypes["abstime"] = "abstime";
        PostgresTypes["bool"] = "bool";
        PostgresTypes["date"] = "date";
        PostgresTypes["daterange"] = "daterange";
        PostgresTypes["float4"] = "float4";
        PostgresTypes["float8"] = "float8";
        PostgresTypes["int2"] = "int2";
        PostgresTypes["int4"] = "int4";
        PostgresTypes["int4range"] = "int4range";
        PostgresTypes["int8"] = "int8";
        PostgresTypes["int8range"] = "int8range";
        PostgresTypes["json"] = "json";
        PostgresTypes["jsonb"] = "jsonb";
        PostgresTypes["money"] = "money";
        PostgresTypes["numeric"] = "numeric";
        PostgresTypes["oid"] = "oid";
        PostgresTypes["reltime"] = "reltime";
        PostgresTypes["text"] = "text";
        PostgresTypes["time"] = "time";
        PostgresTypes["timestamp"] = "timestamp";
        PostgresTypes["timestamptz"] = "timestamptz";
        PostgresTypes["timetz"] = "timetz";
        PostgresTypes["tsrange"] = "tsrange";
        PostgresTypes["tstzrange"] = "tstzrange";
    })(PostgresTypes || (PostgresTypes = {}));
    /**
     * Takes an array of columns and an object of string values then converts each string value
     * to its mapped type.
     *
     * @param {{name: String, type: String}[]} columns
     * @param {Object} record
     * @param {Object} options The map of various options that can be applied to the mapper
     * @param {Array} options.skipTypes The array of types that should not be converted
     *
     * @example convertChangeData([{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age:'33'}, {})
     * //=>{ first_name: 'Paul', age: 33 }
     */
    const convertChangeData = (columns, record, options = {}) => {
        var _a;
        const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
        return Object.keys(record).reduce((acc, rec_key) => {
            acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
            return acc;
        }, {});
    };
    /**
     * Converts the value of an individual column.
     *
     * @param {String} columnName The column that you want to convert
     * @param {{name: String, type: String}[]} columns All of the columns
     * @param {Object} record The map of string values
     * @param {Array} skipTypes An array of types that should not be converted
     * @return {object} Useless information
     *
     * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, [])
     * //=> 33
     * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, ['int4'])
     * //=> "33"
     */
    const convertColumn = (columnName, columns, record, skipTypes) => {
        const column = columns.find((x) => x.name === columnName);
        const colType = column === null || column === void 0 ? void 0 : column.type;
        const value = record[columnName];
        if (colType && !skipTypes.includes(colType)) {
            return convertCell(colType, value);
        }
        return noop$1(value);
    };
    /**
     * If the value of the cell is `null`, returns null.
     * Otherwise converts the string value to the correct type.
     * @param {String} type A postgres column type
     * @param {String} stringValue The cell value
     *
     * @example convertCell('bool', 't')
     * //=> true
     * @example convertCell('int8', '10')
     * //=> 10
     * @example convertCell('_int4', '{1,2,3,4}')
     * //=> [1,2,3,4]
     */
    const convertCell = (type, value) => {
        // if data type is an array
        if (type.charAt(0) === '_') {
            const dataType = type.slice(1, type.length);
            return toArray(value, dataType);
        }
        // If not null, convert to correct type.
        switch (type) {
            case PostgresTypes.bool:
                return toBoolean(value);
            case PostgresTypes.float4:
            case PostgresTypes.float8:
            case PostgresTypes.int2:
            case PostgresTypes.int4:
            case PostgresTypes.int8:
            case PostgresTypes.numeric:
            case PostgresTypes.oid:
                return toNumber(value);
            case PostgresTypes.json:
            case PostgresTypes.jsonb:
                return toJson(value);
            case PostgresTypes.timestamp:
                return toTimestampString(value); // Format to be consistent with PostgREST
            case PostgresTypes.abstime: // To allow users to cast it based on Timezone
            case PostgresTypes.date: // To allow users to cast it based on Timezone
            case PostgresTypes.daterange:
            case PostgresTypes.int4range:
            case PostgresTypes.int8range:
            case PostgresTypes.money:
            case PostgresTypes.reltime: // To allow users to cast it based on Timezone
            case PostgresTypes.text:
            case PostgresTypes.time: // To allow users to cast it based on Timezone
            case PostgresTypes.timestamptz: // To allow users to cast it based on Timezone
            case PostgresTypes.timetz: // To allow users to cast it based on Timezone
            case PostgresTypes.tsrange:
            case PostgresTypes.tstzrange:
                return noop$1(value);
            default:
                // Return the value for remaining types
                return noop$1(value);
        }
    };
    const noop$1 = (value) => {
        return value;
    };
    const toBoolean = (value) => {
        switch (value) {
            case 't':
                return true;
            case 'f':
                return false;
            default:
                return value;
        }
    };
    const toNumber = (value) => {
        if (typeof value === 'string') {
            const parsedValue = parseFloat(value);
            if (!Number.isNaN(parsedValue)) {
                return parsedValue;
            }
        }
        return value;
    };
    const toJson = (value) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch (error) {
                console.log(`JSON parse error: ${error}`);
                return value;
            }
        }
        return value;
    };
    /**
     * Converts a Postgres Array into a native JS array
     *
     * @example toArray('{}', 'int4')
     * //=> []
     * @example toArray('{"[2021-01-01,2021-12-31)","(2021-01-01,2021-12-32]"}', 'daterange')
     * //=> ['[2021-01-01,2021-12-31)', '(2021-01-01,2021-12-32]']
     * @example toArray([1,2,3,4], 'int4')
     * //=> [1,2,3,4]
     */
    const toArray = (value, type) => {
        if (typeof value !== 'string') {
            return value;
        }
        const lastIdx = value.length - 1;
        const closeBrace = value[lastIdx];
        const openBrace = value[0];
        // Confirm value is a Postgres array by checking curly brackets
        if (openBrace === '{' && closeBrace === '}') {
            let arr;
            const valTrim = value.slice(1, lastIdx);
            // TODO: find a better solution to separate Postgres array data
            try {
                arr = JSON.parse('[' + valTrim + ']');
            }
            catch (_) {
                // WARNING: splitting on comma does not cover all edge cases
                arr = valTrim ? valTrim.split(',') : [];
            }
            return arr.map((val) => convertCell(type, val));
        }
        return value;
    };
    /**
     * Fixes timestamp to be ISO-8601. Swaps the space between the date and time for a 'T'
     * See https://github.com/supabase/supabase/issues/18
     *
     * @example toTimestampString('2019-09-10 00:00:00')
     * //=> '2019-09-10T00:00:00'
     */
    const toTimestampString = (value) => {
        if (typeof value === 'string') {
            return value.replace(' ', 'T');
        }
        return value;
    };

    // generated by genversion
    const version$3 = '1.3.4';

    const DEFAULT_HEADERS$1 = { 'X-Client-Info': `realtime-js/${version$3}` };
    const VSN = '1.0.0';
    const DEFAULT_TIMEOUT = 10000;
    const WS_CLOSE_NORMAL = 1000;
    var SOCKET_STATES;
    (function (SOCKET_STATES) {
        SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
        SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
        SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
        SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
    })(SOCKET_STATES || (SOCKET_STATES = {}));
    var CHANNEL_STATES;
    (function (CHANNEL_STATES) {
        CHANNEL_STATES["closed"] = "closed";
        CHANNEL_STATES["errored"] = "errored";
        CHANNEL_STATES["joined"] = "joined";
        CHANNEL_STATES["joining"] = "joining";
        CHANNEL_STATES["leaving"] = "leaving";
    })(CHANNEL_STATES || (CHANNEL_STATES = {}));
    var CHANNEL_EVENTS;
    (function (CHANNEL_EVENTS) {
        CHANNEL_EVENTS["close"] = "phx_close";
        CHANNEL_EVENTS["error"] = "phx_error";
        CHANNEL_EVENTS["join"] = "phx_join";
        CHANNEL_EVENTS["reply"] = "phx_reply";
        CHANNEL_EVENTS["leave"] = "phx_leave";
        CHANNEL_EVENTS["access_token"] = "access_token";
    })(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
    var TRANSPORTS;
    (function (TRANSPORTS) {
        TRANSPORTS["websocket"] = "websocket";
    })(TRANSPORTS || (TRANSPORTS = {}));

    /**
     * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
     *
     * @example
     *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
     *      return [1000, 5000, 10000][tries - 1] || 10000
     *    })
     *    reconnectTimer.scheduleTimeout() // fires after 1000
     *    reconnectTimer.scheduleTimeout() // fires after 5000
     *    reconnectTimer.reset()
     *    reconnectTimer.scheduleTimeout() // fires after 1000
     */
    class Timer {
        constructor(callback, timerCalc) {
            this.callback = callback;
            this.timerCalc = timerCalc;
            this.timer = undefined;
            this.tries = 0;
            this.callback = callback;
            this.timerCalc = timerCalc;
        }
        reset() {
            this.tries = 0;
            clearTimeout(this.timer);
        }
        // Cancels any previous scheduleTimeout and schedules callback
        scheduleTimeout() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.tries = this.tries + 1;
                this.callback();
            }, this.timerCalc(this.tries + 1));
        }
    }

    class Push {
        /**
         * Initializes the Push
         *
         * @param channel The Channel
         * @param event The event, for example `"phx_join"`
         * @param payload The payload, for example `{user_id: 123}`
         * @param timeout The push timeout in milliseconds
         */
        constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
            this.channel = channel;
            this.event = event;
            this.payload = payload;
            this.timeout = timeout;
            this.sent = false;
            this.timeoutTimer = undefined;
            this.ref = '';
            this.receivedResp = null;
            this.recHooks = [];
            this.refEvent = null;
        }
        resend(timeout) {
            this.timeout = timeout;
            this._cancelRefEvent();
            this.ref = '';
            this.refEvent = null;
            this.receivedResp = null;
            this.sent = false;
            this.send();
        }
        send() {
            if (this._hasReceived('timeout')) {
                return;
            }
            this.startTimeout();
            this.sent = true;
            this.channel.socket.push({
                topic: this.channel.topic,
                event: this.event,
                payload: this.payload,
                ref: this.ref,
            });
        }
        updatePayload(payload) {
            this.payload = Object.assign(Object.assign({}, this.payload), payload);
        }
        receive(status, callback) {
            var _a;
            if (this._hasReceived(status)) {
                callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
            }
            this.recHooks.push({ status, callback });
            return this;
        }
        startTimeout() {
            if (this.timeoutTimer) {
                return;
            }
            this.ref = this.channel.socket.makeRef();
            this.refEvent = this.channel.replyEventName(this.ref);
            this.channel.on(this.refEvent, (payload) => {
                this._cancelRefEvent();
                this._cancelTimeout();
                this.receivedResp = payload;
                this._matchReceive(payload);
            });
            this.timeoutTimer = setTimeout(() => {
                this.trigger('timeout', {});
            }, this.timeout);
        }
        trigger(status, response) {
            if (this.refEvent)
                this.channel.trigger(this.refEvent, { status, response });
        }
        destroy() {
            this._cancelRefEvent();
            this._cancelTimeout();
        }
        _cancelRefEvent() {
            if (!this.refEvent) {
                return;
            }
            this.channel.off(this.refEvent);
        }
        _cancelTimeout() {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = undefined;
        }
        _matchReceive({ status, response, }) {
            this.recHooks
                .filter((h) => h.status === status)
                .forEach((h) => h.callback(response));
        }
        _hasReceived(status) {
            return this.receivedResp && this.receivedResp.status === status;
        }
    }

    class RealtimeSubscription {
        constructor(topic, params = {}, socket) {
            this.topic = topic;
            this.params = params;
            this.socket = socket;
            this.bindings = [];
            this.state = CHANNEL_STATES.closed;
            this.joinedOnce = false;
            this.pushBuffer = [];
            this.timeout = this.socket.timeout;
            this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
            this.rejoinTimer = new Timer(() => this.rejoinUntilConnected(), this.socket.reconnectAfterMs);
            this.joinPush.receive('ok', () => {
                this.state = CHANNEL_STATES.joined;
                this.rejoinTimer.reset();
                this.pushBuffer.forEach((pushEvent) => pushEvent.send());
                this.pushBuffer = [];
            });
            this.onClose(() => {
                this.rejoinTimer.reset();
                this.socket.log('channel', `close ${this.topic} ${this.joinRef()}`);
                this.state = CHANNEL_STATES.closed;
                this.socket.remove(this);
            });
            this.onError((reason) => {
                if (this.isLeaving() || this.isClosed()) {
                    return;
                }
                this.socket.log('channel', `error ${this.topic}`, reason);
                this.state = CHANNEL_STATES.errored;
                this.rejoinTimer.scheduleTimeout();
            });
            this.joinPush.receive('timeout', () => {
                if (!this.isJoining()) {
                    return;
                }
                this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout);
                this.state = CHANNEL_STATES.errored;
                this.rejoinTimer.scheduleTimeout();
            });
            this.on(CHANNEL_EVENTS.reply, (payload, ref) => {
                this.trigger(this.replyEventName(ref), payload);
            });
        }
        rejoinUntilConnected() {
            this.rejoinTimer.scheduleTimeout();
            if (this.socket.isConnected()) {
                this.rejoin();
            }
        }
        subscribe(timeout = this.timeout) {
            if (this.joinedOnce) {
                throw `tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance`;
            }
            else {
                this.joinedOnce = true;
                this.rejoin(timeout);
                return this.joinPush;
            }
        }
        onClose(callback) {
            this.on(CHANNEL_EVENTS.close, callback);
        }
        onError(callback) {
            this.on(CHANNEL_EVENTS.error, (reason) => callback(reason));
        }
        on(event, callback) {
            this.bindings.push({ event, callback });
        }
        off(event) {
            this.bindings = this.bindings.filter((bind) => bind.event !== event);
        }
        canPush() {
            return this.socket.isConnected() && this.isJoined();
        }
        push(event, payload, timeout = this.timeout) {
            if (!this.joinedOnce) {
                throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
            }
            let pushEvent = new Push(this, event, payload, timeout);
            if (this.canPush()) {
                pushEvent.send();
            }
            else {
                pushEvent.startTimeout();
                this.pushBuffer.push(pushEvent);
            }
            return pushEvent;
        }
        updateJoinPayload(payload) {
            this.joinPush.updatePayload(payload);
        }
        /**
         * Leaves the channel
         *
         * Unsubscribes from server events, and instructs channel to terminate on server.
         * Triggers onClose() hooks.
         *
         * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
         * channel.unsubscribe().receive("ok", () => alert("left!") )
         */
        unsubscribe(timeout = this.timeout) {
            this.state = CHANNEL_STATES.leaving;
            let onClose = () => {
                this.socket.log('channel', `leave ${this.topic}`);
                this.trigger(CHANNEL_EVENTS.close, 'leave', this.joinRef());
            };
            // Destroy joinPush to avoid connection timeouts during unscription phase
            this.joinPush.destroy();
            let leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
            leavePush.receive('ok', () => onClose()).receive('timeout', () => onClose());
            leavePush.send();
            if (!this.canPush()) {
                leavePush.trigger('ok', {});
            }
            return leavePush;
        }
        /**
         * Overridable message hook
         *
         * Receives all events for specialized message handling before dispatching to the channel callbacks.
         * Must return the payload, modified or unmodified.
         */
        onMessage(event, payload, ref) {
            return payload;
        }
        isMember(topic) {
            return this.topic === topic;
        }
        joinRef() {
            return this.joinPush.ref;
        }
        sendJoin(timeout) {
            this.state = CHANNEL_STATES.joining;
            this.joinPush.resend(timeout);
        }
        rejoin(timeout = this.timeout) {
            if (this.isLeaving()) {
                return;
            }
            this.sendJoin(timeout);
        }
        trigger(event, payload, ref) {
            let { close, error, leave, join } = CHANNEL_EVENTS;
            let events = [close, error, leave, join];
            if (ref && events.indexOf(event) >= 0 && ref !== this.joinRef()) {
                return;
            }
            let handledPayload = this.onMessage(event, payload, ref);
            if (payload && !handledPayload) {
                throw 'channel onMessage callbacks must return the payload, modified or unmodified';
            }
            this.bindings
                .filter((bind) => {
                // Bind all events if the user specifies a wildcard.
                if (bind.event === '*') {
                    return event === (payload === null || payload === void 0 ? void 0 : payload.type);
                }
                else {
                    return bind.event === event;
                }
            })
                .map((bind) => bind.callback(handledPayload, ref));
        }
        replyEventName(ref) {
            return `chan_reply_${ref}`;
        }
        isClosed() {
            return this.state === CHANNEL_STATES.closed;
        }
        isErrored() {
            return this.state === CHANNEL_STATES.errored;
        }
        isJoined() {
            return this.state === CHANNEL_STATES.joined;
        }
        isJoining() {
            return this.state === CHANNEL_STATES.joining;
        }
        isLeaving() {
            return this.state === CHANNEL_STATES.leaving;
        }
    }

    var naiveFallback = function () {
    	if (typeof self === "object" && self) return self;
    	if (typeof window === "object" && window) return window;
    	throw new Error("Unable to resolve global `this`");
    };

    var global$1 = (function () {
    	if (this) return this;

    	// Unexpected strict mode (may happen if e.g. bundled into ESM module)

    	// Fallback to standard globalThis if available
    	if (typeof globalThis === "object" && globalThis) return globalThis;

    	// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
    	// In all ES5+ engines global object inherits from Object.prototype
    	// (if you approached one that doesn't please report)
    	try {
    		Object.defineProperty(Object.prototype, "__global__", {
    			get: function () { return this; },
    			configurable: true
    		});
    	} catch (error) {
    		// Unfortunate case of updates to Object.prototype being restricted
    		// via preventExtensions, seal or freeze
    		return naiveFallback();
    	}
    	try {
    		// Safari case (window.__global__ works, but __global__ does not)
    		if (!__global__) return naiveFallback();
    		return __global__;
    	} finally {
    		delete Object.prototype.__global__;
    	}
    })();

    var name = "websocket";
    var description = "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.";
    var keywords = [
    	"websocket",
    	"websockets",
    	"socket",
    	"networking",
    	"comet",
    	"push",
    	"RFC-6455",
    	"realtime",
    	"server",
    	"client"
    ];
    var author = "Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)";
    var contributors = [
    	"Iñaki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"
    ];
    var version$2 = "1.0.34";
    var repository = {
    	type: "git",
    	url: "https://github.com/theturtle32/WebSocket-Node.git"
    };
    var homepage = "https://github.com/theturtle32/WebSocket-Node";
    var engines = {
    	node: ">=4.0.0"
    };
    var dependencies = {
    	bufferutil: "^4.0.1",
    	debug: "^2.2.0",
    	"es5-ext": "^0.10.50",
    	"typedarray-to-buffer": "^3.1.5",
    	"utf-8-validate": "^5.0.2",
    	yaeti: "^0.0.6"
    };
    var devDependencies = {
    	"buffer-equal": "^1.0.0",
    	gulp: "^4.0.2",
    	"gulp-jshint": "^2.0.4",
    	"jshint-stylish": "^2.2.1",
    	jshint: "^2.0.0",
    	tape: "^4.9.1"
    };
    var config = {
    	verbose: false
    };
    var scripts = {
    	test: "tape test/unit/*.js",
    	gulp: "gulp"
    };
    var main = "index";
    var directories = {
    	lib: "./lib"
    };
    var browser$1 = "lib/browser.js";
    var license = "Apache-2.0";
    var require$$0 = {
    	name: name,
    	description: description,
    	keywords: keywords,
    	author: author,
    	contributors: contributors,
    	version: version$2,
    	repository: repository,
    	homepage: homepage,
    	engines: engines,
    	dependencies: dependencies,
    	devDependencies: devDependencies,
    	config: config,
    	scripts: scripts,
    	main: main,
    	directories: directories,
    	browser: browser$1,
    	license: license
    };

    var version$1 = require$$0.version;

    var _globalThis;
    if (typeof globalThis === 'object') {
    	_globalThis = globalThis;
    } else {
    	try {
    		_globalThis = global$1;
    	} catch (error) {
    	} finally {
    		if (!_globalThis && typeof window !== 'undefined') { _globalThis = window; }
    		if (!_globalThis) { throw new Error('Could not determine global this'); }
    	}
    }

    var NativeWebSocket = _globalThis.WebSocket || _globalThis.MozWebSocket;



    /**
     * Expose a W3C WebSocket class with just one or two arguments.
     */
    function W3CWebSocket(uri, protocols) {
    	var native_instance;

    	if (protocols) {
    		native_instance = new NativeWebSocket(uri, protocols);
    	}
    	else {
    		native_instance = new NativeWebSocket(uri);
    	}

    	/**
    	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
    	 * class). Since it is an Object it will be returned as it is when creating an
    	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
    	 *
    	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
    	 */
    	return native_instance;
    }
    if (NativeWebSocket) {
    	['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function(prop) {
    		Object.defineProperty(W3CWebSocket, prop, {
    			get: function() { return NativeWebSocket[prop]; }
    		});
    	});
    }

    /**
     * Module exports.
     */
    var browser = {
        'w3cwebsocket' : NativeWebSocket ? W3CWebSocket : null,
        'version'      : version$1
    };

    // This file draws heavily from https://github.com/phoenixframework/phoenix/commit/cf098e9cf7a44ee6479d31d911a97d3c7430c6fe
    // License: https://github.com/phoenixframework/phoenix/blob/master/LICENSE.md
    class Serializer {
        constructor() {
            this.HEADER_LENGTH = 1;
        }
        decode(rawPayload, callback) {
            if (rawPayload.constructor === ArrayBuffer) {
                return callback(this._binaryDecode(rawPayload));
            }
            if (typeof rawPayload === 'string') {
                return callback(JSON.parse(rawPayload));
            }
            return callback({});
        }
        _binaryDecode(buffer) {
            const view = new DataView(buffer);
            const decoder = new TextDecoder();
            return this._decodeBroadcast(buffer, view, decoder);
        }
        _decodeBroadcast(buffer, view, decoder) {
            const topicSize = view.getUint8(1);
            const eventSize = view.getUint8(2);
            let offset = this.HEADER_LENGTH + 2;
            const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
            offset = offset + topicSize;
            const event = decoder.decode(buffer.slice(offset, offset + eventSize));
            offset = offset + eventSize;
            const data = JSON.parse(decoder.decode(buffer.slice(offset, buffer.byteLength)));
            return { ref: null, topic: topic, event: event, payload: data };
        }
    }

    var __awaiter$4 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const noop = () => { };
    class RealtimeClient {
        /**
         * Initializes the Socket
         *
         * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
         * @param options.transport The Websocket Transport, for example WebSocket.
         * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
         * @param options.params The optional params to pass when connecting.
         * @param options.headers The optional headers to pass when connecting.
         * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
         * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
         * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
         * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
         * @param options.longpollerTimeout The maximum timeout of a long poll AJAX request. Defaults to 20s (double the server long poll timer).
         * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
         */
        constructor(endPoint, options) {
            this.accessToken = null;
            this.channels = [];
            this.endPoint = '';
            this.headers = DEFAULT_HEADERS$1;
            this.params = {};
            this.timeout = DEFAULT_TIMEOUT;
            this.transport = browser.w3cwebsocket;
            this.heartbeatIntervalMs = 30000;
            this.longpollerTimeout = 20000;
            this.heartbeatTimer = undefined;
            this.pendingHeartbeatRef = null;
            this.ref = 0;
            this.logger = noop;
            this.conn = null;
            this.sendBuffer = [];
            this.serializer = new Serializer();
            this.stateChangeCallbacks = {
                open: [],
                close: [],
                error: [],
                message: [],
            };
            this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
            if (options === null || options === void 0 ? void 0 : options.params)
                this.params = options.params;
            if (options === null || options === void 0 ? void 0 : options.headers)
                this.headers = Object.assign(Object.assign({}, this.headers), options.headers);
            if (options === null || options === void 0 ? void 0 : options.timeout)
                this.timeout = options.timeout;
            if (options === null || options === void 0 ? void 0 : options.logger)
                this.logger = options.logger;
            if (options === null || options === void 0 ? void 0 : options.transport)
                this.transport = options.transport;
            if (options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs)
                this.heartbeatIntervalMs = options.heartbeatIntervalMs;
            if (options === null || options === void 0 ? void 0 : options.longpollerTimeout)
                this.longpollerTimeout = options.longpollerTimeout;
            this.reconnectAfterMs = (options === null || options === void 0 ? void 0 : options.reconnectAfterMs)
                ? options.reconnectAfterMs
                : (tries) => {
                    return [1000, 2000, 5000, 10000][tries - 1] || 10000;
                };
            this.encode = (options === null || options === void 0 ? void 0 : options.encode)
                ? options.encode
                : (payload, callback) => {
                    return callback(JSON.stringify(payload));
                };
            this.decode = (options === null || options === void 0 ? void 0 : options.decode)
                ? options.decode
                : this.serializer.decode.bind(this.serializer);
            this.reconnectTimer = new Timer(() => __awaiter$4(this, void 0, void 0, function* () {
                yield this.disconnect();
                this.connect();
            }), this.reconnectAfterMs);
        }
        /**
         * Connects the socket.
         */
        connect() {
            if (this.conn) {
                return;
            }
            this.conn = new this.transport(this.endPointURL(), [], null, this.headers);
            if (this.conn) {
                // this.conn.timeout = this.longpollerTimeout // TYPE ERROR
                this.conn.binaryType = 'arraybuffer';
                this.conn.onopen = () => this._onConnOpen();
                this.conn.onerror = (error) => this._onConnError(error);
                this.conn.onmessage = (event) => this.onConnMessage(event);
                this.conn.onclose = (event) => this._onConnClose(event);
            }
        }
        /**
         * Disconnects the socket.
         *
         * @param code A numeric status code to send on disconnect.
         * @param reason A custom reason for the disconnect.
         */
        disconnect(code, reason) {
            return new Promise((resolve, _reject) => {
                try {
                    if (this.conn) {
                        this.conn.onclose = function () { }; // noop
                        if (code) {
                            this.conn.close(code, reason || '');
                        }
                        else {
                            this.conn.close();
                        }
                        this.conn = null;
                        // remove open handles
                        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
                        this.reconnectTimer.reset();
                    }
                    resolve({ error: null, data: true });
                }
                catch (error) {
                    resolve({ error: error, data: false });
                }
            });
        }
        /**
         * Logs the message. Override `this.logger` for specialized logging.
         */
        log(kind, msg, data) {
            this.logger(kind, msg, data);
        }
        /**
         * Registers a callback for connection state change event.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onOpen(() => console.log("Socket opened."))
         */
        onOpen(callback) {
            this.stateChangeCallbacks.open.push(callback);
        }
        /**
         * Registers a callbacks for connection state change events.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onOpen(() => console.log("Socket closed."))
         */
        onClose(callback) {
            this.stateChangeCallbacks.close.push(callback);
        }
        /**
         * Registers a callback for connection state change events.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onOpen((error) => console.log("An error occurred"))
         */
        onError(callback) {
            this.stateChangeCallbacks.error.push(callback);
        }
        /**
         * Calls a function any time a message is received.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onMessage((message) => console.log(message))
         */
        onMessage(callback) {
            this.stateChangeCallbacks.message.push(callback);
        }
        /**
         * Returns the current state of the socket.
         */
        connectionState() {
            switch (this.conn && this.conn.readyState) {
                case SOCKET_STATES.connecting:
                    return 'connecting';
                case SOCKET_STATES.open:
                    return 'open';
                case SOCKET_STATES.closing:
                    return 'closing';
                default:
                    return 'closed';
            }
        }
        /**
         * Retuns `true` is the connection is open.
         */
        isConnected() {
            return this.connectionState() === 'open';
        }
        /**
         * Removes a subscription from the socket.
         *
         * @param channel An open subscription.
         */
        remove(channel) {
            this.channels = this.channels.filter((c) => c.joinRef() !== channel.joinRef());
        }
        channel(topic, chanParams = {}) {
            let chan = new RealtimeSubscription(topic, chanParams, this);
            this.channels.push(chan);
            return chan;
        }
        push(data) {
            let { topic, event, payload, ref } = data;
            let callback = () => {
                this.encode(data, (result) => {
                    var _a;
                    (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
                });
            };
            this.log('push', `${topic} ${event} (${ref})`, payload);
            if (this.isConnected()) {
                callback();
            }
            else {
                this.sendBuffer.push(callback);
            }
        }
        onConnMessage(rawMessage) {
            this.decode(rawMessage.data, (msg) => {
                let { topic, event, payload, ref } = msg;
                if (ref && ref === this.pendingHeartbeatRef) {
                    this.pendingHeartbeatRef = null;
                }
                else if (event === (payload === null || payload === void 0 ? void 0 : payload.type)) {
                    this._resetHeartbeat();
                }
                this.log('receive', `${payload.status || ''} ${topic} ${event} ${(ref && '(' + ref + ')') || ''}`, payload);
                this.channels
                    .filter((channel) => channel.isMember(topic))
                    .forEach((channel) => channel.trigger(event, payload, ref));
                this.stateChangeCallbacks.message.forEach((callback) => callback(msg));
            });
        }
        /**
         * Returns the URL of the websocket.
         */
        endPointURL() {
            return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: VSN }));
        }
        /**
         * Return the next message ref, accounting for overflows
         */
        makeRef() {
            let newRef = this.ref + 1;
            if (newRef === this.ref) {
                this.ref = 0;
            }
            else {
                this.ref = newRef;
            }
            return this.ref.toString();
        }
        /**
         * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
         *
         * @param token A JWT string.
         */
        setAuth(token) {
            this.accessToken = token;
            try {
                this.channels.forEach((channel) => {
                    token && channel.updateJoinPayload({ user_token: token });
                    if (channel.joinedOnce && channel.isJoined()) {
                        channel.push(CHANNEL_EVENTS.access_token, { access_token: token });
                    }
                });
            }
            catch (error) {
                console.log('setAuth error', error);
            }
        }
        _onConnOpen() {
            this.log('transport', `connected to ${this.endPointURL()}`);
            this._flushSendBuffer();
            this.reconnectTimer.reset();
            this._resetHeartbeat();
            this.stateChangeCallbacks.open.forEach((callback) => callback());
        }
        _onConnClose(event) {
            this.log('transport', 'close', event);
            this._triggerChanError();
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.reconnectTimer.scheduleTimeout();
            this.stateChangeCallbacks.close.forEach((callback) => callback(event));
        }
        _onConnError(error) {
            this.log('transport', error.message);
            this._triggerChanError();
            this.stateChangeCallbacks.error.forEach((callback) => callback(error));
        }
        _triggerChanError() {
            this.channels.forEach((channel) => channel.trigger(CHANNEL_EVENTS.error));
        }
        _appendParams(url, params) {
            if (Object.keys(params).length === 0) {
                return url;
            }
            const prefix = url.match(/\?/) ? '&' : '?';
            const query = new URLSearchParams(params);
            return `${url}${prefix}${query}`;
        }
        _flushSendBuffer() {
            if (this.isConnected() && this.sendBuffer.length > 0) {
                this.sendBuffer.forEach((callback) => callback());
                this.sendBuffer = [];
            }
        }
        _resetHeartbeat() {
            this.pendingHeartbeatRef = null;
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = setInterval(() => this._sendHeartbeat(), this.heartbeatIntervalMs);
        }
        _sendHeartbeat() {
            var _a;
            if (!this.isConnected()) {
                return;
            }
            if (this.pendingHeartbeatRef) {
                this.pendingHeartbeatRef = null;
                this.log('transport', 'heartbeat timeout. Attempting to re-establish connection');
                (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, 'hearbeat timeout');
                return;
            }
            this.pendingHeartbeatRef = this.makeRef();
            this.push({
                topic: 'phoenix',
                event: 'heartbeat',
                payload: {},
                ref: this.pendingHeartbeatRef,
            });
            this.setAuth(this.accessToken);
        }
    }

    class SupabaseRealtimeClient {
        constructor(socket, headers, schema, tableName) {
            const chanParams = {};
            const topic = tableName === '*' ? `realtime:${schema}` : `realtime:${schema}:${tableName}`;
            const userToken = headers['Authorization'].split(' ')[1];
            if (userToken) {
                chanParams['user_token'] = userToken;
            }
            this.subscription = socket.channel(topic, chanParams);
        }
        getPayloadRecords(payload) {
            const records = {
                new: {},
                old: {},
            };
            if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
                records.new = convertChangeData(payload.columns, payload.record);
            }
            if (payload.type === 'UPDATE' || payload.type === 'DELETE') {
                records.old = convertChangeData(payload.columns, payload.old_record);
            }
            return records;
        }
        /**
         * The event you want to listen to.
         *
         * @param event The event
         * @param callback A callback function that is called whenever the event occurs.
         */
        on(event, callback) {
            this.subscription.on(event, (payload) => {
                let enrichedPayload = {
                    schema: payload.schema,
                    table: payload.table,
                    commit_timestamp: payload.commit_timestamp,
                    eventType: payload.type,
                    new: {},
                    old: {},
                    errors: payload.errors,
                };
                enrichedPayload = Object.assign(Object.assign({}, enrichedPayload), this.getPayloadRecords(payload));
                callback(enrichedPayload);
            });
            return this;
        }
        /**
         * Enables the subscription.
         */
        subscribe(callback = () => { }) {
            this.subscription.onError((e) => callback('SUBSCRIPTION_ERROR', e));
            this.subscription.onClose(() => callback('CLOSED'));
            this.subscription
                .subscribe()
                .receive('ok', () => callback('SUBSCRIBED'))
                .receive('error', (e) => callback('SUBSCRIPTION_ERROR', e))
                .receive('timeout', () => callback('RETRYING_AFTER_TIMEOUT'));
            return this.subscription;
        }
    }

    class SupabaseQueryBuilder extends PostgrestQueryBuilder {
        constructor(url, { headers = {}, schema, realtime, table, fetch, }) {
            super(url, { headers, schema, fetch });
            this._subscription = null;
            this._realtime = realtime;
            this._headers = headers;
            this._schema = schema;
            this._table = table;
        }
        /**
         * Subscribe to realtime changes in your database.
         * @param event The database event which you would like to receive updates for, or you can use the special wildcard `*` to listen to all changes.
         * @param callback A callback that will handle the payload that is sent whenever your database changes.
         */
        on(event, callback) {
            if (!this._realtime.isConnected()) {
                this._realtime.connect();
            }
            if (!this._subscription) {
                this._subscription = new SupabaseRealtimeClient(this._realtime, this._headers, this._schema, this._table);
            }
            return this._subscription.on(event, callback);
        }
    }

    var __awaiter$3 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    const handleError = (error, reject) => {
        if (typeof error.json !== 'function') {
            return reject(error);
        }
        error.json().then((err) => {
            return reject({
                message: _getErrorMessage(err),
                status: (error === null || error === void 0 ? void 0 : error.status) || 500,
            });
        });
    };
    const _getRequestParams = (method, options, parameters, body) => {
        const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
        if (method === 'GET') {
            return params;
        }
        params.headers = Object.assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
        return Object.assign(Object.assign({}, params), parameters);
    };
    function _handleRequest(fetcher = fetch$1, method, url, options, parameters, body) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fetcher(url, _getRequestParams(method, options, parameters, body))
                    .then((result) => {
                    if (!result.ok)
                        throw result;
                    if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                        return resolve(result);
                    return result.json();
                })
                    .then((data) => resolve(data))
                    .catch((error) => handleError(error, reject));
            });
        });
    }
    function get(fetcher, url, options, parameters) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return _handleRequest(fetcher, 'GET', url, options, parameters);
        });
    }
    function post(fetcher, url, body, options, parameters) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return _handleRequest(fetcher, 'POST', url, options, parameters, body);
        });
    }
    function put(fetcher, url, body, options, parameters) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return _handleRequest(fetcher, 'PUT', url, options, parameters, body);
        });
    }
    function remove(fetcher, url, body, options, parameters) {
        return __awaiter$3(this, void 0, void 0, function* () {
            return _handleRequest(fetcher, 'DELETE', url, options, parameters, body);
        });
    }

    // generated by genversion
    const version = '0.0.0';

    const DEFAULT_HEADERS = { 'X-Client-Info': `storage-js/${version}` };

    var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class StorageBucketApi {
        constructor(url, headers = {}, fetch) {
            this.url = url;
            this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS), headers);
            this.fetch = fetch;
        }
        /**
         * Retrieves the details of all Storage buckets within an existing product.
         */
        listBuckets() {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield get(this.fetch, `${this.url}/bucket`, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Retrieves the details of an existing Storage bucket.
         *
         * @param id The unique identifier of the bucket you would like to retrieve.
         */
        getBucket(id) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield get(this.fetch, `${this.url}/bucket/${id}`, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Creates a new Storage bucket
         *
         * @param id A unique identifier for the bucket you are creating.
         * @returns newly created bucket id
         */
        createBucket(id, options = { public: false }) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/bucket`, { id, name: id, public: options.public }, { headers: this.headers });
                    return { data: data.name, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Updates a new Storage bucket
         *
         * @param id A unique identifier for the bucket you are creating.
         */
        updateBucket(id, options) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield put(this.fetch, `${this.url}/bucket/${id}`, { id, name: id, public: options.public }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Removes all objects inside a single bucket.
         *
         * @param id The unique identifier of the bucket you would like to empty.
         */
        emptyBucket(id) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
         * You must first `empty()` the bucket.
         *
         * @param id The unique identifier of the bucket you would like to delete.
         */
        deleteBucket(id) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const data = yield remove(this.fetch, `${this.url}/bucket/${id}`, {}, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
    }

    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const DEFAULT_SEARCH_OPTIONS = {
        limit: 100,
        offset: 0,
        sortBy: {
            column: 'name',
            order: 'asc',
        },
    };
    const DEFAULT_FILE_OPTIONS = {
        cacheControl: '3600',
        contentType: 'text/plain;charset=UTF-8',
        upsert: false,
    };
    class StorageFileApi {
        constructor(url, headers = {}, bucketId, fetch) {
            this.url = url;
            this.headers = headers;
            this.bucketId = bucketId;
            this.fetch = fetch;
        }
        /**
         * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
         *
         * @param method HTTP method.
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param fileBody The body of the file to be stored in the bucket.
         * @param fileOptions HTTP headers.
         * `cacheControl`: string, the `Cache-Control: max-age=<seconds>` seconds value.
         * `contentType`: string, the `Content-Type` header value. Should be specified if using a `fileBody` that is neither `Blob` nor `File` nor `FormData`, otherwise will default to `text/plain;charset=UTF-8`.
         * `upsert`: boolean, whether to perform an upsert.
         */
        uploadOrUpdate(method, path, fileBody, fileOptions) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    let body;
                    const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
                    const headers = Object.assign(Object.assign({}, this.headers), (method === 'POST' && { 'x-upsert': String(options.upsert) }));
                    if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                        body = new FormData();
                        body.append('cacheControl', options.cacheControl);
                        body.append('', fileBody);
                    }
                    else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                        body = fileBody;
                        body.append('cacheControl', options.cacheControl);
                    }
                    else {
                        body = fileBody;
                        headers['cache-control'] = `max-age=${options.cacheControl}`;
                        headers['content-type'] = options.contentType;
                    }
                    const _path = this._getFinalPath(path);
                    const res = yield fetch$1(`${this.url}/object/${_path}`, {
                        method,
                        body: body,
                        headers,
                    });
                    if (res.ok) {
                        // const data = await res.json()
                        // temporary fix till backend is updated to the latest storage-api version
                        return { data: { Key: _path }, error: null };
                    }
                    else {
                        const error = yield res.json();
                        return { data: null, error };
                    }
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Uploads a file to an existing bucket.
         *
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param fileBody The body of the file to be stored in the bucket.
         * @param fileOptions HTTP headers.
         * `cacheControl`: string, the `Cache-Control: max-age=<seconds>` seconds value.
         * `contentType`: string, the `Content-Type` header value. Should be specified if using a `fileBody` that is neither `Blob` nor `File` nor `FormData`, otherwise will default to `text/plain;charset=UTF-8`.
         * `upsert`: boolean, whether to perform an upsert.
         */
        upload(path, fileBody, fileOptions) {
            return __awaiter$1(this, void 0, void 0, function* () {
                return this.uploadOrUpdate('POST', path, fileBody, fileOptions);
            });
        }
        /**
         * Replaces an existing file at the specified path with a new one.
         *
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param fileBody The body of the file to be stored in the bucket.
         * @param fileOptions HTTP headers.
         * `cacheControl`: string, the `Cache-Control: max-age=<seconds>` seconds value.
         * `contentType`: string, the `Content-Type` header value. Should be specified if using a `fileBody` that is neither `Blob` nor `File` nor `FormData`, otherwise will default to `text/plain;charset=UTF-8`.
         * `upsert`: boolean, whether to perform an upsert.
         */
        update(path, fileBody, fileOptions) {
            return __awaiter$1(this, void 0, void 0, function* () {
                return this.uploadOrUpdate('PUT', path, fileBody, fileOptions);
            });
        }
        /**
         * Moves an existing file, optionally renaming it at the same time.
         *
         * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
         * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
         */
        move(fromPath, toPath) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const data = yield post(this.fetch, `${this.url}/object/move`, { bucketId: this.bucketId, sourceKey: fromPath, destinationKey: toPath }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Create signed url to download file without requiring permissions. This URL can be valid for a set number of seconds.
         *
         * @param path The file path to be downloaded, including the current file name. For example `folder/image.png`.
         * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
         */
        createSignedUrl(path, expiresIn) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const _path = this._getFinalPath(path);
                    let data = yield post(this.fetch, `${this.url}/object/sign/${_path}`, { expiresIn }, { headers: this.headers });
                    const signedURL = `${this.url}${data.signedURL}`;
                    data = { signedURL };
                    return { data, error: null, signedURL };
                }
                catch (error) {
                    return { data: null, error, signedURL: null };
                }
            });
        }
        /**
         * Downloads a file.
         *
         * @param path The file path to be downloaded, including the path and file name. For example `folder/image.png`.
         */
        download(path) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const _path = this._getFinalPath(path);
                    const res = yield get(this.fetch, `${this.url}/object/${_path}`, {
                        headers: this.headers,
                        noResolveJson: true,
                    });
                    const data = yield res.blob();
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Retrieve URLs for assets in public buckets
         *
         * @param path The file path to be downloaded, including the path and file name. For example `folder/image.png`.
         */
        getPublicUrl(path) {
            try {
                const _path = this._getFinalPath(path);
                const publicURL = `${this.url}/object/public/${_path}`;
                const data = { publicURL };
                return { data, error: null, publicURL };
            }
            catch (error) {
                return { data: null, error, publicURL: null };
            }
        }
        /**
         * Deletes files within the same bucket
         *
         * @param paths An array of files to be deletes, including the path and file name. For example [`folder/image.png`].
         */
        remove(paths) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const data = yield remove(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Get file metadata
         * @param id the file id to retrieve metadata
         */
        // async getMetadata(id: string): Promise<{ data: Metadata | null; error: Error | null }> {
        //   try {
        //     const data = await get(`${this.url}/metadata/${id}`, { headers: this.headers })
        //     return { data, error: null }
        //   } catch (error) {
        //     return { data: null, error }
        //   }
        // }
        /**
         * Update file metadata
         * @param id the file id to update metadata
         * @param meta the new file metadata
         */
        // async updateMetadata(
        //   id: string,
        //   meta: Metadata
        // ): Promise<{ data: Metadata | null; error: Error | null }> {
        //   try {
        //     const data = await post(`${this.url}/metadata/${id}`, { ...meta }, { headers: this.headers })
        //     return { data, error: null }
        //   } catch (error) {
        //     return { data: null, error }
        //   }
        // }
        /**
         * Lists all the files within a bucket.
         * @param path The folder path.
         * @param options Search options, including `limit`, `offset`, and `sortBy`.
         * @param parameters Fetch parameters, currently only supports `signal`, which is an AbortController's signal
         */
        list(path, options, parameters) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || '' });
                    const data = yield post(this.fetch, `${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        _getFinalPath(path) {
            return `${this.bucketId}/${path}`;
        }
    }

    class SupabaseStorageClient extends StorageBucketApi {
        constructor(url, headers = {}, fetch) {
            super(url, headers, fetch);
        }
        /**
         * Perform file operation in a bucket.
         *
         * @param id The bucket id to operate on.
         */
        from(id) {
            return new StorageFileApi(this.url, this.headers, id, this.fetch);
        }
    }

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const DEFAULT_OPTIONS = {
        schema: 'public',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        multiTab: true,
        headers: DEFAULT_HEADERS$4,
    };
    /**
     * Supabase Client.
     *
     * An isomorphic Javascript client for interacting with Postgres.
     */
    class SupabaseClient {
        /**
         * Create a new client for use in the browser.
         * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
         * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
         * @param options.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
         * @param options.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
         * @param options.persistSession Set to "true" if you want to automatically save the user session into local storage.
         * @param options.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
         * @param options.headers Any additional headers to send with each network request.
         * @param options.realtime Options passed along to realtime-js constructor.
         * @param options.multiTab Set to "false" if you want to disable multi-tab/window events.
         * @param options.fetch A custom fetch implementation.
         */
        constructor(supabaseUrl, supabaseKey, options) {
            this.supabaseUrl = supabaseUrl;
            this.supabaseKey = supabaseKey;
            if (!supabaseUrl)
                throw new Error('supabaseUrl is required.');
            if (!supabaseKey)
                throw new Error('supabaseKey is required.');
            supabaseUrl = stripTrailingSlash(supabaseUrl);
            const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
            this.restUrl = `${supabaseUrl}/rest/v1`;
            this.realtimeUrl = `${supabaseUrl}/realtime/v1`.replace('http', 'ws');
            this.authUrl = `${supabaseUrl}/auth/v1`;
            this.storageUrl = `${supabaseUrl}/storage/v1`;
            this.schema = settings.schema;
            this.multiTab = settings.multiTab;
            this.fetch = settings.fetch;
            this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$4), options === null || options === void 0 ? void 0 : options.headers);
            this.auth = this._initSupabaseAuthClient(settings);
            this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers }, settings.realtime));
            this._listenForAuthEvents();
            this._listenForMultiTabEvents();
            // In the future we might allow the user to pass in a logger to receive these events.
            // this.realtime.onOpen(() => console.log('OPEN'))
            // this.realtime.onClose(() => console.log('CLOSED'))
            // this.realtime.onError((e: Error) => console.log('Socket error', e))
        }
        /**
         * Supabase Storage allows you to manage user-generated content, such as photos or videos.
         */
        get storage() {
            return new SupabaseStorageClient(this.storageUrl, this._getAuthHeaders(), this.fetch);
        }
        /**
         * Perform a table operation.
         *
         * @param table The table name to operate on.
         */
        from(table) {
            const url = `${this.restUrl}/${table}`;
            return new SupabaseQueryBuilder(url, {
                headers: this._getAuthHeaders(),
                schema: this.schema,
                realtime: this.realtime,
                table,
                fetch: this.fetch,
            });
        }
        /**
         * Perform a function call.
         *
         * @param fn  The function name to call.
         * @param params  The parameters to pass to the function call.
         * @param head   When set to true, no data will be returned.
         * @param count  Count algorithm to use to count rows in a table.
         *
         */
        rpc(fn, params, { head = false, count = null, } = {}) {
            const rest = this._initPostgRESTClient();
            return rest.rpc(fn, params, { head, count });
        }
        /**
         * Remove all subscriptions.
         */
        removeAllSubscriptions() {
            return __awaiter(this, void 0, void 0, function* () {
                const subscriptions = this.realtime.channels.slice();
                return yield Promise.allSettled(subscriptions.map((sub) => this.removeSubscription(sub)));
            });
        }
        /**
         * Removes an active subscription and returns the number of open connections.
         *
         * @param subscription The subscription you want to remove.
         */
        removeSubscription(subscription) {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this._closeSubscription(subscription);
                    const allSubscriptions = this.getSubscriptions();
                    const openSubscriptionsCount = allSubscriptions.filter((chan) => chan.isJoined()).length;
                    if (!allSubscriptions.length) {
                        const { error } = yield this.realtime.disconnect();
                        if (error)
                            return resolve({ error });
                    }
                    return resolve({ error: null, data: { openSubscriptions: openSubscriptionsCount } });
                }
                catch (error) {
                    return resolve({ error });
                }
            }));
        }
        _closeSubscription(subscription) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!subscription.isClosed()) {
                    yield this._closeChannel(subscription);
                }
                return new Promise((resolve) => {
                    this.realtime.remove(subscription);
                    return resolve(true);
                });
            });
        }
        /**
         * Returns an array of all your subscriptions.
         */
        getSubscriptions() {
            return this.realtime.channels;
        }
        _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, localStorage, headers, fetch, }) {
            const authHeaders = {
                Authorization: `Bearer ${this.supabaseKey}`,
                apikey: `${this.supabaseKey}`,
            };
            return new SupabaseAuthClient({
                url: this.authUrl,
                headers: Object.assign(Object.assign({}, headers), authHeaders),
                autoRefreshToken,
                persistSession,
                detectSessionInUrl,
                localStorage,
                fetch,
            });
        }
        _initRealtimeClient(options) {
            return new RealtimeClient(this.realtimeUrl, Object.assign(Object.assign({}, options), { params: Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.params), { apikey: this.supabaseKey }) }));
        }
        _initPostgRESTClient() {
            return new PostgrestClient(this.restUrl, {
                headers: this._getAuthHeaders(),
                schema: this.schema,
                fetch: this.fetch,
            });
        }
        _getAuthHeaders() {
            var _a, _b;
            const headers = this.headers;
            const authBearer = (_b = (_a = this.auth.session()) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : this.supabaseKey;
            headers['apikey'] = this.supabaseKey;
            headers['Authorization'] = `Bearer ${authBearer}`;
            return headers;
        }
        _closeChannel(subscription) {
            return new Promise((resolve, reject) => {
                subscription
                    .unsubscribe()
                    .receive('ok', () => {
                    return resolve(true);
                })
                    .receive('error', (e) => reject(e));
            });
        }
        _listenForMultiTabEvents() {
            if (!this.multiTab || !isBrowser$1() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
                return null;
            }
            try {
                return window === null || window === void 0 ? void 0 : window.addEventListener('storage', (e) => {
                    var _a, _b, _c;
                    if (e.key === STORAGE_KEY$1) {
                        const newSession = JSON.parse(String(e.newValue));
                        const accessToken = (_b = (_a = newSession === null || newSession === void 0 ? void 0 : newSession.currentSession) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : undefined;
                        const previousAccessToken = (_c = this.auth.session()) === null || _c === void 0 ? void 0 : _c.access_token;
                        if (!accessToken) {
                            this._handleTokenChanged('SIGNED_OUT', accessToken, 'STORAGE');
                        }
                        else if (!previousAccessToken && accessToken) {
                            this._handleTokenChanged('SIGNED_IN', accessToken, 'STORAGE');
                        }
                        else if (previousAccessToken !== accessToken) {
                            this._handleTokenChanged('TOKEN_REFRESHED', accessToken, 'STORAGE');
                        }
                    }
                });
            }
            catch (error) {
                console.error('_listenForMultiTabEvents', error);
                return null;
            }
        }
        _listenForAuthEvents() {
            let { data } = this.auth.onAuthStateChange((event, session) => {
                this._handleTokenChanged(event, session === null || session === void 0 ? void 0 : session.access_token, 'CLIENT');
            });
            return data;
        }
        _handleTokenChanged(event, token, source) {
            if ((event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
                this.changedAccessToken !== token) {
                // Token has changed
                this.realtime.setAuth(token);
                // Ideally we should call this.auth.recoverSession() - need to make public
                // to trigger a "SIGNED_IN" event on this client.
                if (source == 'STORAGE')
                    this.auth.setAuth(token);
                this.changedAccessToken = token;
            }
            else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                // Token is removed
                this.removeAllSubscriptions();
                if (source == 'STORAGE')
                    this.auth.signOut();
            }
        }
    }

    /**
     * Creates a new Supabase Client.
     */
    const createClient = (supabaseUrl, supabaseKey, options) => {
        return new SupabaseClient(supabaseUrl, supabaseKey, options);
    };

    var ifvisible = createCommonjsModule(function (module, exports) {
    (function() {
      (function(root, factory) {
        {
          return module.exports = factory();
        }
      })(this, function() {
        var addEvent, customEvent, doc, hidden, idleStartedTime, idleTime, ie, ifvisible, init, initialized, status, trackIdleStatus, visibilityChange;
        ifvisible = {};
        doc = document;
        initialized = false;
        status = "active";
        idleTime = 60000;
        idleStartedTime = false;
        customEvent = (function() {
          var addCustomEvent, cgid, fireCustomEvent, listeners, removeCustomEvent;
          listeners = {};
          cgid = '__ceGUID';
          addCustomEvent = function(obj, event, callback) {
            obj[cgid] = undefined;
            if (!obj[cgid]) {
              obj[cgid] = "ifvisible.object.event.identifier";
            }
            if (!listeners[obj[cgid]]) {
              listeners[obj[cgid]] = {};
            }
            if (!listeners[obj[cgid]][event]) {
              listeners[obj[cgid]][event] = [];
            }
            return listeners[obj[cgid]][event].push(callback);
          };
          fireCustomEvent = function(obj, event, memo) {
            var ev, j, len, ref, results;
            if (obj[cgid] && listeners[obj[cgid]] && listeners[obj[cgid]][event]) {
              ref = listeners[obj[cgid]][event];
              results = [];
              for (j = 0, len = ref.length; j < len; j++) {
                ev = ref[j];
                results.push(ev(memo || {}));
              }
              return results;
            }
          };
          removeCustomEvent = function(obj, event, callback) {
            var cl, i, j, len, ref;
            if (callback) {
              if (obj[cgid] && listeners[obj[cgid]] && listeners[obj[cgid]][event]) {
                ref = listeners[obj[cgid]][event];
                for (i = j = 0, len = ref.length; j < len; i = ++j) {
                  cl = ref[i];
                  if (cl === callback) {
                    listeners[obj[cgid]][event].splice(i, 1);
                    return cl;
                  }
                }
              }
            } else {
              if (obj[cgid] && listeners[obj[cgid]] && listeners[obj[cgid]][event]) {
                return delete listeners[obj[cgid]][event];
              }
            }
          };
          return {
            add: addCustomEvent,
            remove: removeCustomEvent,
            fire: fireCustomEvent
          };
        })();
        addEvent = (function() {
          var setListener;
          setListener = false;
          return function(el, ev, fn) {
            if (!setListener) {
              if (el.addEventListener) {
                setListener = function(el, ev, fn) {
                  return el.addEventListener(ev, fn, false);
                };
              } else if (el.attachEvent) {
                setListener = function(el, ev, fn) {
                  return el.attachEvent('on' + ev, fn, false);
                };
              } else {
                setListener = function(el, ev, fn) {
                  return el['on' + ev] = fn;
                };
              }
            }
            return setListener(el, ev, fn);
          };
        })();
        ie = (function() {
          var all, check, div, undef, v;
          undef = void 0;
          v = 3;
          div = doc.createElement("div");
          all = div.getElementsByTagName("i");
          check = function() {
            return (div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->", all[0]);
          };
          while (check()) {
            continue;
          }
          if (v > 4) {
            return v;
          } else {
            return undef;
          }
        })();
        hidden = false;
        visibilityChange = void 0;
        if (typeof doc.hidden !== "undefined") {
          hidden = "hidden";
          visibilityChange = "visibilitychange";
        } else if (typeof doc.mozHidden !== "undefined") {
          hidden = "mozHidden";
          visibilityChange = "mozvisibilitychange";
        } else if (typeof doc.msHidden !== "undefined") {
          hidden = "msHidden";
          visibilityChange = "msvisibilitychange";
        } else if (typeof doc.webkitHidden !== "undefined") {
          hidden = "webkitHidden";
          visibilityChange = "webkitvisibilitychange";
        }
        trackIdleStatus = function() {
          var timer, wakeUp;
          timer = false;
          wakeUp = function() {
            clearTimeout(timer);
            if (status !== "active") {
              ifvisible.wakeup();
            }
            idleStartedTime = +(new Date());
            return timer = setTimeout(function() {
              if (status === "active") {
                return ifvisible.idle();
              }
            }, idleTime);
          };
          wakeUp();
          addEvent(doc, "mousemove", wakeUp);
          addEvent(doc, "keyup", wakeUp);
          addEvent(doc, "touchstart", wakeUp);
          addEvent(window, "scroll", wakeUp);
          ifvisible.focus(wakeUp);
          return ifvisible.wakeup(wakeUp);
        };
        init = function() {
          var blur;
          if (initialized) {
            return true;
          }
          if (hidden === false) {
            blur = "blur";
            if (ie < 9) {
              blur = "focusout";
            }
            addEvent(window, blur, function() {
              return ifvisible.blur();
            });
            addEvent(window, "focus", function() {
              return ifvisible.focus();
            });
          } else {
            addEvent(doc, visibilityChange, function() {
              if (doc[hidden]) {
                return ifvisible.blur();
              } else {
                return ifvisible.focus();
              }
            }, false);
          }
          initialized = true;
          return trackIdleStatus();
        };
        ifvisible = {
          setIdleDuration: function(seconds) {
            return idleTime = seconds * 1000;
          },
          getIdleDuration: function() {
            return idleTime;
          },
          getIdleInfo: function() {
            var now, res;
            now = +(new Date());
            res = {};
            if (status === "idle") {
              res.isIdle = true;
              res.idleFor = now - idleStartedTime;
              res.timeLeft = 0;
              res.timeLeftPer = 100;
            } else {
              res.isIdle = false;
              res.idleFor = now - idleStartedTime;
              res.timeLeft = (idleStartedTime + idleTime) - now;
              res.timeLeftPer = (100 - (res.timeLeft * 100 / idleTime)).toFixed(2);
            }
            return res;
          },
          focus: function(callback) {
            if (typeof callback === "function") {
              this.on("focus", callback);
            } else {
              status = "active";
              customEvent.fire(this, "focus");
              customEvent.fire(this, "wakeup");
              customEvent.fire(this, "statusChanged", {
                status: status
              });
            }
            return this;
          },
          blur: function(callback) {
            if (typeof callback === "function") {
              this.on("blur", callback);
            } else {
              status = "hidden";
              customEvent.fire(this, "blur");
              customEvent.fire(this, "idle");
              customEvent.fire(this, "statusChanged", {
                status: status
              });
            }
            return this;
          },
          idle: function(callback) {
            if (typeof callback === "function") {
              this.on("idle", callback);
            } else {
              status = "idle";
              customEvent.fire(this, "idle");
              customEvent.fire(this, "statusChanged", {
                status: status
              });
            }
            return this;
          },
          wakeup: function(callback) {
            if (typeof callback === "function") {
              this.on("wakeup", callback);
            } else {
              status = "active";
              customEvent.fire(this, "wakeup");
              customEvent.fire(this, "statusChanged", {
                status: status
              });
            }
            return this;
          },
          on: function(name, callback) {
            init();
            customEvent.add(this, name, callback);
            return this;
          },
          off: function(name, callback) {
            init();
            customEvent.remove(this, name, callback);
            return this;
          },
          onEvery: function(seconds, callback) {
            var paused, t;
            init();
            paused = false;
            if (callback) {
              t = setInterval(function() {
                if (status === "active" && paused === false) {
                  return callback();
                }
              }, seconds * 1000);
            }
            return {
              stop: function() {
                return clearInterval(t);
              },
              pause: function() {
                return paused = true;
              },
              resume: function() {
                return paused = false;
              },
              code: t,
              callback: callback
            };
          },
          now: function(check) {
            init();
            return status === (check || "active");
          }
        };
        return ifvisible;
      });

    }).call(commonjsGlobal);


    });

    var ifvisible$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
        __proto__: null,
        'default': ifvisible
    }, [ifvisible]));

    /* src/App.svelte generated by Svelte v3.44.3 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[99] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[111] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[111] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[102] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[105] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[108] = list[i];
    	return child_ctx;
    }

    function get_each_context_6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[116] = list[i];
    	return child_ctx;
    }

    // (1571:1) {:else}
    function create_else_block_6(ctx) {
    	let div;
    	let p0;
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let button0;
    	let t5;
    	let button1;
    	let t7;
    	let p1;
    	let t8;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			p0.textContent = "The Tesla Stem Productivity App";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "Verify for Sign Up";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Sign In";
    			t7 = space();
    			p1 = element("p");
    			t8 = text(/*errorMsg*/ ctx[19]);
    			attr_dev(p0, "class", "text-5xl m-3");
    			add_location(p0, file, 1572, 3, 40027);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "placeholder", "Your Email: ");
    			attr_dev(input0, "class", "border-2 p-2 m-1 rounded-md");
    			add_location(input0, file, 1573, 3, 40090);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Your Password:  ");
    			attr_dev(input1, "class", "border-2 p-2 m-1 rounded-md");
    			add_location(input1, file, 1579, 3, 40217);
    			attr_dev(button0, "class", "bg-emerald-400 shadow-sm shadow-emerald-400 p-2 m-1 rounded-md");
    			add_location(button0, file, 1585, 3, 40350);
    			attr_dev(button1, "class", "border-2 border-emerald-400 p-2 m-1 rounded-md");
    			add_location(button1, file, 1593, 3, 40695);
    			set_style(p1, "color", "red");
    			add_location(p1, file, 1599, 3, 40841);
    			attr_dev(div, "class", "flex flex-col items-center justify-center h-screen");
    			add_location(div, file, 1571, 2, 39959);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(div, t1);
    			append_dev(div, input0);
    			set_input_value(input0, /*email*/ ctx[20]);
    			append_dev(div, t2);
    			append_dev(div, input1);
    			set_input_value(input1, /*pass*/ ctx[21]);
    			append_dev(div, t3);
    			append_dev(div, button0);
    			append_dev(div, t5);
    			append_dev(div, button1);
    			append_dev(div, t7);
    			append_dev(div, p1);
    			append_dev(p1, t8);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[85]),
    					listen_dev(input1, "input", /*input1_input_handler_2*/ ctx[86]),
    					listen_dev(button0, "click", /*click_handler_26*/ ctx[87], false, false, false),
    					listen_dev(button1, "click", /*click_handler_27*/ ctx[88], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*email*/ 1048576 && input0.value !== /*email*/ ctx[20]) {
    				set_input_value(input0, /*email*/ ctx[20]);
    			}

    			if (dirty[0] & /*pass*/ 2097152 && input1.value !== /*pass*/ ctx[21]) {
    				set_input_value(input1, /*pass*/ ctx[21]);
    			}

    			if (dirty[0] & /*errorMsg*/ 524288) set_data_dev(t8, /*errorMsg*/ ctx[19]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_6.name,
    		type: "else",
    		source: "(1571:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (957:1) {#if userSess !== null}
    function create_if_block(ctx) {
    	let await_block_anchor;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block_1
    	};

    	handle_promise(/*getData*/ ctx[27](), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(957:1) {#if userSess !== null}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  let nameInput; // for focus states   let posts;  let name = "";  let desc = "";   let userFiles = [];   let adminEmail = "";   let newName = "";   let profilePic =   "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";   let chatOrTodo = "chat";   let newChannel = "";  let channels = [];  let channelData = "";  let channelPeople = [];   let allChannelData = [];   let availableMentions = [];  let showMentionPanel = false;   let activeChannel = "null";   let newEmail = "";   let oldPassword = "";  let newPassword = "";   let completedTodos = [];  let todos = [];   let signedIn = false;   let errorMsg = "";   let email = "";  let pass = "";   let deleting = false;   let opened = false;   import { createClient }
    function create_catch_block_1(ctx) {
    	const block = { c: noop$2, m: noop$2, p: noop$2, d: noop$2 };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script>  let nameInput; // for focus states   let posts;  let name = \\\"\\\";  let desc = \\\"\\\";   let userFiles = [];   let adminEmail = \\\"\\\";   let newName = \\\"\\\";   let profilePic =   \\\"https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png\\\";   let chatOrTodo = \\\"chat\\\";   let newChannel = \\\"\\\";  let channels = [];  let channelData = \\\"\\\";  let channelPeople = [];   let allChannelData = [];   let availableMentions = [];  let showMentionPanel = false;   let activeChannel = \\\"null\\\";   let newEmail = \\\"\\\";   let oldPassword = \\\"\\\";  let newPassword = \\\"\\\";   let completedTodos = [];  let todos = [];   let signedIn = false;   let errorMsg = \\\"\\\";   let email = \\\"\\\";  let pass = \\\"\\\";   let deleting = false;   let opened = false;   import { createClient }",
    		ctx
    	});

    	return block;
    }

    // (962:2) {:then}
    function create_then_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (!/*deleting*/ ctx[22]) return create_if_block_1;
    		return create_else_block_5;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(962:2) {:then}",
    		ctx
    	});

    	return block;
    }

    // (1565:3) {:else}
    function create_else_block_5(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Deleting item...";
    			attr_dev(p, "class", "text-5xl text-red-500");
    			add_location(p, file, 1566, 5, 39863);
    			attr_dev(div, "class", "flex justify-center items-center h-screen");
    			add_location(div, file, 1565, 4, 39802);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_5.name,
    		type: "else",
    		source: "(1565:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (963:3) {#if !deleting}
    function create_if_block_1(ctx) {
    	let div2;
    	let div0;
    	let p;
    	let t1;
    	let hr;
    	let t2;
    	let t3;
    	let t4;
    	let button0;
    	let t6;
    	let button1;
    	let t8;
    	let t9;
    	let div1;
    	let button2;
    	let t11;
    	let t12;
    	let button3;
    	let t14;
    	let input;
    	let t15;
    	let mounted;
    	let dispose;
    	let each_value_6 = /*channels*/ ctx[9];
    	validate_each_argument(each_value_6);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_6.length; i += 1) {
    		each_blocks[i] = create_each_block_6(get_each_context_6(ctx, each_value_6, i));
    	}

    	function select_block_type_3(ctx, dirty) {
    		if (/*activeChannel*/ ctx[14] == "null") return create_if_block_17;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_4(ctx, dirty) {
    		if (/*chatOrTodo*/ ctx[7] == "chat") return create_if_block_4;
    		if (/*chatOrTodo*/ ctx[7] == "todos") return create_if_block_13;
    		return create_else_block_2;
    	}

    	let current_block_type_1 = select_block_type_4(ctx);
    	let if_block1 = current_block_type_1(ctx);
    	let if_block2 = /*activeChannel*/ ctx[14] != "null" && create_if_block_3(ctx);
    	let if_block3 = /*activeChannel*/ ctx[14] != "null" && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "The Tesla Stem Productivity App";
    			t1 = space();
    			hr = element("hr");
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			if_block0.c();
    			t4 = space();
    			button0 = element("button");
    			button0.textContent = "Sign Out";
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Profile";
    			t8 = space();
    			if_block1.c();
    			t9 = space();
    			div1 = element("div");
    			button2 = element("button");
    			button2.textContent = "Close Panel";
    			t11 = space();
    			if (if_block2) if_block2.c();
    			t12 = space();
    			button3 = element("button");
    			button3.textContent = "+ Create a new Channel";
    			t14 = space();
    			input = element("input");
    			t15 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(p, "class", "m-2 text-lg");
    			add_location(p, file, 969, 6, 22392);
    			add_location(hr, file, 972, 6, 22472);
    			attr_dev(button0, "class", "bg-red-500 text-white p-2 m-1 rounded-md mt-3");
    			add_location(button0, file, 1015, 6, 23613);
    			attr_dev(button1, "class", "bg-emerald-500 text-white p-2 m-1 rounded-md");
    			add_location(button1, file, 1021, 6, 23779);
    			attr_dev(div0, "class", "w-2/12 fixed left-0 top-0 h-screen text-white overflow-y-auto flex flex-col pt-12");
    			attr_dev(div0, "id", "othersidebar");
    			set_style(div0, "background-color", "#39133D");
    			set_style(div0, "width", "0%");
    			set_style(div0, "transition", "0.5s");
    			add_location(div0, file, 964, 5, 22184);
    			attr_dev(button2, "id", "infoButton");
    			attr_dev(button2, "class", "border-2 border-black p-1 rounded-md");
    			set_style(button2, "right", "0.25rem");
    			set_style(button2, "transition", "0.5s");
    			add_location(button2, file, 1493, 6, 37720);
    			attr_dev(button3, "class", "p-2 m-1 rounded-md bg-emerald-400 shadow-lg");
    			add_location(button3, file, 1541, 6, 39185);
    			attr_dev(input, "placeholder", "Name of Channel: ");
    			attr_dev(input, "class", "border-2 p-2 m-1 rounded-md");
    			add_location(input, file, 1549, 6, 39416);
    			attr_dev(div1, "class", "fixed right-0 top-0 flex flex-col h-screen bg-white pt-1");
    			set_style(div1, "width", "0%");
    			set_style(div1, "transition", "0.5s");
    			attr_dev(div1, "id", "sidebar");
    			add_location(div1, file, 1488, 5, 37569);
    			attr_dev(div2, "class", "flex flex-row ");
    			add_location(div2, file, 963, 4, 22150);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, p);
    			append_dev(div0, t1);
    			append_dev(div0, hr);
    			append_dev(div0, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t3);
    			if_block0.m(div0, null);
    			append_dev(div0, t4);
    			append_dev(div0, button0);
    			append_dev(div0, t6);
    			append_dev(div0, button1);
    			append_dev(div2, t8);
    			if_block1.m(div2, null);
    			append_dev(div2, t9);
    			append_dev(div2, div1);
    			append_dev(div1, button2);
    			append_dev(div1, t11);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t12);
    			append_dev(div1, button3);
    			append_dev(div1, t14);
    			append_dev(div1, input);
    			set_input_value(input, /*newChannel*/ ctx[8]);
    			append_dev(div1, t15);
    			if (if_block3) if_block3.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_4*/ ctx[53], false, false, false),
    					listen_dev(button1, "click", /*click_handler_5*/ ctx[54], false, false, false),
    					listen_dev(button2, "click", /*openSidebar*/ ctx[40], false, false, false),
    					listen_dev(button3, "click", /*click_handler_24*/ ctx[82], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_3*/ ctx[83])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*activeChannel, channels, getData*/ 134234624 | dirty[1] & /*openOtherSidebar*/ 1024) {
    				each_value_6 = /*channels*/ ctx[9];
    				validate_each_argument(each_value_6);
    				let i;

    				for (i = 0; i < each_value_6.length; i += 1) {
    					const child_ctx = get_each_context_6(ctx, each_value_6, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, t3);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_6.length;
    			}

    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, t4);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_4(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, t9);
    				}
    			}

    			if (/*activeChannel*/ ctx[14] != "null") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					if_block2.m(div1, t12);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*newChannel*/ 256 && input.value !== /*newChannel*/ ctx[8]) {
    				set_input_value(input, /*newChannel*/ ctx[8]);
    			}

    			if (/*activeChannel*/ ctx[14] != "null") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					if_block3.m(div1, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(963:3) {#if !deleting}",
    		ctx
    	});

    	return block;
    }

    // (985:7) {:else}
    function create_else_block_4(ctx) {
    	let button;
    	let t0;
    	let t1_value = /*channel*/ ctx[116] + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[50](/*channel*/ ctx[116]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text("# ");
    			t1 = text(t1_value);
    			attr_dev(button, "class", "border-emerald-400 w-full text-left pl-1 py-1");
    			add_location(button, file, 985, 8, 22833);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*channels*/ 512 && t1_value !== (t1_value = /*channel*/ ctx[116] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(985:7) {:else}",
    		ctx
    	});

    	return block;
    }

    // (975:7) {#if activeChannel == channel}
    function create_if_block_18(ctx) {
    	let button;
    	let t0;
    	let t1_value = /*channel*/ ctx[116] + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[49](/*channel*/ ctx[116]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text("# ");
    			t1 = text(t1_value);
    			attr_dev(button, "class", "w-full text-left pl-1 py-1");
    			set_style(button, "background-color", "#2F629E");
    			add_location(button, file, 975, 8, 22559);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*channels*/ 512 && t1_value !== (t1_value = /*channel*/ ctx[116] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_18.name,
    		type: "if",
    		source: "(975:7) {#if activeChannel == channel}",
    		ctx
    	});

    	return block;
    }

    // (974:6) {#each channels as channel}
    function create_each_block_6(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*activeChannel*/ ctx[14] == /*channel*/ ctx[116]) return create_if_block_18;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_6.name,
    		type: "each",
    		source: "(974:6) {#each channels as channel}",
    		ctx
    	});

    	return block;
    }

    // (1006:6) {:else}
    function create_else_block_3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "# Public Chat";
    			attr_dev(button, "class", "w-full text-left pl-1 py-1");
    			add_location(button, file, 1006, 7, 23394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_3*/ ctx[52], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(1006:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (996:6) {#if activeChannel == "null"}
    function create_if_block_17(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "# Public Chat";
    			attr_dev(button, "class", "w-full text-left pl-1 py-1");
    			set_style(button, "background-color", "#2F629E");
    			add_location(button, file, 996, 7, 23129);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[51], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_17.name,
    		type: "if",
    		source: "(996:6) {#if activeChannel == \\\"null\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1387:5) {:else}
    function create_else_block_2(ctx) {
    	let div;
    	let button0;
    	let t2;
    	let p0;
    	let t3_value = /*userSess*/ ctx[24].email + "";
    	let t3;
    	let t4;
    	let p1;
    	let t6;
    	let t7;
    	let input0;
    	let t8;
    	let button1;
    	let t10;
    	let p2;
    	let t12;
    	let input1;
    	let t13;
    	let button2;
    	let t15;
    	let p3;
    	let t17;
    	let input2;
    	let t18;
    	let button3;
    	let t20;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block
    	};

    	handle_promise(/*downloadProfilePic*/ ctx[47](), info);
    	let if_block = (/*userSess*/ ctx[24].email == "rohit.karthik@outlook.com" || /*userSess*/ ctx[24].email == "s-rkarthik@lwsd.org") && create_if_block_16(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = `${"<"} Go Back`;
    			t2 = space();
    			p0 = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "Current Profile Picture:";
    			t6 = space();
    			info.block.c();
    			t7 = space();
    			input0 = element("input");
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "Delete Profile Pic";
    			t10 = space();
    			p2 = element("p");
    			p2.textContent = "Update your password:";
    			t12 = space();
    			input1 = element("input");
    			t13 = space();
    			button2 = element("button");
    			button2.textContent = "Update";
    			t15 = space();
    			p3 = element("p");
    			p3.textContent = "Set your Display Name:";
    			t17 = space();
    			input2 = element("input");
    			t18 = space();
    			button3 = element("button");
    			button3.textContent = "Update";
    			t20 = space();
    			if (if_block) if_block.c();
    			attr_dev(button0, "class", "p-5");
    			add_location(button0, file, 1388, 7, 34686);
    			attr_dev(p0, "class", "text-2xl font-bold p-2");
    			add_location(p0, file, 1394, 7, 34819);
    			add_location(p1, file, 1397, 7, 34898);
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "id", "newPic");
    			attr_dev(input0, "class", "pl-28 pt-2 text-emerald-500");
    			attr_dev(input0, "accept", "image/*");
    			add_location(input0, file, 1407, 7, 35182);
    			attr_dev(button1, "class", "p-2 m-1 mt-3 rounded-md bg-red-500 text-white");
    			add_location(button1, file, 1414, 7, 35352);
    			attr_dev(p2, "class", "pt-5 text-xl");
    			add_location(p2, file, 1419, 7, 35510);
    			attr_dev(input1, "placeholder", "New Password: ");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "border-2 p-2 m-1 rounded-md");
    			add_location(input1, file, 1420, 7, 35567);
    			attr_dev(button2, "class", "p-2 m-1 rounded-md bg-red-500 text-white");
    			add_location(button2, file, 1426, 7, 35729);
    			attr_dev(p3, "class", "pt-5 text-xl");
    			add_location(p3, file, 1436, 7, 36016);
    			attr_dev(input2, "placeholder", "New Name: ");
    			attr_dev(input2, "class", "border-2 p-2 m-1 rounded-md");
    			add_location(input2, file, 1437, 7, 36074);
    			attr_dev(button3, "class", "p-2 m-1 rounded-md bg-emerald-500");
    			add_location(button3, file, 1442, 7, 36204);
    			attr_dev(div, "class", "flex flex-col justify-center items-center");
    			add_location(div, file, 1387, 6, 34623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t2);
    			append_dev(div, p0);
    			append_dev(p0, t3);
    			append_dev(div, t4);
    			append_dev(div, p1);
    			append_dev(div, t6);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = t7;
    			append_dev(div, t7);
    			append_dev(div, input0);
    			append_dev(div, t8);
    			append_dev(div, button1);
    			append_dev(div, t10);
    			append_dev(div, p2);
    			append_dev(div, t12);
    			append_dev(div, input1);
    			set_input_value(input1, /*newPassword*/ ctx[16]);
    			append_dev(div, t13);
    			append_dev(div, button2);
    			append_dev(div, t15);
    			append_dev(div, p3);
    			append_dev(div, t17);
    			append_dev(div, input2);
    			set_input_value(input2, /*newName*/ ctx[5]);
    			append_dev(div, t18);
    			append_dev(div, button3);
    			append_dev(div, t20);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_18*/ ctx[72], false, false, false),
    					listen_dev(input0, "change", /*uploadProfilePic*/ ctx[45], false, false, false),
    					listen_dev(button1, "click", /*removeProfilePic*/ ctx[46], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[73]),
    					listen_dev(button2, "click", /*click_handler_19*/ ctx[74], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[75]),
    					listen_dev(button3, "click", /*click_handler_20*/ ctx[76], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*userSess*/ 16777216 && t3_value !== (t3_value = /*userSess*/ ctx[24].email + "")) set_data_dev(t3, t3_value);
    			update_await_block_branch(info, ctx, dirty);

    			if (dirty[0] & /*newPassword*/ 65536 && input1.value !== /*newPassword*/ ctx[16]) {
    				set_input_value(input1, /*newPassword*/ ctx[16]);
    			}

    			if (dirty[0] & /*newName*/ 32 && input2.value !== /*newName*/ ctx[5]) {
    				set_input_value(input2, /*newName*/ ctx[5]);
    			}

    			if (/*userSess*/ ctx[24].email == "rohit.karthik@outlook.com" || /*userSess*/ ctx[24].email == "s-rkarthik@lwsd.org") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_16(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(1387:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1280:37) 
    function create_if_block_13(ctx) {
    	let div5;
    	let div1;
    	let div0;
    	let button0;
    	let t1;
    	let p0;
    	let t2;

    	let t3_value = (/*activeChannel*/ ctx[14] == "null"
    	? "Public Chat"
    	: /*activeChannel*/ ctx[14]) + "";

    	let t3;
    	let t4;
    	let button1;
    	let t6;
    	let button2;
    	let t8;
    	let div2;
    	let p1;
    	let t10;
    	let t11;
    	let p2;
    	let t13;
    	let t14;
    	let div4;
    	let div3;
    	let p3;
    	let t15;
    	let t16;
    	let input;
    	let t17;
    	let button3;
    	let mounted;
    	let dispose;
    	let each_value_5 = /*todos*/ ctx[18];
    	validate_each_argument(each_value_5);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks_1[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	let each_value_4 = /*completedTodos*/ ctx[17];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "☰";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("# ");
    			t3 = text(t3_value);
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Chat";
    			t6 = space();
    			button2 = element("button");
    			button2.textContent = "Info";
    			t8 = space();
    			div2 = element("div");
    			p1 = element("p");
    			p1.textContent = "In Progress";
    			t10 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t11 = space();
    			p2 = element("p");
    			p2.textContent = "Completed";
    			t13 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t14 = space();
    			div4 = element("div");
    			div3 = element("div");
    			p3 = element("p");
    			t15 = text(/*errorMsg*/ ctx[19]);
    			t16 = space();
    			input = element("input");
    			t17 = space();
    			button3 = element("button");
    			button3.textContent = "Create";
    			attr_dev(button0, "class", "rounded-md fixed top-1 left-1 text-xl");
    			set_style(button0, "right", "0.25rem");
    			set_style(button0, "transition", "0.5s");
    			add_location(button0, file, 1283, 9, 31717);
    			attr_dev(p0, "class", "pl-5");
    			add_location(p0, file, 1288, 9, 31901);
    			attr_dev(button1, "id", "switchButton");
    			attr_dev(button1, "class", "border-2 border-black p-1 rounded-md fixed top-1 right-1");
    			set_style(button1, "right", "3rem");
    			set_style(button1, "transition", "0.5s");
    			add_location(button1, file, 1293, 9, 32033);
    			attr_dev(button2, "id", "infoButton");
    			attr_dev(button2, "class", "border-2 border-black p-1 rounded-md fixed top-1 right-1");
    			set_style(button2, "right", "0.25rem");
    			set_style(button2, "transition", "0.5s");
    			add_location(button2, file, 1301, 9, 32299);
    			attr_dev(div0, "class", "bg-white w-screen p-2");
    			add_location(div0, file, 1282, 8, 31672);
    			attr_dev(div1, "class", "fixed top-0");
    			add_location(div1, file, 1281, 7, 31638);
    			attr_dev(p1, "class", "text-3xl pb-1");
    			add_location(p1, file, 1310, 8, 32591);
    			attr_dev(p2, "class", "text-3xl pb-1");
    			add_location(p2, file, 1334, 8, 33204);
    			attr_dev(div2, "class", "pt-8 pb-16 ml-2");
    			add_location(div2, file, 1309, 7, 32553);
    			set_style(p3, "color", "red");
    			add_location(p3, file, 1369, 9, 34134);
    			attr_dev(input, "placeholder", "Name of Todo (required): ");
    			attr_dev(input, "class", "border-2 p-2 m-1 rounded-md w-64");
    			add_location(input, file, 1370, 9, 34181);
    			attr_dev(button3, "class", "bg-emerald-400 p-2 m-1 shadow-xl rounded-md");
    			add_location(button3, file, 1376, 9, 34379);
    			attr_dev(div3, "class", "bg-white w-screen");
    			add_location(div3, file, 1368, 8, 34093);
    			attr_dev(div4, "class", "fixed bottom-0");
    			add_location(div4, file, 1367, 7, 34056);
    			attr_dev(div5, "id", "mainContent");
    			set_style(div5, "width", "100%");
    			add_location(div5, file, 1280, 6, 31588);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(div0, t6);
    			append_dev(div0, button2);
    			append_dev(div5, t8);
    			append_dev(div5, div2);
    			append_dev(div2, p1);
    			append_dev(div2, t10);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div2, t11);
    			append_dev(div2, p2);
    			append_dev(div2, t13);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div5, t14);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, p3);
    			append_dev(p3, t15);
    			append_dev(div3, t16);
    			append_dev(div3, input);
    			set_input_value(input, /*name*/ ctx[3]);
    			append_dev(div3, t17);
    			append_dev(div3, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*openOtherSidebar*/ ctx[41], false, false, false),
    					listen_dev(button1, "click", /*click_handler_11*/ ctx[64], false, false, false),
    					listen_dev(button2, "click", /*openSidebar*/ ctx[40], false, false, false),
    					listen_dev(input, "keydown", /*handleKeydownTodo*/ ctx[44], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[70]),
    					listen_dev(button3, "click", /*click_handler_17*/ ctx[71], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*activeChannel*/ 16384 && t3_value !== (t3_value = (/*activeChannel*/ ctx[14] == "null"
    			? "Public Chat"
    			: /*activeChannel*/ ctx[14]) + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*todos, userSess, updateTodo*/ 285474816 | dirty[1] & /*deleteTodo*/ 16) {
    				each_value_5 = /*todos*/ ctx[18];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_5(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, t11);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_5.length;
    			}

    			if (dirty[0] & /*completedTodos, userSess, updateTodo*/ 285343744 | dirty[1] & /*deleteTodo*/ 16) {
    				each_value_4 = /*completedTodos*/ ctx[17];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (dirty[0] & /*errorMsg*/ 524288) set_data_dev(t15, /*errorMsg*/ ctx[19]);

    			if (dirty[0] & /*name*/ 8 && input.value !== /*name*/ ctx[3]) {
    				set_input_value(input, /*name*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_13.name,
    		type: "if",
    		source: "(1280:37) ",
    		ctx
    	});

    	return block;
    }

    // (1030:5) {#if chatOrTodo == "chat"}
    function create_if_block_4(ctx) {
    	let div7;
    	let div1;
    	let div0;
    	let button0;
    	let t1;
    	let p0;
    	let t2;

    	let t3_value = (/*activeChannel*/ ctx[14] == "null"
    	? "Public Chat"
    	: /*activeChannel*/ ctx[14]) + "";

    	let t3;
    	let t4;
    	let button1;
    	let t6;
    	let button2;
    	let t8;
    	let div3;
    	let div2;
    	let t9;
    	let div6;
    	let t10;
    	let div4;
    	let p1;
    	let t11;
    	let t12;
    	let div5;
    	let label;
    	let input0;
    	let t13;
    	let svg;
    	let path;
    	let t14;
    	let input1;
    	let t15;
    	let button3;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*posts*/ ctx[2];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let if_block = /*showMentionPanel*/ ctx[13] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "☰";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("# ");
    			t3 = text(t3_value);
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Todos";
    			t6 = space();
    			button2 = element("button");
    			button2.textContent = "Info";
    			t8 = space();
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div6 = element("div");
    			if (if_block) if_block.c();
    			t10 = space();
    			div4 = element("div");
    			p1 = element("p");
    			t11 = text(/*errorMsg*/ ctx[19]);
    			t12 = space();
    			div5 = element("div");
    			label = element("label");
    			input0 = element("input");
    			t13 = space();
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t14 = space();
    			input1 = element("input");
    			t15 = space();
    			button3 = element("button");
    			button3.textContent = "Send";
    			attr_dev(button0, "class", "rounded-md fixed top-1 left-1 text-xl");
    			set_style(button0, "right", "0.25rem");
    			set_style(button0, "transition", "0.5s");
    			add_location(button0, file, 1033, 9, 24147);
    			attr_dev(p0, "class", "pl-5");
    			add_location(p0, file, 1038, 9, 24331);
    			attr_dev(button1, "id", "switchButton");
    			attr_dev(button1, "class", "border-2 border-black p-1 rounded-md fixed top-1 right-1");
    			set_style(button1, "right", "3rem");
    			set_style(button1, "transition", "0.5s");
    			add_location(button1, file, 1043, 9, 24463);
    			attr_dev(button2, "id", "infoButton");
    			attr_dev(button2, "class", "border-2 border-black p-1 rounded-md fixed top-1 right-1");
    			set_style(button2, "right", "0.25rem");
    			set_style(button2, "transition", "0.5s");
    			add_location(button2, file, 1051, 9, 24731);
    			attr_dev(div0, "class", "bg-white w-screen p-2");
    			add_location(div0, file, 1032, 8, 24102);
    			attr_dev(div1, "class", "fixed top-0");
    			add_location(div1, file, 1031, 7, 24068);
    			attr_dev(div2, "class", "flex flex-col");
    			add_location(div2, file, 1063, 8, 25074);
    			attr_dev(div3, "class", "pt-10 flex");
    			set_style(div3, "padding-bottom", "3.2rem");
    			add_location(div3, file, 1059, 7, 24985);
    			set_style(p1, "color", "red");
    			add_location(p1, file, 1201, 9, 29395);
    			attr_dev(div4, "class", "bg-white w-screen flex bottom-12");
    			add_location(div4, file, 1200, 8, 29339);
    			attr_dev(input0, "type", "file");
    			input0.hidden = true;
    			input0.multiple = true;
    			add_location(input0, file, 1207, 10, 29597);
    			attr_dev(path, "strokelinecap", "round");
    			attr_dev(path, "strokelinejoin", "round");
    			attr_dev(path, "strokewidth", 2);
    			attr_dev(path, "d", "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z");
    			add_location(path, file, 1220, 11, 29913);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-11 w-11");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file, 1213, 10, 29723);
    			attr_dev(label, "class", "bg-gray-100 h-11 w-11 p-0 self-center rounded-md");
    			add_location(label, file, 1204, 9, 29502);
    			attr_dev(input1, "id", "chatInput");
    			attr_dev(input1, "placeholder", "Text (required): ");
    			attr_dev(input1, "class", "border-2 p-2 m-1 rounded-md w-5/12 resize-none h-11");
    			add_location(input1, file, 1228, 9, 30150);
    			attr_dev(button3, "class", "bg-emerald-400 p-2 m-1 shadow-xl rounded-md h-11");
    			add_location(button3, file, 1269, 9, 31316);
    			attr_dev(div5, "class", "bg-white w-screen flex");
    			add_location(div5, file, 1203, 8, 29456);
    			attr_dev(div6, "class", "fixed bottom-0");
    			add_location(div6, file, 1171, 7, 28462);
    			attr_dev(div7, "class", "ml-0 w-screen");
    			attr_dev(div7, "id", "mainContent");
    			add_location(div7, file, 1030, 6, 24016);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(div0, t6);
    			append_dev(div0, button2);
    			append_dev(div7, t8);
    			append_dev(div7, div3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			if (if_block) if_block.m(div6, null);
    			append_dev(div6, t10);
    			append_dev(div6, div4);
    			append_dev(div4, p1);
    			append_dev(p1, t11);
    			append_dev(div6, t12);
    			append_dev(div6, div5);
    			append_dev(div5, label);
    			append_dev(label, input0);
    			append_dev(label, t13);
    			append_dev(label, svg);
    			append_dev(svg, path);
    			append_dev(div5, t14);
    			append_dev(div5, input1);
    			set_input_value(input1, /*name*/ ctx[3]);
    			/*input1_binding*/ ctx[60](input1);
    			append_dev(div5, t15);
    			append_dev(div5, button3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*openOtherSidebar*/ ctx[41], false, false, false),
    					listen_dev(button1, "click", /*click_handler_6*/ ctx[55], false, false, false),
    					listen_dev(button2, "click", /*openSidebar*/ ctx[40], false, false, false),
    					listen_dev(div2, "click", /*click_handler_8*/ ctx[57], false, false, false),
    					listen_dev(input0, "change", /*uploadFiles*/ ctx[48], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[59]),
    					listen_dev(input1, "keydown", /*handleKeydown*/ ctx[42], false, false, false),
    					listen_dev(input1, "keyup", /*keyup_handler*/ ctx[61], false, false, false),
    					listen_dev(input1, "input", /*input_handler*/ ctx[62], false, false, false),
    					listen_dev(button3, "click", /*click_handler_10*/ ctx[63], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*activeChannel*/ 16384 && t3_value !== (t3_value = (/*activeChannel*/ ctx[14] == "null"
    			? "Public Chat"
    			: /*activeChannel*/ ctx[14]) + "")) set_data_dev(t3, t3_value);

    			if (dirty[0] & /*posts, userSess, activeChannel*/ 16793604 | dirty[1] & /*deletePost*/ 8) {
    				each_value_2 = /*posts*/ ctx[2];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (/*showMentionPanel*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(div6, t10);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*errorMsg*/ 524288) set_data_dev(t11, /*errorMsg*/ ctx[19]);

    			if (dirty[0] & /*name*/ 8 && input1.value !== /*name*/ ctx[3]) {
    				set_input_value(input1, /*name*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			/*input1_binding*/ ctx[60](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(1030:5) {#if chatOrTodo == \\\"chat\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>  let nameInput; // for focus states   let posts;  let name = "";  let desc = "";   let userFiles = [];   let adminEmail = "";   let newName = "";   let profilePic =   "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";   let chatOrTodo = "chat";   let newChannel = "";  let channels = [];  let channelData = "";  let channelPeople = [];   let allChannelData = [];   let availableMentions = [];  let showMentionPanel = false;   let activeChannel = "null";   let newEmail = "";   let oldPassword = "";  let newPassword = "";   let completedTodos = [];  let todos = [];   let signedIn = false;   let errorMsg = "";   let email = "";  let pass = "";   let deleting = false;   let opened = false;   import { createClient }
    function create_catch_block(ctx) {
    	const block = { c: noop$2, m: noop$2, p: noop$2, d: noop$2 };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>  let nameInput; // for focus states   let posts;  let name = \\\"\\\";  let desc = \\\"\\\";   let userFiles = [];   let adminEmail = \\\"\\\";   let newName = \\\"\\\";   let profilePic =   \\\"https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png\\\";   let chatOrTodo = \\\"chat\\\";   let newChannel = \\\"\\\";  let channels = [];  let channelData = \\\"\\\";  let channelPeople = [];   let allChannelData = [];   let availableMentions = [];  let showMentionPanel = false;   let activeChannel = \\\"null\\\";   let newEmail = \\\"\\\";   let oldPassword = \\\"\\\";  let newPassword = \\\"\\\";   let completedTodos = [];  let todos = [];   let signedIn = false;   let errorMsg = \\\"\\\";   let email = \\\"\\\";  let pass = \\\"\\\";   let deleting = false;   let opened = false;   import { createClient }",
    		ctx
    	});

    	return block;
    }

    // (1401:7) {:then}
    function create_then_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*profilePic*/ ctx[6])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Default Profile Pic");
    			attr_dev(img, "class", "w-48 h-48 p-2 rounded-3xl hover:opacity-50");
    			add_location(img, file, 1401, 8, 35022);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*profilePic*/ 64 && !src_url_equal(img.src, img_src_value = /*profilePic*/ ctx[6])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(1401:7) {:then}",
    		ctx
    	});

    	return block;
    }

    // (1399:36)          <p>Getting photo...</p>        {:then}
    function create_pending_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Getting photo...";
    			add_location(p, file, 1399, 8, 34975);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(1399:36)          <p>Getting photo...</p>        {:then}",
    		ctx
    	});

    	return block;
    }

    // (1473:7) {#if userSess.email == "rohit.karthik@outlook.com" || userSess.email == "s-rkarthik@lwsd.org"}
    function create_if_block_16(ctx) {
    	let input;
    	let t0;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			button = element("button");
    			button.textContent = "Add user";
    			attr_dev(input, "type", "email");
    			attr_dev(input, "placeholder", "New User Email: ");
    			attr_dev(input, "class", "border-2 p-2 m-1 rounded-md");
    			add_location(input, file, 1473, 8, 37159);
    			attr_dev(button, "class", "bg-emerald-400 shadow-sm shadow-emerald-400 p-2 m-1 rounded-md");
    			add_location(button, file, 1479, 8, 37325);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*adminEmail*/ ctx[4]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler_1*/ ctx[77]),
    					listen_dev(button, "click", /*click_handler_21*/ ctx[78], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*adminEmail*/ 16 && input.value !== /*adminEmail*/ ctx[4]) {
    				set_input_value(input, /*adminEmail*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_16.name,
    		type: "if",
    		source: "(1473:7) {#if userSess.email == \\\"rohit.karthik@outlook.com\\\" || userSess.email == \\\"s-rkarthik@lwsd.org\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1321:10) {#if userSess.email.toLowerCase() == todo.email}
    function create_if_block_15(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_13() {
    		return /*click_handler_13*/ ctx[66](/*todo*/ ctx[111]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete this todo";
    			attr_dev(button, "class", "ml-3 text-red-500");
    			add_location(button, file, 1321, 11, 32912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_13, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_15.name,
    		type: "if",
    		source: "(1321:10) {#if userSess.email.toLowerCase() == todo.email}",
    		ctx
    	});

    	return block;
    }

    // (1312:8) {#each todos as todo}
    function create_each_block_5(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1_value = /*todo*/ ctx[111].name + "";
    	let t1;
    	let t2;
    	let show_if = /*userSess*/ ctx[24].email.toLowerCase() == /*todo*/ ctx[111].email;
    	let t3;
    	let br;
    	let mounted;
    	let dispose;

    	function click_handler_12() {
    		return /*click_handler_12*/ ctx[65](/*todo*/ ctx[111]);
    	}

    	let if_block = show_if && create_if_block_15(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			br = element("br");
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file, 1313, 10, 32689);
    			add_location(br, file, 1331, 10, 33155);
    			add_location(label, file, 1312, 9, 32671);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			if (if_block) if_block.m(label, null);
    			append_dev(label, t3);
    			append_dev(label, br);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", click_handler_12, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*todos*/ 262144 && t1_value !== (t1_value = /*todo*/ ctx[111].name + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*userSess, todos*/ 17039360) show_if = /*userSess*/ ctx[24].email.toLowerCase() == /*todo*/ ctx[111].email;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_15(ctx);
    					if_block.c();
    					if_block.m(label, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(1312:8) {#each todos as todo}",
    		ctx
    	});

    	return block;
    }

    // (1353:10) {#if userSess.email.toLowerCase() == todo.email}
    function create_if_block_14(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_16() {
    		return /*click_handler_16*/ ctx[69](/*todo*/ ctx[111]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete this todo";
    			attr_dev(button, "class", "ml-3 text-red-500");
    			add_location(button, file, 1353, 11, 33751);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_16, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_14.name,
    		type: "if",
    		source: "(1353:10) {#if userSess.email.toLowerCase() == todo.email}",
    		ctx
    	});

    	return block;
    }

    // (1336:8) {#each completedTodos as todo}
    function create_each_block_4(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1_value = /*todo*/ ctx[111].name + "";
    	let t1;
    	let t2;
    	let button;
    	let t4;
    	let show_if = /*userSess*/ ctx[24].email.toLowerCase() == /*todo*/ ctx[111].email;
    	let t5;
    	let br;
    	let t6;
    	let mounted;
    	let dispose;

    	function click_handler_14() {
    		return /*click_handler_14*/ ctx[67](/*todo*/ ctx[111]);
    	}

    	function click_handler_15() {
    		return /*click_handler_15*/ ctx[68](/*todo*/ ctx[111]);
    	}

    	let if_block = show_if && create_if_block_14(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			button = element("button");
    			button.textContent = "Make unchecked";
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			br = element("br");
    			t6 = space();
    			attr_dev(input, "type", "checkbox");
    			input.disabled = true;
    			input.checked = true;
    			add_location(input, file, 1337, 10, 33309);
    			attr_dev(button, "class", "ml-3 text-emerald-500");
    			add_location(button, file, 1346, 10, 33512);
    			add_location(br, file, 1363, 10, 33994);
    			add_location(label, file, 1336, 9, 33291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			append_dev(label, button);
    			append_dev(label, t4);
    			if (if_block) if_block.m(label, null);
    			append_dev(label, t5);
    			append_dev(label, br);
    			append_dev(label, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "click", click_handler_14, false, false, false),
    					listen_dev(button, "click", click_handler_15, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*completedTodos*/ 131072 && t1_value !== (t1_value = /*todo*/ ctx[111].name + "")) set_data_dev(t1, t1_value);
    			if (dirty[0] & /*userSess, completedTodos*/ 16908288) show_if = /*userSess*/ ctx[24].email.toLowerCase() == /*todo*/ ctx[111].email;

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_14(ctx);
    					if_block.c();
    					if_block.m(label, t5);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(1336:8) {#each completedTodos as todo}",
    		ctx
    	});

    	return block;
    }

    // (1083:11) {:else}
    function create_else_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*post*/ ctx[105].profilePicture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Default Profile Pic");
    			attr_dev(img, "class", "w-8 h-8 rounded-sm self-center");
    			add_location(img, file, 1083, 12, 25655);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*posts*/ 4 && !src_url_equal(img.src, img_src_value = /*post*/ ctx[105].profilePicture)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(1083:11) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1077:11) {#if !post.profilePicture}
    function create_if_block_12(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Default Profile Pic");
    			attr_dev(img, "class", "w-8 h-8 rounded-sm self-center");
    			add_location(img, file, 1077, 12, 25417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(1077:11) {#if !post.profilePicture}",
    		ctx
    	});

    	return block;
    }

    // (1100:14) {#if post.createdAt != null}
    function create_if_block_11(ctx) {
    	let t_value = /*post*/ ctx[105].createdAt + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*posts*/ 4 && t_value !== (t_value = /*post*/ ctx[105].createdAt + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(1100:14) {#if post.createdAt != null}",
    		ctx
    	});

    	return block;
    }

    // (1105:12) {#if post.description != null}
    function create_if_block_10(ctx) {
    	let p;
    	let t_value = /*post*/ ctx[105].description + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file, 1105, 13, 26303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*posts*/ 4 && t_value !== (t_value = /*post*/ ctx[105].description + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(1105:12) {#if post.description != null}",
    		ctx
    	});

    	return block;
    }

    // (1113:42) 
    function create_if_block_8(ctx) {
    	let each_1_anchor;
    	let each_value_3 = /*post*/ ctx[105].files;
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*posts, activeChannel*/ 16388) {
    				each_value_3 = /*post*/ ctx[105].files;
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(1113:42) ",
    		ctx
    	});

    	return block;
    }

    // (1109:13) {#if post.description != null}
    function create_if_block_7(ctx) {
    	let p;
    	let t_value = /*post*/ ctx[105].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file, 1109, 14, 26436);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*posts*/ 4 && t_value !== (t_value = /*post*/ ctx[105].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(1109:13) {#if post.description != null}",
    		ctx
    	});

    	return block;
    }

    // (1121:15) {:else}
    function create_else_block(ctx) {
    	let div;
    	let svg;
    	let path;
    	let t0;
    	let a;
    	let t1_value = /*file*/ ctx[108].replace(`https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/user-files/${/*activeChannel*/ ctx[14]}/`, "") + "";
    	let t1;
    	let a_href_value;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t0 = space();
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z");
    			add_location(path, file, 1131, 18, 27205);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-6 w-6");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file, 1124, 17, 26968);
    			attr_dev(a, "href", a_href_value = /*file*/ ctx[108]);
    			attr_dev(a, "download", "");
    			add_location(a, file, 1138, 17, 27545);
    			attr_dev(div, "class", "rounded-md border-2 p-1 m-1 flex border-black max-h-16");
    			add_location(div, file, 1121, 16, 26848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);
    			append_dev(div, t0);
    			append_dev(div, a);
    			append_dev(a, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*posts, activeChannel*/ 16388 && t1_value !== (t1_value = /*file*/ ctx[108].replace(`https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/user-files/${/*activeChannel*/ ctx[14]}/`, "") + "")) set_data_dev(t1, t1_value);

    			if (dirty[0] & /*posts*/ 4 && a_href_value !== (a_href_value = /*file*/ ctx[108])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(1121:15) {:else}",
    		ctx
    	});

    	return block;
    }

    // (1115:15) {#if file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg")}
    function create_if_block_9(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "max-w-[90%] max-h-[90%]");
    			if (!src_url_equal(img.src, img_src_value = /*file*/ ctx[108])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "File");
    			add_location(img, file, 1115, 16, 26680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*posts*/ 4 && !src_url_equal(img.src, img_src_value = /*file*/ ctx[108])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(1115:15) {#if file.endsWith(\\\".png\\\") || file.endsWith(\\\".jpg\\\") || file.endsWith(\\\".jpeg\\\")}",
    		ctx
    	});

    	return block;
    }

    // (1114:14) {#each post.files as file}
    function create_each_block_3(ctx) {
    	let show_if;
    	let if_block_anchor;

    	function select_block_type_7(ctx, dirty) {
    		if (show_if == null || dirty[0] & /*posts*/ 4) show_if = !!(/*file*/ ctx[108].endsWith(".png") || /*file*/ ctx[108].endsWith(".jpg") || /*file*/ ctx[108].endsWith(".jpeg"));
    		if (show_if) return create_if_block_9;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_7(ctx, [-1, -1, -1, -1]);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_7(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(1114:14) {#each post.files as file}",
    		ctx
    	});

    	return block;
    }

    // (1151:13) {#if userSess.email.toLowerCase() == post.email}
    function create_if_block_6(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_7() {
    		return /*click_handler_7*/ ctx[56](/*post*/ ctx[105]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete";
    			attr_dev(button, "class", "ml-3 text-red-500");
    			add_location(button, file, 1151, 14, 27982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_7, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(1151:13) {#if userSess.email.toLowerCase() == post.email}",
    		ctx
    	});

    	return block;
    }

    // (1075:9) {#each posts as post}
    function create_each_block_2(ctx) {
    	let div3;
    	let t0;
    	let div2;
    	let div0;
    	let p0;

    	let t1_value = (/*post*/ ctx[105].personName != null
    	? /*post*/ ctx[105].personName
    	: /*post*/ ctx[105].email) + "";

    	let t1;
    	let t2;
    	let p1;
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let show_if = /*userSess*/ ctx[24].email.toLowerCase() == /*post*/ ctx[105].email;
    	let t6;

    	function select_block_type_5(ctx, dirty) {
    		if (!/*post*/ ctx[105].profilePicture) return create_if_block_12;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_5(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*post*/ ctx[105].createdAt != null && create_if_block_11(ctx);
    	let if_block2 = /*post*/ ctx[105].description != null && create_if_block_10(ctx);

    	function select_block_type_6(ctx, dirty) {
    		if (/*post*/ ctx[105].description != null) return create_if_block_7;
    		if (/*post*/ ctx[105].files != null) return create_if_block_8;
    	}

    	let current_block_type_1 = select_block_type_6(ctx);
    	let if_block3 = current_block_type_1 && current_block_type_1(ctx);
    	let if_block4 = show_if && create_if_block_6(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if_block0.c();
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			div1 = element("div");
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			attr_dev(p0, "class", "font-bold");
    			add_location(p0, file, 1091, 13, 25902);
    			attr_dev(p1, "class", "mx-2 text-gray-500");
    			add_location(p1, file, 1096, 13, 26056);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file, 1090, 12, 25870);
    			attr_dev(div1, "class", "flex");
    			add_location(div1, file, 1107, 12, 26359);
    			attr_dev(div2, "class", "pl-3 w-fit");
    			add_location(div2, file, 1089, 11, 25833);
    			attr_dev(div3, "class", "flex flex-row pl-1");
    			add_location(div3, file, 1075, 10, 25334);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			if_block0.m(div3, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p1);
    			if (if_block1) if_block1.m(p1, null);
    			append_dev(div2, t3);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			if (if_block3) if_block3.m(div1, null);
    			append_dev(div1, t5);
    			if (if_block4) if_block4.m(div1, null);
    			append_dev(div3, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div3, t0);
    				}
    			}

    			if (dirty[0] & /*posts*/ 4 && t1_value !== (t1_value = (/*post*/ ctx[105].personName != null
    			? /*post*/ ctx[105].personName
    			: /*post*/ ctx[105].email) + "")) set_data_dev(t1, t1_value);

    			if (/*post*/ ctx[105].createdAt != null) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_11(ctx);
    					if_block1.c();
    					if_block1.m(p1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*post*/ ctx[105].description != null) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_10(ctx);
    					if_block2.c();
    					if_block2.m(div2, t4);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_6(ctx)) && if_block3) {
    				if_block3.p(ctx, dirty);
    			} else {
    				if (if_block3) if_block3.d(1);
    				if_block3 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block3) {
    					if_block3.c();
    					if_block3.m(div1, t5);
    				}
    			}

    			if (dirty[0] & /*userSess, posts*/ 16777220) show_if = /*userSess*/ ctx[24].email.toLowerCase() == /*post*/ ctx[105].email;

    			if (show_if) {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_6(ctx);
    					if_block4.c();
    					if_block4.m(div1, null);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();

    			if (if_block3) {
    				if_block3.d();
    			}

    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(1075:9) {#each posts as post}",
    		ctx
    	});

    	return block;
    }

    // (1173:8) {#if showMentionPanel}
    function create_if_block_5(ctx) {
    	let div;
    	let each_value_1 = /*availableMentions*/ ctx[12];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "bg-white w-80 flex flex-col bottom-16 overflow-y-scroll");
    			add_location(div, file, 1173, 9, 28531);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*name, availableMentions, showMentionPanel, nameInput*/ 12298 | dirty[1] & /*handleKeydownMentions*/ 4096) {
    				each_value_1 = /*availableMentions*/ ctx[12];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(1173:8) {#if showMentionPanel}",
    		ctx
    	});

    	return block;
    }

    // (1177:10) {#each availableMentions as mentionPerson}
    function create_each_block_1(ctx) {
    	let button;
    	let t_value = /*mentionPerson*/ ctx[102] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_9() {
    		return /*click_handler_9*/ ctx[58](/*mentionPerson*/ ctx[102]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "id", "eachPerson");
    			attr_dev(button, "class", "hover:bg-gray-200 focus:bg-blue-600 focus:text-white focus:outline-none flex p-1");
    			add_location(button, file, 1177, 11, 28685);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "keydown", /*handleKeydownMentions*/ ctx[43], false, false, false),
    					listen_dev(button, "click", click_handler_9, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*availableMentions*/ 4096 && t_value !== (t_value = /*mentionPerson*/ ctx[102] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(1177:10) {#each availableMentions as mentionPerson}",
    		ctx
    	});

    	return block;
    }

    // (1500:6) {#if activeChannel != "null"}
    function create_if_block_3(ctx) {
    	let p;
    	let t1;
    	let t2;
    	let div;
    	let button0;
    	let t4;
    	let button1;
    	let t6;
    	let input;
    	let mounted;
    	let dispose;
    	let each_value = /*allChannelData*/ ctx[11];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Members:";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "+ Add Person";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "+ Remove Person";
    			t6 = space();
    			input = element("input");
    			attr_dev(p, "class", "font-bold text-xl m-1");
    			add_location(p, file, 1500, 7, 37953);
    			attr_dev(button0, "class", "p-2 m-1 rounded-md bg-emerald-400 shadow-lg");
    			add_location(button0, file, 1518, 8, 38553);
    			attr_dev(button1, "class", "p-2 m-1 rounded-md bg-red-500 shadow-lg");
    			add_location(button1, file, 1526, 8, 38787);
    			attr_dev(div, "class", "flex");
    			add_location(div, file, 1517, 7, 38526);
    			attr_dev(input, "placeholder", "Email of Person: ");
    			attr_dev(input, "class", "border-2 p-2 m-1 rounded-md");
    			add_location(input, file, 1535, 7, 39036);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t4);
    			append_dev(div, button1);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*newEmail*/ ctx[15]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_22*/ ctx[79], false, false, false),
    					listen_dev(button1, "click", /*click_handler_23*/ ctx[80], false, false, false),
    					listen_dev(input, "input", /*input_input_handler_2*/ ctx[81])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*allChannelData*/ 2048) {
    				each_value = /*allChannelData*/ ctx[11];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t2.parentNode, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*newEmail*/ 32768 && input.value !== /*newEmail*/ ctx[15]) {
    				set_input_value(input, /*newEmail*/ ctx[15]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(1500:6) {#if activeChannel != \\\"null\\\"}",
    		ctx
    	});

    	return block;
    }

    // (1502:7) {#each allChannelData as person}
    function create_each_block(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t1_value = /*person*/ ctx[99].name + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);

    			if (!src_url_equal(img.src, img_src_value = /*person*/ ctx[99].status == "online"
    			? "https://bit.ly/3rTxbrW"
    			: /*person*/ ctx[99].status == "away"
    				? "https://bit.ly/3AvrIvk"
    				: "https://png.pngitem.com/pimgs/s/204-2040894_grey-circle-icon-transparent-png-download-small-black.png")) attr_dev(img, "src", img_src_value);

    			attr_dev(img, "alt", "Status");
    			attr_dev(img, "class", "w-3 h-3");
    			add_location(img, file, 1503, 9, 38088);
    			attr_dev(p, "class", "m-1");
    			add_location(p, file, 1512, 9, 38435);
    			attr_dev(div, "class", "flex items-center");
    			add_location(div, file, 1502, 8, 38047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, p);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*allChannelData*/ 2048 && !src_url_equal(img.src, img_src_value = /*person*/ ctx[99].status == "online"
    			? "https://bit.ly/3rTxbrW"
    			: /*person*/ ctx[99].status == "away"
    				? "https://bit.ly/3AvrIvk"
    				: "https://png.pngitem.com/pimgs/s/204-2040894_grey-circle-icon-transparent-png-download-small-black.png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*allChannelData*/ 2048 && t1_value !== (t1_value = /*person*/ ctx[99].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(1502:7) {#each allChannelData as person}",
    		ctx
    	});

    	return block;
    }

    // (1555:6) {#if activeChannel != "null"}
    function create_if_block_2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Delete this channel";
    			attr_dev(button, "class", "p-2 m-1 rounded-md bg-red-500 shadow-lg");
    			add_location(button, file, 1555, 7, 39588);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_25*/ ctx[84], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(1555:6) {#if activeChannel != \\\"null\\\"}",
    		ctx
    	});

    	return block;
    }

    // (958:20)     <div class="flex justify-center items-center h-screen">     <p class="text-5xl text-emerald-500">Grabbing data...</p>    </div>   {:then}
    function create_pending_block(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Grabbing data...";
    			attr_dev(p, "class", "text-5xl text-emerald-500");
    			add_location(p, file, 959, 4, 22049);
    			attr_dev(div, "class", "flex justify-center items-center h-screen");
    			add_location(div, file, 958, 3, 21989);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		p: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(958:20)     <div class=\\\"flex justify-center items-center h-screen\\\">     <p class=\\\"text-5xl text-emerald-500\\\">Grabbing data...</p>    </div>   {:then}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*userSess*/ ctx[24] !== null) return create_if_block;
    		return create_else_block_6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "flex overflow-auto overflow-x-auto flex-col-reverse h-screen");
    			add_location(div, file, 955, 0, 21865);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop$2,
    		o: noop$2,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let nameInput; // for focus states
    	let posts;
    	let name = "";
    	let desc = "";
    	let userFiles = [];
    	let adminEmail = "";
    	let newName = "";
    	let profilePic = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
    	let chatOrTodo = "chat";
    	let newChannel = "";
    	let channels = [];
    	let channelData = "";
    	let channelPeople = [];
    	let allChannelData = [];
    	let availableMentions = [];
    	let showMentionPanel = false;
    	let activeChannel = "null";
    	let newEmail = "";
    	let oldPassword = "";
    	let newPassword = "";
    	let completedTodos = [];
    	let todos = [];
    	let signedIn = false;
    	let errorMsg = "";
    	let email = "";
    	let pass = "";
    	let deleting = false;
    	let opened = false;
    	const supabase = createClient("https://tymaawbbrmoeljisdgry.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTI2Nzc0OCwiZXhwIjoxOTU2ODQzNzQ4fQ.wzGimQFfkYZVvDQrT-fG5RTjDZhEBcGbYG6OVyWrNQs");
    	let userSess = supabase.auth.user();
    	let peopleStatusChannel = [];

    	async function getData() {
    		const res2 = await supabase.from("channels").select("*");
    		await downloadProfilePic();

    		//channels = [];
    		channelData = "";

    		$$invalidate(10, channelPeople = []);
    		$$invalidate(11, allChannelData = []);
    		const userData = await supabase.from("users").select("*");

    		for (let i in res2.data) {
    			if (res2.data[i].name == activeChannel) {
    				channelData = res2.data[i].access;

    				for (let j in userData.data) {
    					if (res2.data[i].access.includes(userData.data[j].email)) {
    						if (userData.data[j].name != null) {
    							$$invalidate(10, channelPeople = [...channelPeople, userData.data[j].name]);
    							peopleStatusChannel = [...peopleStatusChannel, userData.data[j].status];
    							$$invalidate(11, allChannelData = [...allChannelData, userData.data[j]]);
    						}
    					}
    				}

    				console.log(channelPeople);
    			}
    		}

    		$$invalidate(9, channels = []);

    		for (let i in res2.data) {
    			if (res2.data[i].access.includes(userSess.email)) {
    				$$invalidate(9, channels = [...channels, res2.data[i].name]);
    			}
    		}

    		if (activeChannel != "null") {
    			const res = await supabase.from("posts").select("*").eq("channel", activeChannel).order("id");
    			$$invalidate(2, posts = res.data);
    			const latestPost = await supabase.from("posts").select("*").order("id", { ascending: false });
    			console.log(latestPost);
    			let s2 = null;
    			const nameMentions = await supabase.from("users").select("*").eq("email", userSess.email);
    			console.log(nameMentions);

    			if (nameMentions.data.length != 0) {
    				if (nameMentions.data[0].name != null) {
    					s2 = ("@").concat(nameMentions.data[0].name);
    				}
    			}

    			let s = ('@"').concat(userSess.email, '"');

    			//console.log(latestPost.data[0].name)
    			console.log(s);

    			if (latestPost.data.length != 0 && latestPost.data[0].name != null) {
    				if (latestPost.data[0].name.includes(s) || latestPost.data[0].description.includes(s) || latestPost.data[0].name.includes(s2)) {
    					console.log("mentioned");
    					Notification.requestPermission();
    					let newNotif = new Notification(`You got mentioned in ${latestPost.data[0].channel} (click to open)!`, { body: `${latestPost.data[0].name}` });

    					newNotif.addEventListener("click", function () {
    						window.open(`/`);
    					});

    					console.log("mentioned");
    				}
    			}

    			$$invalidate(18, todos = []);
    			const res2 = await supabase.from("todos").select("*").eq("channel", activeChannel).eq("completed", false).order("id");
    			$$invalidate(18, todos = res2.data);
    			$$invalidate(17, completedTodos = []);
    			const res3 = await supabase.from("todos").select("*").eq("channel", activeChannel).eq("completed", true).order("id");
    			$$invalidate(17, completedTodos = res3.data);
    		} else {
    			const res = await supabase.from("posts").select("*").eq("channel", "null").order("id");
    			$$invalidate(2, posts = res.data);
    			const latestPost = await supabase.from("posts").select("*").order("id", { ascending: false });
    			console.log(latestPost);
    			let s2 = null;
    			const nameMentions = await supabase.from("users").select("*").eq("email", userSess.email);
    			console.log(nameMentions);

    			if (nameMentions.data.length != 0) {
    				if (nameMentions.data[0].name != null) {
    					s2 = ("@").concat(nameMentions.data[0].name);
    				}
    			}

    			let s = ('@"').concat(userSess.email, '"');
    			console.log(latestPost.data[0].name);
    			console.log(s);

    			if (latestPost.data.length != 0 && latestPost.data[0].name != null) {
    				if (latestPost.data[0].name.includes(s) || latestPost.data[0].description.includes(s) || latestPost.data[0].name.includes(s2)) {
    					console.log("mentioned");
    					Notification.requestPermission();

    					let newNotif = new Notification(`You got mentioned in ${latestPost.data[0].channel != "null"
						? latestPost.data[0].channel
						: "Public Chat"} (click to open)!`,
    					{ body: `${latestPost.data[0].name}` });

    					newNotif.addEventListener("click", function () {
    						window.open(`/`);
    					});

    					console.log("mentioned");
    				}
    			}

    			$$invalidate(18, todos = []);
    			const res2 = await supabase.from("todos").select("*").eq("channel", "null").eq("completed", false).order("id");
    			$$invalidate(18, todos = res2.data);
    			$$invalidate(17, completedTodos = []);
    			const res3 = await supabase.from("todos").select("*").eq("channel", "null").eq("completed", true).order("id");
    			$$invalidate(17, completedTodos = res3.data);
    		}
    	}

    	async function updateTodo(newValue, todoName) {
    		await supabase.from("todos").update({ completed: newValue }).eq("name", todoName);
    	}

    	async function addPost(channelName) {
    		if (name == "") {
    			$$invalidate(19, errorMsg = "Please enter your message!");

    			setTimeout(
    				() => {
    					$$invalidate(19, errorMsg = "");
    				},
    				1500
    			);
    		} else {
    			//console.log(profilePic)
    			$$invalidate(13, showMentionPanel = false);

    			let postDate = new Date();
    			let postMinutes = postDate.getMinutes();
    			let postHours = postDate.getHours();
    			let amPm = " AM";
    			let addOn = "";

    			if (postMinutes < 10) {
    				addOn = "0";
    			}

    			if (postHours > 12) {
    				postHours -= 12;
    				amPm = " PM";
    			} else if (postHours == 12) {
    				amPm = " PM";
    			} else if (postHours == 0) {
    				postHours += 12;
    			}

    			let valueForName = null;
    			const { data, error } = await supabase.from("users").select().eq("email", userSess.email);

    			//console.log(data);
    			if (data.length != 0) {
    				if (data[0].name != null) {
    					valueForName = data[0].name;
    				}
    			}

    			await supabase.from("posts").insert([
    				{
    					name,
    					description: desc,
    					email: userSess.email,
    					channel: channelName,
    					profilePicture: profilePic,
    					createdAt: postDate.getMonth() + 1 + "/" + postDate.getDate() + " " + postHours + ":" + addOn + postMinutes + amPm,
    					personName: valueForName
    				}
    			]);

    			$$invalidate(3, name = "");
    			desc = "";
    		}
    	}

    	async function addTodo(channelName) {
    		if (name == "") {
    			$$invalidate(19, errorMsg = "Please enter a name!");

    			setTimeout(
    				() => {
    					$$invalidate(19, errorMsg = "");
    				},
    				1500
    			);
    		} else {
    			await supabase.from("todos").insert([
    				{
    					name,
    					completed: false,
    					channel: channelName,
    					email: userSess.email
    				}
    			]);

    			$$invalidate(3, name = "");
    		}
    	}

    	async function addChannel() {
    		if (newChannel == "") {
    			$$invalidate(19, errorMsg = "Please enter a channel name!");

    			setTimeout(
    				() => {
    					$$invalidate(19, errorMsg = "");
    				},
    				1500
    			);
    		} else {
    			await supabase.from("channels").insert([{ name: newChannel, access: userSess.email }]);
    		}
    	}

    	async function addPerson() {
    		console.log(activeChannel);
    		const res = await supabase.from("channels").select("*").eq("name", activeChannel);
    		console.log(res.data);
    		const newStr = res.data[0].access.concat(", ", newEmail);
    		console.log(newStr);
    		await supabase.from("channels").update({ access: newStr }).eq("name", activeChannel);
    	}

    	async function removePerson() {
    		console.log(activeChannel);
    		const res = await supabase.from("channels").select("*").eq("name", activeChannel);
    		console.log(res.data);
    		const newStr = res.data[0].access.replace(newEmail, "");
    		console.log(newStr);
    		await supabase.from("channels").update({ access: newStr }).eq("name", activeChannel);
    	}

    	async function deletePost(postI, postN, postD, postE, isFile, postFiles) {
    		$$invalidate(19, errorMsg = "");
    		$$invalidate(22, deleting = true);

    		await supabase.from("posts").delete().match({
    			//name: postN,
    			//description: postD,
    			id: postI
    		});

    		if (isFile) {
    			for (let i = 0; i < postFiles.length; i++) {
    				await supabase.storage.from("user-files").remove([
    					postFiles[i].replace(`https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/user-files/`, "")
    				]);
    			}
    		}

    		//await getData();
    		$$invalidate(22, deleting = false);
    	}

    	async function deleteTodo(todoI, todoN) {
    		$$invalidate(19, errorMsg = "");
    		$$invalidate(22, deleting = true);
    		await supabase.from("todos").delete().match({ name: todoN, id: todoI });
    		await getData();
    		$$invalidate(22, deleting = false);
    	}

    	async function deleteChannel() {
    		$$invalidate(19, errorMsg = "");
    		$$invalidate(22, deleting = true);
    		await supabase.from("channels").delete().match({ name: activeChannel });
    		await supabase.from("posts").delete().match({ channel: activeChannel });
    		location.reload();
    		$$invalidate(22, deleting = false);
    	}

    	async function signUp(email, password, isAdmin) {
    		const { user, session, error } = await supabase.auth.signUp({ email, password });

    		if (error !== null) {
    			$$invalidate(19, errorMsg = error.message);
    		} else {
    			$$invalidate(19, errorMsg = "");

    			if (!isAdmin) {
    				$$invalidate(24, userSess = user);
    			} else {
    				$$invalidate(4, adminEmail = "");
    			}

    			signedIn = true;
    		} //localStorage.signedIn = true
    	}

    	async function signIn(email, password) {
    		const { user, session, error } = await supabase.auth.signIn({ email, password });

    		if (error !== null) {
    			$$invalidate(19, errorMsg = error.message);
    		} else {
    			$$invalidate(19, errorMsg = "");

    			//user = user;
    			$$invalidate(24, userSess = user);

    			signedIn = true;
    		} //localStorage.signedIn = true
    	}

    	async function signOut() {
    		const { error } = await supabase.auth.signOut();

    		if (error !== null) {
    			$$invalidate(19, errorMsg = error.message);

    			setTimeout(
    				() => {
    					$$invalidate(19, errorMsg = "");
    				},
    				1500
    			);
    		} else {
    			signedIn = false;
    			location.reload();
    		} //localStorage.signedIn = false
    	}

    	supabase.from("posts").on("*", res => {
    		//console.log(res);
    		getData();
    	}).subscribe(); //console.log(posts);

    	supabase.from("todos").on("*", res => {
    		//console.log(res);
    		getData();
    	}).subscribe(); //location.reload();
    	//console.log(todos);

    	function openSidebar() {
    		if (!opened && !otherOpened) {
    			document.getElementById("switchButton").style.visibility = "hidden";
    			document.getElementById("infoButton").style.visibility = "hidden";
    			document.getElementById("sidebar").style.width = "80%";
    			$$invalidate(23, opened = true);
    		} else {
    			document.getElementById("sidebar").style.width = "0%";
    			document.getElementById("switchButton").style.visibility = "visible";
    			document.getElementById("infoButton").style.visibility = "visible";
    			$$invalidate(23, opened = false);
    		}
    	}

    	let otherOpened = false;

    	function openOtherSidebar() {
    		if (!otherOpened && !opened) {
    			document.getElementById("othersidebar").style.width = "80%";
    			$$invalidate(25, otherOpened = true);
    		} else {
    			document.getElementById("othersidebar").style.width = "0%";
    			$$invalidate(25, otherOpened = false);
    		}
    	}

    	let activeMentionPeople;
    	let activeMentionPerson = availableMentions.length;

    	function handleKeydown(event) {
    		//console.log(activeMentionPeople)
    		activeMentionPerson = availableMentions.length;

    		if (event.key == "Enter") {
    			addPost(activeChannel);
    		}

    		if (event.keyCode == 38) {
    			event.preventDefault();
    			activeMentionPerson = activeMentionPerson > 0 ? activeMentionPerson - 1 : 0;
    			activeMentionPeople[activeMentionPerson].focus();
    		}
    	}

    	function handleKeydownMentions(event) {
    		if (event.keyCode == 38) {
    			event.preventDefault();
    			activeMentionPerson = activeMentionPerson > 0 ? activeMentionPerson - 1 : 0;
    			activeMentionPeople[activeMentionPerson].focus();
    		} else if (event.keyCode == 40) {
    			event.preventDefault();

    			activeMentionPerson = activeMentionPerson < activeMentionPeople.length - 1
    			? activeMentionPerson + 1
    			: activeMentionPeople.length - 1;

    			activeMentionPeople[activeMentionPerson].focus();
    		} else if (event.keyCode == 27) {
    			document.getElementById("chatInput").focus();
    		}
    	}

    	function handleKeydownTodo(event) {
    		if (event.key == "Enter") {
    			addTodo(activeChannel);
    		}
    	}

    	async function uploadProfilePic(e) {
    		console.log(e.target.files[0]);
    		var file = e.target.files[0];

    		if (e.target.files || e.target.files.length != 0) {
    			console.log(file);
    			console.log(file.name.split(".").pop());
    			const fileName = `${userSess.id}/profile-picture.png`;

    			/*const { data1, error1 } = await supabase.storage
    	.from("profile-pics")
    	.remove([fileName]);*/
    			const { data, error } = await supabase.storage.from("profile-pics").upload(fileName, file, { cacheControl: "0", upsert: true });

    			location.reload();
    			console.log(data);
    		}
    	}

    	async function removeProfilePic() {
    		const fileName = `${userSess.id}/profile-picture.png`;
    		const response = await fetch("https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png");

    		// here image is url/location of image
    		const blob = await response.blob();

    		const file = new File([blob], "image.jpg", { type: blob.type });
    		await supabase.storage.from("profile-pics").upload(fileName, file, { cacheControl: "0", upsert: true });
    		location.reload();
    	}

    	async function downloadProfilePic() {
    		try {
    			const res = await fetch(`https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/profile-pics/${userSess.id}/profile-picture.png`);

    			if (res.status != 400) {
    				$$invalidate(6, profilePic = `https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/profile-pics/${userSess.id}/profile-picture.png`);
    			}
    		} catch {
    			
    		}
    	}

    	async function uploadFiles(e) {
    		let filesArr = [];
    		let filePaths = [];
    		console.log(e.target.files[0]);

    		if (e.target.files || e.target.files.length != 0) {
    			const { data, error } = await supabase.storage.from("user-files").list(activeChannel);

    			//console.log(data);
    			$$invalidate(19, errorMsg = "Uploading Files...");

    			for (let i = 0; i < e.target.files.length; i++) {
    				let fileName = e.target.files[i].name;
    				let addOn = 0;

    				for (let j = 0; j < data.length; j++) {
    					if (fileName == data[j].name) {
    						fileName = fileName.substring(0, fileName.lastIndexOf(".")) + `-${addOn}` + fileName.substring(fileName.lastIndexOf("."));
    						j = -1;
    						addOn++;
    						continue;
    					}
    				}

    				filesArr.push(fileName);
    				filePaths.push(`https://tymaawbbrmoeljisdgry.supabase.co/storage/v1/object/public/user-files/${activeChannel}/${fileName}`);
    			}

    			for (let i = 0; i < e.target.files.length; i++) {
    				await supabase.storage.from("user-files").upload(`${activeChannel}/${filesArr[i]}`, e.target.files[i], { cacheControl: "0", upsert: false });
    			}

    			let postDate = new Date();
    			let postMinutes = postDate.getMinutes();
    			let postHours = postDate.getHours();
    			let amPm = " AM";
    			let addOn = "";

    			if (postMinutes < 10) {
    				addOn = "0";
    			}

    			if (postHours > 12) {
    				postHours -= 12;
    				amPm = " PM";
    			} else if (postHours == 12) {
    				amPm = " PM";
    			} else if (postHours == 0) {
    				postHours += 12;
    			}

    			let valueForName = null;
    			const newRes = await supabase.from("users").select().eq("email", userSess.email);

    			if (newRes.data.length != 0) {
    				if (newRes.data[0].name != null) {
    					valueForName = newRes.data[0].name;
    				}
    			}

    			await supabase.from("posts").insert([
    				{
    					email: userSess.email,
    					channel: activeChannel,
    					profilePicture: profilePic,
    					createdAt: postDate.getMonth() + 1 + "/" + postDate.getDate() + " " + postHours + ":" + addOn + postMinutes + amPm,
    					files: filePaths,
    					personName: valueForName
    				}
    			]);

    			$$invalidate(19, errorMsg = "");
    		}
    	}

    	let timeout;
    	let mouseMoving = false;
    	let mouseMoved = false;
    	ifvisible.setIdleDuration(120);

    	window.addEventListener("DOMContentLoaded", async function () {
    		const data2nd = await supabase.from("users").select().eq("email", userSess.email);

    		//console.log(data);
    		if (data2nd.data[0].status != "online") {
    			console.log(data2nd.data[0].status);

    			await supabase.from("users").upsert({
    				id: data2nd.data[0].id,
    				email: userSess.email,
    				status: "online"
    			});
    		}
    	});

    	window.onbeforeunload = async function () {
    		const data2nd = await supabase.from("users").select().eq("email", userSess.email);

    		//console.log(data);
    		if (data2nd.data[0].status != "offline") {
    			console.log(data2nd.data[0].status);

    			await supabase.from("users").upsert({
    				id: data2nd.data[0].id,
    				email: userSess.email,
    				status: "offline"
    			});
    		}

    		console.log("went here!");
    		return null;
    	};

    	ifvisible.on("idle", async function () {
    		const data2nd = await supabase.from("users").select().eq("email", userSess.email);

    		//console.log(data);
    		if (data2nd.data[0].status != "away") {
    			console.log(data2nd.data[0].status);

    			await supabase.from("users").upsert({
    				id: data2nd.data[0].id,
    				email: userSess.email,
    				status: "away"
    			});
    		}
    	});

    	ifvisible.on("wakeup", async function () {
    		const data2nd = await supabase.from("users").select().eq("email", userSess.email);

    		//console.log(data);
    		if (data2nd.data[0].status != "online") {
    			console.log(data2nd.data[0].status);

    			await supabase.from("users").upsert({
    				id: data2nd.data[0].id,
    				email: userSess.email,
    				status: "online"
    			});
    		}
    	});

    	/*setInterval(async () => {
    	if (!mouseMoved && mouseMoving) {
    		const data2nd = await supabase
    			.from("users")
    			.select()
    			.eq("email", userSess.email);
    		//console.log(data);
    		if (data2nd.data[0].status != "away") {
    			console.log(data2nd.data[0].status);
    			const { data1, error1 } = await supabase.from("users").upsert({
    				id: data2nd.data[0].id,
    				email: userSess.email,
    				status: "away",
    			});
    		}
    		mouseMoving = false;
    	}
    	mouseMoved = false;
    }, 5000);*/
    	/*document.onmousemove = async function () {
    	//clearTimeout(timeout);
    	mouseMoving = true;
    	mouseMoved = true;
    	const { data, error } = await supabase
    		.from("users")
    		.select()
    		.eq("email", userSess.email);

    	//console.log(data);
    	if (data[0].status != "online") {
    		console.log(data[0].status)
    		const { data2, error2 } = await supabase.from("users").upsert({
    			id: data[0].id,
    			email: userSess.email,
    			status: "online",
    		});
    	}
    	timeout = setTimeout(async function () {
    		
    	}, 5000);
    };*/
    	supabase.from("users").on("*", res => {
    		//console.log(res);
    		channelData.split(",").forEach((element, i) => {
    			if (element == res.new.email) {
    				peopleStatusChannel[i] = res.new.status;

    				allChannelData.forEach((val, i) => {
    					//console.log(res.new.name)
    					if (val.name == res.new.name) {
    						$$invalidate(11, allChannelData[i].status = res.new.status, allChannelData);
    					}
    				});
    			}
    		});
    	}).subscribe(); //location.reload();
    	//console.log(todos);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = channel => {
    		$$invalidate(14, activeChannel = channel);
    		openOtherSidebar();
    		getData();
    	};

    	const click_handler_1 = channel => {
    		$$invalidate(14, activeChannel = channel);
    		openOtherSidebar();
    		getData();
    	};

    	const click_handler_2 = () => {
    		$$invalidate(14, activeChannel = "null");
    		openOtherSidebar();
    		getData();
    	};

    	const click_handler_3 = () => {
    		$$invalidate(14, activeChannel = "null");
    		openOtherSidebar();
    		getData();
    	};

    	const click_handler_4 = async () => {
    		await signOut();
    	};

    	const click_handler_5 = () => {
    		$$invalidate(7, chatOrTodo = "profile");
    		openOtherSidebar();
    	};

    	const click_handler_6 = () => {
    		$$invalidate(7, chatOrTodo = "todos");
    	};

    	const click_handler_7 = post => {
    		deletePost(post.id, post.name, post.description, post.email, post.isFile, post.files);
    	};

    	const click_handler_8 = () => {
    		if (otherOpened) {
    			openOtherSidebar();
    		}

    		if (opened) {
    			openSidebar();
    		}
    	};

    	const click_handler_9 = mentionPerson => {
    		let newText = name.substring(0, name.lastIndexOf("@")) + "@" + mentionPerson + " ";
    		$$invalidate(3, name = newText);
    		$$invalidate(13, showMentionPanel = false);
    		nameInput.focus();
    	};

    	function input1_input_handler() {
    		name = this.value;
    		$$invalidate(3, name);
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			nameInput = $$value;
    			$$invalidate(1, nameInput);
    		});
    	}

    	const keyup_handler = () => {
    		$$invalidate(26, activeMentionPeople = document.querySelectorAll("[id=eachPerson]"));
    	};

    	const input_handler = () => {
    		let subStr = name.substring(name.lastIndexOf("@") + 1);
    		let myVar = false;
    		$$invalidate(12, availableMentions = []);

    		if (name.lastIndexOf("@") != -1) {
    			for (let i in channelPeople) {
    				if (channelPeople[i].includes(subStr)) {
    					myVar = true;
    					$$invalidate(13, showMentionPanel = true);
    					$$invalidate(12, availableMentions = [...availableMentions, channelPeople[i]]);
    				}
    			}
    		}

    		if (!myVar) {
    			$$invalidate(12, availableMentions = []);
    			$$invalidate(13, showMentionPanel = false);
    		}
    	};

    	const click_handler_10 = () => {
    		addPost(activeChannel);
    	};

    	const click_handler_11 = () => {
    		$$invalidate(7, chatOrTodo = "chat");
    	};

    	const click_handler_12 = todo => {
    		updateTodo(true, todo.name);
    	};

    	const click_handler_13 = todo => {
    		deleteTodo(todo.id, todo.name);
    	};

    	const click_handler_14 = todo => {
    		updateTodo(false, todo.name);
    	};

    	const click_handler_15 = todo => {
    		updateTodo(false, todo.name);
    	};

    	const click_handler_16 = todo => {
    		deleteTodo(todo.id, todo.name);
    	};

    	function input_input_handler() {
    		name = this.value;
    		$$invalidate(3, name);
    	}

    	const click_handler_17 = () => {
    		addTodo(activeChannel);
    	};

    	const click_handler_18 = () => {
    		$$invalidate(7, chatOrTodo = "chat");
    	};

    	function input1_input_handler_1() {
    		newPassword = this.value;
    		$$invalidate(16, newPassword);
    	}

    	const click_handler_19 = async () => {
    		await supabase.auth.update({ password: newPassword });
    		location.reload();
    	};

    	function input2_input_handler() {
    		newName = this.value;
    		$$invalidate(5, newName);
    	}

    	const click_handler_20 = async () => {
    		const { data, error } = await supabase.from("users").select().eq("email", userSess.email);
    		console.log(data);

    		if (data.length != 0) {
    			console.log("here");

    			await supabase.from("users").upsert({
    				id: data[0].id,
    				email: userSess.email,
    				status: "online",
    				name: newName
    			});
    		} else {
    			await supabase.from("users").insert({
    				email: userSess.email,
    				status: "online",
    				name: newName
    			});
    		}

    		location.reload();
    	};

    	function input_input_handler_1() {
    		adminEmail = this.value;
    		$$invalidate(4, adminEmail);
    	}

    	const click_handler_21 = () => {
    		signUp(adminEmail, "password", true);
    	};

    	const click_handler_22 = async () => {
    		await addPerson();
    		$$invalidate(15, newEmail = "");
    		await getData();
    	};

    	const click_handler_23 = async () => {
    		await removePerson();
    		$$invalidate(15, newEmail = "");
    		await getData();
    	};

    	function input_input_handler_2() {
    		newEmail = this.value;
    		$$invalidate(15, newEmail);
    	}

    	const click_handler_24 = async () => {
    		await addChannel();
    		$$invalidate(8, newChannel = "");
    		await getData();
    	};

    	function input_input_handler_3() {
    		newChannel = this.value;
    		$$invalidate(8, newChannel);
    	}

    	const click_handler_25 = () => {
    		deleteChannel();
    	};

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(20, email);
    	}

    	function input1_input_handler_2() {
    		pass = this.value;
    		$$invalidate(21, pass);
    	}

    	const click_handler_26 = () => {
    		window.open(`mailto:s-rkarthik@lwsd.org?subject=I'd like to sign up for the chat app!&body=I'd like to sign up for the chat app! Here's the email I would like to use: ${email}.`);
    	};

    	const click_handler_27 = () => {
    		signIn(email, pass);
    	};

    	$$self.$capture_state = () => ({
    		nameInput,
    		posts,
    		name,
    		desc,
    		userFiles,
    		adminEmail,
    		newName,
    		profilePic,
    		chatOrTodo,
    		newChannel,
    		channels,
    		channelData,
    		channelPeople,
    		allChannelData,
    		availableMentions,
    		showMentionPanel,
    		activeChannel,
    		newEmail,
    		oldPassword,
    		newPassword,
    		completedTodos,
    		todos,
    		signedIn,
    		errorMsg,
    		email,
    		pass,
    		deleting,
    		opened,
    		createClient,
    		element,
    		supabase,
    		userSess,
    		peopleStatusChannel,
    		getData,
    		updateTodo,
    		addPost,
    		addTodo,
    		addChannel,
    		addPerson,
    		removePerson,
    		deletePost,
    		deleteTodo,
    		deleteChannel,
    		signUp,
    		signIn,
    		signOut,
    		openSidebar,
    		otherOpened,
    		openOtherSidebar,
    		activeMentionPeople,
    		activeMentionPerson,
    		handleKeydown,
    		handleKeydownMentions,
    		handleKeydownTodo,
    		uploadProfilePic,
    		removeProfilePic,
    		downloadProfilePic,
    		uploadFiles,
    		timeout,
    		mouseMoving,
    		mouseMoved,
    		ifvisible: ifvisible$1
    	});

    	$$self.$inject_state = $$props => {
    		if ('nameInput' in $$props) $$invalidate(1, nameInput = $$props.nameInput);
    		if ('posts' in $$props) $$invalidate(2, posts = $$props.posts);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('desc' in $$props) desc = $$props.desc;
    		if ('userFiles' in $$props) userFiles = $$props.userFiles;
    		if ('adminEmail' in $$props) $$invalidate(4, adminEmail = $$props.adminEmail);
    		if ('newName' in $$props) $$invalidate(5, newName = $$props.newName);
    		if ('profilePic' in $$props) $$invalidate(6, profilePic = $$props.profilePic);
    		if ('chatOrTodo' in $$props) $$invalidate(7, chatOrTodo = $$props.chatOrTodo);
    		if ('newChannel' in $$props) $$invalidate(8, newChannel = $$props.newChannel);
    		if ('channels' in $$props) $$invalidate(9, channels = $$props.channels);
    		if ('channelData' in $$props) channelData = $$props.channelData;
    		if ('channelPeople' in $$props) $$invalidate(10, channelPeople = $$props.channelPeople);
    		if ('allChannelData' in $$props) $$invalidate(11, allChannelData = $$props.allChannelData);
    		if ('availableMentions' in $$props) $$invalidate(12, availableMentions = $$props.availableMentions);
    		if ('showMentionPanel' in $$props) $$invalidate(13, showMentionPanel = $$props.showMentionPanel);
    		if ('activeChannel' in $$props) $$invalidate(14, activeChannel = $$props.activeChannel);
    		if ('newEmail' in $$props) $$invalidate(15, newEmail = $$props.newEmail);
    		if ('oldPassword' in $$props) oldPassword = $$props.oldPassword;
    		if ('newPassword' in $$props) $$invalidate(16, newPassword = $$props.newPassword);
    		if ('completedTodos' in $$props) $$invalidate(17, completedTodos = $$props.completedTodos);
    		if ('todos' in $$props) $$invalidate(18, todos = $$props.todos);
    		if ('signedIn' in $$props) signedIn = $$props.signedIn;
    		if ('errorMsg' in $$props) $$invalidate(19, errorMsg = $$props.errorMsg);
    		if ('email' in $$props) $$invalidate(20, email = $$props.email);
    		if ('pass' in $$props) $$invalidate(21, pass = $$props.pass);
    		if ('deleting' in $$props) $$invalidate(22, deleting = $$props.deleting);
    		if ('opened' in $$props) $$invalidate(23, opened = $$props.opened);
    		if ('userSess' in $$props) $$invalidate(24, userSess = $$props.userSess);
    		if ('peopleStatusChannel' in $$props) peopleStatusChannel = $$props.peopleStatusChannel;
    		if ('otherOpened' in $$props) $$invalidate(25, otherOpened = $$props.otherOpened);
    		if ('activeMentionPeople' in $$props) $$invalidate(26, activeMentionPeople = $$props.activeMentionPeople);
    		if ('activeMentionPerson' in $$props) activeMentionPerson = $$props.activeMentionPerson;
    		if ('timeout' in $$props) timeout = $$props.timeout;
    		if ('mouseMoving' in $$props) mouseMoving = $$props.mouseMoving;
    		if ('mouseMoved' in $$props) mouseMoved = $$props.mouseMoved;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		supabase,
    		nameInput,
    		posts,
    		name,
    		adminEmail,
    		newName,
    		profilePic,
    		chatOrTodo,
    		newChannel,
    		channels,
    		channelPeople,
    		allChannelData,
    		availableMentions,
    		showMentionPanel,
    		activeChannel,
    		newEmail,
    		newPassword,
    		completedTodos,
    		todos,
    		errorMsg,
    		email,
    		pass,
    		deleting,
    		opened,
    		userSess,
    		otherOpened,
    		activeMentionPeople,
    		getData,
    		updateTodo,
    		addPost,
    		addTodo,
    		addChannel,
    		addPerson,
    		removePerson,
    		deletePost,
    		deleteTodo,
    		deleteChannel,
    		signUp,
    		signIn,
    		signOut,
    		openSidebar,
    		openOtherSidebar,
    		handleKeydown,
    		handleKeydownMentions,
    		handleKeydownTodo,
    		uploadProfilePic,
    		removeProfilePic,
    		downloadProfilePic,
    		uploadFiles,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		input1_input_handler,
    		input1_binding,
    		keyup_handler,
    		input_handler,
    		click_handler_10,
    		click_handler_11,
    		click_handler_12,
    		click_handler_13,
    		click_handler_14,
    		click_handler_15,
    		click_handler_16,
    		input_input_handler,
    		click_handler_17,
    		click_handler_18,
    		input1_input_handler_1,
    		click_handler_19,
    		input2_input_handler,
    		click_handler_20,
    		input_input_handler_1,
    		click_handler_21,
    		click_handler_22,
    		click_handler_23,
    		input_input_handler_2,
    		click_handler_24,
    		input_input_handler_3,
    		click_handler_25,
    		input0_input_handler,
    		input1_input_handler_2,
    		click_handler_26,
    		click_handler_27
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { supabase: 0 }, null, [-1, -1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get supabase() {
    		return this.$$.ctx[0];
    	}

    	set supabase(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
