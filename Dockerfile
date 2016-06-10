FROM node:6

RUN useradd --user-group --create-home --shell /bin/false service

ENV HOME=/home/service
RUN mkdir -p $HOME/api-server

RUN npm install pm2 -g

COPY package.json $HOME/api-server/
RUN chown -R service:service $HOME/*

USER service
WORKDIR $HOME/api-server
RUN npm install

USER root
COPY . $HOME/api-server/
RUN chown -R service:service $HOME/*
USER service

CMD ["node", "src/index.js"]
