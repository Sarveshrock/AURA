# AURA AI --- Complete Claude Build Specification

## 0. Mission

Build **AURA AI**, a JARVIS-style personal AI decision-maker and
multi-agent personal intelligence platform.

AURA is **not merely a task automation app**. It should understand the
user's current situation, combine information from multiple domains, ask
specialized agents for insights, evaluate alternatives, explain
trade-offs, and then suggest or execute an authorized action.

The product should feel like a **robotic AI operating system /
futuristic command center** rather than a conventional productivity
SaaS.

### Core loop

**Observe → Understand → Remember → Reason → Coordinate Agents →
Evaluate Options → Ask Permission When Needed → Act → Verify → Learn**

The user must remain in control of consequential actions.

------------------------------------------------------------------------

# 1. Required Technology Stack

Use this stack unless there is a strong technical reason to substitute a
component.

### Frontend

-   React Native
-   TypeScript
-   React Navigation
-   Reanimated
-   Gesture Handler
-   SVG / Skia where useful
-   Three.js / React Three Fiber for 3D effects where practical
-   GSAP where compatible/useful for advanced motion
-   Lottie for lightweight robotic animations
-   Native Android modules where React Native cannot provide required
    capabilities

### Backend

-   Node.js
-   TypeScript
-   REST API
-   WebSocket support for real-time AI/agent activity
-   Supabase for:
    -   PostgreSQL
    -   Authentication
    -   Realtime
    -   Storage
    -   Row Level Security
    -   pgvector if required

### AI Runtime

-   Python
-   FastAPI
-   Dockerized AI service
-   Grok AI API as the primary LLM/AI support
-   Python agent orchestration
-   Structured JSON outputs between agents and the backend

### Voice

Use **Vapi and/or ElevenLabs**.

Architecture should keep voice provider abstraction behind a
`VoiceService` interface so either provider can be switched without
rewriting the application.

### Infrastructure

-   Docker
-   Docker Compose for local development
-   Production container deployment
-   Environment variables/secrets
-   Health checks
-   Structured logging
-   Error monitoring

------------------------------------------------------------------------

# 2. Product Identity

## Name

**AURA AI**

### Meaning

**Autonomous User Reasoning Assistant**

### Positioning

> Your personal AI co-pilot that understands your world, reasons across
> it, and helps you make smarter decisions.

AURA should feel closer to **JARVIS** than Siri, Alexa, a chatbot, or a
simple automation platform.

------------------------------------------------------------------------

# 3. Core Product Philosophy

AURA should NOT behave like:

> User asks task → system executes task.

Instead:

> User provides a goal or situation → AURA understands context →
> relevant agents collaborate → AURA evaluates options → AURA explains
> the situation → user approves when necessary → AURA executes → AURA
> verifies the result.

Example:

User:

> "I have an interview tomorrow in another city and I also have work."

AURA should be able to consider: - interview time - travel duration -
existing calendar events - preparation time - budget - work
commitments - user preferences - available travel options

Then produce:

> "Your current schedule creates a conflict. I found two ways to handle
> it. Option A reduces cost but leaves less preparation time. Option B
> gives you more preparation time but costs more. I can prepare the
> required changes for you."

This is the heart of the product.

------------------------------------------------------------------------

# 4. Full UI Theme

The entire application must use a consistent **robotic futuristic AI
command-center design**.

## Visual direction

Think:

-   JARVIS
-   futuristic spacecraft cockpit
-   AI command center
-   cybernetic HUD
-   dark sci-fi interface
-   premium enterprise AI
-   holographic glass
-   robotic intelligence

Do NOT make it look like a normal: - banking app - calendar app -
generic SaaS dashboard - ordinary chatbot - flat Material UI application

------------------------------------------------------------------------

# 5. Global Design System

## Background

Primary: - Near-black navy - Deep space blue - Subtle gradient layers

Suggested values: - `#030712` - `#06111F` - `#081526` - `#0B1728`

## Accent colors

Primary: - Electric Cyan - Neon Blue - Violet - Magenta

