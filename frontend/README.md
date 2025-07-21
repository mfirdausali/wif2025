# WIF Japan ERP - Frontend Application

A modern, responsive Vue.js frontend application for the WIF Japan ERP system, embodying the principles of Japanese design philosophy with clean, uncluttered interfaces and superior user experience.

## 🎯 Design Philosophy

This application follows **Nikkei-inspired design principles**:
- **清潔 (Seiketsu)** - Cleanliness: Clean, uncluttered layouts
- **間 (Ma)** - Effective use of whitespace
- **品質 (Hinshitsu)** - Quality: Robust, well-tested code
- **改善 (Kaizen)** - Continuous improvement through maintainable architecture

## 🚀 Features

### Module A2 - Customer Management
- ✅ **Customer List View** - Clean, scannable customer directory
- ✅ **Add/Edit Customers** - Intuitive form with real-time validation
- ✅ **Delete Customers** - Safe deletion with confirmation
- ✅ **Responsive Design** - Works perfectly on all devices
- ✅ **Loading States** - Clear feedback during API operations
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Accessibility** - WCAG compliant interface

## 🛠 Technology Stack

- **Frontend Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **CSS Framework**: Tailwind CSS
- **HTTP Client**: Axios
- **Testing**: Vitest + Vue Test Utils
- **Type Safety**: TypeScript support
- **Code Quality**: ESLint + Prettier

## 📋 Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 8.0.0
- Laravel backend API running

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd frontend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoint
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## 📁 Project Structure

```
src/
├── components/           # Reusable Vue components
│   ├── CustomerForm.vue  # Customer form component
│   └── __tests__/        # Component tests
├── views/               # Page-level components
│   ├── CustomersPage.vue # Main customers page
│   └── __tests__/        # View tests
├── services/            # API and external services
│   └── apiClient.js     # Centralized API client
└── test/               # Test configuration
    └── setup.js        # Global test setup
```

## 🧪 Testing Strategy

Our testing approach follows the **Testing Trophy** methodology:

### Unit Tests
- **Component Logic**: Business logic and computed properties
- **User Interactions**: Form submissions, button clicks
- **Error Handling**: Validation and API error scenarios

### Integration Tests
- **API Integration**: Mock API responses and error states
- **Component Communication**: Parent-child component interactions
- **State Management**: Data flow and updates

### Coverage Goals
- **Functions**: > 90%
- **Statements**: > 90%
- **Branches**: > 85%
- **Lines**: > 90%

## 🎨 Design System

### Color Palette
- **Primary**: Indigo scale (Japanese-inspired professional blue)
- **Gray**: Neutral scale for text and backgrounds
- **Semantic**: Red for errors, Green for success

### Typography
- **Font**: Inter (clean, readable sans-serif)
- **Hierarchy**: Clear distinction between headers and body text
- **Spacing**: Consistent vertical rhythm

### Layout Principles
- **Grid System**: 12-column responsive grid
- **Whitespace**: Generous margins and padding (Ma principle)
- **Visual Hierarchy**: Clear content organization

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Lint and fix code
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Backend API endpoint
- `VITE_APP_NAME`: Application name
- `VITE_DEV_MODE`: Development mode flag

### API Client Configuration
The API client (`src/services/apiClient.js`) provides:
- Automatic token management
- Request/response interceptors
- Consistent error handling
- CSRF protection

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built files in `dist/` can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Nginx/Apache

## 🤝 Contributing

1. **Code Style**: Follow the ESLint configuration
2. **Testing**: Write tests for new features
3. **Documentation**: Update README for significant changes
4. **Quality**: Ensure all tests pass before submitting

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the Laravel backend documentation

## 📄 License

This project is proprietary software developed for WIF Japan.

---

**Built with 💙 following Japanese principles of quality and continuous improvement (Kaizen)**