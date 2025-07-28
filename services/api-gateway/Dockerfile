FROM node:20

WORKDIR /usr/src/app

COPY services/api-gateway/package*.json ./services/api-gateway/
COPY libs/logger/package*.json ./libs/logger/

COPY services/api-gateway ./services/api-gateway
COPY libs/logger ./libs/logger
COPY libs ./libs

WORKDIR /usr/src/app/services/api-gateway
RUN npm install

COPY libs/kafka ./src/libs/kafka
COPY libs/grpc ./src/libs/grpc

RUN npm run build
RUN mkdir -p dist/libs/grpc && cp -r src/libs/grpc/* dist/libs/grpc/

EXPOSE 3004

CMD ["node", "dist/main"]
