import exec from "oxigen-core/Maker/index.js";
import html from "oxigen-core/Html/index.js";

/**
 * get the type of object
 * @param {Any} o 
 * @returns {String}
 */
function type(o) {
    return Object.prototype.toString.call(o).slice(8).slice(0, -1).toLowerCase();
}

function Router() {
    var _root, _loader,
        _prev = [],
        _next = [],
        _hash = null,
        _routes = [];

    /**
     * set the root element of the Router
     * @param {Node|String} root
     * @returns {Router}
     */
    function Router(root) {
        _root = root instanceof Node ? root : document.querySelector(root);
        Router.props.root = _root;
        return Router;
    }

    Router.props = {
        root: undefined,
        loader: undefined,
        hash: null,
        routes: [],
        log: {
            previous: {},
            current: {},
        },
    };

    /**
     * set prev function(s) of the Router
     * @param {Function(s)} prev
     * @returns {Router}
     */
    Router.prev = function(...prev) {
        _prev = [..._prev, ...prev];
        return this;
    };

    /**
     * set next function(s) of the Router
     * @param {Function(s)} next
     * @returns {Router}
     */
    Router.next = function(...next) {
        _next = [..._next, ...next];
        return this;
    };

    /**
     * set load function of the Router
     * @param {Function} load
     * @returns {Router}
     */
    Router.load = function(load) {
        if (type(load) === "function") document.addEventListener("DOMContentLoaded", load);
        return this;
    };

    /**
     * set the hash prop of the Router
     * @param {Boolean} hash
     * @returns {Router}
     */
    Router.hash = function(hash) {
        _hash = type(hash) === "boolean" ? hash : true;
        return this;
    };

    /**
     * set the loader prop of the Router
     * @param {Any} loader
     * @returns {Router}
     */
    Router.loader = function(loader) {
        _loader = loader;
        return this;
    };

    /**
     * initilize the Router
     * @returns {Router}
     */
    Router.init = function() {
        var self = this;
        if (_hash && !location.hash) location.hash = "#/";
        _hash
            ?
            window.addEventListener("hashchange", function() {
                self.goto(location.hash.slice(1));
            }) :
            window.addEventListener("popstate", function(e) {
                self.goto(history.state.path);
            });
        if (_hash) self.goto(location.hash.slice(1));
        else self.goto(location.pathname);
        return self;
    };

    /**
     * add new route to the Router
     * @param {String} path
     * @param {String|Object|Node|Function|Promise} view
     * @param {String|Null} name
     * @returns {Router}
     */
    Router.add = function(path, view, name, guard = () => true) {
        const is = _routes.find((r) => r.path === path);
        if (!is && type(path) === "string" && (["string", "object", "function", "asyncfunction"].includes(type(view)) || view instanceof Node)) {
            path = path.endsWith("/") && path.length > 1 ? path.substr(0, path.length - 1) : path;
            _routes.push({ path: path, view: view, name: name, guard: guard });
            this.props = {
                ...this.props,
                routes: _routes,
            };
        }
        return this;
    };

    /**
     * add scoped routes to the Router
     * @param {String} path
     * @param {Function} fn
     * @returns {Router}
     */
    Router.scope = function(path, fn, guard = () => true) {
        var router = {
            routes: [],
            prepath: [path],
            guard: guard,
            add: function(path, view, name, _guard) {
                if (type(path) === "string" && (["string", "object", "function", "asyncfunction"].includes(type(view)) || view instanceof HTMLElement)) {
                    path = !path || path == "*" ? "/404" : path;
                    path = path.startsWith("/") ? path : "/" + path;
                    path = path.endsWith("/") ? path.substr(0, path.length - 2) : path;
                    this.routes.push({
                        view: view,
                        name: name,
                        guard: _guard ? _guard : this.guard,
                        path: this.prepath.join("") + path,
                    });
                }
                return this;
            },
            scope: function(path, fn, guard = () => true) {
                this.prepath.push(path);
                this.guard = guard;
                fn.call(this);
                return this;
            },
        };
        fn.call(router);
        _routes = [..._routes, ...router.routes];
        return this;
    };

    /**
     * change the view according to provaded value
     * @param {String} url
     * @returns {Router}
     */
    Router.goto = function(url) {
        if (!history.state || history.state.path !== url) {
            history.pushState({
                    path: url,
                },
                document.title,
                (_hash ? "#" : "") + url
            );
        }
        _run();
        return this;
    };

    /**
     * make the url with params according to provided name
     * @param {string} name
     * @param {Any} params
     * @returns {String|Null}
     */
    Router.url = function(name) {
        for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            data[_key - 1] = arguments[_key];
        }
        var route = _routes.find(function(r) {
            return r.name === name;
        });
        if (route) {
            var path = route.path.replace(/{\w+:\w+}/g, "(.+)");
            var i = -1;
            path = path.replaceAll("(.+)", function() {
                i++;
                return data[i] || null;
            });
            var url = "/" + (path.startsWith("/") ? path.slice(1) : path);
            return url;
        }
        return null;
    };

    /**
     * get the prop value according to provided name
     * @param {String} name
     * @returns {Any}
     */
    Router.param = function(name) {
        if (this.props.log.current.params && this.props.log.current.params[name]) return this.props.log.current.params[name];
        return null;
    };

    /**
     * get the query value according to provided name
     * @param {String} name
     * @returns {Any}
     */
    Router.query = function(name) {
        if (this.props.log.current.queries && this.props.log.current.queries[name]) return this.props.log.current.queries[name];
        return null;
    };

    /**
     * clean up the Router
     * @returns {Router}
     */
    Router.clean = function() {
        Router.props.routes = _routes = [];
        Router.props.hash = _hash = null;
        _change = [];
        return this;
    };

    /**
     * make the route regex
     * @param {String} path
     * @returns {Regex}
     */
    function _path(path) {
        return new RegExp("^" + path.replace(/\//g, "\\/").replace(/{\w+:\w+}/g, "(.+)") + "$");
    }

    /**
     * get the according route of the current link
     * @returns {Route}
     */
    function _match() {
        var url = (_hash ? location.hash.slice(1) : location.pathname) || "/";
        if (!_hash && !url.startsWith("/")) url = "/" + url;
        var potentialMatches = _routes.map(function(route) {
            return {
                route: route,
                result: url.match(_path(route.path)),
            };
        });
        var match = potentialMatches.find(function(potentialMatch) {
            return potentialMatch.result !== null;
        });
        if (!match) {
            match = {
                route: _routes.find(function(x) {
                    return x.path === "/404";
                }),
                result: [url],
            };
        }
        return match;
    }

    /**
     * make object of params from current link
     * @param {Route} match
     * @returns {Object}
     */
    function _params(match) {
        var values = match.result.slice(1);
        var keys = Array.from(match.route.path.matchAll(/{(\w+):/g)).map(function(result) {
            return result[1];
        });
        var types = Array.from(match.route.path.matchAll(/:(\w+)}/g)).map(function(result) {
            return result[1];
        });
        return Object.fromEntries(
            keys.map(function(key, i) {
                var val = void 0;
                switch (types[i].toLowerCase()) {
                    case "str":
                        val = String(values[i]);
                        break;
                    case "int":
                        val = parseInt(values[i]);
                        break;
                    case "num":
                        val = Number(values[i]);
                        break;
                    case "real":
                        val = parseFloat(values[i]);
                        break;
                    case "bool":
                        val = Boolean(values[i]);
                        break;
                    case "any":
                    default:
                        val = values[i];
                        break;
                }
                return [key, val];
            })
        );
    }

    /**
     * make object of queries from current link
     * @returns {Object}
     */
    function _queries() {
        var params = new URLSearchParams(_hash ? location.hash.split("?")[1] || "" : location.search);
        var obj = {};
        new Set([...params.keys()]).forEach((key) => {
            obj[key] = params.getAll(key).length > 1 ? params.getAll(key) : params.get(key);
        });
        return obj;
    }

    /**
     * logs the current view data
     * @param {Route} match
     * @param {Object} params
     * @param {Object} queries
     */
    function _logger(match, params, queries) {
        Router.props = {
            root: _root,
            routes: _routes,
            hash: _hash,
            loader: _loader,
            log: {
                previous: Router.props.log.current,
                current: {
                    route: match,
                    params: params,
                    queries: queries,
                },
            },
        };
    }

    /**
     * chnage view to the according route
     * @param {String|Object|Node|Function|Promise} element
     * @param {Node} anchor
     * @param {Object} opts
     */
    async function _append(element, anchor, opts = {}) {
        opts = { route: {}, params: {}, queries: {}, ...opts };
        switch (type(element)) {
            case "function":
            case "asyncfunction":
                element = await element({ params: opts.params, queries: opts.queries });
                break;
            case "string":
            case "object":
            default:
                element = html ` ${element} `;
                break;
        }

        const temp = element.string;
        const components = element.components;
        const events = element.events;
        const props = element.props;
        exec(anchor, temp, props, events, components);
        for (const fn of _next) {
            if (type(fn) === "function") fn(opts.route, opts.params, opts.queries);
        }
    }

    /**
     * execute the view change fns
     */
    async function _run() {
        var match = _match();
        var route = {
            path: match.route.path,
            name: match.route.name,
            input: match.result[0],
        };
        var $ = (view) => {
            _append(view, _root, {
                route,
            });
        };
        if (_loader) {
            _append(_loader, _root, {
                route,
            });
        }
        for (const fn of _prev) {
            if (type(fn) === "function") fn(route, $);
        }
        const guard = match.route.guard;
        if (type(guard) === "function" && (await guard()) === true) {
            var params = _params(match);
            var queries = _queries();
            _logger(route, params, queries);
            _append(match.route.view, _root, {
                route,
                params,
                queries,
            });
        }
    }

    /**
     * change the view according to provaded value
     * @param {String} url
     */
    function redirect(url) {
        Router.goto(url);
    }

    /**
     * get object of queries from the current view
     * @returns {Object}
     */
    function queries() {
        return (Router.props.log && Router.props.log.current.queries) || {};
    }

    /**
     * get object of params from the current view
     * @returns {Object}
     */
    function params() {
        return (Router.props.log && Router.props.log.current.params) || {};
    }

    /**
     *  make the url with params according to provided name
     * @param {String} name
     * @param  {...any} args
     * @returns {String}
     */
    function urls(name, ...args) {
        return Router.url(name, ...args);
    }

    /**
     * get the logs
     * @returns {Object}
     */
    function logs() {
        return Router.props.log;
    }

    return {
        redirect,
        queries,
        params,
        urls,
        logs,
        Router,
    };
}

const { redirect, queries, params, urls, logs, Router: router } = Router();

export default router;
export { Router as Private, redirect, queries, params, urls, logs };