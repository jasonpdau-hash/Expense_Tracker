# Expense Tracker
An expense tracker application built off the FARM stack (fast api, react and mongodb). Users can add, remove, read and edit their expense items. Administrators can monitor user actions including login and logout, as well as updates to their personal expense list.

## Features
- Dynamic updates
- Responsive design
- Keyboard and alt accessible
- Form validation

## Application stack
- Frontend: React
- Backend: FastAPI
- Database: MongoDB

## Demonstration Accounts
| Email            | Password    | Role  |
| ---------------- | ----------- | ----- |
| admin@test.com   | admin       | admin |
| user1@test.com   | user1       | user  |
| user2@test.com   | user2       | user  |

## Database details
The application uses 3 mongo db collections.
- users - registered accounts and roles.
- expenses - record of expenses with title, amount, category, date, description and user's email.
- actions - a log of major actions in the application such as login, logout, and expense modifications.

## Workload
This application was developed indivdually by Jason Dau.
