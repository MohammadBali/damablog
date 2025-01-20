# Blog API by Mohamad Al Bali

This project is a RESTful API for a blog application built using **Node.js**, **Express.js**, and **TypeScript**, with **MongoDB** as the database. The API supports user authentication, role-based authorization, input validation, and error handling, along with additional features like pagination and Swagger documentation.

## Features

### Authentication
- Implements user authentication using **JWT**.
- Provides routes for user login and signup.

### Authorization
- Role-based access control:
    - Authenticated users can create and update blogs.
    - Admin users can delete blogs.

### Models
1. **User Model**:
    - Includes fields for name, email, password, role, and authentication tokens.
2. **Blog Model**:
    - Stores blog information like title, description, and author.

### Validation
- Validates input for creating users, blogs, and authentication.
- Enforces rules such as password length and email format.

### Error Handling
- Provides descriptive error messages and appropriate HTTP status codes for invalid requests (e.g., 400, 401, 403, 404).

### Endpoints
#### Authentication Routes
- `POST /auth/signup` - Create a new user.
- `POST /auth/login` - Log in a user and return a JWT token.

#### Blog Routes
- `GET /blogs` - Retrieve all blogs (public).
- `POST /blogs` - Create a new blog (requires authentication).
- `PUT /blogs/:id` - Update a blog (requires authentication and ownership check).
- `DELETE /blogs/:id` - Delete a blog (admin only).

### Additional Features
- **Pagination** for the `GET /blogs` endpoint.
- **Swagger Documentation** for API endpoints.

## Project Structure
```
├── src
│   ├── db               # Database connection and configuration
│   ├── middleware       # Authentication and other middleware
│   ├── models           # Mongoose models for User and Blog
│   ├── routers          # API route handlers
│   ├── shared           # Utilities and shared components
│   └── index.ts         # Application entry point
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── nodemon.json         # Nodemon configuration
├── package.json         # Project metadata and dependencies
├── package-lock.json    # Dependency lock file
├── tsconfig.json        # TypeScript configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or later)
- MongoDB
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MohammadBali/damablog
   cd damablog
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
    - Create a `.env` file in the root directory.
    - Add the following variables:
      ```env
      PORT=3000
      MONGODB_URI=<your-mongodb-connection-string>
      SIGN_KEY=<your-jwt-secret>
      ```

### Running the Application
1. Start the development server:
   ```bash
   npm run dev
   ```
2. The API will be accessible at `http://localhost:3000`.

### Scripts
- `npm run dev` - Run the application in development mode with Nodemon.
- `npm run build` - Compile TypeScript to JavaScript.
- `npm start` - Start the production server.

## API Documentation
This project includes Swagger documentation for the API. After starting the server, you can access the documentation at:
```
http://localhost:3000/api-docs
```

## Testing
- Use tools like **Postman** or **cURL** to test the API endpoints.
- Verify authentication and role-based access control by creating users with different roles.
- a Postman exported file is available too



