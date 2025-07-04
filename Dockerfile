FROM node:lts
WORKDIR /app
COPY *.json ./
RUN npm install
COPY . .
CMD [ "npm" , "start"]
