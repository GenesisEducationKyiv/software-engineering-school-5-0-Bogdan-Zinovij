FROM node:20

WORKDIR /usr/src/app

COPY libs/logger/package*.json ./libs/logger/
WORKDIR /usr/src/app/libs/logger
RUN npm install

COPY libs/logger ./
RUN npm run build

WORKDIR /usr/src/app/services/notification
COPY services/notification/package*.json ./
RUN npm install

COPY services/notification ./

COPY libs/kafka ./src/libs/kafka
COPY libs/grpc ./src/libs/grpc

RUN npm run build

EXPOSE 3001
CMD ["node", "dist/main"]
