# Project Manager (Server) 

## Description 

This is the backend component of the Project Manager project, providing robust server-side functionality for project planning and management. Built with Express and MongoDB, it supports secure authentication, user and project management, and advanced analytics (network diagrams, optimized Gantt charts). The server code includes tests to ensure reliability and is designed with Ukrainian localization in mind.

## How to run

1. Clone the repository to your local machine 
2. Navigate to the project directory in your terminal or command prompt 
3. Install the dependencies 
```bash
$ npm install
``` 
4. Set up a configuration file 
Configuration file should be named as .env, example is named as .env.example 
5. To run the server 
```bash 
$ npm run dev 
```  
6. To run tests 
```bash 
$ npm test 
```

## API Endpoints 

- POST /auth/register: Register a new user. Validates the request body using registerValidation and creates a new user with a hashed password.
- POST /auth/login: Authenticate a user. Validates the request body using loginValidation and generates a JWT token upon successful login.
- GET /auth/me: Retrieve current user information based on the authenticated token.
- PATCH /auth/profile: Update user profile, including avatar upload.
- POST /auth/invitations: Manage user invitations to projects.
- GET /users/:id: Retrieve user profile by ID.
- GET /groups: Retrieve all projects for the authenticated user.
- GET /groups/:id: Retrieve a specific project by ID.
- POST /groups: Create a new project. Validates the request body using groupCreateValidation.
- DELETE /groups/:id: Delete a project by ID.
- PATCH /groups/:id: Update a project by ID. Validates the request body using groupCreateValidation.
- POST /groups/:id/invite: Invite a user to a project by email.
- POST /groups/:id/remove-user: Remove a user from a project.
- PATCH /groups/:id/permissions: Update user permissions within a project.
- GET /tasks/:groupId: Retrieve all tasks within a specific project.
- POST /tasks/:groupId: Create a new task within a project. Validates the request body using taskValidation.
- DELETE /tasks/:groupId/:taskId: Delete a task by ID within a project.
- PATCH /tasks/:groupId/:taskId: Update a task by ID within a project. Validates the request body using taskValidation.

## Сode reviews of my project

- [Code review №1](https://github.com/vladimirvikulin/To-Do-List/pull/4) 
- [Code review №2](https://github.com/vladimirvikulin/To-Do-List-Server/pull/2) 
- [Code review №3](https://github.com/vladimirvikulin/To-Do-List-Server/pull/3) 
- [Code review №4](https://github.com/vladimirvikulin/To-Do-List/pull/8) 

## My code reviews

- [Code review №1](https://github.com/danil2205/blitz-session-react/pull/3) 
- [Code review №2](https://github.com/danil2205/blitz-session-react/pull/4) 
- [Code review №3](https://github.com/danil2205/BlitzSession/pull/1) 
- [Code review №4](https://github.com/danil2205/BlitzSession/pull/2) 

## Frontend

[Frontend](https://github.com/vladimirvikulin/Project-Manager) 

## Acknowledgements

- [Express](https://expressjs.com) 
- [MongoDB](https://www.mongodb.com) 
- [bcrypt](https://www.npmjs.com/package/bcrypt)  
