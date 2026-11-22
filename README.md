# Customer Loyalty Rewards System

## Project Overview

The Customer Loyalty Rewards System is a web-based application designed for factories that sell packaged products.

The system allows customers to collect loyalty points by entering unique reward codes found inside product packages. Customers can accumulate points and redeem them for rewards available in the system.

The application also provides an administrative dashboard for managing products, generating reward codes, monitoring customer activity, managing rewards, and tracking loyalty transactions.

## Objectives

- Allow customers to register and securely log in.
- Enable customers to claim loyalty points using unique product codes.
- Prevent duplicate code claims and reduce fraudulent activities.
- Allow customers to view their points balance and transaction history.
- Provide a reward catalogue and points-based redemption system.
- Allow factory administrators to manage products, codes, customers, rewards, and reports.
- Provide staff members with a system to verify reward collection.

## User Roles

### 1. Customer
- Register and log in.
- Claim product reward codes.
- View points balance and transaction history.
- Browse and redeem available rewards.
- View redemption history and notifications.
- View the customer leaderboard.

### 2. Administrator
- Manage products and product categories.
- Generate and manage reward codes in batches.
- Manage rewards and redemption settings.
- Monitor customers and suspicious activities.
- Manage staff accounts.
- View dashboard statistics and export reports.

### 3. Staff
- Log in using administrator-created credentials.
- Verify customer redemption codes.
- Confirm physical reward collection.
- View their own verification activity.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB Community |
| Database Integration | Mongoose |
| Styling | CSS |
| Authentication | JWT |
| Version Control | Git and GitHub |

## Project Structure

```text
CustomerLoyaltyRewards/
├── client/
├── server/
├── README.md
├── ASSUMPTIONS.md
├── ARCHITECTURE.md
├── TESTING.md
├── AI_LOG.md
└── .env.example
```

## Core Features

- Customer registration and authentication.
- Unique, single-use product reward codes.
- Bulk reward code generation.
- Points management and transaction history.
- Reward catalogue and redemption.
- Redemption code verification by staff.
- Customer leaderboard.
- Suspicious activity monitoring.
- Administrative dashboard and reports.
- In-app notifications.

## Development Approach

The application will be developed module by module. Features will be implemented and tested incrementally, with source code and documentation maintained through Git and GitHub.

## Project Status

**Status:** Initial Setup and Planning

The project requirements and technology stack have been defined. Development and implementation are in progress.

## Installation and Execution

Installation instructions, environment configuration, and commands to run the application will be added as development progresses.

## Author
Kasak