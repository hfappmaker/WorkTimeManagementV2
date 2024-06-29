FROM postgres AS db
WORKDIR /usr/src/db
EXPOSE 5432

FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye AS app
WORKDIR /usr/src/app
COPY ["./package.json","./yarn.lock","./"]
RUN sudo chown node node_modules && sudo chown node dist && yarn install
COPY ./ .
EXPOSE 3000

CMD yarn start
