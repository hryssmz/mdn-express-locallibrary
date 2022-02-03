FROM node:16

WORKDIR /opt

# Upgrade NPM.
RUN npm install -g npm

# Install dependencies.
COPY ./package-lock.json .
RUN npm install --production

# Copy compiled app (ordered by estimated update frequency in ascending order).
COPY ./package.json .
COPY ./public .
COPY ./views .
COPY ./dist .

# Run app.
CMD ["npm", "start"]
