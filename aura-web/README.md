# AURA AI — Web Frontend (React)

JARVIS-style AI operating-system UI for AURA. The visual source of truth is the reference set in [`/reference/aura/`](../reference/aura/) (01–15).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # strict type-check + production build (screens are code-split)
```

Stack: React 18 · TypeScript (strict) · Vite · React Router · lucide-react. No UI framework. The HUD geometry, charts and agent network are hand-built in CSS and SVG.

## Design system

| File | What's in it |
|---|---|
| `src/theme/aura-theme.css` | Tokens (`--aura-bg`, `--aura-panel`, `--aura-primary`, `--aura-cyan`, `--aura-purple`, `--aura-green`, `--aura-warning`, `--aura-danger`, text, borders, glows, metal, type, motion, z-index), the environment background, **clipped HUD geometry**, shell, buttons, inputs, status and responsive rules |
| `src/theme/aura-pages.css` | Page-level compositions (landing, login stage, dashboard, voice, tasks, thank-you) |
| `src/components/aura/` | The component library, imported through `components/aura/index.ts` |
| `public/aura/*.jpg` | Android and robot art cropped from the reference images |

**How the angular panels work.** Every HUD surface (`.hud`, `.tile`, `.btn`, `.chip`, `.input`, `.icon-btn`, `.nav a.active`, …) is drawn with two pseudo-layers that share one clip-path polygon. `::before` is the border layer (`--bd`: a colour, a gradient or `--aura-metal`). `::after` is the fill layer (`--fill` on top of an opaque `--base`), inset by `--bw`. The outer glow is `filter: drop-shadow`, so it follows the diagonal cuts. To restyle one instance, set these variables inline, e.g. `style={{ '--bd': toneHex.green }}`. Don't set `background` on these elements, because the fill layer covers it.

### Components

`AuraShell` (`AuraSidebar`, `AuraTopbar`, mobile bottom nav, `Ctrl+K` palette) · `AuraLogo` · `HudPanel` · `HudFrame` · `NeonButton` · `HudInput` · `CommandInput` · `NeonTabs` · `StatusBadge` · `MetricCard` · `AgentCard` · `AgentAvatar` · `AgentNetwork` · `InsightCard` · `ActionCard` · `ChatMessage` · `ChartCard` · `ProgressRing` · `GlowDivider` · `SectionHeader` · `FuturisticModal` · `VoiceVisualizer` · `AIAvatar` · `AppLogo`

`AIAvatar` takes `art` (`android | core | voice | onboard | signup | login | decision | travel | tasks | integrations | analytics | face`) and `state` (idle … offline). The state changes the glow and ring colour and speed.

## Routes

| Route | Reference |
|---|---|
| `/` | 01 Landing / boot |
| `/login` | 02 Login |
| `/signup` | 04 Sign up |
| `/onboarding` | 05 Personalization |
| `/dashboard` | 03 Command Center |
| `/chat` | 06 AI Chat |
| `/voice` | 07 Voice Mode |
| `/decisions` | 08 Decision Center |
| `/agents` | 09 Agent Hub |
| `/tasks` | 10 Tasks |
| `/agents/:id` (e.g. `/agents/travel`) | 11 Travel Agent |
| `/collaboration` | 12 Agent Collaboration |
| `/integrations`, `/settings` | 13 Integrations & Settings |
| `/analytics` | 14 Analytics & Insights |
| `/thank-you` | 15 Thank You |
| `/qa` | 16 Q&A / Ask Anything |
| `/pricing` | 17 Plans & Pricing |
| `/calendar` | 18 Calendar |
| `/tasks` (+ `/tasks/board` agent view from ref 10) | 19 Tasks |
| `/shopping` | 20 Shopping |
| `/travel` | 21 Travel |
| `/finance` | 22 Finance |
| `/wellness` | 23 Wellness |
| `/research` | 24 Research |
| `/memory` | 25 Memory |
| `/automation-hub` | 26 Automation Hub |
| `/automations` | 27 Automations |

`/home`, `/setup`, `/faq` and `/agents/collaboration` redirect to their new paths.

Layout by width: above 1100px, sidebar, top command bar and multi-column grids. From 900–1100px, the sidebar stays and grids drop to two columns or stack. Below 900px, a drawer and a bottom nav (Home · Chat · **Voice** · Agents · More). No route scrolls horizontally at phone width.

## Behaviour rules

- Data lives in `src/data/mock.ts` and in data arrays inside each screen. Anything not backed by an integration shows a **DEMO** badge.
- `src/services/aura.ts` is the only API boundary, and no keys are in the frontend. The voice layer is `src/services/voice.ts` (browser speech, with Vapi/ElevenLabs handled server-side).
- Consequential actions go through the approval modal. Mock mode never reports a fake success.
- The Decision Center's "AURA's pick" comes from a transparent weighted score over your priority-goal order. Reorder the goals and the pick can change. The final choice stays with the user.
- `prefers-reduced-motion` is respected. Focus states are visible, and controls have labels.

## Module architecture (refs 16–27)

```
src/components/ui/          primitives + kit (Drawer, MoreMenu, FilterDropdown, Tooltip, DataTable, AvatarGroup…)
src/components/ai/          AICommandPanel — suggested prompts, NL input, voice, streaming reply, action preview, Confirm/Cancel
src/components/<domain>/    calendar · tasks · shopping · travel · finance · wellness · research · memory · automations · pricing
src/data/mock*.ts           one file per domain (mockTasks, mockEvents, mockProducts, mockTrips, mockTransactions, mockBudgets,
                            mockGoals, mockWellnessData, mockResearchPapers, mockMemories, mockAutomations, mockTestimonials, mockPricingPlans)
src/state/stores.ts         tiny shared stores (useSyncExternalStore) seeded from the mock files — swap for API/Supabase loaders
src/state/search.tsx        header search: on module pages it filters the page live; elsewhere Enter asks AURA
```

**AI actions follow one rule:** anything that changes data is shown as a preview and waits for **Confirm** or **Cancel**. Examples are "Plan my day → Optimize My Day / Keep Current Schedule", creating tasks, adding focus blocks, and budget changes. Purchases, bookings and plan upgrades run in demo mode, so they never report a real charge or booking.
