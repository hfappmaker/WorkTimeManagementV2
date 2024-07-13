FROM node:alpine
WORKDIR /usr/bin/app
COPY . /usr/bin/app
RUN yarn install && yarn prisma generate
CMD ["yarn","run","start"]