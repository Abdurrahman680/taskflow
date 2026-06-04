FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Prisma generate
RUN npx prisma generate

EXPOSE 8080

CMD ["npm", "start"]