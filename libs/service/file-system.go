package service

import (
	"embed"
	"io/fs"
	"net/http"
)

func EmbedFileSystem(embedFS embed.FS, sub string) (http.FileSystem, error) {
	fsys, err := fs.Sub(embedFS, sub)
  if err != nil {
  	return nil, err
  }
  return http.FS(fsys), nil
}