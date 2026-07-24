# WhatsNext
It's a fullstack application that idea is to get release dates of upcoming movies, as well as create your own watchlist, review movies past the release date, and browse the movies or reviews on their listing pages, and also detail pages for movies.
## Techstack
#### Frontend
- NextJS
- taildwindcss
#### Backend
- NestJS
- class validator
- typeORM
- swagger (docs)
#### Database
- PostgreSQL

## Startup
We can start the app right away with the command, we do not need to create .env there are local default values preassigned.
```bash  
docker compose up
``` 
it will create 3 images (Database, backend (+ init) , frontend)

After database is created, we create backend-init image that's only purpose is to migrate databse "/backend/src/database/migrations" and after that we will seed the database with mock data jsons from "/backend/src/database/seeds". After database is created and seeded we install backend deps, build it, and start it, same goes for the FE.

By default FE runs on port :3000 [http://localhost:3000](http://localhost:3000/) , and BE on port :8080 [http://localhost:8080/api](http://localhost:8080/api).  To find out if backend is running before moving to FE image build we do use healthcheck endpoint [http://localhost:8080/api/health](http://localhost:8080/api/health).

## Shutdown
```bash
docker compose down
```

### Demo account

Seeder creates demo account with already existing mock data.

`E-mail: user123@example.com 
Password: password123`


## Documentation
There is additional documentation in form of JSON OpenAPI that we can use to get all endpoints in for example Postman, [http://localhost:8080/docs/openapi.json](http://localhost:8080/docs/openapi.json). 
As well there is also documentation in form of Swagger UI [http://localhost:8080/docs](http://localhost:8080/docs)


## API
We hase used NestJS to create simple REST API. We do use GET, POST, PATCH, DELETE http requests, although not for all entities. For validation we do use dto with class transformer and validator as well as validationPipes from NestJS. Most of the GET endpoints are using Public() decorator and are accesible with no bearer token, all other endpoints are protected by JWT guard so user has to be authorized to access them. To ensure always the same error response we do use NestJS exceptions and validationPipe  (message, error, statusCode).
```json  
{  
  "message": [  
    "rating must not be greater than 10"  ],  "error": "Bad Request",  
  "statusCode": 400  
}  
```

## Database
For better manageability we are using Postgres 17 with TypeORM, Database has 5 entities [User, Movie, Genre, WatchlistItem, Review] as well as 1 pivot table for linking Movies to Genres. Database model is also defined inside "/backend/src/[entity]/entities/[entity].entity.ts". 

Some entities like Reviews got also unique conditions set on database level -> 1 <= rating  >= 10, as well as indexes for faster searches. All main entities use UUID primary keys.

| Relationship              | Cardinality |
| ------------------------- | ----------- |
| `User` → `WatchlistItem`  | 1:N         |
| `Movie` → `WatchlistItem` | 1:N         |
| `User` → `Review`         | 1:N         |
| `Movie` → `Review`        | 1:N         |
| `Movie` ↔ `Genre`         | N:M         |

## Web interface
To ensure SSR and SEO, we use NextJS and to keep design similar and responsive on multiple devices we use tailwindcss. We also use client components for interactive elements such as modals or forms. There are 7 subpages as well 1 slugDetail page
- `/`
- `/movies`
- `/movies/[slug]`
- `/reviews`
- `/watchlist`
- `/profile`
- `/login`
- `/register`


  If the user is not signed in and he is trying to reach authenticated subpage he will be redirected to login page, the JWT token itself is being saved into httpOnly cookie. User has option to edit his reviews, profile, password (hashed by bcrypt), watchlist, as well as to delete entries from his watchlist or his reviews.
  Every component has its skeleton variant that will be displayed if data is being fetched for that component. If backend would fail there is PageErrorState component that tells user that something went wrong. If backend would fetch 0 items there is also condition for that. When user updates data or creates, the responses are being presented in Toast component on the bottom of the screen. If user fetches new data in listing pages only the skeleton component will be shown for the data he refreshed/fetched.  Most of the components are being shared or have variants. In the footer we also can find links to OpenAPI or Swagger UI docs.

## SEO
Default OG:metadata are stored inside "/frontend/src/lib/seo.tx". Additionally each subpage has its own metadata prepared. There are 2 subpages that are not indexed from being accessed by search engines -> /profile, /watchlist. Sitemap is being generated for everyother subpage as well as all movie detail pages where movie title and description as well poster is being used for og:metadata.

## Responsiveness & UX
Tailwind has breakpoints that we use (sm. md, lg, xl), all components are being adapted to those media queries. Every interactive component has hover animation, when it comes to movie cards they have subtle animation, buttons for example has colour change. Whole design is being kept in 2 colours, White for background and Blue as primary as well LightBlue for accents and hover animations.

## User Functionality
### Public
- view upcoming movie releases and the latest community reviews
- filter, sort and paginate movies by genre and release status
- view movie details and movie reviews
- browse and filter community reviews
- create an account and log in
- access a list of recently viewed movies stored locally
### Authenticated users
- add or remove movies to their watchlist
- filter and paginate their watchlist
- review movies that have already been released
- edit and delete their own reviews
- browse their review history
- update profile, change password,

# Developer Guide
## Repository Structure
```text
├── backend/
│   ├── src/auth/             authentication and JWT guard
│   ├── src/database/         data source, migrations, and seed data
│   ├── src/movies/           movie catalogue and details
│   ├── src/reviews/          review CRUD operations
│   ├── src/users/            user profiles and avatars
│   └── src/watchlist/        personal watchlist
├── frontend/
│   ├── src/app/              Next.js pages, actions, and route handlers
│   ├── src/components/       domain-specific and shared UI components
│   ├── src/lib/              API clients, authentication, SEO, and form validation
│   └── public/               static assets
├── compose.yaml              single-command startup
├── compose.dev.yaml          development environment with hot reload
├── .env.example              Docker Compose configuration example
└── .nvmrc                    recommended local Node.js version

```

## Development with Docker
For frontend and backend hot reload we can run:

```bash
docker compose -f compose.dev.yaml up
```

## Environment Variables
The project includes three environment files
- "/.env.example" for Docker Compose
- "/backend/.env.example" for backend `npm`
- "/frontend/.env.example" for frontend `npm`

### Docker Compose

| Variable                 | Description                          |
| ------------------------ | ------------------------------------ |
| `POSTGRES_USER`          | PostgreSQL user                      |
| `POSTGRES_PASSWORD`      | database password                    |
| `POSTGRES_DB`            | database name                        |
| `JWT_SECRET`             | Key to sign access tokens            |
| `JWT_EXPIRES_IN_SECONDS` | Token lifetime in seconds            |
| `JWT_ISSUER`             | JWT issuer                           |
| `JWT_AUDIENCE`           | JWT audience                         |
| `BCRYPT_ROUNDS`          | bcrypt hashing cost                  |
| `FRONTEND_PORT`          | Frontend host port                   |
| `BACKEND_PORT`           | Backend host port                    |
| `FRONTEND_URL`           | Allowed CORS origin                  |
| `SITE_URL`               | Public canonical origin used for SEO |
| `NEXT_PUBLIC_API_URL`    | Public API URL in the frontend build |

### Backend

| Variable                 | Description                             |
| ------------------------ | --------------------------------------- |
| `NODE_ENV`               | Application environment                 |
| `PORT`                   | API port                                |
| `FRONTEND_URL`           | Allowed CORS origins                    |
| `DB_HOST`                | PostgreSQL host                         |
| `DB_PORT`                | PostgreSQL port                         |
| `DB_USER`                | database user                           |
| `DB_PASSWORD`            | database password                       |
| `DB_NAME`                | database name                           |
| `DB_SSL`                 | Enables TLS for the database connection |
| `BCRYPT_ROUNDS`          | bcrypt hashing cost                     |
| `JWT_SECRET`             | Secret signing key                      |
| `JWT_EXPIRES_IN_SECONDS` | Access token lifetime                   |
| `JWT_ISSUER`             | JWT issuer                              |
| `JWT_AUDIENCE`           | JWT audience                            |

### Frontend

| Variable              | Description                         |
| --------------------- | ----------------------------------- |
| `SITE_URL`            | Canonical origin used for metadata  |
| `API_URL`             | Backend API URL                     |
| `NEXT_PUBLIC_API_URL` | API URL accessible from the browser |
### Database Commands

```bash
npm run migration:show
npm run migration:run
npm run migration:revert
npm run seed
npm run seed -- --if-empty
```

Generate a new migration

```bash
npm run migration:generate -- src/database/migrations/MigrationName
```
### Development Commands

Backend:

```bash
npm run start:dev
npm run build
npm run start:prod
npm run lint
npm run format
```

Frontend:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

