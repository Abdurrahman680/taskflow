FROM node:20-slim

WORKDIR /app

# Install OpenSSL (required)
RUN apt-get update -y && apt-get install -y openssl libssl-dev

# 🔥 FORCE Prisma to use OpenSSL 3
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 8080

CMD ["npm", "start"]