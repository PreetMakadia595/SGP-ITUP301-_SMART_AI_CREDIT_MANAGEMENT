"""
AI Workflow Planner Service
Deconstructs any high-level user goal into a sequential, multi-step pipeline,
recommending the Best AI, reasons, time, costs, alternative models, and prompt templates.
"""
import re
from typing import List, Dict, Any, Optional

from app.schemas.workflow_planner import (
    WorkflowStep,
    WorkflowPlanResponse,
    WorkflowPreset,
    WorkflowRequest,
)

PRESETS: List[WorkflowPreset] = [
    WorkflowPreset(
        id="prepare-ppt",
        title="Prepare PPT / Presentation",
        icon="📊",
        description="End-to-end slide deck creation from topic research to final deck polish.",
        category="presentation",
        default_prompt="Prepare College PPT on Quantum Computing in Healthcare",
    ),
    WorkflowPreset(
        id="build-website",
        title="Build a Website / Web App",
        icon="💻",
        description="Full stack web development pipeline: UX wireframes, frontend, backend API, and deployment.",
        category="coding",
        default_prompt="Build a SaaS Landing Page and Dashboard for AI Credit Management",
    ),
    WorkflowPreset(
        id="write-research-paper",
        title="Write Research Paper",
        icon="📚",
        description="Literature review, paper structure, citations, deep reasoning, and peer review audit.",
        category="research",
        default_prompt="Write Research Paper on Multi-Agent Reinforcement Learning for Autonomous Vehicles",
    ),
    WorkflowPreset(
        id="create-resume",
        title="Create Resume / CV",
        icon="📄",
        description="Extract career milestones, craft ATS-compliant impact bullet points, and build modern layouts.",
        category="career",
        default_prompt="Create Software Engineer Resume with ATS optimization for FAANG roles",
    ),
    WorkflowPreset(
        id="develop-mobile-app",
        title="Develop Mobile App",
        icon="📱",
        description="PRD drafting, Flutter/React Native screens, state management, and backend API integration.",
        category="coding",
        default_prompt="Develop Mobile App for Personal Finance and Expense Tracking",
    ),
    WorkflowPreset(
        id="create-marketing-campaign",
        title="Create Marketing Campaign",
        icon="🚀",
        description="Audience positioning, ad copy, email sequences, visual creatives, and analytics setup.",
        category="marketing",
        default_prompt="Create Marketing Campaign for a B2B AI Developer Productivity Tool",
    ),
]


