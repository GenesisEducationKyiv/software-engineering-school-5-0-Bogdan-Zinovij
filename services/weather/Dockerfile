FROM node:20

WORKDIR /usr/src/app

COPY services/weather/package*.json ./services/weather/
COPY libs/logger/package*.json ./libs/logger/

COPY services/weather ./services/weather
COPY libs/logger ./libs/logger
COPY libs ./libs

WORKDIR /usr/src/app/services/weather
RUN npm install
COPY libs/kafka ./src/libs/kafka
COPY libs/grpc ./src/libs/grpc

RUN npm run build
RUN mkdir -p dist/libs/grpc && cp -r src/libs/grpc/* dist/libs/grpc/

EXPOSE 3002

CMD ["node", "dist/main"]
