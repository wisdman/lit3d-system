package service

import (
	"context"
	"log"
	"net/http"
	"runtime/debug"
)

type ctxParamsKey int
const ParamsKey ctxParamsKey = 0

// API is a http.Handler which can be used to dispatch requests to different
// handler functions via configurable routes
type API struct {
	http.Handler
	trees map[string]*Node
	pattern  string
}

func NewAPI(pattern string) *API {
	return &API{
		trees: make(map[string]*Node),
		pattern: pattern,
	}
}

// Handle registers a new request handle with the given path and method.
func (api *API) Handle(method, path string, handle http.HandlerFunc) {
	if path[0] != '/' {
		log.Fatalf("Path must begin with '/' in path \"%s\"\n", path)
	}

	path = api.pattern + path

	root := api.trees[method]
	if root == nil {
		root = new(Node)
		api.trees[method] = root
	}

	root.addRoute(path, handle)
}

func (api *API) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Catch panic
	defer func() {
		if rvr := recover(); rvr != nil {
			log.Printf("Panic: %+v\n", rvr)
			debug.PrintStack()
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		}
	}()

	path := removeFinalSlashes(r.URL.Path)

	// Handle exist route
	if root := api.trees[r.Method]; root != nil {
		if handle, params := root.getValue(path); handle != nil {
			if params != nil {
				ctx := r.Context()
				ctx = context.WithValue(ctx, ParamsKey, params)
				r = r.WithContext(ctx)
			}
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			w.Header().Set("Pragma", "no-cache")
			w.Header().Set("Expires", "0")
			handle(w, r)
			return
		}
	}

	log.Println("NotFound")

	// Search allowed methods for current request
	var allow string
	for method := range api.trees {
		if handle, _ := api.trees[method].getValue(path); handle != nil {
			if len(allow) == 0 {
				allow = method
			} else {
				allow += ", " + method
			}
		}
	}

	// Handle OPTIONS or 405
	if len(allow) > 0 {
		w.Header().Set("Allow", allow)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}

	// Handle 404
	http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
}

// GET is a shortcut for service.router.Handle("GET", path, handle)
func (api *API) GET(path string, handle http.HandlerFunc) {
	api.Handle("GET", path, handle)
}

// HEAD is a shortcut for service.router.Handle("HEAD", path, handle)
func (api *API) HEAD(path string, handle http.HandlerFunc) {
	api.Handle("HEAD", path, handle)
}

// OPTIONS is a shortcut for service.router.Handle("OPTIONS", path, handle)
func (api *API) OPTIONS(path string, handle http.HandlerFunc) {
	api.Handle("OPTIONS", path, handle)
}

// POST is a shortcut for service.router.Handle("POST", path, handle)
func (api *API) POST(path string, handle http.HandlerFunc) {
	api.Handle("POST", path, handle)
}

// PUT is a shortcut for service.router.Handle("PUT", path, handle)
func (api *API) PUT(path string, handle http.HandlerFunc) {
	api.Handle("PUT", path, handle)
}

// PATCH is a shortcut for service.router.Handle("PATCH", path, handle)
func (api *API) PATCH(path string, handle http.HandlerFunc) {
	api.Handle("PATCH", path, handle)
}

// DELETE is a shortcut for service.router.Handle("DELETE", path, handle)
func (api *API) DELETE(path string, handle http.HandlerFunc) {
	api.Handle("DELETE", path, handle)
}
