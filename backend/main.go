package main

import (
	"fmt"
	"net/http"
)

func main() {
	// This is our receptionist who waits for someone to visit the /api/hello page
	http.HandleFunc("/api/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello from the Go Engine Room! 🚀")
	})

	// This starts our engine on a special door, port 8080
	fmt.Println("Backend engine is starting on port 8080...")
	http.ListenAndServe(":8080", nil)
}