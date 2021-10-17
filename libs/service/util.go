package service

func min(a, b int) int {
	if a <= b {
		return a
	}
	return b
}

func removeFinalSlashes (path string) string {
	for i := len(path) - 1; i > 1; i-- {
		if path[i] != '/' {
			path = path[:i+1]
			return path
		}
	}
	return path
}