Secondary: - Teal - Emerald - Amber for warnings - Red for critical
states

Suggested: - Cyan `#00E5FF` - Blue `#3B82FF` - Violet `#8B5CF6` -
Magenta `#D946EF` - Teal `#00F5D4` - Green `#22C55E` - Amber `#F59E0B` -
Red `#EF4444`

Use colors consistently. Avoid rainbow overload.

## Typography

Use a modern geometric/sci-fi-friendly sans serif.

Recommended: - Inter - Space Grotesk - Orbitron for selected display
labels only - JetBrains Mono for system telemetry / technical values

Do not use futuristic fonts everywhere. Keep body text highly readable.

------------------------------------------------------------------------

# 6. UI Effects

Use these throughout the product:

-   neon edge glow
-   glassmorphism
-   holographic cards
-   thin cyan borders
-   subtle scanlines
-   animated grid backgrounds
-   particle fields
-   radial light
-   data streams
-   pulsing status indicators
-   animated AI waveforms
-   futuristic progress rings
-   HUD corner decorations
-   subtle perspective effects
-   depth and parallax
-   animated gradients
-   3D robotic elements

Effects must remain performant and usable.

Do NOT create excessive animation that makes the application difficult
to use.

------------------------------------------------------------------------

# 7. AURA Robot

AURA should have a recognizable robotic visual identity.

Create a reusable `AuraAvatar` component with states:

-   idle
-   listening
-   thinking
-   analyzing
-   speaking
-   executing
-   success
-   warning
-   error
-   offline

The avatar can be: - 3D model - Three.js / React Three Fiber scene -
animated 2D/3D visual - Lottie fallback for lower-end devices

The robot should be used selectively: - onboarding - home dashboard -
voice screen - decision center - agent collaboration - important AI
states

Do not place a huge robot on every screen.

------------------------------------------------------------------------

# 8. Application Navigation

Use a primary navigation structure suitable for mobile/tablet and
adaptable to desktop/web if required.

Primary destinations:

1.  Home / Command Center
2.  AI Chat
3.  Voice
4.  Agents
5.  Decisions
6.  Tasks
7.  Calendar
8.  Shopping
9.  Travel
10. Finance
11. Wellness
12. Research
13. Memory
14. Automations
15. Integrations
16. Settings

On mobile, do NOT put all destinations in a bottom tab bar.

Use: - bottom navigation for 4--5 primary areas - drawer / command
palette / expandable navigation for secondary areas

Recommended primary bottom navigation:

**Home \| Agents \| Decisions \| Activity \| Control**

------------------------------------------------------------------------

# 9. Required Screens

Build the following complete screen system.

## Authentication

### 1. Splash / AURA Boot

-   robotic boot animation
-   AURA logo
-   system diagnostics
-   "Initializing Intelligence..."
-   animated loading sequence

### 2. Login

-   futuristic login card
-   email
-   password
-   biometric option where supported
-   Google/other auth if configured
-   voice-assisted login optional
-   animated AURA background

### 3. Sign Up

-   name
-   email
-   password
-   confirmation
-   terms
-   privacy
-   futuristic onboarding transition

### 4. AI Initialization / Personalization

Ask the user: - what they want AURA to help with - important goals -
preferred communication style - connected services - autonomy
preferences - notification preferences

Do not overwhelm the user. Use progressive onboarding.

------------------------------------------------------------------------

# 10. Home / Command Center

This is the most important screen.

It should feel like:

> "AURA is currently aware of my world."

Sections:

### Top

-   AURA status
-   current time
-   user profile
-   notification indicator
-   connection status

### Hero

-   AURA avatar
-   "Good morning, [name](#name)"
-   current context summary
-   voice activation button

Example:

> "You have 3 important things today. I detected one schedule conflict."

### Situation Card

Show: - current priorities - upcoming events - urgent items - active
decisions - relevant context

### AURA Insights

Examples: - "Your 10:00 meeting overlaps with travel." - "You have 3
tasks due today." - "Your shopping list has 2 recurring items." - "Your
configured budget threshold is approaching."

