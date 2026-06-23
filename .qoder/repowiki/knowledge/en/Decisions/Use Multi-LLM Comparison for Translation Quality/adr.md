# Use Multi-LLM Comparison for Translation Quality

_Source: coding plans from commit period 198f2de → 6f5f8ae — records intent at planning time; the implementation may lag or differ._

**Status:** accepted

## Context
Users need high-quality translations and educational feedback. Relying on a single LLM may lead to inaccuracies or lack of nuanced explanation. The system needed a way to ensure reliability and provide educational value through comparison.

## Decision drivers
- Translation accuracy and reliability
- Educational value (showing alternatives)
- Leveraging diverse model strengths

## Considered options
- **Single Model Strategy** _(rejected)_ — pros: Lower latency; reduced API costs; simpler implementation.; cons: Single point of failure for quality; no basis for comparison or alternative phrasing.
- **Dual-Model Comparison (Chosen)** — pros: Allows side-by-side comparison of Llama 3 and Gemma 3 outputs; provides richer context via 'compareResults' metrics (length, overlap); enables users to choose the best translation.; cons: Higher latency (parallel calls); increased API costs; more complex UI state management.

## Decision
Integrate both Llama 3 (via Meta AI API) and Gemma 3 (via Google AI Studio) as primary providers. Implement a `translationService` that supports parallel execution (`translateWithBoth`) and a `ModelComparison` UI component to display outputs side-by-side with basic similarity metrics.

## Consequences
Enhances user trust and learning by exposing model differences. Increases operational complexity in managing two provider SDKs (`@google/generative-ai` and Meta API) and handling parallel async states in the UI.