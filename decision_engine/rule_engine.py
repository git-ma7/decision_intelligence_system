from typing import Dict, List, Optional
from decision_engine.decision_schema import DecisionType

class RuleEngine:
    """
    Implements decision detection rules based on signals.
    """

    def detect_destination_exploration(self, signals: Dict) -> float:
        """
        Detects destination exploration.
        Triggered when user is researching 'where to go'.
        """
        score = 0.0
        categories = signals.get('categories', [])
        keywords = signals.get('keywords', [])
        entities = signals.get('entities', [])

        # Essential signals (Research-oriented)
        if 'travel_blog' in categories: score += 0.4
        if 'video' in categories: score += 0.3
        
        # Keyword signals
        if any(kw in ['best places', 'top destinations', 'comparison', 'vs', 'where to'] for kw in keywords):
            score += 0.3
        
        # Entity diversity (Researching multiple places)
        if len(entities) >= 2:
            score += 0.2
        
        return min(score, 1.0)

    def detect_transport_planning(self, signals: Dict) -> float:
        """
        Detects transport planning.
        Triggered when user is evaluating HOW to get there (flights, trains, etc.).
        """
        score = 0.0
        categories = signals.get('categories', [])
        transport_signals = signals.get('transport_signals', [])

        # Booking intent (Highest signal)
        if any(cat in ['flight_booking', 'train_booking', 'bus_booking'] for cat in categories):
            score += 0.7
        
        # Navigation intent
        if 'map_navigation' in categories:
            score += 0.4
        
        # Multimodal signals
        if len(transport_signals) >= 1:
            score += 0.3
        
        return min(score, 1.0)

    def detect_accommodation_selection(self, signals: Dict) -> float:
        """
        Detects accommodation selection.
        Triggered when user is evaluating WHERE to stay.
        """
        score = 0.0
        categories = signals.get('categories', [])
        keywords = signals.get('keywords', [])

        # Booking interest
        if 'accommodation_booking' in categories:
            score += 0.6
        if 'hotel_search' in categories:
            score += 0.5
        
        # Specific keywords
        if any(kw in ['hotel', 'airbnb', 'hostel', 'resort', 'homestay'] for kw in keywords):
            score += 0.3
        
        return min(score, 1.0)

    def detect_activity_planning(self, signals: Dict) -> float:
        """
        Detects activity planning.
        Triggered when user is planning WHAT to do (treks, cafes, attractions).
        """
        score = 0.0
        categories = signals.get('categories', [])
        activity_signals = signals.get('activity_signals', [])
        keywords = signals.get('keywords', [])

        # Attraction/Activity signals
        if 'attractions' in categories: score += 0.5
        if 'restaurant_search' in categories: score += 0.3
        
        # Keyword-based activity intent
        if any(kw in ['trek', 'things to do', 'sightseeing', 'cafes', 'itinerary'] for kw in keywords):
            score += 0.4

        if len(activity_signals) >= 1:
            score += 0.2
        
        return min(score, 1.0)

    def get_best_decision(self, signals: Dict) -> Optional[Dict]:
        """
        Evaluates all rules and returns the one with the highest confidence.
        """
        results = [
            (DecisionType.DESTINATION_EXPLORATION, self.detect_destination_exploration(signals)),
            (DecisionType.TRANSPORT_PLANNING, self.detect_transport_planning(signals)),
            (DecisionType.ACCOMMODATION_SELECTION, self.detect_accommodation_selection(signals)),
            (DecisionType.ACTIVITY_PLANNING, self.detect_activity_planning(signals)),
        ]
        
        # Filter by those that have a score > 0.0
        active_decisions = [res for res in results if res[1] > 0.0]
        
        if not active_decisions:
            return None
            
        # Sort by score descending
        active_decisions.sort(key=lambda x: x[1], reverse=True)
        
        best = active_decisions[0]
        return {
            "type": best[0],
            "confidence": best[1]
        }
