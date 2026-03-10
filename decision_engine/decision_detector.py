import uuid
from typing import Dict, Optional
from datetime import datetime

from decision_engine.decision_schema import Decision, DecisionType
from decision_engine.signal_extractor import SignalExtractor
from decision_engine.rule_engine import RuleEngine
from decision_engine.trip_inference import TripInference

class DecisionDetector:
    """
    Main entry point for Stage 5: Travel Decision Detection Engine.
    Orchestrates signal extraction, rule evaluation, and trip inference.
    """

    def __init__(self):
        self.signal_extractor = SignalExtractor()
        self.rule_engine = RuleEngine()
        self.trip_inference = TripInference()

    def detect_decision(self, session: Dict) -> Optional[Decision]:
        """
        Analyzes a session and returns a Decision object if a travel decision is detected.
        """
        session_id = session.get('session_id', 'unknown')
        
        # 1. Signal Extraction
        signals = self.signal_extractor.extract_signals(session)
        
        if signals['event_count'] == 0:
            return None

        # 2. Rule Engine Evaluation
        best_match = self.rule_engine.get_best_decision(signals)
        
        if not best_match or best_match['confidence'] < 0.3:
            return None
            
        # 3. Trip Type Inference
        trip_type = self.trip_inference.infer_trip_type(signals)
        
        # 4. Construct Decision Object
        decision = Decision(
            decision_id=str(uuid.uuid4()),
            session_id=session_id,
            decision_type=best_match['type'],
            trip_type=trip_type,
            entities_considered=signals['entities'],
            sources_used=signals['categories'],
            confidence_score=best_match['confidence'],
            timestamp=datetime.now().isoformat()
        )
        
        return decision

# Singleton instance for easy access
detector = DecisionDetector()

def detect_decision(session: Dict) -> Optional[Dict]:
    """
    Wrapper function for external use.
    Returns a dictionary representation of the Decision object.
    """
    decision_obj = detector.detect_decision(session)
    if decision_obj:
        return decision_obj.to_dict()
    return None
