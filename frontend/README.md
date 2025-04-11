# GrantCraft Frontend

This is the frontend application for GrantCraft, an AI-powered grant writing assistant.

## Technology Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS with a custom design system inspired by Shadcn UI
- **State Management:** Zustand
- **Authentication:** Firebase Auth
- **API Client:** Custom API service

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Firebase project configured (for authentication)

### Environment Variables

Create a `.env.local` file in the root of the frontend directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000 # Or your deployed API URL
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── components/   # UI Components
│   │   ├── auth/     # Authentication components
│   │   ├── chat/     # Chat-related components
│   │   ├── files/    # File management components
│   │   ├── layout/   # Layout components (Header, Sidebar, etc.)
│   │   ├── tasks/    # Task management components
│   │   └── ui/       # Reusable UI components
│   ├── lib/          # Utility functions and hooks
│   │   ├── hooks/    # Custom React hooks
│   │   └── utils.ts  # Utility functions
│   ├── pages/        # Next.js pages
│   ├── services/     # API services
│   ├── store/        # Global state management
│   ├── styles/       # Global styles
│   └── types/        # TypeScript type definitions
├── .env.example      # Example environment variables
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json     # TypeScript configuration
```

## Design System

The application follows a clean, minimalist design with a black and white color scheme accented with cyan and teal colors. The design system is inspired by Shadcn UI components with a focus on usability and elegant presentation.

### Color Palette

- **Background:** White (#FFFFFF)
- **Text:** Near Black (#0F172A)
- **Primary:** Cyan (#06B6D4)
- **Secondary:** Teal (#14B8A6)
- **Accent:** Blue (#0EA5E9)

## Available Features

- [x] User authentication (sign up, sign in, sign out)
- [x] Dashboard with overview of recent activity
- [ ] Chat interface for AI conversations
- [ ] Task management system
- [ ] File uploads and management
- [ ] User profile management

## Development Roadmap

- [ ] Implement chat service and components
- [ ] Implement task service and components
- [ ] Implement file service and components
- [ ] Add user profile settings page
- [ ] Implement real-time updates for chat
- [ ] Add collaborative features
- [ ] Improve accessibility
- [ ] Add comprehensive test coverage

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. 