FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Prisma generate (safe for Cloud Run)
RUN npx prisma generate

EXPOSE 8080

CMD ["npm", "start"]