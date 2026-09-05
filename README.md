# Evalix - Research Paper Analysis Tool

Evalix is a full-stack web application designed to analyze academic research papers, syllabi, and educational documents using **Bloom's Taxonomy**. It extracts action verbs, classifies them across cognitive, affective, and psychomotor domains, provides interactive visual dashboards, generates actionable pedagogical recommendations, and exports detailed Excel reports.

---

## 🌟 Features

- **Document Ingestion**: Supports PDF, DOCX, DOC, and TXT files.
- **NLP Verb Extraction**: Identifies and tallies action verbs using Natural Language Processing (WordPOS & Natural).
- **Taxonomy Classification**: Classifies extracted verbs into Bloom's Taxonomy domains (Cognitive, Affective, Psychomotor) and their sub-levels.
- **Semantic Embeddings**: Uses vector embeddings (with Google Gemini API support and built-in offline fallback) to semantically match verbs to educational objectives.
- **Interactive Visualizations**: Dynamic charts powered by Chart.js displaying domain and level distributions.
- **Pedagogical Recommendations**: Automatic gap analysis and targeted recommendations for curriculum improvement.
- **Report Generation**: Exports individual analysis reports and maintains a cumulative analysis history in Excel (`.xlsx`).

---

## 📁 Repository Structure

```
Eva-main/
├── frontend/                 # React.js client application
│   ├── public/               # Static assets & index.html
│   ├── src/
│   │   ├── components/       # UI dashboards, file upload, reports, charts
│   │   ├── services/         # Axios API service
│   │   ├── styles/           # SCSS stylesheets
│   │   ├── App.js            # Main application router
│   │   └── index.js          # React entry point
│   ├── .env.example          # Sample frontend environment config
│   └── package.json          # Frontend dependencies
│
├── server/                   # Node.js & Express.js backend
│   ├── controllers/          # Request handlers (paper analysis, reports)
│   ├── routes/               # API route definitions
│   ├── utils/                # Text extractors, classifiers, embeddings, excel generator
│   ├── cache/                # Embedding cache
│   ├── uploads/              # Uploaded document storage
│   ├── reports/              # Generated Excel reports
│   ├── .env.example          # Sample backend environment config
│   ├── server.js             # Express server entry point
│   └── package.json          # Backend dependencies
│
├── .gitignore                # Git ignore rules for node_modules, .env, and temp files
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Clone the Repository
```bash
git clone <repository-url>
cd <repository-folder>
```

### 3. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```
   *(Optional)*: Add your `GEMINI_API_KEY` to `.env` if you wish to use Google Gemini embeddings.
4. Start the backend server:
   ```bash
   npm start
   ```
   The backend API will run at `http://localhost:5001`.

### 4. Frontend Setup
1. In a new terminal, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm start
   ```
   The application will open in your browser at `http://localhost:3000`.

---

## 👥 Collaborator Workflow

To manage changes smoothly across your team:

1. **Pull latest changes before starting work**:
   ```bash
   git pull origin main
   ```
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: describe your change"
   ```
4. **Push to GitHub**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** on GitHub for code review.

---

## 📄 License
This project is for educational and research purposes.
