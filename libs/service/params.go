package service

import (
	"net/http"
)

func GetParams(r *http.Request) map[string]string {
	if params, ok := r.Context().Value(ParamsKey).(map[string]string); ok {
		return params
	}
	return nil
}

func GetParam(r *http.Request, key string) string {
	if params := GetParams(r); params != nil {
		if value, ok := params[key]; ok {
			return value
		}
	}
	return ""
}