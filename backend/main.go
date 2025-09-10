package main

import (
	"fmt"
	"net/http"
)

// This is our new "doorman" who adds the welcome sign (CORS headers)
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// This is the most important part of the welcome sign!
		// It says "Mail from ANY address is welcome here."
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// We also tell them which methods (like GET, POST) are allowed.
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		// And which headers are allowed.
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		// If the browser sends a "pre-flight" check (an OPTIONS request), we just say OK.
		if r.Method == "OPTIONS" {
			return
		}

		// Otherwise, let the original receptionist handle the request.
		next.ServeHTTP(w, r)
	})
}

func main() {
	// Create a new router
	mux := http.NewServeMux()

	// Our receptionist is still here!
	mux.HandleFunc("/api/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from the Go Engine Room! 🚀 The CORS mailman let you in!")
	})

	fmt.Println("Backend engine is starting on port 8080...")
	// We wrap our entire router with the new doorman before starting the engine.
	http.ListenAndServe(":8080", corsMiddleware(mux))
}
