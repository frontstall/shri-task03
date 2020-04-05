install:
	npm install

start:
	npx nodemon --exec babel-node src/index.js --ignore 'tmp/*'

lint:
	npx eslint .

test:
	npm test
