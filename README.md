# 🛡️ SecureWatch AI
### AI-Powered Web Application Vulnerability Intelligence & Continuous Security Monitoring Platform

SecureWatch AI is an intelligent web application security platform that automates vulnerability scanning, analyzes security findings, and provides actionable remediation recommendations using Artificial Intelligence.

Built using the MERN stack, OWASP ZAP, and Google Gemini API, the platform helps developers identify, understand, prioritize, and monitor web application security vulnerabilities through a centralized dashboard.

---

## 🚀 Key Features

### 1. Automated Vulnerability Scanning
- Integrates OWASP ZAP for automated web application security testing.
- Performs Spider Scans to discover website pages and endpoints.
- Performs Active Scans to identify potential security vulnerabilities.
- Retrieves and stores scan results for further analysis.

### 2. Vulnerability Intelligence Engine (VIE)
- Normalizes vulnerability data from OWASP ZAP.
- Removes duplicate findings.
- Categorizes vulnerabilities based on their security impact.
- Assigns risk scores and severity classifications.
- Generates an overall website security health score.

### 3. AI-Powered Security Analysis
- Integrates Google Gemini API for intelligent vulnerability analysis.
- Generates contextual explanations of security findings.
- Provides potential attack scenarios and business impact insights.
- Suggests remediation steps to help developers address vulnerabilities.

### 4. Continuous Security Monitoring
- Supports scheduled website security scans.
- Provides daily and weekly monitoring options.
- Automatically executes scans based on configured schedules.
- Tracks monitoring history and security changes.
- Generates monitoring events and notifications.

### 5. Security Dashboard
- Centralized dashboard for managing monitored websites.
- Displays vulnerability severity distribution.
- Provides security health scores and trends.
- Shows recent scan activity and monitoring status.

### 6. Authentication & Reporting
- User registration and login.
- JWT-based authentication.
- Protected application routes.
- MongoDB-backed scan and vulnerability history.
- PDF security report generation.

---

## 🏗️ System Architecture

```text
                User
                 |
                 v
        React.js Frontend
                 |
                 v
          Express.js API
                 |
       +---------+---------+
       |                   |
       v                   v
  OWASP ZAP          MongoDB Database
       |
       v
 Vulnerability Findings
       |
       v
 Vulnerability Intelligence Engine
       |
       +----------------------+
       |                      |
       v                      v
  Risk Scoring          Google Gemini API
       |                      |
       v                      v
 Security Health       AI Security Analysis
       |                      |
       +----------+-----------+
                  |
                  v
          Security Dashboard
                  |
                  v
         Reports & Monitoring
```

---

## 🧰 Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Security Scanner | OWASP ZAP |
| Artificial Intelligence | Google Gemini API |
| Authentication | JWT, bcryptjs |
| Scheduled Tasks | node-cron |
| HTTP Client | Axios |
| Reporting | PDFKit |
| Development Tools | VS Code, Git, Postman |

---

## 📂 Project Structure

```text
SecureWatch/
│
├── client/
│   ├── public/
│   └── src/
│       ├── Components/
│       ├── Context/
│       ├── Layouts/
│       ├── Pages/
│       ├── Services/
│       ├── assets/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   │   ├── ai/
│   │   ├── intelligence/
│   │   ├── monitoring/
│   │   ├── report/
│   │   ├── scan/
│   │   └── zap/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure the following are installed:

- Node.js (LTS recommended)
- npm
- MongoDB (local installation or MongoDB Atlas)
- OWASP ZAP
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Sujal-dev5/SecureWatch

cd SecureWatch-Localhost
```

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory using `.env.example` as a reference.

Configure the following environment variables:

```env
PORT=5000

FRONTEND_URL=http://localhost:5173

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

ZAP_URL=http://localhost:8080
ZAP_API_KEY=your_zap_api_key

ZAP_MAX_SCAN_DURATION_MINUTES=15
ZAP_MAX_RULE_DURATION_MINUTES=3

GEMINI_API_KEY=your_gemini_api_key
```

**Environment variable descriptions:**

| Variable | Description |
|---|---|
| PORT | Backend server port |
| FRONTEND_URL | Frontend origin for CORS |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret used for JWT authentication |
| ZAP_URL | OWASP ZAP API endpoint |
| ZAP_API_KEY | OWASP ZAP API authentication key |
| ZAP_MAX_SCAN_DURATION_MINUTES | Maximum configured scan duration |
| ZAP_MAX_RULE_DURATION_MINUTES | Maximum configured scan-rule duration |
| GEMINI_API_KEY | Google Gemini API key |

### 3. OWASP ZAP Setup

1. Install OWASP ZAP on your local machine.
2. Start ZAP and enable its API.
3. Configure the API to listen on `localhost:8080`.
4. Configure an API key.
5. Add the same API URL and key to your backend `.env` file.

Make sure OWASP ZAP is running before starting a vulnerability scan.

### 4. Start the Backend

From the `server` directory:

```bash
npm run dev
```

The backend should be available at:

```text
http://localhost:5000
```

### 5. Frontend Setup

Open another terminal:

```bash
cd client
npm install
```

Create a `.env.local` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the application:

```text
http://localhost:5173
```

---

## 🔄 Application Workflow

1. **User Authentication:** Register or log in to the platform.
2. **Website Registration:** Add the website URL you want to assess.
3. **Vulnerability Scanning:** OWASP ZAP performs Spider and Active Scans.
4. **Finding Collection:** Security alerts are retrieved from the scanner.
5. **Intelligence Processing:** VIE normalizes, deduplicates, categorizes, and scores findings.
6. **AI Analysis:** Google Gemini generates contextual vulnerability explanations and remediation recommendations.
7. **Security Assessment:** The platform calculates and displays website security health information.
8. **Monitoring:** Schedule recurring scans and track changes in website security.
9. **Reporting:** Review scan history and generate PDF security reports.

---

## 🔐 Security Considerations

- Never commit `.env` files or API credentials.
- Use strong JWT secrets.
- Keep dependencies updated.
- Restrict access to the OWASP ZAP API.
- Only scan websites you own or have explicit authorization to test.
- Do not expose local development services directly to the public internet.

---

## 🛠️ Development Status

SecureWatch AI is an academic major project developed to demonstrate the integration of web application security testing, vulnerability intelligence, AI-assisted analysis, and continuous security monitoring.

This repository contains the **localhost development version**, designed to run with a locally accessible OWASP ZAP instance.

---

## 👨‍💻 Project Information

**Project Name:** SecureWatch AI  
**Project Type:** Major Project / Academic Project  
**Domain:** Cybersecurity | Web Application Security | Artificial Intelligence  
**Architecture:** MERN Stack  

---

## 📜 Disclaimer

SecureWatch AI is developed for educational and authorized security testing purposes only.

Users are responsible for obtaining proper authorization before scanning or testing any website or web application.

The platform's AI-generated security explanations and remediation recommendations should be reviewed by qualified developers or security professionals before implementation.

---