### Quick Commands

-   Ask AURA
-   Plan my day
-   Analyze my schedule
-   Find something
-   Prepare my tasks
-   Start focus mode

------------------------------------------------------------------------

# 11. AI Chat

A full AI conversation interface.

Features: - text - voice - attachments - images - files - structured
results - cards - action buttons - decision previews - agent activity

The chat should NOT look like a generic ChatGPT clone.

Use: - holographic message cards - AURA avatar - thinking animation -
tool activity indicators - agent collaboration indicators

Example:

> AURA is consulting Travel + Productivity + Finance...

Then show structured result.

------------------------------------------------------------------------

# 12. Voice Interface

Full-screen voice mode.

Visual: - large AURA robot - animated circular waveform - voice energy
visualization - listening state - thinking state - speaking state

Buttons: - mute - cancel - switch to text - interrupt - conversation
history

Voice provider abstraction:

``` text
VoiceService
 ├── VapiProvider
 └── ElevenLabsProvider
```

Keep provider-specific implementation isolated.

------------------------------------------------------------------------

# 13. Agent Hub

Show all specialized agents.

Agents:

-   Core Coordinator
-   Shopping Agent
-   Food Agent
-   Travel Agent
-   Productivity Agent
-   Finance Agent
-   Wellness Agent
-   Communication Agent
-   Research Agent
-   Memory Agent
-   Calendar Agent
-   Planning Agent

Each agent card shows: - avatar/icon - status - capabilities - current
task - last activity - permission level - connected tools

------------------------------------------------------------------------

# 14. Agent Details

Each agent has:

-   identity
-   purpose
-   capabilities
-   tools
-   permissions
-   memory access
-   current tasks
-   recent decisions
-   activity
-   enable/disable
-   autonomy level

------------------------------------------------------------------------

# 15. Agent Collaboration / Neural Network

This screen is critical to the JARVIS experience.

Show a visual network:

``` text
                    AURA CORE
                       |
        +--------------+--------------+
        |              |              |
     TRAVEL         FINANCE       PRODUCTIVITY
        |              |              |
        +--------------+--------------+
                       |
                DECISION ENGINE
                       |
                    USER
```

Use Three.js for an animated neural network.

Features: - live agent nodes - animated data packets - agent-to-agent
communication - active task graph - current reasoning session - event
stream

Do not expose private chain-of-thought. Show high-level activity such
as: - "Travel data received" - "Budget constraint checked" - "Schedule
conflict detected"

------------------------------------------------------------------------

# 16. Decision Center

This is the defining screen of AURA.

It should answer:

> "What decision is AURA helping me make?"

Structure:

### Situation

What is happening?

### Context

Relevant information.

### Options

Possible actions.

### Trade-offs

Cost, time, convenience, risk, dependencies.

### AURA Analysis

A concise explanation of why each option differs.

### Recommendation / Suggested Path

Present as decision support, not unquestionable truth.

### Actions

-   Approve
-   Modify
-   Reject
-   Ask AURA
-   Save for later

For consequential actions, require explicit approval.

------------------------------------------------------------------------

# 17. Decision Detail

Show: - decision ID - timestamp - situation - agents consulted -
evidence/context used - options - assumptions - uncertainties - user
choice - resulting action - outcome

------------------------------------------------------------------------

# 18. Tasks

Task management should be AI-first.

Features: - natural language task creation - priorities - deadlines -
dependencies - subtasks - AI breakdown - agent assignment - progress -
reminders

Example:

> "Prepare my hackathon presentation tomorrow."

AURA can break this into: - finalize problem statement - architecture -
UI screenshots - technical stack - demo - final review

------------------------------------------------------------------------

# 19. Calendar

Features: - month - week - day - agenda - event creation - AI schedule
analysis - conflict detection - focus blocks - travel integration - task
integration

Important: Calendar is not just a calendar viewer.

AURA should identify: - conflicts - overloaded days - travel buffers -
preparation requirements - deadlines

------------------------------------------------------------------------

# 20. Shopping

