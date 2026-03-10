from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime

class DecisionType:
    DESTINATION_EXPLORATION = "destination_exploration"
    TRANSPORT_PLANNING = "transport_planning"
    ACCOMMODATION_SELECTION = "accommodation_selection"
    ACTIVITY_PLANNING = "activity_planning"

class TripType:
    WEEKEND_TRIP = "weekend_trip"
    ROAD_TRIP = "road_trip"
    INTERNATIONAL_TRIP = "international_trip"
    LOCAL_EXPLORATION = "local_exploration"
    ADVENTURE_TRIP = "adventure_trip"

@dataclass
class Decision:
    decision_id: str
    session_id: str
    decision_type: str
    entities_considered: List[str] = field(default_factory=list)
    sources_used: List[str] = field(default_factory=list)
    confidence_score: float = 0.0
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    trip_type: Optional[str] = None

    def to_dict(self):
        return {
            "decision_id": self.decision_id,
            "session_id": self.session_id,
            "decision_type": self.decision_type,
            "trip_type": self.trip_type,
            "entities_considered": self.entities_considered,
            "sources_used": self.sources_used,
            "confidence_score": self.confidence_score,
            "timestamp": self.timestamp
        }
