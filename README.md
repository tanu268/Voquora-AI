# 🎓 Voquora AI — Adaptive English Learning System

An AI-powered adaptive English learning platform that personalizes exercises based on each user's weaknesses and performance.

---

## 🚀 Live Demo
> Run locally following the setup instructions below.

---

## ✨ Features

### 👤 User Features
- Register & login with JWT authentication
- Practice English exercises (MCQ, Fill in the blank, Error correction, Sentence rewrite)
- Get instant feedback with explanations
- Track progress with accuracy stats and XP points
- View weakness areas detected by AI
- Get personalized exercise recommendations
- Visual analytics dashboard with charts

### 👑 Admin Features
- Separate admin dashboard
- Add, edit, delete exercises and topics
- View all registered users
- Monitor overall platform statistics
- See common weakness patterns across all users

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router, Recharts, Axios |
| Backend | Django 6, Django REST Framework |
| Authentication | JWT (SimpleJWT) |
| Database | MySQL |
| AI/NLP Engine | Rule-based + spaCy + Transformers (optional) |
| Styling | Custom CSS-in-JS |

---

## 📁 Project Structure
```
Voquora-AI/
├── backend/                  # Django backend
│   ├── adaptive_english_backend/  # Project settings
│   ├── users/                # Auth & user management
│   ├── learning/             # Exercises & topics
│   ├── progress/             # Progress tracking
│   ├── analysis/             # AI/NLP engine
│   └── manage.py
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/            # Login, Register, Dashboard, Practice, AdminDashboard
│   │   ├── components/       # ProgressChart
│   │   ├── context/          # AuthContext
│   │   └── services/         # API calls
└── ai_engine/                # AI engine (future)
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- Git

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/tanu268/Voquora-AI.git
cd Voquora-AI
```

---

### 2️⃣ Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate.bat

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### Create `.env` file in `backend/` folder:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

USE_MYSQL=True
DB_NAME=adaptive_english_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

#### Create MySQL database:
```sql
CREATE DATABASE adaptive_english_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Run migrations:
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

---

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/auth/profile/` | Get user profile |
| POST | `/api/auth/token/refresh/` | Refresh JWT token |

### Learning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/learning/topics/` | List all topics |
| GET | `/api/learning/exercises/` | List exercises |
| POST | `/api/learning/submit/` | Submit answer |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/history/` | Attempt history |
| GET | `/api/progress/summary/` | Progress summary |
| GET | `/api/progress/weaknesses/` | Weakness list |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analysis/analyze/` | Analyze text |
| GET | `/api/analysis/recommendations/` | Get recommendations |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/admin/users/` | List all users |
| GET | `/api/auth/admin/stats/` | Platform statistics |
| GET/POST | `/api/learning/admin/exercises/` | Manage exercises |
| PUT/DELETE | `/api/learning/admin/exercises/<id>/` | Edit/Delete exercise |

---

## 👥 Roles

| Role | Access |
|------|--------|
| Regular User | Dashboard, Practice, Progress, Recommendations |
| Admin (is_staff=True) | Admin Dashboard, User Management, Exercise Management |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Voquora AI Team**
- GitHub: [@tanu268](https://github.com/tanu268)