AURA is NOT a marketplace.

The Shopping Agent should: - understand the user's requirement - search
supported providers - compare equivalent products - normalize
quantity/variant - compare total cost - compare delivery - consider user
preferences - present options - open/handoff to the selected provider

Example:

> "Find protein powder under my budget."

Show: - products - price - quantity - effective unit price - delivery -
provider - user preferences - comparison

Do not claim universal control over every shopping application.

Use official APIs, authorized integrations, deep links, and
platform-supported handoff mechanisms.

------------------------------------------------------------------------

# 21. Travel

Features: - flight search - hotel search - train/bus/cab support where
integrations exist - itinerary - destination research - packing
planning - travel reminders - budget awareness - calendar conflict
detection - trip timeline - AI trip planner

Example:

> "Plan a 5-day Goa trip under my configured budget."

AURA coordinates: - Travel - Finance - Calendar - Shopping - Research -
Productivity

------------------------------------------------------------------------

# 22. Finance

Finance page should be an awareness and planning dashboard.

Features: - income - expenses - budgets - goals - recurring bills -
spending categories - transaction history where authorized - AI
insights - upcoming obligations

Do not make autonomous financial transactions without explicit
authorization.

Avoid presenting regulated financial advice as fact.

------------------------------------------------------------------------

# 23. Wellness

Features: - user-configured routines - fitness tracking - hydration
reminders - sleep routines - mindfulness - meal planning - habit
tracking - personal care reminders

Use careful language.

Do not diagnose medical conditions.

------------------------------------------------------------------------

# 24. Research

Research assistant features: - paper discovery - PDF upload -
summarization - literature search - citation assistance - research
ideas - research project workspace - data analysis - notes - outline
generation

Include source/evidence handling.

------------------------------------------------------------------------

# 25. Memory

Memory is the shared intelligence layer.

Categories: - preferences - goals - projects - tasks - decisions -
conversations - notes - travel - shopping preferences - routines -
user-approved facts

Features: - search memory - save - edit - archive - delete -
categories - timeline - AI recall

Memory access must be permission-aware.

------------------------------------------------------------------------

# 26. Automation Hub

Automation is secondary to decision intelligence.

Users can create: - time-based automations - event-based automations -
conditional workflows - multi-agent workflows

Example:

> "When I add a new trip, create a travel checklist, check my calendar,
> estimate required shopping, and prepare reminders."

This is a multi-agent workflow.

Automation builder: - natural language input - visual workflow -
trigger - conditions - agent steps - tool actions - approval gates -
output - logs

------------------------------------------------------------------------

# 27. Integrations

Show: - connected apps - available apps - permissions - scopes -
connection status - revoke access

Categories: - calendar - email - maps - shopping - food - travel -
productivity - communication - storage - finance - voice

Use least privilege.

------------------------------------------------------------------------

# 28. Settings / Control Center

Sections: - account - appearance - notifications - voice - AI
preferences - memory - agent permissions - autonomy - integrations -
privacy - security - data export - delete account

------------------------------------------------------------------------

# 29. Autonomy Model

AURA must have explicit autonomy levels.

### Level 1 --- Suggest

AURA only informs/recommends.

### Level 2 --- Prepare

AURA prepares drafts, plans, carts, schedules, etc.

### Level 3 --- Restricted Execute

AURA can execute narrowly scoped actions under user-defined limits.

### Level 4 --- Explicit Approval

Sensitive/high-impact actions require confirmation.

Examples: - sending sensitive messages - financial transactions -
purchases - deleting important data

Permissions must be enforced outside the LLM.

------------------------------------------------------------------------

# 30. Backend Architecture

Use Node.js as the primary backend/BFF and Python as the AI runtime.

``` text
React Native
     |
     v
Node.js API
     |
     +--------------------+
     |                    |
     v                    v
Supabase             Python AI Service
                           |
                           v
                     AURA Coordinator
                           |
          +----------------+----------------+
          |                |                |
       Agents          Decision         Memory
          |              Engine          Service
          |
       Tools / APIs
```

