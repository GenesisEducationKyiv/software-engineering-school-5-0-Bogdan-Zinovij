FROM node:20

WORKDIR /usr/src/app

COPY services/api-gateway/package*.json ./
RUN npm install

COPY services/api-gateway ./

COPY libs ./src/libs

RUN npm run build
RUN mkdir -p dist/libs/grpc && cp -r src/libs/grpc/* dist/libs/grpc/

EXPOSE 3004

CMD ["node", "dist/main"]