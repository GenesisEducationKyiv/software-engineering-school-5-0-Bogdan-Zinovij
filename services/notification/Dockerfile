FROM node:20

WORKDIR /usr/src/app

COPY services/notification/package*.json ./
RUN npm install

COPY services/notification ./

COPY libs ./src/libs

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main"]
