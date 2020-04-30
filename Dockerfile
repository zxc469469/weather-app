FROM node:12.14.1 as builder
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

FROM node:12.14.1
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/build .
CMD ["serve", "-p", "8001", "-s", "."]


