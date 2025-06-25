# Contribution Guidelines

Thank you for your interest in contributing to Stations of Sun! We welcome all contributions, including bug reports, feature requests, documentation improvements, and code enhancements.

## How to Contribute

- **Issues:** Use the [issue tracker](../../issues) to report bugs, suggest features, or ask questions.
- **Pull Requests:** Fork the repository, create a new branch, and submit a pull request with your changes. Please provide a clear description and reference related issues if applicable.
- **Code Style:** Follow best practices for JavaScript and Node.js. Keep code clean, modular, and well-documented.
- **Frontend Components:** When adding new frontend components, follow the existing modular pattern.
- **Notebooks:** Ensure Jupyter notebooks are reproducible and outputs are cleared before committing.
- **Database Migrations:** If you make schema changes, update the migration files accordingly.

## Development Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/OpenRail-Playground/stations-of-sun.git
   cd stations-of-sun
   ```

2. Install Node.js dependencies:

   ```sh
   npm install
   ```

3. Set up the database:

   ```sh
   npm run db:setup
   npm run db:seed
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Development Workflow

### Backend Development

- The backend is built with Node.js and Express.js
- API endpoints are defined in `/backend/routes/`
- Controllers handle request/response logic in `/backend/controllers/`
- Data models in `/backend/models/` interact with the SQLite database
- Use the appropriate service files in `/backend/services/` for business logic

### Frontend Development

- The frontend uses vanilla JavaScript with a modular component pattern
- Components are defined in `/frontend/public/components/`
- Services for API interaction are in `/frontend/public/services/`
- CSS styles are in `/frontend/public/styles/`
- PWA functionality is handled by `/frontend/public/sw.js` (Service Worker)

### Database Changes

If you need to modify the database schema:

1. Update the migration files in `/backend/db/migrations/`
2. Update the corresponding models
3. Run `npm run db:migrate` to apply your changes
4. Update seed data if necessary

## Testing

- For backend changes, test your API endpoints using tools like Postman or curl
- For frontend changes, test across different browsers and device sizes
- Verify PWA functionality by testing offline capabilities

## Code of Conduct

We strive to foster a welcoming and respectful environment. Please be kind and considerate in all interactions.

By submitting a contribution, you agree to license your work under the repository's license and certify you have the rights to do so.
