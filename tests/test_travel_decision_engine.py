import unittest
import sys
import os
import uuid

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from decision_engine.decision_detector import detect_decision
from decision_engine.decision_schema import DecisionType, TripType

class TestTravelDecisionEngine(unittest.TestCase):

    def test_destination_exploration_detection(self):
        session = {
            "session_id": "S101",
            "events": [
                {"url": "https://travelblog.com/top-places-bali", "category": "travel_blog", "entities": ["Bali"], "metadata": {"title": "Top 10 Places in Bali"}},
                {"url": "https://youtube.com/watch?v=bali-vlog", "category": "video", "entities": ["Bali", "Ubud"], "metadata": {"title": "Bali Travel Vlog 2024"}}
            ]
        }
        decision = detect_decision(session)
        self.assertIsNotNone(decision)
        self.assertEqual(decision['decision_type'], DecisionType.DESTINATION_EXPLORATION)
        self.assertIn("Bali", decision['entities_considered'])

    def test_transport_planning_detection(self):
        session = {
            "session_id": "S102",
            "events": [
                {"url": "https://makemytrip.com/flights", "category": "flight_booking", "entities": ["Mumbai", "London"], "metadata": {"title": "Cheap Flights"}},
                {"url": "https://visa.com/apply", "category": "general", "entities": ["UK"], "metadata": {"title": "Apply for UK Visa"}}
            ]
        }
        decision = detect_decision(session)
        self.assertIsNotNone(decision)
        self.assertEqual(decision['decision_type'], DecisionType.TRANSPORT_PLANNING)
        self.assertEqual(decision['trip_type'], TripType.INTERNATIONAL_TRIP)

    def test_accommodation_selection_detection(self):
        session = {
            "session_id": "S103",
            "events": [
                {"url": "https://booking.com/hotels/saputara", "category": "accommodation_booking", "entities": ["Saputara"], "metadata": {"title": "Hotels in Saputara"}},
                {"url": "https://airbnb.com/rooms/123", "category": "accommodation_booking", "entities": ["Saputara"], "metadata": {"title": "Cozy Cabin in Saputara"}}
            ]
        }
        decision = detect_decision(session)
        self.assertIsNotNone(decision)
        self.assertEqual(decision['decision_type'], DecisionType.ACCOMMODATION_SELECTION)

    def test_activity_planning_detection(self):
        session = {
            "session_id": "S104",
            "events": [
                {"url": "https://alltrails.com/trek/saputara", "category": "general", "entities": ["Saputara"], "metadata": {"title": "Saputara Trekking Routes"}},
                {"url": "https://tripadvisor.com/attractions/saputara", "category": "attractions", "entities": ["Saputara"], "metadata": {"title": "Things to do in Saputara"}}
            ]
        }
        decision = detect_decision(session)
        self.assertIsNotNone(decision)
        self.assertEqual(decision['decision_type'], DecisionType.ACTIVITY_PLANNING)
        self.assertEqual(decision['trip_type'], TripType.ADVENTURE_TRIP)

    def test_no_travel_decision(self):
        session = {
            "session_id": "S105",
            "events": [
                {"url": "https://github.com/trending", "category": "developer_tools", "entities": ["Python"], "metadata": {"title": "Trending Repos"}},
                {"url": "https://stackoverflow.com/q/123", "category": "documentation", "entities": ["JS"], "metadata": {"title": "JS Help"}}
            ]
        }
        decision = detect_decision(session)
        self.assertIsNone(decision)

if __name__ == '__main__':
    unittest.main()
