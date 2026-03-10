from typing import Dict, List, Optional
from decision_engine.decision_schema import DecisionType

class RuleEngine:
    """
    Implements decision detection rules based on signals.
    """

    def detect_destination_exploration(self, signals: Dict) -> float:
        """
        Detects destination exploration.
        Signals: travel blogs, YouTube travel videos, tourism websites, multiple destination entities.
        """
        score = 0.0
        categories = signals.get('categories', [])
        keywords = signals.get('keywords', [])
        entities = signals.get('entities', [])

        # High signals
        has_category = 'travel_blog' in categories or 'video' in categories
        has_keyword = any(kw in ['best places', 'things to do', 'top destinations'] for kw in keywords)

        if has_category:
            score += 0.4
        
        if has_keyword:
            score += 0.3
        
        # Only add entity score if there's already some travel signal
        if len(entities) >= 2 and (has_category or has_keyword):
            score += 0.3
        
        return min(score, 1.0)

    def detect_transport_planning(self, signals: Dict) -> float:
        """
        Detects transport planning.
        Signals: flight booking, train schedules, Google Maps routes, bus booking, cruise booking.
        """
        score = 0.0
        categories = signals.get('categories', [])
        transport_signals = signals.get('transport_signals', [])

        if any(cat in ['flight_booking', 'train_booking', 'bus_booking', 'map_navigation'] for cat in categories):
            score += 0.6
        
        if len(transport_signals) >= 1:
            score += 0.4
        
        return min(score, 1.0)

    def detect_accommodation_selection(self, signals: Dict) -> float:
        """
        Detects accommodation selection.
        Signals: hotel booking platforms, Airbnb listings, hostels, homestays.
        """
        score = 0.0
        categories = signals.get('categories', [])
        keywords = signals.get('keywords', [])

        if 'accommodation_booking' in categories or 'hotel_search' in categories:
            score += 0.7
        
        if any(kw in ['hotel', 'airbnb', 'hostel', 'stay', 'resort'] for kw in keywords):
            score += 0.3
        
        return min(score, 1.0)

    def detect_activity_planning(self, signals: Dict) -> float:
        """
        Detects activity planning.
        Signals: treks, tourist attractions, restaurants, events, local sightseeing.
        """
        score = 0.0
        categories = signals.get('categories', [])
        activity_signals = signals.get('activity_signals', [])
        keywords = signals.get('keywords', [])

        if 'attractions' in categories or 'restaurant_search' in categories:
            score += 0.5
        
        if len(activity_signals) >= 1:
            score += 0.3

        if any(kw in ['trek', 'things to do', 'sightseeing'] for kw in keywords):
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
