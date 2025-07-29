FROM node:20

WORKDIR /usr/src/app

COPY libs/logger/package*.json ./libs/logger/
WORKDIR /usr/src/app/libs/logger
RUN npm install

COPY libs/logger ./
RUN npm run build

WORKDIR /usr/src/app/services/api-gateway
COPY services/api-gateway/package*.json ./
RUN npm install

COPY services/api-gateway ./

COPY libs/kafka ./src/libs/kafka
COPY libs/grpc ./src/libs/grpc

RUN npm run build
RUN mkdir -p dist/libs/grpc && cp -r src/libs/grpc/* dist/libs/grpc/

EXPOSE 3004

CMD ["node", "dist/main"]
