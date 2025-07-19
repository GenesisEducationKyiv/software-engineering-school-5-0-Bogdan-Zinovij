FROM node:20

WORKDIR /usr/src/app

COPY services/subscription/package*.json ./
RUN npm install

COPY services/subscription ./

COPY libs ./src/libs

RUN npm run build
RUN mkdir -p dist/libs/grpc && cp -r src/libs/grpc/* dist/libs/grpc/

EXPOSE 3000

CMD ["node", "dist/main"]