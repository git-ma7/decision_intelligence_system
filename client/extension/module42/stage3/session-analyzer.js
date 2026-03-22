/**
 * Module 4.2 - Stage 3: Session Analyzer
 * Combines metrics and behavioral flags.
 */

import { computeSessionMetrics } from './session-metrics.js';
import { detectBehaviors } from './behavior-detector.js';

export function analyzeSession(sessionId, events) {
  const metrics = computeSessionMetrics(events);
  const behavioralFlags = detectBehaviors(events, metrics);
  
  return {
    sessionId,
    metrics,
    behavioralFlags,
    enrichedEvents: events,
    analyzedAt: Date.now()
  };
}