------------------------------------------------------------------------

# 31. Python AI Service

Use FastAPI.

Responsibilities: - AI orchestration - agent execution - Grok API
integration - prompt management - structured output validation - memory
retrieval - decision generation - tool selection - agent communication -
AI evaluation - context management

Do not put business-critical authorization only in Python prompts.

------------------------------------------------------------------------

# 32. Grok AI Integration

Create an abstraction:

``` text
LLMService
   |
   +── GrokProvider
```

All model calls should go through this service.

Required capabilities: - chat - structured JSON output - agent
reasoning - summarization - classification - planning - extraction

Use environment variables for credentials.

Never hard-code API keys.

------------------------------------------------------------------------

# 33. Multi-Agent Architecture

Each agent should have:

``` text
Agent
 ├── identity
 ├── capabilities
 ├── allowed tools
 ├── memory access
 ├── permission scope
 ├── planner
 ├── executor
 ├── validator
 └── event publisher
```

Agent output must be structured.

Example conceptual output:

``` json
{
  "agent": "travel",
  "status": "completed",
  "insights": [],
  "constraints": [],
  "options": [],
  "events": [],
  "required_approval": false
}
```

Do not allow one agent to arbitrarily invoke every other agent.

Use the Coordinator/Event Bus.

------------------------------------------------------------------------

# 34. Shared Context

All agents need awareness of relevant system state.

Create a Shared Context service.

It should provide: - user context - current situation - active goal -
relevant memories - active tasks - active decisions - agent results -
policies - permissions

Context must be filtered based on: - relevance - agent role - user
permissions - sensitivity

------------------------------------------------------------------------

# 35. Event Bus

Use an event-driven architecture.

Example events:

``` text
USER_PREFERENCE_UPDATED
GOAL_CREATED
TASK_CREATED
TASK_COMPLETED
CALENDAR_CONFLICT_DETECTED
TRAVEL_PLAN_CREATED
BUDGET_THRESHOLD_REACHED
PRICE_CHANGED
DECISION_CREATED
APPROVAL_REQUESTED
ACTION_COMPLETED
ACTION_FAILED
INTEGRATION_DISCONNECTED
```

Agents subscribe only to relevant events.

------------------------------------------------------------------------

# 36. Decision Engine

Decision engine pipeline:

``` text
User Goal
   ↓
Situation Model
   ↓
Relevant Context
   ↓
Agent Consultation
   ↓
Candidate Options
   ↓
Constraint Evaluation
   ↓
Trade-off Analysis
   ↓
Risk / Uncertainty
   ↓
Permission Check
   ↓
Decision Plan
   ↓
Approval
   ↓
Execution
   ↓
Verification
```

Never expose hidden chain-of-thought.

Instead show: - concise reasoning summary - factors considered -
evidence - assumptions - uncertainties - actions

------------------------------------------------------------------------

# 37. Task Graph

Complex goals must become a task graph.

Example:

``` text
Prepare for Interview
|
+-- Confirm Interview
+-- Research Company
+-- Prepare Technical Topics
+-- Plan Travel
|     +-- Compare transport
|     +-- Check budget
|     +-- Add travel buffer
|
+-- Check Calendar
|     +-- Detect conflicts
|     +-- Prepare rescheduling draft
|
+-- Create Final Preparation Plan
```

Tasks should contain: - ID - parent goal - assigned agent -
dependencies - deadline - status - permission requirements - retry
count - result - evidence

------------------------------------------------------------------------

# 38. Memory Architecture

Use Supabase PostgreSQL.

Suggested tables:

``` text
users
user_preferences
goals
memory_items
conversations
agents
agent_permissions
tasks
task_dependencies
events
decision_sessions
decision_options
approvals
automations
automation_runs
integrations
notifications
audit_logs
tool_calls
```

Use pgvector if semantic memory retrieval is required.

Use Row Level Security.

------------------------------------------------------------------------

# 39. Security

Implement:

