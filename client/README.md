# Mentora Frontend

A modern, responsive frontend for the Mentora learning platform built with React, Vite, and TailwindCSS.

## 🚀 Features

- Responsive modern UI/UX
- Dark/Light mode support
- Interactive course browsing
- Real-time quiz taking interface
- Secure payment integration
- Video lecture streaming
- Progress tracking
- Instructor dashboard
- Student dashboard

## 🛠 Technologies Used

- **Framework**: React.js 18+
- **Build Tool**: Vite
- **Styling**: 
  - TailwindCSS
  - Shadcn UI Components
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Data Fetching**: Axios
- **Code Quality**:
  - ESLint
  - Prettier
  - PostCSS

## 🔧 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mentora/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env` file in the client directory
   - Add the following configurations:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_KEY=your_supabase_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
client/
├── public/              # Public assets
├── src/
│   ├── app/            # App configuration
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   ├── config/         # Configuration files
│   ├── features/       # Redux slices
│   ├── hooks/         # Custom React hooks
│   ├── layout/        # Layout components
│   ├── lib/           # Library configurations
│   ├── pages/         # Page components
│   └── utils/         # Utility functions
├── index.html
└── vite.config.js
```

## 🎨 Key Components

### Layout Components
- `Navbar`: Main navigation component
- `Sidebar`: Course navigation and filters
- `Footer`: Site footer with links and information

### Feature Components
- `CourseCard`: Display course information
- `VideoPlayer`: Custom video player for lectures
- `QuizInterface`: Interactive quiz taking interface
- `PaymentForm`: Secure payment processing
- `ProgressTracker`: Course progress visualization

## 🔐 Authentication

The application uses JWT-based authentication with secure HTTP-only cookies. Authentication state is managed through Redux and persisted in local storage.

## 🌓 Dark Mode

Dark mode is implemented using TailwindCSS and custom React hooks. The mode preference is persisted in local storage.

## 📱 Responsive Design

The UI is fully responsive and optimized for:
- Desktop (1024px and above)
- Tablet (768px to 1023px)
- Mobile (320px to 767px)

## 🔍 State Management

Redux Toolkit is used for global state management:
- Authentication state
- Course data
- User preferences
- Shopping cart
- Quiz progress

## 🔄 API Integration

API calls are managed using Axios with a custom configuration:
- Request/Response interceptors
- Error handling
- Authentication header management
- Request caching
- Retry logic

## ⚡ Performance Optimization

- Code splitting using React.lazy()
- Image optimization
- Caching strategies
- Lazy loading of components
- Memoization of expensive computations

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📈 Analytics

The application integrates with:
- Google Analytics
- Error tracking
- User behavior tracking
- Performance monitoring

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Using Docker**
   ```bash
   docker build -t mentora-client .
   docker run -p 80:80 mentora-client
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Shadcn UI for the component library
- Tailwind team for the amazing CSS framework
- Vite team for the blazing fast build tool
