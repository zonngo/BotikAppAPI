<h1>BotikAppAPI</h1>


<h2>Requirements</h2>
1. db-migrate https://db-migrate.readthedocs.io/en/latest/
2. gulp https://gulpjs.com/

<h2>Installation</h2>
1. `git clone git@github.com:zonngo/BotikAppAPI.git`
2. `cd BotikAppAPI`
3. `cp .env.example .env</code`
4. put db credentials in the .env file
5. `npm install`
6. `db-migrate up`
7. `npm start`

<h2>Generate documentation</h2>
1. `gulp apidoc`
2. go [http://localhost:3000/apidoc]