-   Supabase Auth
-   Row Level Security
-   encrypted secrets
-   scoped integration tokens
-   least privilege
-   API rate limits
-   request validation
-   audit logs
-   approval tokens
-   expiration
-   tool allowlists
-   input/output validation
-   prompt injection defenses
-   external content treated as untrusted data
-   no secret values sent unnecessarily to LLMs

------------------------------------------------------------------------

# 40. React Native Architecture

Recommended structure:

``` text
src/
  app/
  navigation/
  screens/
    auth/
    home/
    chat/
    voice/
    agents/
    decisions/
    tasks/
    calendar/
    shopping/
    travel/
    finance/
    wellness/
    research/
    memory/
    automations/
    integrations/
    settings/
  components/
    aura/
    hud/
    cards/
    charts/
    modals/
    buttons/
    inputs/
  services/
    api/
    auth/
    voice/
    realtime/
    storage/
  state/
  hooks/
  theme/
  animations/
  utils/
  types/
```

Use feature-based organization where appropriate.

------------------------------------------------------------------------

# 41. Reusable UI Components

Build a design system first.

Required components:

-   AuraAvatar
-   NeonButton
-   GlowCard
-   HudCard
-   GlassPanel
-   StatusIndicator
-   NeonInput
-   SearchBar
-   CommandPalette
-   AgentCard
-   DecisionCard
-   InsightCard
-   TaskCard
-   EventCard
-   Timeline
-   AgentNode
-   NeuralGraph
-   VoiceOrb
-   AIThinkingIndicator
-   ApprovalModal
-   PermissionCard
-   IntegrationCard
-   StatCard
-   ChartCard
-   EmptyState
-   ErrorState
-   LoadingState

Do not duplicate styling screen by screen.

------------------------------------------------------------------------

# 42. Animation System

Use React Native Reanimated for UI motion.

Use Three.js / React Three Fiber for: - robot - neural network -
particle environments - 3D visualizations

Use GSAP where it provides clear value and compatibility.

Animations: - screen entrance - glow pulse - hover/press - agent
activation - data packet movement - AI thinking - voice waveform -
decision transitions - success/error states

Respect reduced-motion accessibility settings.

------------------------------------------------------------------------

# 43. Responsive Design

The design should support:

-   Android phones
-   iPhones
-   tablets
-   web/desktop if React Native Web is later enabled

Do not simply stretch a desktop dashboard onto mobile.

Create responsive layouts.

------------------------------------------------------------------------

# 44. Real-Time Agent Activity

Use Supabase Realtime and/or WebSockets.

Example:

``` text
AURA CORE
  |
  +-- Travel Agent: analyzing
  |
  +-- Finance Agent: checking budget
  |
  +-- Calendar Agent: checking conflicts
  |
  +-- Research Agent: completed
```

This activity should be visualized without exposing private model
reasoning.

------------------------------------------------------------------------

# 45. API Architecture

Node.js routes:

``` text
/auth
/users
/chat
/voice
/agents
/decisions
/tasks
/calendar
/shopping
/travel
/finance
/wellness
/research
/memory
/automations
/integrations
/notifications
/approvals
```

Python AI routes:

``` text
/ai/chat
/ai/plan
/ai/decide
/ai/agents/run
/ai/memory/retrieve
/ai/summarize
/ai/classify
/ai/health
```

Node should remain the main public backend boundary.

Python AI service should not be publicly exposed without appropriate
authentication and network controls.

------------------------------------------------------------------------

# 46. Docker

Create Docker configuration for:

``` text
node-backend
python-ai
```

Optional: - local Redis - worker - monitoring

Use: - health checks - non-root containers where practical - environment
variables - production builds - minimal images - clear service
dependencies

------------------------------------------------------------------------

# 47. Environment Variables

Use `.env.example`.

Example categories:

``` text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

GROK_API_KEY

VAPI_API_KEY
ELEVENLABS_API_KEY

NODE_API_URL
PYTHON_AI_URL

JWT_SECRET

REDIS_URL
```

Never commit real secrets.

------------------------------------------------------------------------

# 48. Error Handling

Every service needs:

