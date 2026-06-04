FROM node:20-slim

WORKDIR /app

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl libssl-dev

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 8080

CMD ["npm", "start"]