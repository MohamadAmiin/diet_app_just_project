# Diet Management System

A basic Diet Management System built for university backend-focused project. This application allows users to track their meals, manage diet plans, and monitor their weight progress.

## Project Overview

This is an academic project demonstrating:
- **MVC Architecture** - Clean separation of Models, Views, and Controllers
- **RESTful API Design** - Well-structured endpoints following REST principles
- **Role-Based Access Control (RBAC)** - Admin and User roles with different permissions
- **JWT Authentication** - Secure token-based authentication
- **MongoDB with Mongoose** - NoSQL database with ODM

## Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/User)

### Diet Plan Generator
- Create and manage multiple diet plans
- Add/remove foods from plans
- Calculate total calories and macros
- Set active plan
- Personalized calorie recommendations

### Meal Logging
- Log daily meals with food items
- Track meals by type (breakfast, lunch, dinner, snack)
- View daily nutritional totals
- Historical log viewing

### Progress Tracking
- Log weight entries over time
- View weight change trends
- Monitor nutrition progress
- Goal tracking and status updates

## Project Structure

```
├── package.json
├── README.md
├── .env
├── server.js
│
├── app/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── plan.routes.js
│   │   ├── log.routes.js
│   │   └── progress.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── plan.controller.js
│   │   ├── log.controller.js
│   │   └── progress.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── plan.service.js
│   │   ├── logging.service.js
│   │   └── progress.service.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── profile.model.js
│   │   ├── food.model.js
│   │   ├── plan.model.js
│   │   ├── log.model.js
│   │   └── weight.model.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   │
│   ├── views/
│   │   └── frontend/ (React app)
│   │
│   └── config/
│       ├── db.config.js
│       └── app.config.js
```

## How to Run

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   cd diet_app_just_project
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Edit the `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/diet_management_db
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the backend server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd app/views/frontend
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend**
   ```bash
   npm start
   ```

   The React app will be available at `http://localhost:3000`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |
| GET | `/profile` | Get user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/change-password` | Change password | Private |
| GET | `/users` | Get all users | Admin |

### Foods (`/api/foods`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all foods | Private |
| GET | `/:id` | Get single food | Private |
| POST | `/` | Create food | Admin |
| PUT | `/:id` | Update food | Admin |
| DELETE | `/:id` | Delete food | Admin |

### Plans (`/api/plans`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get user's plans | Private |
| GET | `/:id` | Get single plan | Private |
| GET | `/active` | Get active plan | Private |
| GET | `/calculate-calories` | Calculate recommended calories | Private |
| POST | `/` | Create plan | Private |
| PUT | `/:id` | Update plan | Private |
| PUT | `/:id/activate` | Set plan as active | Private |
| POST | `/:id/items` | Add item to plan | Private |
| DELETE | `/:id/items/:itemId` | Remove item from plan | Private |
| DELETE | `/:id` | Delete plan | Private |

### Meal Logs (`/api/logs`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all logs | Private |
| GET | `/today` | Get today's logs | Private |
| GET | `/date/:date` | Get logs by date | Private |
| GET | `/range` | Get logs in date range | Private |
| POST | `/` | Create meal log | Private |
| PUT | `/:id` | Update log | Private |
| DELETE | `/:id` | Delete log | Private |
| GET | `/totals/today` | Get today's totals | Private |
| GET | `/totals/date/:date` | Get totals by date | Private |
| GET | `/totals/weekly` | Get weekly summary | Private |

### Progress (`/api/progress`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/summary` | Get full progress summary | Private |
| GET | `/weight-progress` | Get weight progress | Private |
| GET | `/nutrition` | Get nutrition progress | Private |
| GET | `/goal` | Get goal progress | Private |
| GET | `/weight` | Get weight history | Private |
| GET | `/weight/latest` | Get latest weight | Private |
| POST | `/weight` | Log weight | Private |
| PUT | `/weight/:id` | Update weight | Private |
| DELETE | `/weight/:id` | Delete weight | Private |

## User Roles & Permissions

### Admin
- Manage foods (create, update, delete)
- View all users
- All user permissions

### User
- Manage own profile
- Create and manage diet plans
- Log meals
- Track weight and progress
- View foods

## Database Models

### User
- email, password, role

### Profile
- userId, age, height, weight, goal, dailyCalorieTarget

### Food
- name, calories, protein, carbs, fats, servingSize, category

### Plan
- userId, name, totalCalories, totalProtein, totalCarbs, totalFats, items[], isActive

### MealLog
- userId, foodId, quantity, mealType, date, calories, protein, carbs, fats

### DailyTotals
- userId, date, totalCalories, totalProtein, totalCarbs, totalFats, mealsCount

### Weight
- userId, value, date, notes

## Sample Data

To add sample foods, you can use the admin panel or make POST requests:

```json
{
  "name": "Chicken Breast",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fats": 3.6,
  "servingSize": "100g",
  "category": "protein"
}
```

## Testing the API

You can test the API using tools like:
- **Postman**
- **curl**
- **Thunder Client (VS Code extension)**

Example login request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Notes

- This is an academic project, not production-ready
- JWT secret should be changed in production
- MongoDB should be properly secured in production
- Error handling is basic for learning purposes
- No advanced optimizations or caching implemented

## License

This project is for educational purposes only.
