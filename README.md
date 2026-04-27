<p align="center">
  <h1>Grocery Ecommerce Platform</h1>
  <em>A seamless, efficient, and modern online grocery shopping experience.</em>
  <br>
  <br>
  <img alt="Build Status" src="https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square">
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square">
</p>

---
### Database Strategy

The application uses MongoDB for its flexibility in handling dynamic product schemas and rapid iteration during development. Collections include:

- users
- products
- categories
- orders
- carts

## Key Features

*   🛒 **Intuitive Product Browsing**: Effortlessly discover and explore a wide range of grocery items with advanced search and filtering options.
*   💳 **Secure Checkout Process**: Enjoy peace of mind with encrypted transactions and multiple payment gateway integrations.
*   📦 **Real-time Inventory Management**: Always know what's in stock, preventing frustrating out-of-stock surprises.
*   👤 **Personalized User Accounts**: Manage orders, track delivery, and save preferences for a tailored shopping experience.
*   🚀 **Scalable Architecture**: Built to handle growing demand, ensuring consistent performance even during peak times.
*   🚚 **Efficient Order Fulfillment**: Streamlined backend processes for quick picking, packing, and delivery management.

##  Technical Architecture

### Tech Stack Overview

| Technology   | Purpose                                  | Key Benefit                                      |
| :----------- | :--------------------------------------- | :----------------------------------------------- |
| **Frontend** |                                          |                                                  |
| React        | User Interface Library                   | Declarative, component-based UI development      |
| TypeScript   | Type-safe JavaScript Superset            | Enhanced code quality and maintainability        |
| Tailwind CSS | Utility-First CSS Framework              | Rapid and consistent UI styling                  |
| **Backend**  |                                          |                                                  |
| Node.js      | JavaScript Runtime                       | High performance, non-blocking I/O               |
| Express.js   | Web Application Framework                | Robust API development and routing               |
| MongoDB      | NoSQL Database                           | Flexible schema, horizontal scalability          |
| JWT          | Authentication Mechanism                 | Secure, stateless user authentication            |
| **Tooling**  |                                          |                                                  |
| Git          | Version Control System                   | Collaborative development, change tracking       |

### Directory Structure

```
grocery-ecommerce/
├── .gitignore
├── backend/
│   ├── src/                 # Backend source code (controllers, services, models)
│   ├── package.json         # Backend dependencies and scripts
│   └── tsconfig.json        # TypeScript configuration for backend
└── frontend/
    ├── public/              # Static assets for the frontend
    ├── src/                 # Frontend source code (components, pages, services)
    ├── package.json         # Frontend dependencies and scripts
    └── tsconfig.json        # TypeScript configuration for frontend
```

## Operational Setup

### Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: LTS version (e.g., v18.x or v20.x)
*   **npm** or **Yarn**: Package manager (npm comes with Node.js)
*   **MongoDB**: A running MongoDB instance (local or cloud via MongoDB Atlas).
*   **Docker** (Optional): For containerized deployment and local development.

### Installation

Follow these steps to get the `grocery-ecommerce` platform up and running locally:

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/[your-username]/grocery-ecommerce.git
    cd grocery-ecommerce
    ```

2.  **Setup Backend Service**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Edit .env to configure MongoDB connection string and JWT secret
    npm run dev
    ```
    The backend server should now be running, typically on `http://localhost:5000`.

3.  **Setup Frontend Service**
    ```bash
    cd ../frontend
    npm install # or yarn install
    cp .env.example .env # Create your .env file from the example
    # Edit .env to configure your API base URL
    npm run dev # Start the frontend development server
    ```
    The frontend application should now be accessible, typically on `http://localhost:3000`.

### Environment Configuration

Both the `backend` and `frontend` services require specific environment variables to operate correctly. Create a `.env` file in both the `backend/` and `frontend/` directories by copying their respective `.env.example` files (if provided) or manually creating them.

**`backend/.env` example:**
```
MONGO_URI="mongodb://localhost:27017/grocery_db"
JWT_SECRET="your_strong_jwt_secret_key_here"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

**`frontend/.env` example:**
```
VITE_API_BASE_URL="http://localhost:5000/api" # Or REACT_