-   typed errors
-   retries for transient failures
-   timeout handling
-   circuit breakers where appropriate
-   graceful degradation
-   offline UI states
-   user-friendly error messages
-   logs with correlation IDs

Example:

If Grok is unavailable:

> "AURA AI reasoning is temporarily unavailable. Your saved tasks and
> calendar are still accessible."

Do not show raw stack traces to users.

------------------------------------------------------------------------

# 49. Observability

Track:

-   request ID
-   user/session ID
-   agent ID
-   task ID
-   decision ID
-   tool call ID
-   latency
-   model latency
-   token usage if available
-   errors
-   integration failures
-   approval events

Never log secrets or unnecessary sensitive content.

------------------------------------------------------------------------

# 50. Performance

Optimize:

-   lazy screen loading
-   image caching
-   animation performance
-   3D rendering
-   API response caching
-   database queries
-   pagination
-   realtime subscriptions
-   AI context size
-   model usage

Do not run expensive 3D effects continuously when the screen is
inactive.

------------------------------------------------------------------------

# 51. AI UX Rules

AURA should communicate clearly.

Instead of:

> "Done."

Prefer:

> "I created the plan and found one scheduling conflict. Review it
> before I make the change."

Instead of pretending:

> "Your order is placed."

Only say this after a verified provider result.

Use statuses: - thinking - analyzing - waiting for approval -
executing - verifying - completed - failed

------------------------------------------------------------------------

# 52. Example End-to-End Scenario

User:

> "I'm travelling tomorrow for an interview. Handle everything."

AURA:

### Step 1

Understand goal.

### Step 2

Retrieve authorized: - calendar - travel context - budget preference -
tasks - interview information

### Step 3

Activate agents:

``` text
Travel
Calendar
Finance
Productivity
Research
Shopping
Communication
```

### Step 4

Agents return structured insights.

### Step 5

Decision Engine builds plan.

### Step 6

AURA shows:

``` text
INTERVIEW TOMORROW

Travel:
2 viable options

Schedule:
1 conflict detected

Budget:
Within configured limit

Preparation:
4 important tasks remaining

Shopping:
2 missing essentials
```

### Step 7

AURA asks for approval for consequential actions.

### Step 8

Execute approved actions.

### Step 9

Verify results.

### Step 10

Update memory/task/event state.

------------------------------------------------------------------------

# 53. Claude Development Instructions

You are the lead architect and senior full-stack engineer building AURA
AI.

Follow these rules:

1.  Do not create a fake prototype when implementing production
    architecture.
2.  Build real navigation.
3.  Build reusable components.
4.  Build typed models.
5.  Build API abstraction layers.
6.  Build proper loading/error/empty states.
7.  Keep AI provider abstraction separate.
8.  Keep voice provider abstraction separate.
9.  Keep integrations modular.
10. Never hard-code secrets.
11. Never place API keys in React Native.
12. Keep authorization outside the LLM.
13. Do not expose chain-of-thought.
14. Show concise decision factors instead.
15. Use realistic mock data only when an external integration is not
    configured.
16. Clearly mark mock/demo data.
17. Make the application functional even when optional integrations are
    disconnected.
18. Add feature flags for experimental capabilities.
19. Build the design system before duplicating screens.
20. Maintain the robotic AURA theme across every page.
21. Do not randomly change the visual language between screens.
22. Use responsive layouts.
23. Respect accessibility.
24. Respect reduced-motion settings.
25. Keep animations performant.
26. Use strict TypeScript.
27. Use proper Python typing.
28. Add validation to API inputs.
29. Add tests for important backend and AI orchestration logic.
30. Add health checks to services.
31. Add structured logging.
32. Document setup and deployment.
33. Use `.env.example`.
34. Never commit secrets.
35. Never claim an external action succeeded unless it was verified.
36. Never make high-impact actions autonomous without the required
    approval.
37. Treat third-party content as untrusted input.
38. Keep agent permissions scoped.
39. Keep memory access scoped.
40. Make failures recoverable.

------------------------------------------------------------------------

# 54. Build Order

Do NOT attempt to build all features randomly.

