package service

import (
	"log"
	"net/http"
	"strings"
)

type nodeType uint8

const (
	static nodeType = iota // default
	root
	param
)

type Node struct {
	path      string
	wildChild bool
	nType     nodeType
	maxParams uint8
	indices   string
	children  []*Node
	handle    http.HandlerFunc
	priority  uint32
}

// increments priority of the given child and reorders if necessary
func (n *Node) incrementChildPrio(pos int) int {
	n.children[pos].priority++
	prio := n.children[pos].priority

	// adjust position (move to front)
	newPos := pos
	for newPos > 0 && n.children[newPos-1].priority < prio {
		// swap node positions
		n.children[newPos-1], n.children[newPos] = n.children[newPos], n.children[newPos-1]

		newPos--
	}

	// build new index char string
	if newPos != pos {
		n.indices = n.indices[:newPos] + // unchanged prefix, might be empty
			n.indices[pos:pos+1] + // the index char we move
			n.indices[newPos:pos] + n.indices[pos+1:] // rest without char at 'pos'
	}

	return newPos
}

// addRoute adds a node with the given handle to the path.
// Not concurrency-safe!
func (n *Node) addRoute(path string, handle http.HandlerFunc) {
	fullPath := path
	path = removeFinalSlashes(path)

	n.priority++

	var numParams uint8
	for i := 0; i < len(path); i++ {
		if path[i] == ':' {
			numParams++
		}
	}

	// non-empty tree
	if len(n.path) > 0 || len(n.children) > 0 {
	walk:
		for {
			// Update maxParams of the current node
			if numParams > n.maxParams {
				n.maxParams = numParams
			}

			// Find the longest common prefix.
			// This also implies that the common prefix contains no ':'
			// since the existing key can't contain those chars.
			i := 0
			max := min(len(path), len(n.path))
			for i < max && path[i] == n.path[i] {
				i++
			}

			// Split edge
			if i < len(n.path) {
				child := Node{
					path:      n.path[i:],
					wildChild: n.wildChild,
					nType:     static,
					indices:   n.indices,
					children:  n.children,
					handle:    n.handle,
					priority:  n.priority - 1,
				}

				// Update maxParams (max of all children)
				for i := range child.children {
					if child.children[i].maxParams > child.maxParams {
						child.maxParams = child.children[i].maxParams
					}
				}

				n.children = []*Node{&child}
				// []byte for proper unicode char conversion, see #65
				n.indices = string([]byte{n.path[i]})
				n.path = path[:i]
				n.handle = nil
				n.wildChild = false
			}

			// Make new node a child of this node
			if i < len(path) {
				path = path[i:]

				if n.wildChild {
					n = n.children[0]
					n.priority++

					// Update maxParams of the child node
					if numParams > n.maxParams {
						n.maxParams = numParams
					}
					numParams--

					// Check if the wildcard matches
					if len(path) >= len(n.path) && n.path == path[:len(n.path)] &&
						// Check for longer wildcard, e.g. :name and :names
						(len(n.path) >= len(path) || path[len(n.path)] == '/') {
						continue walk
					} else {
						// Wildcard conflict
						pathSeg := strings.SplitN(path, "/", 2)[0]
						prefix := fullPath[:strings.Index(fullPath, pathSeg)] + n.path
						log.Fatalf(
							"\"%s\" in new path \"%s\" conflicts with existing wildcard \"%s\" in existing prefix \"%s\"\n",
							pathSeg, fullPath, n.path, prefix,
						)
					}
				}

				c := path[0]

				// slash after param
				if n.nType == param && c == '/' && len(n.children) == 1 {
					n = n.children[0]
					n.priority++
					continue walk
				}

				// Check if a child with the next path byte exists
				for i := 0; i < len(n.indices); i++ {
					if c == n.indices[i] {
						i = n.incrementChildPrio(i)
						n = n.children[i]
						continue walk
					}
				}

				// Otherwise insert it
				if c != ':' {
					// []byte for proper unicode char conversion, see #65
					n.indices += string([]byte{c})
					child := &Node{
						maxParams: numParams,
					}
					n.children = append(n.children, child)
					n.incrementChildPrio(len(n.indices) - 1)
					n = child
				}
				n.insertChild(numParams, path, fullPath, handle)
				return

			} else if i == len(path) { // Make node a (in-path) leaf
				if n.handle != nil {
					log.Fatalf("A handle is already registered for path \"%s\"\n", fullPath)
				}
				n.handle = handle
			}
			return
		}
	} else { // Empty tree
		n.insertChild(numParams, path, fullPath, handle)
		n.nType = root
	}
}

