## About Cinetix Backend

Cinetix Backend is a Restful API integrated with the [Cinetix](https://github.com/ariqhikari/cinetix-frontend)

## Table of contents

- [Features](#features)
- [Technology](#technology)
- [Installation](#installation)
- [License](#license)

## Features

- Auth
- Now Playing Movies
- Select Showtimes
- E-Wallet (for ticket transaction)

## Technology

- [NodeJS](https://nodejs.org/en)
- [Express](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)

## Installation

Clone the repo:

```shell
git clone https://github.com/ariqhikari/cinetix-backend.git
cd cinetix-backend
```

Create file .env and insert

```shell
PORT=8000
DB_URL=cinetix
JWT_SECRET=af?>!@D12%*!__4+_+_fak123
```

You can install the dummy SQL database [here](https://github.com/ariqhikari/cinetix-backend/blob/main/cinetix.sql).

After that, run your application:

```shell
npm install
npm run start
```
