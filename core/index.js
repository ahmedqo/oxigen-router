import exec from "oxigen-core/Maker/index.js";
import html from "oxigen-core/Html/index.js";

function type(o) {
    return Object.prototype.toString.call(o).slice(8).slice(0, -1).toLowerCase();
}

function Router() {
    var _root,
        _change = [],
        _hash = null,
        _routes = [];

    function Router(root) {
        _root = (root instanceof Node) ? root : document.querySelector(root);
        Router.props.root = _root;
        return Router;
    }

    Router.props = {
        root: undefined,
        hash: null,
        routes: [],
        log: {
            previous: {},
            current: {},
        }
    };

    Router.change = function(change) {
        _change = [..._change, change];
        return this;
    };
    Router.load = function(load) {
        if (type(load) === "function") document.addEventListener("DOMContentLoaded", load);
        return this;
    };
    Router.hash = function(hash) {
        _hash = type(hash) === "boolean" ? hash : true;
        return this;
    };
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
    Router.add = function(path, view, name) {
        const is = _routes.find(r => r.path === path);
        if (!is && type(path) === "string" && (["string", "object", "function", "asyncfunction"].includes(type(view)) || view instanceof Node)) {
            path = (path.endsWith("/") && path.length > 1) ? path.substr(0, path.length - 1) : path;
            _routes.push({ path: path, view: view, name: name });
            this.props = {
                ...this.props,
                routes: _routes
            }
        }
        return this;
    };
    Router.scope = function(path, fn) {
        var router = {
            routes: [],
            prepath: [path],
            add: function(path, view, name) {
                if (type(path) === "string" && (["string", "object", "function", "asyncfunction"].includes(type(view)) || view instanceof HTMLElement)) {
                    path = !path || path == "*" ? "/404" : path;
                    path = path.startsWith("/") ? path : "/" + path;
                    path = path.endsWith("/") ? path.substr(0, path.length - 2) : path;
                    this.routes.push({
                        view: view,
                        name: name,
                        path: this.prepath.join("") + path,
                    });
                }
                return this;
            },
            scope: function(path, fn) {
                this.prepath.push(path);
                fn.call(this);
                return this;
            },
        };
        fn.call(router);
        _routes = [..._routes, ...router.routes];
        return this;
    };
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
    Router.param = function(name) {
        if (this.props.log.current.params && this.props.log.current.params[name]) return this.props.log.current.params[name];
        return null;
    };
    Router.query = function(name) {
        if (this.props.log.current.queries && this.props.log.current.queries[name]) return this.props.log.current.queries[name];
        return null;
    };
    Router.clean = function() {
        Router.props.routes = _routes = [];
        Router.props.hash = _hash = null;
        _change = [];
        return this;
    };

    function _path(path) {
        return new RegExp("^" + path.replace(/\//g, "\\/").replace(/{\w+:\w+}/g, "(.+)") + "$");
    }

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

    function _queries() {
        var params = new URLSearchParams(_hash ? (location.hash.split("?")[1] || "") : location.search);
        var obj = {};
        new Set([...params.keys()]).forEach((key) => {
            obj[key] = params.getAll(key).length > 1 ? params.getAll(key) : params.get(key);
        });
        return obj;
    }

    function _logger(match, params, queries) {
        Router.props = {
            root: _root,
            routes: _routes,
            hash: _hash,
            log: {
                previous: Router.props.log.current,
                current: {
                    route: match,
                    params: params,
                    queries: queries,
                },
            }
        };
    }

    async function _append(element, anchor, opts = {}) {
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
        for (const fn of _change) {
            if (type(fn) === "function") fn(opts.route, opts.params, opts.queries);
        }
    }

    function _run() {
        var match = _match();
        var params = _params(match);
        var queries = _queries();
        var route = {
            path: match.route.path,
            name: match.route.name,
            input: match.result[0],
        };
        _logger(route, params, queries);
        _append(match.route.view, _root, {
            route,
            params,
            queries,
        });
    }

    function redirect(url) {
        Router.goto(url)
    }

    function queries() {
        return (Router.props.log && Router.props.log.current.queries) || {};
    }

    function params() {
        return (Router.props.log && Router.props.log.current.params) || {};
    }

    function urls(name, ...args) {
        return Router.url(name, ...args);
    }

    function logs() {
        return Router.props.log
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
export { redirect, queries, params, urls, logs };