func (n *Node) insertChild(numParams uint8, path, fullPath string, handle http.HandlerFunc) {
	var offset int // already handled bytes of the path

	// find prefix until first wildcard (beginning with ':')
	for i, max := 0, len(path); numParams > 0; i++ {
		c := path[i]
		if c != ':' {
			continue
		}

		// find wildcard end (either '/' or path end)
		end := i + 1
		for end < max && path[end] != '/' {
			if path[end] == ':' {
				log.Fatalf(
					"Only one wildcard per path segment is allowed, has \"%s\" in path \"%s\"\n",
					path[i:], fullPath,
				)
			}
			end++
		}

		// check if this Node existing children which would be
		// unreachable if we insert the wildcard here
		if len(n.children) > 0 {
			log.Fatalf(
				"Wildcard route \"%s\" conflicts with existing children in path \"%s\"\n",
				path[i:end], fullPath,
			)
		}

		// check if the wildcard has a name
		if end-i < 2 {
			log.Fatalf("Wildcards must be named with a non-empty name in path \"%s\"\n", fullPath)
		}

		// split path at the beginning of the wildcard
		if i > 0 {
			n.path = path[offset:i]
			offset = i
		}

		child := &Node{
			nType:     param,
			maxParams: numParams,
		}
		n.children = []*Node{child}
		n.wildChild = true
		n = child
		n.priority++
		numParams--

		// if the path doesn't end with the wildcard, then there
		// will be another non-wildcard subpath starting with '/'
		if end < max {
			n.path = path[offset:end]
			offset = end

			child := &Node{
				maxParams: numParams,
				priority:  1,
			}
			n.children = []*Node{child}
			n = child
		}
	}

	// insert remaining path part and handle to the leaf
	n.path = path[offset:]
	n.handle = handle
}

// Returns the handle registered with the given path (key). The values of
// wildcards are saved to a map.
func (n *Node) getValue(path string) (handle http.HandlerFunc, p map[string]string) {
walk: // outer loop for walking the tree
	for {
		if len(path) > len(n.path) {
			if path[:len(n.path)] == n.path {
				path = path[len(n.path):]
				// If this node does not have a wildcard (param or catchAll)
				// child,  we can just look up the next child node and continue
				// to walk down the tree
				if !n.wildChild {
					c := path[0]
					for i := 0; i < len(n.indices); i++ {
						if c == n.indices[i] {
							n = n.children[i]
							continue walk
						}
					}
					return
				}

				// handle wildcard child
				n = n.children[0]

				if n.nType != param {
					panic("Invalid router node type!")
				}

				// find param end (either '/' or path end)
				end := 0
				for end < len(path) && path[end] != '/' {
					end++
				}

				// save param value
				if p == nil {
					// lazy allocation
					p = make(map[string]string)
				}
				p[n.path[1:]] = path[:end]

				// we need to go deeper!
				if end < len(path) {
					if len(n.children) > 0 {
						path = path[end:]
						n = n.children[0]
						continue walk
					}

					// ... but we can't
					return
				}

				handle = n.handle
				return

			}
		} else if path == n.path {
			handle = n.handle
			return
		}
		return
	}
}
