FROM node:18.10.0-alpine3.15

WORKDIR /app

COPY package*.json .

RUN npm i

COPY . .

CMD ["npm", "start"]