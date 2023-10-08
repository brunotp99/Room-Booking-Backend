# Backend Room Booking App: Node.js, Sequelize, Postgres SQL, Heroku, Firebase | Softinsa

This is a repository for Backend Room Booking App: Node.js, Sequelize, Postgres SQL, Heroku, Firebase | Softinsa

### Prerequisites

**Node version 18.x.x**

### Cloning the repository

```shell
git clone https://github.com/brunotp99/Room-Booking-Backend.git
```

### Install packages

```shell
npm i
```

### Setup .env file


```js
DB_ADDRESS=
DB_USERNAME=
DB_PASSWORD=
DB_PORT=
DB_NAME=
JWT_SECRET=
```

### Setup Sequelize

Add Postgres SQL Database

```shell
npm install --save-dev sequelize-cli
npx sequelize-cli init
npx sequelize-cli db:migrate

```

### Start the app

```shell
npm run dev
```

## Available commands

Running commands with npm `npm run [command]`

| command         | description                              |
| :-------------- | :--------------------------------------- |
| `dev`           | Starts a development instance of the app |
