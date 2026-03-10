import json
import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from decision_engine.decision_detector import detect_decision

def manual_test():
    print("=== Interactive Travel Decision Engine Tester ===")
    print("Paste a session JSON object below and press Enter.")
    print("Enter 'exit' to quit.\n")
    
    while True:
        try:
            user_input = input("JSON > ").strip()
            if user_input.lower() == 'exit':
                break
            
            if not user_input:
                continue
                
            session = json.loads(user_input)
            decision = detect_decision(session)
            
            if decision:
                print("\n[DETECTED DECISION]")
                print(json.dumps(decision, indent=2))
            else:
                print("\n[NO DECISION DETECTED]")
            print("-" * 40)
            
        except json.JSONDecodeError:
            print("Error: Invalid JSON format. Please try again.")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    manual_test()
