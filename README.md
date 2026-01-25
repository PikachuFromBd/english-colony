# English Colony UOS 🎓

A modern web platform for the English Department at University of Scholars, featuring video contests and community engagement.

[![Telegram](https://img.shields.io/badge/Telegram-Contact-blue?logo=telegram)](https://t.me/listkiss)

## 📖 About

English Colony UOS represents the harmony of the English Department at University of Scholars. Known as the "Colony of Harmony," students are called "Mavericks." This platform enables students to participate in video contests, vote for their favorites, and engage with the community.

## ✨ Features

- 🎥 **Video Contest Platform** - Upload and view promotional videos for events
- 🗳️ **Voting System** - Vote for your favorite videos
- 👤 **User Authentication** - Secure login and signup system
- 📱 **Responsive Design** - Beautiful UI built with Tailwind CSS
- 🎬 **Video Player** - HLS video streaming support with Plyr
- 👨‍💼 **Admin Dashboard** - Manage users, videos, and contests
- 🔔 **Telegram Integration** - Bot notifications and updates

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/PikachuFromBd/english-colony.git
cd english-colony
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Built With

- **[Next.js](https://nextjs.org/)** - React framework for production
- **[React](https://reactjs.org/)** - JavaScript library for building user interfaces
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[JWT](https://jwt.io/)** - Authentication
- **[HLS.js](https://github.com/video-dev/hls.js/)** - Video streaming
- **[Plyr](https://plyr.io/)** - Video player
- **[Telegram Bot API](https://core.telegram.org/bots/api)** - Bot integration

## 📁 Project Structure

```
english-colony/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── adminxd/      # Admin dashboard
│   │   ├── event/        # Event pages
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup page
│   │   ├── video/        # Video pages
│   │   └── profile/      # User profile
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   └── models/          # Database models
├── public/              # Static files
├── db/                  # Database utilities
└── server.js           # Custom server
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 👨‍💻 Developer

**Shahadat Hassan**

[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/listkiss)

## 📄 License

This project is private and maintained by the English Department at University of Scholars.

## 🤝 Contributing

This is a private project for the English Colony UOS community. If you're part of the community and want to contribute, please contact the developer.

---

Made with ❤️ for the Mavericks of English Colony UOS
