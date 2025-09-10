// backend/main.go

package main

import (
	"context" // We need this tool to understand JSON
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

// This is the blueprint for a single activity.
type Activity struct {
	Time        string  `json:"time"`
	Description string  `json:"description"`
	Category    string  `json:"category"` // e.g., "Food", "Sightseeing", "Adventure"
	Lat         float64 `json:"lat"`      // Latitude for map pin
	Lng         float64 `json:"lng"`      // Longitude for map pin
}

// This is the blueprint for a single day.
type Day struct {
	Day        int        `json:"day"`
	Title      string     `json:"title"`
	Activities []Activity `json:"activities"`
}

// This is the blueprint for the entire itinerary.
type Itinerary struct {
	TripTitle   string `json:"tripTitle"`
	Destination string `json:"destination"`
	Itinerary   []Day  `json:"itinerary"`
}

// ... (corsMiddleware function is the same, no changes) ...
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if r.Method == "OPTIONS" {
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/generate", handleGenerate)

	fmt.Println("Backend engine with SUPER-SMART AI Brain is starting on port 8080...")
	http.ListenAndServe(":8080", corsMiddleware(mux))
}

func handleGenerate(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Can't read your request", http.StatusBadRequest)
		return
	}
	tripIdea := string(body)

	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	// THIS IS THE NEW MAGIC PROMPT! We tell the AI to ONLY respond with JSON.
	prompt := fmt.Sprintf(`
    You are a world-class travel planning API. Your only output format is JSON. Do not include any text before or after the JSON object.
    Based on the user's request, generate a travel itinerary. The JSON object must follow this exact structure:
    {"tripTitle": "A Catchy Title", "destination": "City, Country", "itinerary": [{"day": 1, "title": "Arrival and Exploration", "activities": [{"time": "9:00 AM", "description": "Visit a famous landmark.", "category": "Sightseeing", "lat": 12.345, "lng": 67.890}]}]}

    User's request: "%s"`, tripIdea)

	// Tell the model its response MUST be JSON
	model.GenerationConfig = genai.GenerationConfig{
		ResponseMIMEType: "application/json",
	}

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		http.Error(w, "The AI Brain is thinking too hard, try again!", http.StatusInternalServerError)
		return
	}

	// Tell the browser we are sending JSON data
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, printResponse(resp))
}

func printResponse(resp *genai.GenerateContentResponse) string {
	var result string
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				result += fmt.Sprintf("%v", part)
			}
		}
	}
	// Clean up the response to make sure it's valid JSON
	return result
}
