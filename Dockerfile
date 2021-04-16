FROM zenika/alpine-chrome

USER root
RUN apk add --no-cache tini make gcc g++ python3 git nodejs nodejs-npm yarn
USER chrome
ENTRYPOINT ["tini", "--"]

# Expose the web-socket and HTTP ports
EXPOSE 8080

ENV NODE_ENV=production
RUN npm install --production
CMD [ "npm", "start" ]