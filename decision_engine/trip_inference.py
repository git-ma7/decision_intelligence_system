from typing import Dict, Optional
from decision_engine.decision_schema import TripType

class TripInference:
    """
    Infers trip type based on behavioral signals.
    """

    def infer_weekend_trip(self, signals: Dict) -> float:
        """
        Signals: "near", "short duration", "trips near X".
        """
        score = 0.0
        keywords = signals.get('keywords', [])
        
        if any(kw in ['near', 'getaway', 'weekend'] for kw in keywords):
            score += 0.5
        
        # Local exploration signals
        if signals.get('event_count', 0) < 10:
            score += 0.2
            
        return min(score, 1.0)

    def infer_road_trip(self, signals: Dict) -> float:
        """
        Signals: "route", "car", "distance".
        """
        score = 0.0
        transport_signals = signals.get('transport_signals', [])
        keywords = signals.get('keywords', [])

        if any(ts in ['car rental', 'zoomcar', 'bus', 'route', 'map'] for ts in transport_signals):
            score += 0.6
        
        if 'route' in keywords or 'drive' in keywords:
            score += 0.4
            
        return min(score, 1.0)

    def infer_international_trip(self, signals: Dict) -> float:
        """
        Signals: "international", "passport", "foreign currency", "flight".
        """
        score = 0.0
        keywords = signals.get('keywords', [])
        transport_signals = signals.get('transport_signals', [])

        if 'flight' in transport_signals or 'airline' in transport_signals:
            score += 0.4
        
        if any(kw in ['international', 'passport', 'visa', 'currency'] for kw in keywords):
            score += 0.6
            
        return min(score, 1.0)

    def infer_adventure_trip(self, signals: Dict) -> float:
        """
        Signals: keywords like "trek", "camping", "hiking".
        """
        score = 0.0
        activity_signals = signals.get('activity_signals', [])
        keywords = signals.get('keywords', [])

        if any(asig in ['trek', 'hike', 'camping'] for asig in activity_signals):
            score += 0.7
        
        if 'adventure' in keywords:
            score += 0.3
            
        return min(score, 1.0)

    def infer_trip_type(self, signals: Dict) -> Optional[str]:
        """
        Infers the most likely trip type.
        """
        results = [
            (TripType.WEEKEND_TRIP, self.infer_weekend_trip(signals)),
            (TripType.ROAD_TRIP, self.infer_road_trip(signals)),
            (TripType.INTERNATIONAL_TRIP, self.infer_international_trip(signals)),
            (TripType.ADVENTURE_TRIP, self.infer_adventure_trip(signals)),
        ]
        
        # Sort by score descending
        results.sort(key=lambda x: x[1], reverse=True)
        
        if results[0][1] > 0.3:
            return results[0][0]
            
        return TripType.LOCAL_EXPLORATION # Default fallback
