# Adopt serverless frontend architecture with direct LLM API calls

_Source: coding plans from commit period 198f2de → 6f5f8ae — records intent at planning time; the implementation may lag or differ._

**Status:** accepted

## Context
The application requires integration with multiple LLM providers (Meta Llama 3 and Google Gemma 3) for translation and content generation, alongside user authentication and data persistence. The team needed to decide on the backend infrastructure strategy.

## Decision drivers
- Development speed and simplicity
- Reduced operational overhead (no server maintenance)
- Leveraging managed services (Supabase)

## Considered options
- **Serverless Frontend (Chosen)** — pros: Eliminates backend server costs and maintenance; leverages Supabase for auth/DB; faster initial development.; cons: Exposes API keys in client-side environment variables (.env); relies on client-side logic for security-sensitive operations.
- **Traditional Backend Server** _(rejected)_ — pros: Secure storage of API keys; centralized business logic; better control over rate limiting and caching.; cons: Increased complexity; requires server hosting, scaling, and maintenance; higher initial development effort.

## Decision
Implement a 'No backend server' architecture where all API calls (Supabase, Meta AI, Google AI) originate directly from the React frontend. API keys are stored in `.env` files, with the explicit acceptance of client-side exposure as a trade-off for simplicity.

## Consequences
Significantly reduces infrastructure complexity and cost. However, it introduces security risks regarding API key exposure, requiring reliance on provider-side restrictions (e.g., domain locking) rather than secret management. All business logic for translation orchestration and gamification resides in the client.