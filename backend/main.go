// backend/main.go

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
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

var firestoreClient *firestore.Client

func initFirebase() {
	ctx := context.Background()
	// TODO: Replace with your actual service account key file path
	sa := option.WithCredentialsFile("serviceAccountKey.json")
	// Get project ID from environment or hardcode for now
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	if projectID == "" {
		log.Fatalf("FIREBASE_PROJECT_ID environment variable is required but not set.")
	}
	conf := &firebase.Config{ProjectID: projectID}
	app, err := firebase.NewApp(ctx, conf, sa)
	if err != nil {
		log.Fatalf("error initializing firebase app: %v", err)
	}
	firestoreClient, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalf("error initializing firestore client: %v", err)
	}
}

// ... (corsMiddleware function is the same, no changes) ...
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, X-User-Id")
		if r.Method == "OPTIONS" {
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	err := godotenv.Load(".env.local")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/generate", handleGenerate)
	mux.HandleFunc("/api/save-trip", handleSaveTrip)
	mux.HandleFunc("/api/mock-prices", handleMockPrices)
	initFirebase()
	fmt.Println("Backend engine with SUPER-SMART AI Brain is starting on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", corsMiddleware(mux)))
}

// Save itinerary to Firestore with user ID from ID token
func handleSaveTrip(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	ctx := context.Background()
	// Get ID token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 {
		http.Error(w, "Missing or invalid Authorization header", http.StatusUnauthorized)
		return
	}
	idToken := authHeader[7:] // Remove 'Bearer '

	// Verify ID token
	app, err := firebase.NewApp(ctx, nil, option.WithCredentialsFile("serviceAccountKey.json"))
	if err != nil {
		http.Error(w, "Failed to init Firebase app", http.StatusInternalServerError)
		return
	}
	client, err := app.Auth(ctx)
	if err != nil {
		http.Error(w, "Failed to get Auth client", http.StatusInternalServerError)
		return
	}
	token, err := client.VerifyIDToken(ctx, idToken)
	if err != nil {
		http.Error(w, "Invalid ID token", http.StatusUnauthorized)
		return
	}
	userId := token.UID

	// Read itinerary JSON from request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Can't read request body", http.StatusBadRequest)
		return
	}
	var req struct {
		Itinerary interface{} `json:"itinerary"`
	}
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Save to Firestore
	if firestoreClient != nil {
		_, _, err := firestoreClient.Collection("trips").Add(ctx, map[string]interface{}{
			"userId":    userId,
			"itinerary": req.Itinerary,
		})
		if err != nil {
			http.Error(w, "Failed to save itinerary to Firestore: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Saved"))
}

func handleGenerate(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Can't read your request", http.StatusBadRequest)
		return
	}
	tripIdea := string(body)

	// Optionally get User ID from header (e.g., "X-User-Id")
	userId := r.Header.Get("X-User-Id")

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

	itineraryJSON := printResponse(resp)

	// Save to Firestore if userId is present
	if userId != "" && firestoreClient != nil {
		_, _, err := firestoreClient.Collection("trips").Add(ctx, map[string]interface{}{
			"userId":    userId,
			"itinerary": itineraryJSON,
		})
		if err != nil {
			log.Printf("Failed to save itinerary: %v", err)
			http.Error(w, "Failed to save itinerary to Firestore: "+err.Error(), http.StatusInternalServerError)
			return
		} else {
			log.Printf("Itinerary saved to Firestore for userId: %s", userId)
		}
	}

	// Tell the browser we are sending JSON data
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, itineraryJSON)
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

func handleMockPrices(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	type Req struct {
		Destination string `json:"destination"`
	}
	var req Req
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Seed random for demo
	rand.Seed(time.Now().UnixNano())

	// Fake airlines and hotels
	airlines := []string{"IndiGo", "Air India", "SpiceJet", "Vistara"}
	hotels := []string{"Taj Palace", "Leela", "Oberoi", "ITC Grand"}

	resp := map[string]interface{}{
		"flights": map[string]interface{}{
			"airline": airlines[rand.Intn(len(airlines))],
			"price":   rand.Intn(8000) + 7000, // 7000-15000
		},
		"hotels": map[string]interface{}{
			"name":            hotels[rand.Intn(len(hotels))],
			"price_per_night": rand.Intn(4000) + 6000, // 6000-10000
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
