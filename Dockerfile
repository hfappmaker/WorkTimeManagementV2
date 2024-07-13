FROM node:alpine
WORKDIR /usr/bin/app
COPY . /usr/bin/app
RUN yarn install && yarn prisma generate && yarn run build
CMD ["yarn","run","start"]