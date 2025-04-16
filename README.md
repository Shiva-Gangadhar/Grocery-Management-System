# Kirana Management System

A comprehensive inventory and order management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- Real-time inventory monitoring and alerts
- Automated order processing and token system
- Multi-staff order management
- Performance analytics dashboard
- Integration with payment gateways and e-commerce platforms
- Secure authentication system

## Tech Stack

- **Frontend**: React.js with Material UI
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **Third-party Integrations**: Payment gateways (Stripe, PayPal), e-commerce platforms

## Project Structure

```
kirana-management-system/
├── src/              # Backend source code
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── utils/        # Utility functions
│   └── app.js        # Express app setup
├── Frontend/         # Frontend React application
│   ├── public/       # Static files
│   └── src/          # React source code
│       ├── assets/   # Images, fonts, etc.
│       ├── components/ # React components
│       ├── contexts/  # React context providers
│       ├── hooks/     # Custom React hooks
│       ├── layouts/   # Page layouts
│       ├── pages/     # Page components
│       ├── services/  # API service functions
│       └── utils/     # Utility functions
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── package.json      # Backend dependencies
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd Frontend
npm install
```

3. Set up environment variables
- Create `.env` file in the root directory
- Copy the example env file and fill in your configuration

4. Start the development servers
```bash
# Start both backend and frontend servers
npm start

# Or start them separately:
# Backend:
npm run server

# Frontend:
npm run frontend
```

## Contributing

[Add contribution guidelines here]

## License

[Add license information here] 