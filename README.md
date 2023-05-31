# My To-Do List+ (Server) 

## Description 

This is the backend component of the My To-Do List+ project, which provides the server-side functionality for managing tasks and groups. The backend is implemented using Express, and the database of choice is MongoDB. The server code is also covered with tests to ensure reliability.

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

The backend provides the following API endpoints: 

- POST /auth/register: Register a new user. Validates the request body using registerValidation and creates a new user with hashed password.  

- POST /auth/login: Authenticate a user. Validates the request body using loginValidation and generates a JWT token upon successful login. 

- GET /auth/me: Retrieve user information based on the authenticated token. 

- GET /groups: Retrieve all task groups for the authenticated user. 

- GET /groups/:id: Retrieve a specific task group by ID. 

- POST /groups: Create a new task group. Validates the request body using groupCreateValidation and adds it to the database. 

- DELETE /groups/:id: Delete a task group by ID. 

- PATCH /groups/:id: Update a task group by ID. Validates the request body using groupCreateValidation. 

- GET /tasks/:groupId: Retrieve all tasks within a specific group. 

- POST /tasks/:groupId: Create a new task within a specific group. Validates the request body using taskValidation. 

- DELETE /tasks/:groupId/:taskId: Delete a task by ID within a specific group. 

- PATCH /tasks/:groupId/:taskId: Update a task by ID within a specific group. Validates the request body using taskValidation. 

## Frontend

[My app](https://github.com/vladimirvikulin/To-Do-List) 


## Acknowledgements

- [Express](https://expressjs.com) 
- [MongoDB](https://www.mongodb.com) 
- [bcrypt](https://www.npmjs.com/package/bcrypt)  
