FROM node:alpine
WORKDIR /usr/bin/app
COPY . /usr/bin/app
RUN yarn install && yarn prisma generate && yarn run build
EXPOSE 80
CMD ["yarn","run","start"]