# 🚀 GigFlow

> **Connect with talented freelancers and find the perfect gig for your project**

A modern, full-stack freelance marketplace platform that connects clients with skilled freelancers. Built with React, TypeScript, Node.js, and MongoDB. 

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://gigflow-ten-lyart.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-91.3%25-blue)](https://github.com/Neo-Ayush-jha/gigflow)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ✨ Features

### For Clients
- 📋 **Post Gigs** - Create detailed project listings with budgets, deadlines, and required skills
- 👥 **Browse Freelancers** - Find skilled professionals with verified ratings and portfolios
- 💬 **Real-time Communication** - Chat with freelancers using Socket.IO
- 🎯 **Smart Matching** - Get matched with the right freelancers for your project
- 💰 **Secure Payments** - Protected transactions with escrow system

### For Freelancers
- 🔍 **Discover Gigs** - Browse and search available projects by category and skills
- 💼 **Place Bids** - Submit proposals with custom pricing and timelines
- 📊 **Dashboard** - Manage active gigs, track bids, and view earnings
- ⭐ **Build Reputation** - Earn ratings and reviews from completed projects
- 🔔 **Real-time Updates** - Get instant notifications for new opportunities

### Platform Features
- 🔐 **Authentication** - Secure JWT-based login/signup with bcrypt password hashing
- 🎨 **Modern UI** - Beautiful interface built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design** - Fully optimized for desktop, tablet, and mobile
- 🌙 **Dark Mode** - Theme switching support with next-themes
- ⚡ **Fast Performance** - Optimized with React Query for efficient data fetching
- 🔄 **Real-time Sync** - WebSocket integration for live updates

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Socket.IO Client
- **UI Components**:  Radix UI primitives

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.IO
- **Security**:  CORS, cookie-parser

---

## 📁 Project Structure

```
gigflow/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── gigs/      # Gig-related components
│   │   │   ├── layout/    # Layout components (Navbar, Footer)
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── pages/         # Page components
│   │   │   ├── Index.tsx
│   │   │   ├── GigsPage.tsx
│   │   │   ├── GigDetailPage.tsx
│   │   │   ├── PostGigPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── services/      # API services & Socket.IO
│   │   ├── data/          # Mock data & constants
│   │   └── App.tsx        # Main app component
│   └── package.json
│
└── server/                 # Node. js backend
    ├── controllers/       # Route controllers
    │   ├── authController.js
    │   ├── gigController.js
    │   └── bidController.js
    ├── models/            # MongoDB models
    │   ├── User.js
    │   ├── Gig.js
    │   └── Bid.js
    ├── routes/            # API routes
    │   ├── authRoutes.js
    │   ├── gigRoutes.js
    │   └── bidRoutes.js
    ├── middleware/        # Custom middleware
    │   └── authMiddleware.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Neo-Ayush-jha/gigflow. git
   cd gigflow
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

   Start the server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

   Start the development server:
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

---

## 📖 API Endpoints

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
GET    /api/auth/profile     # Get user profile (protected)
PATCH  /api/auth/profile     # Update user profile (protected)
```

### Gigs
```
GET    /api/gigs             # Get all gigs
GET    /api/gigs/:id         # Get single gig
POST   /api/gigs             # Create new gig (protected)
PATCH  /api/gigs/:id         # Update gig (protected)
DELETE /api/gigs/:id         # Delete gig (protected)
```

### Bids
```
POST   /api/bids                      # Place a bid (protected)
GET    /api/bids/gig/:gigId           # Get bids for a gig
GET    /api/bids/freelancer/my-bids   # Get user's bids (protected)
PATCH  /api/bids/: bidId/hire          # Hire a bid (protected)
PATCH  /api/bids/: bidId/reject        # Reject a bid (protected)
DELETE /api/bids/:bidId               # Withdraw a bid (protected)
```

---

## 🎨 Key Features Showcase

### 1.  Gig Management
- Create, edit, and delete gigs
- Add skills, budget ranges, and deadlines
- Categorize projects (Design, Development, Marketing, etc.)

### 2. Bidding System
- Freelancers can place bids on gigs
- Clients can accept or reject bids
- Real-time bid notifications

### 3. User Dashboard
- Track posted gigs and received bids
- Monitor active projects
- View bid history and earnings

### 4. Real-time Features
- Live bid notifications
- Instant gig updates
- Socket.IO powered messaging

---

## 🔒 Security

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**:  Secure token-based auth
- **HTTP-only Cookies**: Protection against XSS attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Zod schema validation on frontend

---

## 🚢 Deployment

The application is deployed and live at:  **[https://gigflow-ten-lyart.vercel.app/](https://gigflow-ten-lyart.vercel.app/)**

### Deploy Your Own

**Frontend (Vercel)**
```bash
cd frontend
npm run build
# Deploy to Vercel
```

**Backend (Railway/Render/Heroku)**
```bash
cd server
# Set environment variables in your hosting platform
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ayush Jha**
- GitHub: [@Neo-Ayush-jha](https://github.com/Neo-Ayush-jha)
- Project: [GigFlow](https://github.com/Neo-Ayush-jha/gigflow)

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Socket.IO](https://socket.io/) for real-time features

---

## 📊 Stats

- **10K+** Active Freelancers
- **50K+** Projects Completed
- **$25M+** Total Earnings

---

<p align="center">Made with ❤️ by Ayush Jha</p>
