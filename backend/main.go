// backend/main.go

package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os" // We need this new tool to read from our secret pocket!

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv" // And this is the magic tool to load the .env file
	"google.golang.org/api/option"
)

// ... (The corsMiddleware function is the same, no changes here) ...
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

	fmt.Println("Backend engine with AI Brain is starting on port 8080...")
	http.ListenAndServe(":8080", corsMiddleware(mux))
}

func handleGenerate(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Can't read your request", http.StatusBadRequest)
		return
	}
	tripIdea := string(body)

	// --- The AI Magic Happens Here (Now Securely!) ---
	ctx := context.Background()

	// Read the key from our secret pocket instead of writing it here!
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY not found in .env file")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	// ... (The rest of the AI logic is the same!) ...
	model := client.GenerativeModel("gemini-1.5-flash")
	prompt := fmt.Sprintf("You are an expert travel planner named WanderAI. Create a fun, exciting, and well-structured trip itinerary based on this idea: '%s'. Format the output nicely with headings for each day. Include a mix of activities, food suggestions, and hidden gems. Start with a catchy title for the trip.", tripIdea)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		http.Error(w, "The AI Brain is thinking too hard, try again!", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, printResponse(resp))
}

// ... (The printResponse function is the same, no changes here) ...
func printResponse(resp *genai.GenerateContentResponse) string {
	var result string
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				result += fmt.Sprintf("%v", part)
			}
		}
	}
	return result
}
