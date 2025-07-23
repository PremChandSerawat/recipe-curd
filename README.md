<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Recipe API

A modern, feature-rich RESTful API for managing cooking recipes built with NestJS and MongoDB [[memory:4109437]]. This API provides comprehensive functionality for creating, managing, and searching recipes with advanced filtering and pagination capabilities.

## Features

- Full CRUD operations for recipes (Create, Read, Update, Delete)
- Advanced search capabilities:
  - Regular text search by recipe name
  - Full-text search across name, ingredients, and instructions
  - Filtering by difficulty level and preparation time
- Flexible sorting options for any recipe field
- Pagination support with customizable page size
- Swagger/OpenAPI documentation
- Docker containerization
- MongoDB integration
- Input validation and error handling
- Comprehensive API response documentation

## Prerequisites

- Node.js (v18 or later)
- MongoDB (v6 or later)
- Docker and Docker Compose (optional, for containerized deployment)

## Installation

```bash
# Install dependencies
npm install

# Create environment file
echo "MONGODB_URI=mongodb://localhost:27017/recipe_db" > .env
```

## Running the Application

### Using Docker (Recommended)

```bash
# Start both API and MongoDB services
docker-compose up
```

The API will be available at http://localhost:3000.

### Local Development

1. Ensure MongoDB is running locally on port 27017
2. Start the application in development mode:
   ```bash
   npm run start:dev
   ```

## API Documentation

Swagger documentation is available at http://localhost:3000/api when the application is running.

## API Endpoints

### Create Recipe
- **POST** `/recipes`
- Creates a new recipe
- Required fields:
  - `name` (string): Recipe name
  - `ingredients` (string[]): List of ingredients
  - `instructions` (string): Step-by-step instructions
  - `prepTime` (number): Preparation time in minutes
  - `cookTime` (number): Cooking time in minutes
  - `servings` (number): Number of servings
- Optional fields:
  - `difficulty` (enum): 'easy', 'medium', or 'hard'

### Get Recipes
- **GET** `/recipes`
- Retrieves a paginated list of recipes with filtering options
- Query Parameters:
  - `page` (number, default: 1): Page number
  - `limit` (number, default: 10): Items per page
  - `search` (string): Search recipes by name
  - `textSearch` (string): Full-text search across name, ingredients, and instructions
  - `difficulty` (string): Filter by difficulty level
  - `maxPrepTime` (number): Filter by maximum preparation time
  - `sortBy` (string, default: 'createdAt'): Field to sort by
  - `sortOrder` (enum, default: 'DESC'): Sort order ('ASC' or 'DESC')

### Get Single Recipe
- **GET** `/recipes/:id`
- Retrieves a specific recipe by ID
- Returns 404 if recipe not found

### Update Recipe
- **PATCH** `/recipes/:id`
- Updates an existing recipe
- Supports partial updates
- Returns 404 if recipe not found

### Delete Recipe
- **DELETE** `/recipes/:id`
- Deletes a recipe
- Returns 204 on success
- Returns 404 if recipe not found

## Testing

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e
```

## Error Handling

The API implements standard HTTP status codes:
- 200: Successful GET/PATCH requests
- 201: Successful POST requests
- 204: Successful DELETE requests
- 400: Bad Request (invalid input)
- 404: Resource Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
