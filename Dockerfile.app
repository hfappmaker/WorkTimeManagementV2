FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye
WORKDIR /usr/src/app
COPY ["./package.json","./yarn.lock","./"]
RUN yarn install
COPY ./ .
EXPORT 3000

CMD yarn start
