install:
	npm install

start:
	npx nodemon --exec babel-node src/index.js

lint:
	npx eslint .

test:
	npm test
