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
	mux.HandleFunc("/api/public-trips", handlePublicTrips)
	mux.HandleFunc("/api/generate-checklist", handleGenerateChecklist)
	mux.HandleFunc("/api/generate-comm-card", handleGenerateCommCard)
	mux.HandleFunc("/api/sensory-profile", handleSensoryProfile)
	mux.HandleFunc("/api/reshuffle-day", handleReshuffleDay)
	mux.HandleFunc("/api/generate-script", handleGenerateScript)
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

	// Fetch user constraints from Firestore if userId is present
	var mobility, sensory, dietary interface{}
	if userId != "" && firestoreClient != nil {
		userDoc, err := firestoreClient.Collection("users").Doc(userId).Get(ctx)
		if err == nil {
			mobility = userDoc.Data()["mobility"]
			sensory = userDoc.Data()["sensory"]
			dietary = userDoc.Data()["dietary"]
		}
	}

	// Build constraints string for prompt
	constraints := ""
	if mobility != nil {
		constraints += fmt.Sprintf("- Mobility: %v\n", mobility)
	}
	if sensory != nil {
		constraints += fmt.Sprintf("- Sensory: %v\n", sensory)
	}
	if dietary != nil {
		constraints += fmt.Sprintf("- Dietary: %v\n", dietary)
	}

	// Sophisticated, constraint-based prompt
	prompt := fmt.Sprintf(`
You are Auryvia, a compassionate AI travel assistant. Your primary goal is user safety, comfort, and joy. You MUST adhere to all constraints. Your output MUST be JSON.

USER CONSTRAINTS:
%v
USER REQUEST: "%s"

Generate an itinerary that strictly follows every single constraint. The JSON object must follow this exact structure:
{"tripTitle": "A Catchy Title", "destination": "City, Country", "itinerary": [{"day": 1, "title": "Arrival and Exploration", "activities": [{"time": "9:00 AM", "description": "Visit a famous landmark.", "category": "Sightseeing", "lat": 12.345, "lng": 67.890}]}]}
`, constraints, tripIdea)

	model := client.GenerativeModel("gemini-1.5-flash")
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

func handlePublicTrips(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	ctx := context.Background()
	if firestoreClient == nil {
		http.Error(w, "Firestore not initialized", http.StatusInternalServerError)
		return
	}

	iter := firestoreClient.Collection("trips").
		Where("isPublic", "==", true).
		OrderBy("createdAt", firestore.Desc).
		Limit(10).
		Documents(ctx)

	var trips []map[string]interface{}
	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}
		data := doc.Data()
		data["id"] = doc.Ref.ID
		trips = append(trips, data)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trips)
}

func handleGenerateChecklist(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Destination   string      `json:"destination"`
		TripTitle     string      `json:"tripTitle"`
		Accessibility interface{} `json:"accessibility"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		http.Error(w, "AI error", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	prompt := fmt.Sprintf(`
You are Auryvia, a compassionate travel AI. Your job is to create a personalized pre-flight checklist for the user.
Destination: %s
Trip Title: %s
Accessibility Needs: %v

Checklist must be a JSON array of strings. Each item should be a clear, actionable step for preparation, considering all accessibility needs.
Example: ["Pack noise-cancelling headphones", "Download offline map for step-free routes", "Prepare medication documents for customs"]
`, req.Destination, req.TripTitle, req.Accessibility)

	model := client.GenerativeModel("gemini-1.5-flash")
	model.GenerationConfig = genai.GenerationConfig{
		ResponseMIMEType: "application/json",
	}

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		http.Error(w, "AI error", http.StatusInternalServerError)
		return
	}

	var checklist []string
	if err := json.Unmarshal([]byte(printResponse(resp)), &checklist); err != nil {
		http.Error(w, "Failed to parse checklist", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"checklist": checklist,
	})
}

func handleGenerateCommCard(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Place    string `json:"place"`
		Dietary  string `json:"dietary"`
		Language string `json:"language"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		http.Error(w, "AI error", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	prompt := fmt.Sprintf(`
You are Auryvia, a compassionate travel AI. Generate a clear, professional communication card for a traveler with dietary needs.
Place: %s
Dietary: %s
Language: %s

First, output the message in English for staff. Then, output the same message translated into the target language in large, clear text for staff to read. Output as JSON: {"en": "...", "jp": "..."} 
Example: {"en": "I have a severe gluten allergy (Celiac Disease). My food cannot contain any wheat, barley, or rye. Please ensure there is no cross-contamination.", "jp": "私は重度のグルテンアレルギー（セリアック病）です。小麦、大麦、ライ麦は一切含まないようにしてください。"}
`, req.Place, req.Dietary, req.Language)

	model := client.GenerativeModel("gemini-1.5-flash")
	model.GenerationConfig = genai.GenerationConfig{
		ResponseMIMEType: "application/json",
	}

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		http.Error(w, "AI error", http.StatusInternalServerError)
		return
	}

	var card struct {
		En string `json:"en"`
		Jp string `json:"jp"`
	}
	if err := json.Unmarshal([]byte(printResponse(resp)), &card); err != nil {
		http.Error(w, "Failed to parse card", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(card)
}

func handleSensoryProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Location string `json:"location"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		http.Error(w, "AI error", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	prompt := fmt.Sprintf(`
Act as a sensory data analyst. Analyze '%s' and generate a sensory profile. Consider noise from traffic, visual clutter from shops, and crowd density on a typical afternoon.
Output JSON: {"audio": 1-100, "visual": 1-100, "crowds": 1-100, "summary": "Short descriptive paragraph."}
`, req.Location)

	model := client.GenerativeModel("gemini-1.5-flash")
	model.GenerationConfig = genai.GenerationConfig{
		ResponseMIMEType: "application/json",
	}

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		http.Error(w, "AI error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, printResponse(resp))
}

func handleReshuffleDay(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Itinerary  interface{} `json:"itinerary"`
		Constraint string      `json:"constraint"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		http.Error(w, "AI error", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	prompt := fmt.Sprintf(`
You are Auryvia, a compassionate travel AI. The user is feeling tired and needs a low-energy day.
Given this itinerary: %v
Constraint: %s

Suggest a single, relaxing replacement activity for the most demanding item on the list. Output JSON: {"replace": "original activity", "suggestion": "relaxing alternative"}
`, req.Itinerary, req.Constraint)

	model := client.GenerativeModel("gemini-1.5-flash")
	model.GenerationConfig = genai.GenerationConfig{
		ResponseMIMEType: "application/json",
	}

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		http.Error(w, "AI error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, printResponse(resp))
}

func handleGenerateScript(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		Context string `json:"context"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	ctx := context.Background()
	apiKey := os.Getenv("GEMINI_API_KEY")
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		http.Error(w, "AI error", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	prompt := fmt.Sprintf(`
You are Auryvia, a compassionate travel AI. Generate a simple, step-by-step social script for the following context: %s.
Include:
- What the user can say (as a list)
- What staff might say in response (as a list)
- One or two cultural tips for the situation
Output JSON: {"user": ["..."], "staff": ["..."], "tips": "..." }
Example: {"user": ["I'd like to order pasta, please.", "Could I have the bill?"], "staff": ["Of course, which pasta would you like?", "Here is your bill."], "tips": "In Rome, it's polite to greet staff with 'Buonasera' and ask for the bill by saying 'Il conto, per favore.'}
`, req.Context)

	model := client.GenerativeModel("gemini-1.5-flash")
	model.GenerationConfig = genai.GenerationConfig{
		ResponseMIMEType: "application/json",
	}

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		http.Error(w, "AI error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, printResponse(resp))
}
