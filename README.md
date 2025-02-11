# Finance Management App

## Table of Contents
- [Project Overview](#project-overview)
- [Motivation](#motivation)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Team Members](#team-members)

## Project Overview
The **Finance Management App** is a user-friendly financial planning tool designed to help college students track their spending, manage their budget, and develop responsible financial habits. The system provides an intuitive dashboard, spending insights, and personalized recommendations based on the **50/30/20 budgeting rule** to encourage effective financial management.

## Motivation
As college students, we understand the challenges of managing finances while juggling academics and personal responsibilities. With limited income and increasing expenses, having a structured way to track and optimize spending is crucial. This app aims to serve as a practical financial assistant, helping students develop responsible financial habits that will benefit them both in college and beyond.

## Features
### Functional Requirements
- **User Authentication**: Secure login and access to financial data.
- **Dashboard Overview**: Displays total income, expenses, and remaining budget.
- **Budget Visualization**:
    - Pie chart for spending categories.
    - Progress bar for budget tracking.
- **Expense Tracking**:
    - Log income and expenses.
    - Categorize transactions (food, rent, entertainment, etc.).
    - Edit or delete transactions.
- **Personalized Budget Recommendations**:
    - Uses the **50/30/20 budgeting rule**.
    - Provides financial tips based on spending behavior.
- **Recurring Transactions**: Track ongoing financial commitments.

### Non-Functional Requirements
- **User Interface**: Clean and intuitive design inspired by leading banking apps.
- **Performance**:
    - Responses rendered in under 8 seconds.
    - Support for high transaction volumes.
- **Scalability**: Capable of handling increasing users and transactions.
- **Security**:
    - Secure password hashing.
    - Optional data encryption.

## Tech Stack
| Technology | Purpose                     |
|------------|-----------------------------|
| **Frontend** |
| React | UI Development              |
| D3.js | Budget visualizations       |
| **Backend** |
| Node.js | JavaScript runtime          |
| TypeScript | Statically-typed JavaScript |
| Prisma | ORM for MySQL               |
| **Database** |
| MySQL | Relational database         |
| **Development Tools** |
| Git | Version control             |
| Figma | UI/UX design                |

## Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/linabaly/Financial-Management-App.git
   cd finance-budgeting-app
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Set Up Database:**
    - Ensure MySQL is installed and running.
    - Update `.env` with database credentials.
    - Run migrations:
      ```bash
      npx prisma migrate dev
      ```
4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

## Usage
1. **Sign Up or Log In** to the app.
2. **Add Income & Expenses** by filling out the transaction form.
3. **View Budget Insights** with charts and spending analysis.
4. **Receive Personalized Recommendations** based on spending habits.
5. **Monitor Recurring Transactions** to track ongoing commitments.

## Contributing
We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Added new feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a Pull Request.

## License
This project is licensed under the **AGPL 3.0 License**.

## Team Members
- **Lina Baly**
- **Jacob Darroch**
- **Matthew Ray**
- **Yana Yerokhina**
