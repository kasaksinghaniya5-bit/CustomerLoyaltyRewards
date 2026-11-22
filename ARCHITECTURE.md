# System Architecture

## 1. Architecture Overview

The Customer Loyalty Rewards System will follow a three-tier architecture consisting of:

1. Presentation Layer (Frontend)
2. Application Layer (Backend)
3. Data Layer (Database)

The frontend communicates with the backend through REST APIs. The backend processes requests, validates business rules, performs authentication and communicates with the database.

## 2. Technology Architecture

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React.js | User interface and interaction |
| Styling | CSS | Layout and visual design |
| Backend | Node.js | Server-side execution |
| Framework | Express.js | API routes and request handling |
| Database | MongoDB Community | Persistent data storage |
| ODM | Mongoose | Database models and queries |
| Authentication | JWT | Authenticated access |
| Version Control | Git and GitHub | Source code management |

## 3. Project Structure

The project will maintain separate frontend and backend directories.

```text
CustomerLoyaltyRewards/
│
├── client/
│   └── React application
│
├── server/
│   └── Express application
│
├── README.md
├── ASSUMPTIONS.md
├── ARCHITECTURE.md
├── TESTING.md
├── AI_LOG.md
└── .env.example
```

## 4. Application Layers

### 4.1 Presentation Layer

The React frontend will provide separate dashboards and interfaces for:

- Customers
- Administrators
- Staff members

It will display information, collect user input and communicate with backend APIs.

### 4.2 Application Layer

The Node.js and Express backend will handle:

- User authentication and authorization.
- Product and reward management.
- Product reward code generation and validation.
- Points calculation and transaction management.
- Reward redemption and collection verification.
- Suspicious activity detection.
- Notifications and reporting.

The backend will validate all important operations before updating the database.

### 4.3 Data Layer

MongoDB will store application information.

The database will contain collections for:

- Users
- Products
- Product Categories
- Reward Codes
- Code Generation Batches
- Points Transactions
- Rewards
- Redemptions
- Notifications
- Suspicious Activities
- Admin Activity Logs
- Staff Verification Records

## 5. User Roles and Access Control

### Customer
- Manage personal account access.
- Claim product reward codes.
- View points and transaction history.
- Browse and redeem rewards.
- View notifications and leaderboard.

### Administrator
- Manage products and categories.
- Generate and manage product reward codes.
- Manage rewards and redemption settings.
- Manage customers and staff.
- Review suspicious activities.
- View reports and system statistics.

### Staff
- Verify redemption codes.
- Confirm physical reward collection.
- View personal verification activity.

Access permissions will be checked on the backend to prevent unauthorised operations.

## 6. Main Application Workflows

### 6.1 Customer Registration and Login

1. Customer submits registration information.
2. Backend validates the information.
3. Password is securely hashed.
4. Customer account is stored in MongoDB.
5. During login, credentials are verified.
6. A JWT is issued after successful authentication.

### 6.2 Product Reward Code Generation

1. Administrator selects a product.
2. Administrator specifies the number of codes to generate.
3. Backend generates unique random codes.
4. Each code stores its assigned points value.
5. Batch information and generated codes are stored in MongoDB.
6. Administrator can export the generated codes.

### 6.3 Product Code Claiming

1. Customer enters a product reward code.
2. Backend checks whether the code exists.
3. Backend verifies its status and associated product.
4. If valid and unused, the code is marked as claimed.
5. The customer's points balance is updated.
6. A points transaction and notification are created.
7. Invalid attempts are recorded and suspicious activity is monitored.

### 6.4 Reward Redemption

1. Customer selects an active reward.
2. Backend checks the points balance and available stock.
3. Points are deducted.
4. Reward stock is reserved.
5. A unique redemption code is generated.
6. Redemption details and a points transaction are stored.
7. Customer receives an in-app notification.

### 6.5 Physical Reward Collection

1. Customer presents the redemption code at an authorised outlet.
2. Staff enters the code in the staff dashboard.
3. Backend validates the redemption.
4. Staff confirms the physical handover.
5. Redemption status changes to Used.
6. Verification activity is recorded.

### 6.6 Redemption Cancellation and Expiry

1. An active redemption may be cancelled by the customer or expire after its validity period.
2. Backend verifies that the redemption has not already been used or refunded.
3. Points are refunded.
4. Reserved reward stock is restored.
5. Redemption status is updated.
6. A refund transaction and notification are created.

## 7. Security Architecture

The system will implement:

- Secure password hashing.
- JWT-based authentication.
- Backend-enforced role-based access control.
- Unique and unpredictable product reward codes.
- Single-use product and redemption codes.
- Temporary login lockouts after repeated incorrect attempts.
- Suspicious product-code attempt monitoring.
- Transaction-safe points balance updates.
- Administrative audit logs.

## 8. Data Integrity

Important operations will use database transactions where appropriate.

For example, claiming a product code must update the code status, customer points balance and points transaction together.

Similarly, reward redemption must deduct points, reserve stock, create a redemption record and generate a redemption code consistently.

This will help prevent duplicate claims, incorrect balances and inconsistent stock information.

## 9. Development Architecture

Development will be performed incrementally.

The frontend and backend will be developed separately and connected through REST APIs. MongoDB Community will serve as the local development database.

Git will track changes throughout development, and the completed project will be maintained in a public GitHub repository.

