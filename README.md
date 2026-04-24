# Dishcovery

**Your AI-Powered Recipe Discovery Companion**

Dishcovery is a web application that helps food lovers discover, create, and organize personalized recipes using AI technology. Whether you're a home cook looking for inspiration or someone wanting to plan meals efficiently, Dishcovery makes your culinary journey delightful and stress-free.

## What Makes Dishcovery Special

- **AI-Generated Recipes**: Powered by Google's Gemini AI to create unique, personalized recipes based on your preferences
- **Modern & Responsive**: Beautiful, user-friendly interface that works seamlessly on all devices
- **Personal Profiles**: Save your favorite recipes and build your personal cookbook
- **Meal Planning**: Organize your weekly meals with smart meal planning features
- **Secure Authentication**: Safe and simple login/signup system
- **Recipe History**: Keep track of all the recipes you've explored

## How It's Built

### Frontend (Client)
- **React 19** - Modern, fast, and reactive user interface
- **Material-UI (MUI)** - Beautiful, customizable components
- **Tailwind CSS** - Utility-first CSS framework for stunning designs
- **React Router** - Smooth navigation between pages
- **Vite** - Lightning-fast development and building

### Backend (Server)
- **Node.js & Express** - Robust and scalable server architecture
- **Google Gemini AI** - Advanced AI for recipe generation
- **Supabase** - Authentication and database services
- **CORS** - Secure cross-origin resource sharing

### Key Features
- **Authentication System**: Secure user signup/login with email confirmation
- **Recipe Generation**: AI-powered recipe creation based on user inputs
- **Personal Dashboard**: Your personalized cooking hub
- **Favorites & History**: Save and revisit your favorite recipes
- **Meal Planning**: Organize your meals efficiently

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key
- Supabase project credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd dishcovery
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ..
   
   # Install server dependencies
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   ```

4. **Start the development servers**
   
   **Terminal 1 - Start the backend server:**
   ```bash
   npm run dev
   ```
   
   **Terminal 2 - Start the frontend:**
   ```bash
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Project Structure

```
dishcovery/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── assets/        # Images and static assets
│   │   ├── api/           # API utility functions
│   │   └── utils/         # Helper functions
│   ├── public/            # Public assets
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend API
│   └── src/
│       ├── controllers/   # Request handlers
│       ├── routes/        # API routes
│       ├── middleware/    # Custom middleware
│       └── models/        # Data models
├── .env                   # Environment variables
├── package.json           # Root dependencies
└── README.md             # This file
```

## Main Features in Detail

### Landing Page
- Elegant hero section with call-to-action
- How-it-works guide for new users
- Sample recipe showcase
- Team information
- Responsive signup/login modals

### Dashboard
- Personal recipe collection
- Quick access to favorites
- Recipe generation interface
- Meal planning tools
- Search and filter options

### AI Recipe Generation
- Natural language recipe requests
- Customizable dietary preferences
- Step-by-step cooking instructions
- Ingredient lists with quantities
- Cooking time and difficulty levels

### User Management
- Secure authentication with Supabase
- Email verification process
- Profile customization
- Password recovery

## Available Scripts

### Root Level
- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon

### Client (Frontend)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Frontend (Vercel)
The client is configured for easy deployment on Vercel:
- Connect your GitHub repository
- Vercel automatically detects it as a React app
- Environment variables are configured in Vercel dashboard

### Backend (Any Node.js Hosting)
The server can be deployed on:
- Heroku
- Digital Ocean
- AWS
- Any Node.js hosting service

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Notes

- The app uses environment variables for sensitive data
- CORS is configured for specific domains in production
- The AI integration requires a valid Google Gemini API key
- Supabase handles authentication and database operations

## Troubleshooting

### Common Issues
- **CORS errors**: Make sure your frontend URL is in the CORS whitelist
- **API key errors**: Verify your Gemini API key is correctly set in `.env`
- **Database connection**: Check Supabase credentials and network connectivity

### Getting Help
- Check the console for detailed error messages
- Verify all environment variables are set correctly
- Ensure both frontend and backend are running in development

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for powering recipe generation
- Supabase for authentication and database services
- Material-UI for beautiful UI components
- The open-source community for amazing tools and libraries

---

**Made with care by the Dishcovery Team**

Happy Cooking!