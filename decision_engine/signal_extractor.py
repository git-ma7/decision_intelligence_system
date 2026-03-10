from typing import List, Dict, Set

class SignalExtractor:
    """
    Extracts behavioral signals from a session object.
    """
    
    TRAVEL_KEYWORDS = {
        'flight', 'hotel', 'booking', 'trek', 'trip', 'travel', 'vacation',
        'train', 'bus', 'stay', 'airbnb', 'hostel', 'resort', 'itinerary',
        'things to do', 'best places', 'route', 'map', 'tickets'
    }

    TRANSPORT_KEYWORDS = {
        'flight', 'airline', 'airport', 'train', 'railway', 'irctc', 
        'bus', 'redbus', 'car rental', 'zoomcar', 'cruise', 'ship', 'ferry'
    }

    ACTIVITY_KEYWORDS = {
        'trek', 'hike', 'sightseeing', 'museum', 'park', 'zoo', 
        'cafe', 'restaurant', 'bar', 'club', 'concert', 'event', 'attraction'
    }

    def __init__(self):
        pass

    def extract_signals(self, session: Dict) -> Dict:
        """
        Extracts entities, categories, and keyword presence from a session.
        """
        events = session.get('events', [])
        
        entities = set()
        categories = set()
        domains = set()
        keywords_found = set()
        transport_signals = set()
        activity_signals = set()

        for event in events:
            # Collect entities
            event_entities = event.get('entities', [])
            if isinstance(event_entities, list):
                entities.update(event_entities)
            
            # Collect categories
            category = event.get('category')
            if category:
                categories.add(category)
            
            # Collect domains
            domain = event.get('domain')
            if domain:
                domains.add(domain)
            
            # Extract keywords from URL or Title if available
            url = event.get('url', '').lower()
            title = event.get('metadata', {}).get('title', '').lower()
            
            text_to_search = f"{url} {title}"
            
            for kw in self.TRAVEL_KEYWORDS:
                if kw in text_to_search:
                    keywords_found.add(kw)
            
            for kw in self.TRANSPORT_KEYWORDS:
                if kw in text_to_search:
                    transport_signals.add(kw)
            
            for kw in self.ACTIVITY_KEYWORDS:
                if kw in text_to_search:
                    activity_signals.add(kw)

        return {
            'entities': list(entities),
            'categories': list(categories),
            'domains': list(domains),
            'keywords': list(keywords_found),
            'transport_signals': list(transport_signals),
            'activity_signals': list(activity_signals),
            'event_count': len(events)
        }