class AIWorkflowPlannerService:
    """Intelligent Workflow Decomposition Engine."""

    def get_presets(self) -> List[WorkflowPreset]:
        return PRESETS

    def generate_workflow(self, req: WorkflowRequest) -> WorkflowPlanResponse:
        goal_lower = req.goal.lower().strip()

        # Check for matching specialized archetype
        if any(k in goal_lower for k in ["ppt", "presentation", "slide", "deck", "powerpoint", "keynote"]):
            return self._build_ppt_workflow(req.goal)
        elif any(k in goal_lower for k in ["website", "web app", "webpage", "landing page", "frontend", "full stack"]):
            return self._build_website_workflow(req.goal)
        elif any(k in goal_lower for k in ["research paper", "paper", "literature review", "thesis", "dissertation", "academic"]):
            return self._build_research_paper_workflow(req.goal)
        elif any(k in goal_lower for k in ["resume", "cv", "curriculum vitae", "bio", "cover letter"]):
            return self._build_resume_workflow(req.goal)
        elif any(k in goal_lower for k in ["mobile app", "android", "ios", "flutter", "react native", "app development"]):
            return self._build_mobile_app_workflow(req.goal)
        elif any(k in goal_lower for k in ["marketing", "campaign", "ad copy", "launch", "brand", "social media", "promotion"]):
            return self._build_marketing_workflow(req.goal)
        elif any(k in goal_lower for k in ["video", "youtube", "script", "reel", "tiktok"]):
            return self._build_video_workflow(req.goal)
        elif any(k in goal_lower for k in ["data analysis", "dataset", "eda", "analytics report", "bi dashboard"]):
            return self._build_data_workflow(req.goal)
        else:
            return self._build_dynamic_workflow(req.goal, req.custom_context)

    # ──────────────────────────────────────────────────────────────────────────
    # Archetype 1: PPT & Presentation
    # ──────────────────────────────────────────────────────────────────────────
    def _build_ppt_workflow(self, goal: str) -> WorkflowPlanResponse:
        steps = [
            WorkflowStep(
                step_number=1,
                step_title="Topic Research & Fact Gathering",
                step_category="research",
                best_ai="Perplexity AI",
                best_ai_icon="🔍",
                reason="Perplexity accesses live web data and academic sources with citations, ensuring slide facts and statistics are 100% current and verified.",
                estimated_time="10–15 mins",
                estimated_cost="₹0 (Free Search)",
                alternative_ai="Google Gemini 1.5 Pro",
                alternative_reason="Gemini offers huge context retrieval from attached research PDFs at zero cost.",
                recommended_prompt_template=f"Perform in-depth research on '{goal}'. Provide key historical background, recent 2025/2026 data points, 5 core pillars, and 3 case studies with authoritative citations.",
                output_deliverable="1-page verified factsheet with bulleted statistics and references.",
            ),
            WorkflowStep(
                step_number=2,
                step_title="Presentation Outline & Content Drafting",
                step_category="writing",
                best_ai="ChatGPT (GPT-4o)",
                best_ai_icon="🤖",
                reason="ChatGPT excels at structured logical hierarchies, slide-by-slide narrative pacing, and speaker notes generation.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free / Plus)",
                alternative_ai="Claude 3.5 Sonnet",
                alternative_reason="Claude offers concise, punchy bullet phrasing with zero corporate fluff.",
                recommended_prompt_template=f"Using the verified facts, draft a comprehensive 10-slide presentation structure for '{goal}'. For each slide, write: (1) Slide Title, (2) 3 punchy bullet points, (3) Visual cue suggestion, and (4) Detailed Speaker Notes.",
                output_deliverable="Complete 10-slide written storyboard with slide copy and speaker notes.",
            ),
            WorkflowStep(
                step_number=3,
                step_title="Language Polishing & Tone Enhancement",
                step_category="writing",
                best_ai="Claude 3.5 Sonnet",
                best_ai_icon="⚡",
                reason="Claude generates the most refined, persuasive vocabulary and removes repetitive phrasing to make slide headers impactful.",
                estimated_time="5–10 mins",
                estimated_cost="₹0 (Free tier)",
                alternative_ai="ChatGPT Plus",
                alternative_reason="Can quickly adjust tone between academic, executive, or casual.",
                recommended_prompt_template="Review this 10-slide draft. Polish all bullet points into high-impact, action-driven statements. Ensure consistent parallelism and remove passive voice across all slide titles.",
                output_deliverable="Refined, executive-ready presentation copy.",
            ),
            WorkflowStep(
                step_number=4,
                step_title="Automated Slide Generation & Layout Design",
                step_category="presentation",
                best_ai="Gamma AI",
                best_ai_icon="🎨",
                reason="Gamma transforms raw Markdown or text into polished, responsive slide decks with modern typography and automatic visual cards.",
                estimated_time="10–15 mins",
                estimated_cost="₹0 (Free Credits)",
                alternative_ai="Canva Magic Design",
                alternative_reason="Canva has thousands of ready-made presentation templates for quick exporting.",
                recommended_prompt_template="Paste your polished Markdown outline directly into Gamma AI's 'Generate Deck' prompt and select the 'Modern Dark Tech' or 'Minimal Corporate' theme.",
                output_deliverable="Interactive, editable web & PDF slide deck with responsive layouts.",
            ),
            WorkflowStep(
                step_number=5,
                step_title="Custom Slide Visuals & Infographic Assets",
                step_category="design",
                best_ai="ChatGPT Image Generator (DALL-E 3)",
                best_ai_icon="🖼️",
                reason="Directly creates clean, consistent 16:9 minimalist diagram concepts and artistic illustrations matching slide themes.",
                estimated_time="10–15 mins",
                estimated_cost="₹0 (Included in Plus)",
                alternative_ai="Midjourney V6 / Recraft.ai",
                alternative_reason="Recraft generates native SVG vector icons and crisp diagram graphics.",
                recommended_prompt_template="A clean, minimalist 3D isometric illustration representing the core topic of the presentation on a dark background, corporate glassmorphism style, 16:9 aspect ratio.",
                output_deliverable="2–3 custom high-resolution banner images for hero slides.",
            ),
            WorkflowStep(
                step_number=6,
                step_title="Final Fact-Check & Flow Audit",
                step_category="review",
                best_ai="Google Gemini 1.5 Pro",
                best_ai_icon="✨",
                reason="Gemini cross-references full slide text against its massive 2M token multimodal knowledge base to detect hallucinations or inconsistencies.",
                estimated_time="5 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="DeepSeek-R1",
                alternative_reason="DeepSeek's chain-of-thought logic reveals structural flaws and missing counterarguments.",
                recommended_prompt_template="Perform a rigorous critique of this final slide presentation. Identify any factual leaps, confusing slide transitions, or unsupported claims, and suggest 3 potential Q&A questions the audience might ask.",
                output_deliverable="Final QA audit report with predicted audience Q&A cheat sheet.",
            ),
        ]

        return WorkflowPlanResponse(
            goal=goal,
            category="presentation",
            summary=f"Optimized 6-step AI pipeline to research, write, design, and finalize '{goal}' with zero design friction.",
            total_estimated_time="50–75 mins",
            total_estimated_cost="₹0 (100% Free Tiers / Standard Tools)",
            total_steps_count=len(steps),
            steps=steps,
            workflow_tips=[
                "Export Gamma slides to PPTX or PDF if presenting offline.",
                "Keep slide text under 25 words per slide and rely on speaker notes for spoken commentary.",
                "Use the Gemini-generated Q&A cheat sheet to rehearse difficult audience questions.",
            ],
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Archetype 2: Build a Website / Web App
    # ──────────────────────────────────────────────────────────────────────────
    def _build_website_workflow(self, goal: str) -> WorkflowPlanResponse:
        steps = [
            WorkflowStep(
                step_number=1,
                step_title="System Architecture & Tech Stack Selection",
                step_category="coding",
                best_ai="Claude 3.5 Sonnet",
                best_ai_icon="⚡",
                reason="Ranked #1 for software architecture and clean folder organization. Outlines modular schemas without over-engineering.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free / Pro)",
                alternative_ai="DeepSeek-R1",
                alternative_reason="DeepSeek offers deep reasoning on database schema normalization and performance trade-offs.",
                recommended_prompt_template=f"Architect a modern web application for '{goal}'. Detail: (1) Recommended tech stack (e.g. React/Vite/Tailwind + FastAPI/PostgreSQL), (2) Database ERD schema, (3) RESTful API route list, and (4) Component hierarchy.",
                output_deliverable="Technical Architecture Document (TAD) with entity models and route specs.",
            ),
            WorkflowStep(
                step_number=2,
                step_title="UI/UX Wireframes & Component Prototyping",
                step_category="design",
                best_ai="v0 by Vercel",
                best_ai_icon="🎨",
                reason="v0 generates responsive, ready-to-use React + Tailwind CSS code instantly from natural language design prompts.",
                estimated_time="20–30 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="Claude Artifacts",
                alternative_reason="Allows live interactive React sandbox testing inside the chat window.",
                recommended_prompt_template=f"Design a modern, responsive web application interface for '{goal}'. Use dark mode, glassmorphism cards, violet/cyan gradient accents, responsive sidebar navigation, and clean metric widgets.",
                output_deliverable="Production-ready Tailwind JSX components for Landing, Dashboard, and Data Views.",
            ),
            WorkflowStep(
                step_number=3,
                step_title="Frontend State Management & API Integration",
                step_category="coding",
                best_ai="Claude 3.5 Sonnet / Cursor",
                best_ai_icon="💻",
                reason="Best-in-class TypeScript generation with accurate hook implementations (Zustand/React Query/Axios).",
                estimated_time="45–60 mins",
                estimated_cost="₹0 (Free / Pro)",
                alternative_ai="ChatGPT (GPT-4o)",
                alternative_reason="Provides fast boilerplate generation for CRUD forms and state reducers.",
                recommended_prompt_template="Write fully typed TypeScript services and custom React hooks to connect frontend components to backend endpoints with loading states, error boundaries, and optimistic UI updates.",
                output_deliverable="Complete frontend client services and interactive pages.",
            ),
            WorkflowStep(
                step_number=4,
                step_title="Backend API & Database CRUD Implementation",
                step_category="coding",
                best_ai="ChatGPT (GPT-4o)",
                best_ai_icon="🤖",
                reason="Excels at boilerplate REST API endpoints, JWT auth middleware, SQLAlchemy ORM models, and Pydantic validation.",
                estimated_time="30–45 mins",
                estimated_cost="₹0 (Free / Plus)",
                alternative_ai="Claude 3.5 Sonnet",
                alternative_reason="Claude ensures strict typing and async performance.",
                recommended_prompt_template="Write the complete FastAPI backend routes, SQLAlchemy models, Pydantic schemas, and JWT authentication dependencies for the required data entities.",
                output_deliverable="Fully functional backend API with Swagger docs tested.",
            ),
            WorkflowStep(
                step_number=5,
                step_title="Security Audit, Unit Tests & Bug Fixes",
                step_category="review",
                best_ai="DeepSeek-R1",
                best_ai_icon="🧠",
                reason="DeepSeek's chain-of-thought engine excels at finding subtle race conditions, SQL injection risks, and edge-case boundary errors.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Open Weights / Free)",
                alternative_ai="Claude 3.5 Sonnet",
                alternative_reason="Claude writes comprehensive Pytest and Vitest suites.",
                recommended_prompt_template="Audit this backend and frontend code for security vulnerabilities (CORS, JWT leakage, rate limiting) and write automated test cases for edge cases.",
                output_deliverable="Test suite and security hardening checklist.",
            ),
            WorkflowStep(
                step_number=6,
                step_title="Deployment, SEO & Production Optimization",
                step_category="review",
                best_ai="Google Gemini 1.5 Flash",
                best_ai_icon="🚀",
                reason="Generates Dockerfiles, Vercel/Render deployment configs, and meta tag optimizations in seconds at high speed.",
                estimated_time="10–15 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="ChatGPT Plus",
                alternative_reason="Quick troubleshooting for CI/CD pipeline and environment variables.",
                recommended_prompt_template="Provide a production Dockerfile, Docker Compose script, Vercel deployment configuration, and OpenGraph/SEO meta tags for the project.",
                output_deliverable="Deployment-ready configuration and live staging setup.",
            ),
        ]

        return WorkflowPlanResponse(
            goal=goal,
            category="coding",
            summary=f"End-to-end full-stack web engineering workflow to build, style, integrate, and deploy '{goal}'.",
            total_estimated_time="2.5–3.5 hours",
            total_estimated_cost="₹0 (Standard Free Tiers & Open Source)",
            total_steps_count=len(steps),
            steps=steps,
            workflow_tips=[
                "Use v0 or Claude Artifacts for UI prototyping before writing backend routes.",
                "Run DeepSeek-R1 on authentication and payment handlers to catch logic edge cases.",
                "Set up environment variables (.env) securely before deploying.",
            ],
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Archetype 3: Write Research Paper
    # ──────────────────────────────────────────────────────────────────────────
    def _build_research_paper_workflow(self, goal: str) -> WorkflowPlanResponse:
        steps = [
            WorkflowStep(
                step_number=1,
                step_title="Literature Review & Citation Sourcing",
                step_category="research",
                best_ai="Perplexity Pro / Consensus AI",
                best_ai_icon="📚",
                reason="Queries scientific repositories (Semantic Scholar, PubMed, ArXiv) and pulls real DOI links and paper abstracts.",
                estimated_time="30–40 mins",
                estimated_cost="₹0 (Free / Pro)",
                alternative_ai="Google Gemini 1.5 Pro",
                alternative_reason="Gemini ingests 50+ research PDFs simultaneously for comparative synthesis.",
                recommended_prompt_template=f"Search academic literature on '{goal}'. Provide 10 seminal peer-reviewed papers published between 2021–2026, summarizing their methodologies, limitations, and empirical findings with DOI references.",
                output_deliverable="Annotated bibliography and literature review synthesis matrix.",
            ),
            WorkflowStep(
                step_number=2,
                step_title="Paper Structure, Abstract & Thesis Framing",
                step_category="writing",
                best_ai="Claude 3.5 Sonnet",
                best_ai_icon="⚡",
                reason="Unmatched capability in academic prose, framing novel research questions, and creating rigorous IMRaD section outlines.",
                estimated_time="20–30 mins",
                estimated_cost="₹0 (Free / Pro)",
                alternative_ai="ChatGPT (GPT-4o)",
                alternative_reason="Fast generation of standard journal formatting and submission checklists.",
                recommended_prompt_template=f"Draft a formal academic abstract (250 words), problem statement, novelty contribution bullets, and a detailed section outline (IMRaD format) for a paper titled '{goal}'.",
                output_deliverable="Formal Abstract and Section-by-Section blueprint.",
            ),
            WorkflowStep(
                step_number=3,
                step_title="Methodology, Math & Experimental Rigor",
                step_category="research",
                best_ai="DeepSeek-R1",
                best_ai_icon="🧠",
                reason="Deep reasoning model with superior mathematical derivations, algorithmic pseudocode, and experimental methodology verification.",
                estimated_time="45–60 mins",
                estimated_cost="₹0 (Open Weights)",
                alternative_ai="ChatGPT Plus (o1 / o3-mini)",
                alternative_reason="Excellent multi-step mathematical equation drafting in LaTeX.",
                recommended_prompt_template="Formulate the mathematical model, formal definitions, and algorithmic pseudocode for the methodology section of this research paper. Ensure rigorous notation and define all variables.",
                output_deliverable="Complete Methodology section with LaTeX equations and pseudocode.",
            ),
            WorkflowStep(
                step_number=4,
                step_title="Data Synthesis, Results & Discussion Drafting",
                step_category="data",
                best_ai="ChatGPT Advanced Data Analysis",
                best_ai_icon="📊",
                reason="Executes Python code in a secure sandbox to generate statistical plots, regression tables, and p-value validation charts.",
                estimated_time="30–45 mins",
                estimated_cost="₹0 (Plus / Free)",
                alternative_ai="Claude 3.5 Sonnet",
                alternative_reason="Synthesizes raw numbers into clear, analytical prose describing experimental results.",
                recommended_prompt_template="Analyze this experimental dataset, generate publication-quality Seaborn charts (300 DPI), and draft the Results & Discussion section highlighting key benchmark improvements.",
                output_deliverable="Results section with high-res figures and statistical comparison tables.",
            ),
            WorkflowStep(
                step_number=5,
                step_title="Academic Polishing & LaTeX Compilation",
                step_category="writing",
                best_ai="Claude 3.5 Sonnet",
                best_ai_icon="📄",
                reason="Formats entire manuscript into IEEE / ACM / APA LaTeX source code with spotless BibTeX citations.",
                estimated_time="20–30 mins",
                estimated_cost="₹0 (Free / Pro)",
                alternative_ai="Overleaf AI",
                alternative_reason="Direct in-browser LaTeX compilation and real-time syntax checking.",
                recommended_prompt_template="Convert this manuscript into standard IEEE two-column LaTeX code, including the BibTeX bibliography file and properly referenced tables/figures.",
                output_deliverable="Compilable .tex document and .bib reference file.",
            ),
            WorkflowStep(
                step_number=6,
                step_title="Peer-Review Simulation & Hallucination Audit",
                step_category="review",
                best_ai="Google Gemini 1.5 Pro",
                best_ai_icon="✨",
                reason="Acts as a harsh peer reviewer (Reviewer 2) to identify weak claims, missing baseline comparisons, and formatting flaws.",
                estimated_time="15 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="DeepSeek-R1",
                alternative_reason="DeepSeek systematically stresses experimental assumptions and proofs.",
                recommended_prompt_template="Critique this full research paper manuscript as a top-tier journal referee. Highlight: (1) Weak baseline comparisons, (2) Unsubstantiated claims, (3) Methodological flaws, and (4) Suggestions for rebuttal.",
                output_deliverable="Referee report with pre-emptive rebuttal revisions.",
            ),
        ]

        return WorkflowPlanResponse(
            goal=goal,
            category="research",
            summary=f"Rigorous 6-step academic pipeline to research, mathematically model, write, and peer-review '{goal}'.",
            total_estimated_time="3–4 hours",
            total_estimated_cost="₹0 (Free Tier AI Models)",
            total_steps_count=len(steps),
            steps=steps,
            workflow_tips=[
                "Always verify citation DOIs via Perplexity or Google Scholar before submission.",
                "Use DeepSeek-R1 for complex proofs and algorithmic complexity analysis.",
                "Compile directly in Overleaf to ensure no LaTeX package conflicts.",
            ],
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Archetype 4: Create Resume / CV
    # ──────────────────────────────────────────────────────────────────────────
    def _build_resume_workflow(self, goal: str) -> WorkflowPlanResponse:
        steps = [
            WorkflowStep(
                step_number=1,
                step_title="Career History & Skill Extraction",
                step_category="writing",
                best_ai="ChatGPT (GPT-4o)",
                best_ai_icon="🤖",
                reason="Quickly parses unorganized work history, project links, and raw notes into categorized core competencies and technical skills.",
                estimated_time="10–15 mins",
                estimated_cost="₹0 (Free / Plus)",
                alternative_ai="Claude 3.5 Sonnet",
                alternative_reason="Generates clean bullet hierarchies from scratch.",
                recommended_prompt_template="Here is my raw work history, projects, and tech stack. Extract a structured breakdown: (1) Top 8 core competencies, (2) Categorized technical skills, and (3) Chronological roles with raw achievements.",
                output_deliverable="Structured career inventory document.",
            ),
            WorkflowStep(
                step_number=2,
                step_title="High-Impact Bullet Points & XYZ Metric Formula",
                step_category="writing",
                best_ai="Claude 3.5 Sonnet",
                best_ai_icon="⚡",
                reason="Specializes in Google-style 'Accomplished [X] as measured by [Y] by doing [Z]' bullet points with strong active verbs.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free tier)",
                alternative_ai="ChatGPT Plus",
                alternative_reason="Offers quick variations for diverse job seniority levels.",
                recommended_prompt_template=f"Transform each role's bullet points for '{goal}' using the Google XYZ formula: 'Accomplished [X], measured by [Y], by doing [Z]'. Incorporate quantifiable metrics, high-impact verbs, and remove all generic clichés.",
                output_deliverable="15–20 high-impact, quantifiable resume bullets.",
            ),
            WorkflowStep(
                step_number=3,
                step_title="Target Job ATS Keyword Optimization",
                step_category="research",
                best_ai="Perplexity AI",
                best_ai_icon="🔍",
                reason="Scans current live job listings for target roles to identify high-frequency Applicant Tracking System (ATS) keywords and certifications.",
                estimated_time="10–15 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="Google Gemini 1.5 Flash",
                alternative_reason="Compares your resume text against 5 pasted job descriptions simultaneously.",
                recommended_prompt_template=f"Identify the top 20 essential ATS keywords, libraries, tools, and methodologies demanded in 2025/2026 for '{goal}'. Map which keywords are present in my resume and suggest natural additions.",
                output_deliverable="ATS keyword gap analysis and updated resume copy.",
            ),
            WorkflowStep(
                step_number=4,
                step_title="Single-Page Layout & Formatting",
                step_category="design",
                best_ai="Canva Magic Resume / Overleaf LaTeX",
                best_ai_icon="📄",
                reason="Provides ATS-parseable single-column designs with clean typography, clear section hierarchy, and zero parsing errors.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free Template)",
                alternative_ai="Reactive Resume (Open Source)",
                alternative_reason="Free JSON-based resume generator that exports clean PDFs.",
                recommended_prompt_template="Select a clean single-column ATS template. Paste your polished sections ensuring uniform margins (0.5–0.75 in), standard fonts (Inter / Roboto / Calibri), and consistent date formatting.",
                output_deliverable="1-page polished PDF and editable source file.",
            ),
            WorkflowStep(
                step_number=5,
                step_title="ATS Parser Simulation & Final Proofread",
                step_category="review",
                best_ai="DeepSeek-R1",
                best_ai_icon="🧠",
                reason="Simulates enterprise ATS parsing algorithms to verify readability, check for typos, and evaluate recruiter first-impression score.",
                estimated_time="5–10 mins",
                estimated_cost="₹0 (Free)",
                alternative_ai="ChatGPT (GPT-4o)",
                alternative_reason="Generates a tailored matching cover letter in under 60 seconds.",
                recommended_prompt_template="Grade this resume out of 100 as a Senior Technical Recruiter. Flag any formatting hazards, ambiguous acronyms, or weak impact points, and provide an ATS match score.",
                output_deliverable="Final ATS Score Card (>90/100) and Tailored Cover Letter.",
            ),
        ]

        return WorkflowPlanResponse(
            goal=goal,
            category="career",
            summary=f"Complete 5-step ATS-optimized pipeline to draft, quantify, format, and audit '{goal}'.",
            total_estimated_time="55–80 mins",
            total_estimated_cost="₹0 (100% Free AI Tools)",
            total_steps_count=len(steps),
            steps=steps,
            workflow_tips=[
                "Keep resume strictly to 1 page unless you have 8+ years of relevant experience.",
                "Stick to single-column layouts for maximum compatibility with Workday and Greenhouse ATS.",
                "Always export as PDF with selectable text, not rasterized images.",
            ],
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Archetype 5: Develop Mobile App
    # ──────────────────────────────────────────────────────────────────────────
    def _build_mobile_app_workflow(self, goal: str) -> WorkflowPlanResponse:
        steps = [
            WorkflowStep(
                step_number=1,
                step_title="Product Requirements & User Journey Mapping",
                step_category="writing",
                best_ai="ChatGPT (GPT-4o)",
                best_ai_icon="📱",
                reason="Drafts comprehensive Product Requirements Documents (PRD), user personas, and feature epics.",
                estimated_time="20–30 mins",
                estimated_cost="₹0 (Free / Plus)",
                alternative_ai="Claude 3.5 Sonnet",
                alternative_reason="Deeply structured user flow specifications with boundary edge cases.",
                recommended_prompt_template=f"Write a comprehensive PRD for '{goal}'. Outline: (1) Core MVP features vs Phase 2, (2) User onboarding journey, (3) Data models, and (4) Third-party SDK requirements.",
                output_deliverable="Comprehensive Mobile App PRD & User Flow Map.",
            ),
            WorkflowStep(
                step_number=2,
                step_title="Mobile UI/UX Screen Design & Wireframing",
                step_category="design",
                best_ai="Figma AI / v0 Mobile",
                best_ai_icon="🎨",
                reason="Generates mobile-optimized screen layouts, bottom navigation bars, and touch-friendly component cards.",
                estimated_time="30–45 mins",
                estimated_cost="₹0 (Free Starter)",
                alternative_ai="Claude Artifacts",
                alternative_reason="Simulates interactive mobile phone viewport in real-time.",
                recommended_prompt_template="Design 5 key mobile screens: (1) Auth/Splash, (2) Home Feed, (3) Detail View, (4) Action Modal, (5) User Profile. Use iOS Human Interface / Material 3 guidelines.",
                output_deliverable="Figma prototype and visual screen design tokens.",
            ),
            WorkflowStep(
                step_number=3,
                step_title="Cross-Platform Frontend Code (Flutter / React Native)",
                step_category="coding",
                best_ai="Claude 3.5 Sonnet",
                best_ai_icon="⚡",
                reason="The undisputed leader in generating clean, modular Flutter (Dart) or React Native (Expo/TypeScript) screen code with smooth animations.",
                estimated_time="60–90 mins",
                estimated_cost="₹0 (Free / Pro)",
                alternative_ai="Cursor / ChatGPT Plus",
                alternative_reason="Fast iterative autocomplete inside VS Code.",
                recommended_prompt_template="Generate fully typed React Native (Expo) screens with Zustand state management, NativeWind styling, and smooth gesture transitions for the screens.",
                output_deliverable="Complete mobile codebase screens and navigation container.",
            ),
            WorkflowStep(
                step_number=4,
                step_title="Backend Cloud & Database Setup (Supabase / Firebase)",
                step_category="coding",
                best_ai="ChatGPT (GPT-4o)",
                best_ai_icon="🤖",
                reason="Generates PostgreSQL schemas, Row Level Security (RLS) policies, and serverless authentication handlers.",
                estimated_time="30–45 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="Claude 3.5 Sonnet",
                alternative_reason="Ensures bulletproof SQL security policies.",
                recommended_prompt_template="Write Supabase PostgreSQL schema, RLS policies, storage buckets, and TypeScript client initialization for the mobile app.",
                output_deliverable="Deployed cloud database with secure client SDK integration.",
            ),
            WorkflowStep(
                step_number=5,
                step_title="App Store Assets, Privacy Policy & Submission Prep",
                step_category="review",
                best_ai="Google Gemini 1.5 Pro",
                best_ai_icon="🚀",
                reason="Writes compliant Apple App Store & Google Play listings, keyword metadata, and standard GDPR/CCPA privacy policy copy.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="ChatGPT Plus",
                alternative_reason="Generates screenshot marketing copy and tagline variants.",
                recommended_prompt_template="Generate: (1) App Store title & subtitle, (2) 4000-character description with keywords, (3) Privacy Policy text, and (4) Reviewer test instructions.",
                output_deliverable="App Store submission kit and legally compliant privacy policy.",
            ),
        ]

        return WorkflowPlanResponse(
            goal=goal,
            category="coding",
            summary=f"Complete 5-stage mobile engineering roadmap to design, code, connect, and publish '{goal}'.",
            total_estimated_time="2.5–4 hours",
            total_estimated_cost="₹0 (Free Tiers / Expo Open Source)",
            total_steps_count=len(steps),
            steps=steps,
            workflow_tips=[
                "Use Expo EAS for frictionless cross-platform builds without configuring native Xcode/Android Studio pipelines initially.",
                "Enforce Supabase Row Level Security (RLS) from Day 1 to prevent unauthorized data access.",
            ],
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Archetype 6: Create Marketing Campaign
    # ──────────────────────────────────────────────────────────────────────────
    def _build_marketing_workflow(self, goal: str) -> WorkflowPlanResponse:
        steps = [
            WorkflowStep(
                step_number=1,
                step_title="Audience Segmentation & Competitor Research",
                step_category="research",
                best_ai="Perplexity AI",
                best_ai_icon="🔍",
                reason="Analyzes real-time market trends, competitor ad angles, customer pain points, and social sentiment.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="Google Gemini 1.5 Flash",
                alternative_reason="Fast synthesis of broad consumer trends and regional search queries.",
                recommended_prompt_template=f"Analyze the target market and direct competitors for '{goal}'. Identify 3 distinct buyer personas, their top emotional friction points, and untapped marketing angles.",
                output_deliverable="Audience Persona Deck and Competitor Angle Matrix.",
            ),
            WorkflowStep(
                step_number=2,
                step_title="Core Campaign Concept & Value Proposition",
                step_category="writing",
                best_ai="Claude 3.5 Sonnet",
                best_ai_icon="⚡",
                reason="Excels at creative narrative hooks, memorable campaign taglines, and differentiated product positioning.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="ChatGPT (GPT-4o)",
                alternative_reason="Rapid generation of 20+ viral brainstorming hooks.",
                recommended_prompt_template=f"Develop a high-converting marketing campaign concept for '{goal}'. Include: (1) 3 sticky campaign themes/taglines, (2) Value proposition elevator pitch, (3) Emotional hook, and (4) Primary Call to Action (CTA).",
                output_deliverable="Campaign Creative Brief and Positioning Guide.",
            ),
            WorkflowStep(
                step_number=3,
                step_title="Multi-Channel Copywriting (Ads, Emails, Social)",
                step_category="writing",
                best_ai="ChatGPT (GPT-4o)",
                best_ai_icon="🤖",
                reason="Specialized in direct-response copy: Meta ad copy, Google Search Ads, Twitter/X threads, LinkedIn posts, and 5-part email nurture sequences.",
                estimated_time="25–35 mins",
                estimated_cost="₹0 (Free / Plus)",
                alternative_ai="Claude 3.5 Sonnet",
                alternative_reason="Superior nuanced voice and conversational email tone.",
                recommended_prompt_template="Write a complete copywriting pack for this campaign: (1) 3 Meta Ad variations (Hook, Body, CTA), (2) 5 Google Search headlines/descriptions, (3) 5-day email welcome sequence, (4) 3 viral LinkedIn/X posts.",
                output_deliverable="Ready-to-deploy multi-channel copy repository.",
            ),
            WorkflowStep(
                step_number=4,
                step_title="Visual Ad Creatives & Social Assets",
                step_category="design",
                best_ai="Midjourney V6 / Recraft.ai",
                best_ai_icon="🎨",
                reason="Generates photorealistic product mockups, vibrant banner visuals, and vector illustrations tailored for ad dimensions (1:1, 9:16, 16:9).",
                estimated_time="20–30 mins",
                estimated_cost="₹0 (Free credits / Basic)",
                alternative_ai="ChatGPT Image Generator (DALL-E 3)",
                alternative_reason="Built directly inside ChatGPT for instant text-to-image prompting.",
                recommended_prompt_template="Modern vibrant advertising visual for social media, high aesthetic, clean negative space for typography overlay, commercial studio lighting, 8k resolution.",
                output_deliverable="Suite of 5 visual ad creatives in multiple aspect ratios.",
            ),
            WorkflowStep(
                step_number=5,
                step_title="Campaign Tracking & Analytics Setup",
                step_category="data",
                best_ai="Google Gemini 1.5 Pro",
                best_ai_icon="📈",
                reason="Constructs UTM parameters, Google Analytics 4 event schemas, and Meta Pixel conversion event tracking plans.",
                estimated_time="10–15 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="ChatGPT (GPT-4o)",
                alternative_reason="Generates quick Google Sheets tracking formulas and KPI dashboards.",
                recommended_prompt_template="Generate a UTM tracking convention table, GA4 custom event tracking schema, and a weekly KPI scorecard to measure CAC, ROAS, and Conversion Rate.",
                output_deliverable="UTM tracking sheet and KPI performance dashboard template.",
            ),
        ]

        return WorkflowPlanResponse(
            goal=goal,
            category="marketing",
            summary=f"High-ROI 5-step marketing engine to position, write, design, and track '{goal}'.",
            total_estimated_time="1.5–2 hours",
            total_estimated_cost="₹0 (Free Tier AI Models)",
            total_steps_count=len(steps),
            steps=steps,
            workflow_tips=[
                "A/B test at least 3 distinct hook angles across paid ads in the first 72 hours.",
                "Ensure landing page headline matches ad copy verbatim for highest conversion rate.",
            ],
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Archetype 7: Video Creation
    # ──────────────────────────────────────────────────────────────────────────
    def _build_video_workflow(self, goal: str) -> WorkflowPlanResponse:
        steps = [
            WorkflowStep(
                step_number=1,
                step_title="Topic Research & Viral Hook Ideation",
                step_category="research",
                best_ai="Perplexity AI",
                best_ai_icon="🔍",
                reason="Identifies top trending angles, high-CTR thumbnail concepts, and high-search-volume keywords on YouTube and TikTok.",
                estimated_time="10–15 mins",
                estimated_cost="₹0 (Free)",
                alternative_ai="ChatGPT Plus",
                alternative_reason="Brainstorms 30 catchy titles and thumbnail concepts.",
                recommended_prompt_template=f"Research top trending videos on '{goal}'. Identify what viewers are searching for, top 5 viral title hooks, and 3 visual thumbnail ideas.",
                output_deliverable="Top 5 Video Titles and Thumbnail concepts.",
            ),
            WorkflowStep(
                step_number=2,
                step_title="Engaging Video Script & Storyboard Writing",
                step_category="writing",
                best_ai="Claude 3.5 Sonnet",
                best_ai_icon="⚡",
                reason="Writes natural, conversational spoken dialogue with visual B-roll cues and high-retention pacing.",
                estimated_time="20–30 mins",
                estimated_cost="₹0 (Free)",
                alternative_ai="ChatGPT (GPT-4o)",
                alternative_reason="Fast generation of short-form TikTok/Reels scripts.",
                recommended_prompt_template="Write a high-retention 8-minute YouTube video script with: (1) 0–30s strong pattern interrupt hook, (2) 3 core content segments, (3) Explicit visual B-roll directions, (4) Mid-video retention re-hook, and (5) Strong CTA.",
                output_deliverable="Complete spoken script with timestamped B-roll cues.",
            ),
            WorkflowStep(
                step_number=3,
                step_title="Voiceover Synthesis & Audio Production",
                step_category="design",
                best_ai="ElevenLabs",
                best_ai_icon="🎙️",
                reason="Industry gold standard for human-like emotion, pacing, and studio-grade voiceover cloning.",
                estimated_time="10–15 mins",
                estimated_cost="₹0 (Free 10k chars)",
                alternative_ai="OpenAI TTS (tts-1-hd)",
                alternative_reason="Ultra low-cost natural voice generation via API.",
                recommended_prompt_template="Upload the polished script into ElevenLabs, select an engaging narrator voice (e.g. Adam / Rachel), and export lossless MP3 audio.",
                output_deliverable="Studio-quality voiceover audio track (.mp3).",
            ),
            WorkflowStep(
                step_number=4,
                step_title="AI B-Roll Generation & Thumbnail Art",
                step_category="design",
                best_ai="Midjourney V6 / Runway Gen-2",
                best_ai_icon="🎨",
                reason="Generates eye-catching high-CTR thumbnail imagery and cinematic B-roll footage clips.",
                estimated_time="20–30 mins",
                estimated_cost="₹0 (Free Credits)",
                alternative_ai="Recraft.ai / ChatGPT Image Generator",
                alternative_reason="Creates crisp, expressive 3D and 2D thumbnail visuals.",
                recommended_prompt_template="A high-contrast YouTube thumbnail background, cinematic lighting, expressive subject, bold clean color palette, 16:9 ratio.",
                output_deliverable="1280x720 High CTR Thumbnail and 5 custom B-roll clips.",
            ),
            WorkflowStep(
                step_number=5,
                step_title="Video Assembly, Captions & SEO Metadata",
                step_category="review",
                best_ai="CapCut AI / Gemini 1.5 Pro",
                best_ai_icon="🎬",
                reason="Auto-generates animated subtitles, removes silences, and drafts search-optimized descriptions with timestamps.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free)",
                alternative_ai="ChatGPT (GPT-4o)",
                alternative_reason="Generates keyword-rich tags and pinned comment copy.",
                recommended_prompt_template="Draft the YouTube video description with chapter timestamps, SEO keywords, affiliate links, and top 20 search tags.",
                output_deliverable="Final edited video with automated captions and YouTube metadata kit.",
            ),
        ]

        return WorkflowPlanResponse(
            goal=goal,
            category="marketing",
            summary=f"Full 5-stage production pipeline to research, script, voice, illustrate, and publish '{goal}'.",
            total_estimated_time="1.5–2 hours",
            total_estimated_cost="₹0 (Free Tier Tools)",
            total_steps_count=len(steps),
            steps=steps,
            workflow_tips=[
                "Spend 50% of your prep time on the first 30 seconds (hook) and thumbnail design.",
                "Use animated kinetic captions in CapCut to increase retention by 35%.",
            ],
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Archetype 8: Data Analysis
    # ──────────────────────────────────────────────────────────────────────────
    def _build_data_workflow(self, goal: str) -> WorkflowPlanResponse:
        steps = [
            WorkflowStep(
                step_number=1,
                step_title="Data Ingestion, Cleaning & Schema Inspection",
                step_category="data",
                best_ai="ChatGPT Advanced Data Analysis",
                best_ai_icon="📊",
                reason="Automatically parses CSV/Excel/JSON files in Python sandbox, imputes missing values, and profiles column distributions.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Plus / Free)",
                alternative_ai="Claude 3.5 Sonnet",
                alternative_reason="Writes robust Pandas and Polars data cleaning scripts.",
                recommended_prompt_template=f"Inspect this dataset for '{goal}'. Identify missing values, detect outliers, check column datatypes, and generate a data quality report.",
                output_deliverable="Cleaned DataFrame and Data Quality Summary.",
            ),
            WorkflowStep(
                step_number=2,
                step_title="Exploratory Data Analysis & Statistical Hypotheses",
                step_category="research",
                best_ai="DeepSeek-R1",
                best_ai_icon="🧠",
                reason="Provides rigorous mathematical reasoning, correlation hypotheses, and statistical test recommendations (ANOVA, Chi-Square, t-tests).",
                estimated_time="20–30 mins",
                estimated_cost="₹0 (Free)",
                alternative_ai="ChatGPT (GPT-4o)",
                alternative_reason="Runs instantaneous correlation heatmaps in Python.",
                recommended_prompt_template="Formulate 5 statistical hypotheses regarding the primary target variable and outline the exact statistical tests needed to validate them.",
                output_deliverable="Hypothesis testing framework and statistical findings.",
            ),
            WorkflowStep(
                step_number=3,
                step_title="Data Visualizations & Interactive Dashboarding",
                step_category="design",
                best_ai="ChatGPT / Claude 3.5 Sonnet",
                best_ai_icon="📈",
                reason="Generates publication-ready Seaborn/Plotly interactive charts or React Recharts dashboard code.",
                estimated_time="25–35 mins",
                estimated_cost="₹0 (Free / Plus)",
                alternative_ai="v0.dev",
                alternative_reason="Generates complete React analytics dashboard UI components.",
                recommended_prompt_template="Generate 4 high-impact Plotly/Seaborn visualizations: (1) Trend over time, (2) Distribution by segment, (3) Correlation scatter plot, (4) Metric breakdown bar chart.",
                output_deliverable="Suite of 4 interactive visualization charts.",
            ),
            WorkflowStep(
                step_number=4,
                step_title="Executive Insights & Actionable Business Summary",
                step_category="writing",
                best_ai="Claude 3.5 Sonnet",
                best_ai_icon="⚡",
                reason="Translates complex statistical metrics into clear, non-technical business recommendations for leadership.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free)",
                alternative_ai="Google Gemini 1.5 Pro",
                alternative_reason="Synthesizes long data tables into concise executive bullet briefings.",
                recommended_prompt_template="Summarize the quantitative findings into a 1-page Executive Briefing: (1) Key Drivers, (2) Risk Factors, (3) Revenue Opportunities, and (4) 3 Action Items for Leadership.",
                output_deliverable="1-Page Executive Analytics Briefing and Action Plan.",
            ),
        ]

        return WorkflowPlanResponse(
            goal=goal,
            category="data",
            summary=f"End-to-end 4-step data science pipeline to clean, analyze, visualize, and present '{goal}'.",
            total_estimated_time="1.5–2 hours",
            total_estimated_cost="₹0 (Standard Free Tiers)",
            total_steps_count=len(steps),
            steps=steps,
            workflow_tips=[
                "Never share sensitive PII (Personally Identifiable Information) in raw prompts.",
                "Focus executive slides on business impact and actionable takeaways, not raw math.",
            ],
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Dynamic Heuristic Workflow for Arbitrary Custom Goals
    # ──────────────────────────────────────────────────────────────────────────
    def _build_dynamic_workflow(self, goal: str, context: Optional[str] = None) -> WorkflowPlanResponse:
        steps = [
            WorkflowStep(
                step_number=1,
                step_title="Discovery & Comprehensive Research",
                step_category="research",
                best_ai="Perplexity AI",
                best_ai_icon="🔍",
                reason="Perplexity gathers real-time, verified web information and state-of-the-art industry practices to build a strong factual foundation.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free Web Search)",
                alternative_ai="Google Gemini 1.5 Flash",
                alternative_reason="Blazing fast search queries and massive context window for long reference documents.",
                recommended_prompt_template=f"Conduct thorough research on '{goal}'. Outline: (1) Core objectives and standards, (2) Top 5 best practices in 2026, (3) Common pitfalls to avoid, and (4) Necessary resources or inputs.",
                output_deliverable="1-page research dossier with key benchmarks and references.",
            ),
            WorkflowStep(
                step_number=2,
                step_title="Strategy Formulation & Structural Outline",
                step_category="writing",
                best_ai="Claude 3.5 Sonnet",
                best_ai_icon="⚡",
                reason="Claude excels at clear, structured, and modular strategic planning without generic filler or redundancy.",
                estimated_time="20–30 mins",
                estimated_cost="₹0 (Free Tier)",
                alternative_ai="ChatGPT (GPT-4o)",
                alternative_reason="Fast brainstorming of diverse angles and alternatives.",
                recommended_prompt_template=f"Using the research dossier, develop a comprehensive, step-by-step master plan for '{goal}'. Detail milestones, dependencies, and deliverables for each phase.",
                output_deliverable="Complete Execution Blueprint with milestones and checklist items.",
            ),
            WorkflowStep(
                step_number=3,
                step_title="Core Content & Deliverable Generation",
                step_category="writing",
                best_ai="ChatGPT (GPT-4o)",
                best_ai_icon="🤖",
                reason="ChatGPT's versatility handles bulk drafting, technical formatting, code generation, and multi-format content creation seamlessly.",
                estimated_time="30–45 mins",
                estimated_cost="₹0 (Free / Plus)",
                alternative_ai="Claude 3.5 Sonnet",
                alternative_reason="Superior precision when drafting technical or creative prose.",
                recommended_prompt_template=f"Draft the primary content and core assets for '{goal}'. Ensure high detail, actionable instructions, and complete coverage of all blueprint requirements.",
                output_deliverable="Primary draft deliverable ready for refinement.",
            ),
            WorkflowStep(
                step_number=4,
                step_title="Visual Asset Creation & Formatting",
                step_category="design",
                best_ai="ChatGPT Image Generator / Canva AI",
                best_ai_icon="🎨",
                reason="Generates supporting illustrations, infographics, diagrams, or UI layouts to enhance visual presentation.",
                estimated_time="15–20 mins",
                estimated_cost="₹0 (Free / Included)",
                alternative_ai="Midjourney V6 / Recraft",
                alternative_reason="Industry benchmark for artistic visuals and vector iconography.",
                recommended_prompt_template="Create clean, modern supporting visual graphics and diagrams that illustrate the main concepts of this project in a professional style.",
                output_deliverable="High-resolution supporting images, diagrams, or visual deck.",
            ),
            WorkflowStep(
                step_number=5,
                step_title="Deep Logic Audit & Quality Assurance",
                step_category="review",
                best_ai="DeepSeek-R1",
                best_ai_icon="🧠",
                reason="DeepSeek's chain-of-thought engine exposes hidden inconsistencies, logical gaps, and edge-case vulnerabilities.",
                estimated_time="10–15 mins",
                estimated_cost="₹0 (Free / Open Weights)",
                alternative_ai="Google Gemini 1.5 Pro",
                alternative_reason="Cross-references the full deliverable against broad domain knowledge.",
                recommended_prompt_template="Critically evaluate this entire project. Identify: (1) Any logical inconsistencies, (2) Missing edge cases, (3) Weak points, and (4) 3 specific optimizations to elevate quality.",
                output_deliverable="QA audit report and final polished deliverable.",
            ),
        ]

        return WorkflowPlanResponse(
            goal=goal,
            category="general",
            summary=f"Custom 5-step AI workflow designed to take '{goal}' from initial concept to a validated, polished outcome.",
            total_estimated_time="1.5–2.5 hours",
            total_estimated_cost="₹0 (Free Tier Tools)",
            total_steps_count=len(steps),
            steps=steps,
            workflow_tips=[
                "Follow steps sequentially to avoid having to re-draft deliverables later.",
                "Copy the provided prompt templates directly into the recommended AI tools for best results.",
                "Check off each step as you complete it to track your real-time progress.",
            ],
        )
