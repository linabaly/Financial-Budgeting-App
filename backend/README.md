# The Backend
## Technologies
- Language(s): TypeScript
- Interpreter: >= Node.js v20
- Database: MariaDB (using Prisma ORM)
- Server: NGINX

## How to Run Development Server
1. Change directory to the backend: `cd backend`.
2. Run `npm install`
3. Ensure all dependencies are installed and/or running: `npm install` and make sure you have a MariaDB server available.
4. Configure your config file (`.env`). `cp .example.env .env`. The example file provides all available config options + their explanations.
5. Run the server: `npm run-script start`. (Use `npx ts-node index.ts` if the prior command doesn't work).



# Maintainers
Contact Matthew Ray, `mcray@rollins.edu`, for inquiries regarding the backend for this application.
