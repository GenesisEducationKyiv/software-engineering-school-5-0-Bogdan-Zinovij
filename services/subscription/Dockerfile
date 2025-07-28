FROM node:20

WORKDIR /usr/src/app

COPY services/subscription/package*.json ./services/subscription/
COPY libs/logger/package*.json ./libs/logger/

COPY services/subscription ./services/subscription
COPY libs/logger ./libs/logger
COPY libs ./libs

WORKDIR /usr/src/app/services/subscription
RUN npm install
COPY libs/kafka ./src/libs/kafka
COPY libs/grpc ./src/libs/grpc

RUN npm run build

RUN mkdir -p dist/libs/grpc && cp -r src/libs/grpc/* dist/libs/grpc/

EXPOSE 3000

CMD ["node", "dist/main"]