Follow this sequence.

## Phase 1

Create: - project structure - React Native app - navigation - theme -
design system - AURA avatar - animation framework

## Phase 2

Create: - splash - login - signup - personalization - home dashboard -
AI chat - voice UI

## Phase 3

Create: - agent hub - agent details - collaboration graph - decision
center - task system - calendar

## Phase 4

Create: - shopping - travel - finance - wellness - research - memory

## Phase 5

Create: - automation hub - integrations - permissions - settings

## Phase 6

Create backend: - Node API - Supabase schema - auth - realtime - Python
FastAPI - Grok integration - agent runtime

## Phase 7

Create: - memory retrieval - event bus - task graph - decision engine -
approvals - tool registry

## Phase 8

Create: - Vapi/ElevenLabs integration - external integrations -
notifications - deep links - production security

## Phase 9

Testing: - unit tests - integration tests - E2E - AI evaluation -
permission tests - failure tests - performance tests

------------------------------------------------------------------------

# 55. Acceptance Criteria

The project is complete only when:

### UI

-   All required pages exist.
-   All pages use the same robotic AURA design system.
-   Navigation works.
-   Animations work.
-   Loading/error/empty states exist.
-   Mobile layout is polished.
-   AURA avatar is reusable.

### AI

-   User can chat with AURA.
-   AURA can create structured plans.
-   Multiple agents can collaborate.
-   Decision sessions work.
-   Memory retrieval works.
-   Tool calls are permission-controlled.

### Backend

-   Node backend works.
-   Python AI service works.
-   Supabase works.
-   Auth works.
-   Realtime works.
-   Docker builds successfully.

### Security

-   No frontend secrets.
-   RLS configured.
-   Agent permissions enforced.
-   Approval flow enforced.
-   Audit logs exist.

### Reliability

-   AI failures are handled.
-   Provider failures are handled.
-   External integrations can be disabled.
-   No fake success responses.

------------------------------------------------------------------------

# 56. Final Architecture

``` text
                         AURA AI
                            |
                    React Native App
                            |
                    Node.js Backend
                            |
        +-------------------+-------------------+
        |                   |                   |
     Supabase          Realtime/Auth       Integrations
        |
        |
   Python AI Runtime
        |
   AURA Coordinator
        |
   Situation Understanding
        |
   Goal & Priority Manager
        |
   Agent Orchestrator
        |
  +-----+-----+-----+-----+-----+
  |     |     |     |     |     |
Travel Finance Shopping Research Productivity
  |     |     |     |     |
  +-----+-----+-----+-----+-----+
                |
          Shared Context
                |
          Memory + Events
                |
          Decision Engine
                |
          Policy Engine
                |
       Approval if required
                |
          Tool Execution
                |
            Verification
                |
          Feedback/Memory
```

------------------------------------------------------------------------

# 57. Final Product Definition

AURA AI is a **JARVIS-style personal intelligence platform**.

It does not exist simply to automate repetitive tasks.

It should understand:

> "What is happening?"

Then determine:

> "What matters?"

Then ask:

> "Which agents can help?"

Then determine:

> "What options exist?"

Then evaluate:

> "What are the trade-offs?"

Then ask:

> "Does this action require the user's approval?"

Then:

> "Execute only what is authorized."

And finally:

> "Did it actually work?"

The final experience should make the user feel:

> **"I don't need to manage every application separately. I have one
> intelligent system that understands my context and helps me decide
> what to do next."**

------------------------------------------------------------------------

# 58. First Implementation Instruction

Start by inspecting the existing project structure.

If a project already exists: - preserve useful code - refactor
carefully - do not destroy working functionality - identify reusable
components - document technical debt

If starting from zero: - initialize the React Native TypeScript
project - create the Node.js TypeScript backend - create the Python
FastAPI AI service - configure Supabase - configure Docker - create the
design system - implement authentication - implement the AURA boot
screen - implement the main Command Center

Then proceed phase by phase.

**Do not stop at static UI mockups. Build the actual application
architecture and working interactions.**
