FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

RUN npm i -g serve

EXPOSE 80

CMD [ "serve", "-s", "dist", "-l", "80" ]