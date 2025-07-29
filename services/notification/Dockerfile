FROM node:20

WORKDIR /usr/src/app

COPY libs/logger ./libs/logger
COPY libs/metrics ./libs/metrics

WORKDIR /usr/src/app/libs/logger
RUN npm install
RUN npm run build

WORKDIR /usr/src/app/libs/metrics
RUN npm install
RUN npm run build

WORKDIR /usr/src/app/services/notification
COPY services/notification/package*.json ./
RUN npm install

COPY services/notification ./

COPY libs/kafka ./src/libs/kafka

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main"]
