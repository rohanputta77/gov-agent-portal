# Orion
1. Team Details
Team Name / ID: Orion
Team Lead: Rohan Putta
Team Members:
Rohan Putta | Agent Whisperer & Full Stack
Repo Link (Optional): N/A
Demo Link (Optional): N/A
---
2. Problem Statement
[Please paste the full problem statement provided by your hackathon organizers here]
---
3. TL;DR
Problem: Bureaucracy is slow, forms are confusing, and missing or expired documents cause months of delays and rejections.
Solution: A multi-agent system that dynamically generates requirements, OCRs your documents, and builds a compliance action plan.
Who benefits: Anyone applying for visas, loans, or government services who wants to avoid rejection and save time.
---
4. Scope of the Project
What are you building?
A Bureaucracy Management Agent using a LangGraph multi-agent architecture. It features a React frontend with a live Agent Activity Trace, and a FastAPI backend where 4 specialized AI agents collaborate to analyze user goals and verify uploaded documents using Gemini Vision.
How does it solve the problem statement?
It acts as a personalized consultant that actually "reads" your documents. Instead of just giving generic advice, it cross-references your specific uploaded PDFs/Images against domain requirements to instantly tell you what is missing or expired.
Key features you're building for this hackathon:
LangGraph multi-agent orchestration (4 distinct specialized agents)
Gemini Vision and PyPDF2 integration for live document OCR and data extraction
Dynamic compliance gap analysis (checking uploaded docs vs required docs)
Real-time Agent Activity Trace UI for visibility into agent handoffs
What are you deliberately NOT doing? (Optional)
N/A: We are not actually submitting the documents to real government portals.
---
5. Why an Agentic Approach?
What does your agent decide or do on its own?
The system routes information through specialized experts. The Document Analyst independently decides how to extract dates/names from images via Vision. The Compliance Checker autonomously reasons about whether an uploaded "ID Proof" actually satisfies the "Passport" requirement.
Why wouldn't a fixed script, if-else rules, or a simple chatbot be enough?
A fixed script cannot "read" an image of a passport to verify its expiry date. A simple chatbot would just give a generic checklist. We need an agentic flow to extract structured data from unstructured user uploads and perform complex gap analysis against dynamic rules.
---
6. Who It's For & What Changes
Who or what is this for?
Citizens and applicants applying for complex, document-heavy bureaucratic processes like visas, mortgages, or government IDs.
The world today, without your solution:
Applicants spend hours researching requirements on confusing portals. They submit their applications and wait weeks for a manual review, only to get rejected because they missed a checkbox or attached a bank statement that was 1 day out of date.
The world with your solution, fully built and scaled to production:
An applicant uploads their vault of documents once. The agent instantly verifies them, flags any expiry issues, auto-fills all required PDF forms, and submits the application via API, guaranteeing a 100% first-time acceptance rate.
What your hackathon build actually delivers today:
We built the core intelligence: the multi-agent compliance engine. Users can chat to state a goal, upload documents, and the agents will dynamically extract the document data, cross-reference it against the goal's requirements, and provide a prioritized action plan.
Before vs. After
What Changes	Today	With Our Current Build	At Production Scale
Time to verify documents	Weeks of waiting for manual review	Instant feedback via AI OCR	Instant for any global domain
Effort to find rules	Hours of googling and reading PDFs	Chatbot provides exact checklist	Agent continuously updates rules
Application Rejection Rate	High (due to human error)	Drastically reduced	Near 0% (auto-validated)
---
7. Architecture & Agents
How is your system put together?
Users chat via a React frontend. The FastAPI backend orchestrates a LangGraph pipeline. The Domain Expert sets rules, the Document Analyst extracts data from the SQLite document vault, the Compliance Checker does gap analysis, and the Action Planner formulates the final reply.
7.1 Agents
Domain Expert: Generates exact document requirements based on the chosen domain. Uses Gemini 3.5 Flash for deep reasoning on regulatory rules. Talks to Document Analyst.
Document Analyst: Extracts holder name and expiry from uploaded PDFs/images. Uses Gemini 3.5 Flash (Vision) for OCR. Talks to Compliance Checker.
Compliance Checker: Cross-references requirements against extracted document data to find gaps. Uses Gemini 3.5 Flash. Talks to Action Planner.
Action Planner: Formulates a conversational response and prioritized next steps. Uses Gemini 3.5 Flash. Talks to Frontend.
7.2 Services, APIs, Databases & Memory
FastAPI Backend: Serves the API and orchestrates the LangGraph agents. Used by the Frontend.
SQLite Database: Stores user documents and vault metadata. Used by the Document Analyst agent.
React Frontend: Provides the chat UI and Agent Activity Trace panel. Used by the user.
How does your system remember things (memory & state)?
The frontend passes chat history in the state. LangGraph maintains the `AgentState` TypedDict during the run. Documents are persistently stored in the SQLite database.
Diagram Link (Optional): N/A
7.3 Example Walkthrough
Example input: "I want to apply for a Schengen visa to France."
[Frontend] Sends message to the LangGraph backend.
[Domain Expert] Generates requirements (Passport, Bank Statement, etc.) and passes state.
[Document Analyst] Reads user's uploaded images/PDFs from the vault using Vision OCR.
[Compliance Checker] Compares Expert requirements vs Analyst extracted data to find gaps.
[Action Planner] Creates a prioritized action plan for the missing documents.
[Frontend] Displays the chat reply and the real-time Agent Activity Trace.
Final output: A conversational response, a readiness score, and a list of missing documents.
Anything special about how your workflow runs? (Optional)
The LangGraph pipeline features a conditional edge: if the user hasn't uploaded any documents yet, the graph intelligently skips the Document Analyst node entirely to save time and API costs, routing straight to the Compliance Checker.
---
8. Tech Stack
Layer	Technology
Frontend / Interface	React, TypeScript, TailwindCSS
Backend	FastAPI, Python
Agent Framework	LangGraph
Database / Storage	SQLite
Hosting	Local machine
Other	Gemini 3.5 Flash (Vision API), PyPDF2
---
9. What to Expect From Our Current Build
Working:
LangGraph multi-agent orchestration
Gemini Vision document extraction (OCR)
Dynamic compliance gap analysis
Agent Trace UI
Partly working, mocked, or hard-coded:
The actual submission of documents to a government portal is mocked.
Not working or not built yet:
Auto-filling government PDF forms.
What we'd most like to be judged on:
The Document Analyst agent using Gemini Vision to actually read uploaded passports, and the Agent Activity UI in the frontend that makes the backend multi-agent orchestration completely visible and transparent.
---
10. Future Scope
Idea 1
Name: Auto-Fill Engine
What it is: A tool that takes the data extracted from the Document Analyst and automatically maps it to the fields of official PDF application forms.
Why it matters: It removes the final manual step of bureaucracy—filling out repetitive forms.
How we'd build it: Using PyMuPDF or a headless browser automation tool to programmatically fill and sign PDFs.
Done when: A user can download a fully completed visa application PDF ready for submission.
Idea 2
Name: Web Researcher Agent
What it is: An agent that dynamically scrapes government websites to find the most up-to-date requirements, instead of relying on its internal knowledge.
Why it matters: Bureaucratic rules change constantly; hardcoded prompts become outdated quickly.
How we'd build it: Integrating a tool like Tavily or a custom scraping agent into the LangGraph pipeline before the Domain Expert.
Done when: The agent successfully answers a query using a rule that was updated on a government site yesterday.
---
11. Additional Notes (Optional)
N/A
