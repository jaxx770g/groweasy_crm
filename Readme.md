# GrowEasy CRM & AI-Powered CSV Importer

A production-ready CRM platform featuring a high-performance **Next.js** frontend and a robust **Node.js/Express** backend. The application features an intelligent CSV importer that leverages the **Google Gemini AI API** to automatically parse, map, and validate user data uploads.

The entire ecosystem is containerized using **Docker** and orchestrated with **Docker Compose** for seamless, single-command local development.

---

## 🚀 Features

- **AI-Driven CSV Mapping**: Automatically analyzes raw CSV structures and maps inconsistent column headers to standard CRM data structures using the Google Gemini Pro model.
- **Dockerized Architecture**: Completely isolated environments for frontend and backend services, eliminating the "works on my machine" problem.
- **Next.js Standalone Build**: Configured for rapid production builds, minimizing container sizes and maximizing edge performance.
- **Modern ES Modules Backend**: Clean Node.js structure utilizing native ES Module syntax (`import`/`export`) and experimental VM module configurations for bulletproof Jest testing.

---

## 📁 Repository Structure

```text
groweasy-workspace/
├── client/                  # Next.js Frontend Application
│   ├── app/                 # Application Router
│   ├── Dockerfile           # Next.js Production Docker Configuration
│   └── package.json
├── server/                  # Node.js/Express Backend API
│   ├── index.js             # API Entry Point (Dotenv Configured)
│   ├── Dockerfile           # Node.js Production Docker Configuration
│   └── package.json
├── docker-compose.yml       # Service Orchestration Coordinator
├── .gitignore               # Multi-platform Repository Protection
└── README.md                # Documentation


---

## 🧠 Core Engineering Mechanics (Resilient AI Processing)

Handling large file uploads through LLMs requires optimization to avoid high latency, cost inflation, and API throttling. This project implements two advanced mechanics to guarantee high-performance and fault-tolerant data ingestion:

### 📦 1. AI Batch Parsing & Token Optimization
Sending CSV data line-by-line to an external LLM destroys processing speeds, drains token allocations, and hits API rate limits almost instantly. To mitigate this:
- **Chunked Data Streaming**: The backend breaks incoming parsed CSV records into optimized, context-aware batches (e.g., 50–100 rows per payload depending on token density).
- **Context Preservation**: Each batch includes structural system instructions ensuring Gemini understands the schema mapping rules contextually without needing to re-send global instructions for every single row.
- **Throughput Gains**: This batch processing reducing total round-trip network requests to Google AI Studio by up to 95%, dramatically slicing the frontend loading times.

### 🔄 2. AI Batch Automatic Retry (Fault Tolerance)
AI APIs are prone to transient faults—such as temporary network drops, server timeouts, or `429 Too Many Requests` (Rate Limiting/Resource Exhaustion) flags. 
- **Graceful Error Recovery**: If a specific batch payload fails to communicate with the Gemini API, the application does not crash or throw a terminal error to the user. Instead, an automated retry interceptor intercepts the failure.
- **Resilient Recovery**: The system pauses momentarily and safely retries processing the specific failed batch up to 3 times before declaring a fault. 
- **Partial Success Processing**: If a catastrophic error occurs late in a large document, successfully processed batches remain secure, allowing the system to resume gracefully without forcing the user to waste time or API tokens re-uploading everything from scratch.

## Now the Docker setup guide
-- git clone [https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git)
cd ai-powered CSV impoter 
-- create .env file 
-- docker compose up --build
-- Frontend UI: http://localhost:3000

   Backend API: http://localhost:5000

## Testing 
   The backend includes an automated test suite utilizing Jest with native ES Modules support. To execute the tests locally outside of the container structure:
   cd server
   npm install
   npm test