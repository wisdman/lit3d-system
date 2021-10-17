package service

import (
	"errors"
	"net"
	"net/http"
	"strings"
)

var xHeaders = [...]string{
	http.CanonicalHeaderKey("X-Forwarded-For"),
	http.CanonicalHeaderKey("X-Real-IP"),
}

func getHeader(r *http.Request, headerKey string) string {
	if header := r.Header.Get(headerKey); header != "" {
		i := strings.Index(header, ",")
		if i == -1 {
			return header
		}
		return header[:i]
	}
	return ""
}

func getHeaderIP(r *http.Request, headerKey string) (net.IP, error) {
	if header := getHeader(r, headerKey); header != "" {
		userIP := net.ParseIP(header)
		if userIP == nil {
			return nil, errors.New("Incorrect " + headerKey + " header")
		}
		return userIP, nil
	}
	return nil, nil
}

func getRemoteAddr(r *http.Request) (net.IP, error) {
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return nil, err
	}

	userIP := net.ParseIP(ip)
	if userIP == nil {
		return nil, err
	}

	return userIP, nil
}

func GetIP(r *http.Request) (net.IP, error) {
	for _, headerKey := range xHeaders {
		ip, err := getHeaderIP(r, headerKey)
		if err != nil {
			return nil, err
		}
		if ip != nil {
			return ip, nil
		}
	}

	return getRemoteAddr(r)
}
