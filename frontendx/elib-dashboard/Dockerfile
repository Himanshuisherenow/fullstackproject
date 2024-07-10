FROM node:18-alpine

WORKDIR  /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production

RUN npm ci 
#--omit=dev

COPY --from=builder /app/dist ./dist



