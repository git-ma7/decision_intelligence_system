# Decision Intelligence Platform

## Project Overview
The **Decision Intelligence Platform** is a single-user, professional system designed to observe user digital activity, identify potential decisions, and present structured insights over time.

Unlike standard productivity tools, this system operates as a **retrospective mirror**: it strictly prioritizes privacy and local-first processing to help users understand *how* they decide, without prescriptively telling them *what* to do.

## Architecture
The system follows a **Modular Monolith** architecture. Each feature is an independent module with clear boundaries, prioritizing defensibility and academic rigor.

---

## Module 1: Decision Capture System

**Current Focus**

This module is the entry point of the system. It is responsible for passively observing user interactions within the browser and serving as the "privacy gatekeeper".

### Key Responsibilities
1.  **Passive Observation**: Monitors browser activity (URLs, Page Titles, Metadata) with minimal user friction.
2.  **Privacy Gatekeeper**: Ensures no data is permanently stored without explicit user consent.
3.  **User Interface**: Provides a non-intrusive popup/interaction model for the user to Confirm or Discard potential captured decisions.

### Technology Stack (Module 1)
*   **Platform**: Chrome Extension (Manifest V3)
*   **UI Framework**: React (JavaScript)
*   **Styling**: Tailwind CSS
*   **Classification**: On-device heuristics (JavaScript)

---

*Note: Further modules (Backend Interpretation, Knowledge Graph, etc.) will be documented as the project evolves.*
