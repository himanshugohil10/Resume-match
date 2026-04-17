# Resume Match: Explainable Resume Ranking System

An AI-powered system that ranks resumes against a job description with full transparency and explainability. It leverages Large Language Models (LLMs) and semantic embeddings to provide a structured match score and detailed reasoning for every candidate.

## 🚀 Features

- **Semantic Matching:** Uses Sentence-BERT (`all-MiniLM-L6-v2`) for deep semantic relevance scoring rather than simple keyword matching.
- **LLM-Powered Extraction:** Automatically extracts structured data (skills, experience, education, tools) from both JD and Resumes using Groq API.
- **Explainability:** Provides detailed textual explanations for ranking decisions, highlighting strengths and missing requirements.
- **Weighted Scoring:** Customizable weightage system for skills, experience, education, and tools.
- **Modern UI:** Responsive and dynamic frontend built with React, Vite, and Framer Motion.

## 🛠️ Technology Stack

### Backend
- **Framework:** FastAPI
- **LLM:** Groq (Llama-3)
- **Embeddings:** Sentence-Transformers (BERT)
- **Parser:** pdfplumber, python-docx
- **Runtime:** Python 3.x

### Frontend
- **Framework:** React 19 (Vite)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Styling:** CSS (Modern Responsive Design)

## 🔧 Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- Groq API Key
- [Ollama](https://ollama.com/) (Optional, used as a local fallback if Groq API fails)
  - You will need to pull the Llama 3.2 model: `ollama run llama3.2`

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
*Note: Create a `.env` file in the `backend` folder and add your `GROQ_API_KEY`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
```

## 🏃 Running the Application

### Start Backend
```bash
cd backend
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### Start Frontend
```bash
cd frontend
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## 📂 Project Structure
```
Resume-match/
├── backend/            # FastAPI server & logic
│   ├── services/       # Core matching & extraction modules
│   └── main.py         # Entry point
├── frontend/           # React application
│   ├── src/            # UI components & state
│   └── index.html      # Entry point
└── README.md           # Global documentation
```
