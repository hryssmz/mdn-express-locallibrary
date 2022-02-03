FROM node:16

WORKDIR /opt

# Install dependencies.
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install --production

# Copy compiled app (ordered by estimated update frequency in ascending order).
COPY ./public ./public
COPY ./views ./views
COPY ./dist ./dist
