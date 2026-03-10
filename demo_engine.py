import json
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from decision_engine.decision_detector import detect_decision

def run_demo():
    print("=== Travel Decision Detection Engine Demo ===\n")
    
    # 1. Activity Planning / Weekend Trip Demo
    session_weekend = {
        "session_id": "S_WEEKEND_001",
        "events": [
            {
                "url": "https://www.google.com/search?q=treks+near+Ahmedabad",
                "domain": "google.com",
                "category": "search",
                "entities": ["Ahmedabad", "Saputara"],
                "metadata": {"title": "treks near Ahmedabad - Google Search"}
            },
            {
                "url": "https://www.google.com/maps/dir/Ahmedabad/Saputara",
                "domain": "maps.google.com",
                "category": "map_navigation",
                "entities": ["Ahmedabad", "Saputara"],
                "metadata": {"title": "Google Maps route"}
            },
            {
                "url": "https://www.youtube.com/watch?v=saputara-vlog",
                "domain": "youtube.com",
                "category": "video",
                "entities": ["Saputara"],
                "metadata": {"title": "Saputara Trekking Guide vlog"}
            }
        ]
    }
    
    # 2. International Trip / Transport Planning Demo
    session_intl = {
        "session_id": "S_INTL_002",
        "events": [
            {
                "url": "https://www.google.com/search?q=Bali+vs+Phuket",
                "domain": "google.com",
                "category": "search",
                "entities": ["Bali", "Phuket"],
                "metadata": {"title": "Bali vs Phuket - Google Search"}
            },
            {
                "url": "https://www.skyscanner.com/flights-to-bali",
                "domain": "skyscanner.com",
                "category": "flight_booking",
                "entities": ["Bali"],
                "metadata": {"title": "Flights to Bali"}
            }
        ]
    }

    sessions = [session_weekend, session_intl]
    
    for i, session in enumerate(sessions):
        print(f"Analyzing Session {i+1} ({session['session_id']})...")
        decision = detect_decision(session)
        if decision:
            print(json.dumps(decision, indent=2))
        else:
            print("No travel decision detected.")
        print("-" * 40)

if __name__ == "__main__":
    run_demo()
