# Global Ecosystem Decisions

## GADR 1: Modular Constitution
- **Decision**: Refactor GEMINI.md into Volume I (Core) and Volume II (Branches).
- **Reasoning**: Prevent context overload and improve agent implementation speed.

## GADR 2: Unified Context Protocol
- **Decision**: Every project MUST have its own `/context` folder.
- **Reasoning**: Isolate project-specific hallucinations from global ecosystem rules.
