FROM node:20

WORKDIR /usr/src/app

COPY services/notification/package*.json ./
RUN npm install

COPY services/notification ./

COPY libs ./src/libs

RUN npm run build
RUN mkdir -p dist/libs/grpc && cp -r src/libs/grpc/* dist/libs/grpc/

EXPOSE 3001

CMD ["node", "dist/main"]
