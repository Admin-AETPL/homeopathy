# Homeo Backend

A Node.js backend with Express and SQLite using a feature-first architecture.

## Setup

1.  **Install dependencies:**
    ```sh
    npm install
    ```

2.  **Initialize the database:**
    ```sh
    npm run db:init
    ```

## Running the Application

-   **Development mode (with auto-restarting):**
    ```sh
    npm run dev
    ```

-   **Production mode:**
    ```sh
    npm start
    ```

## API Endpoints

-   `GET /api/users` - Get all users
-   `POST /api/users` - Create a new user
    -   **Body:** `{ "name": "John Doe", "email": "john.doe@example.com" }`

## API Endpoints

### Patients

-   `GET /api/patients` - Get all patients
-   `GET /api/patients/search?q={query}` - Search for patients by name
-   `GET /api/patients/{id}` - Get a single patient by ID
-   `POST /api/patients` - Create a new patient
    -   **Body:** `{ "name": "Jane Doe", "age": 30, "gender": "Female", "contact": "1234567890", "address": "123 Main St" }`
-   `PUT /api/patients/{id}` - Update a patient
-   `DELETE /api/patients/{id}` - Delete a patient
