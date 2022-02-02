FROM node:16

# Install packages.
RUN apt update -y && apt install -y --no-install-recommends \
    sudo \
    vim \
    && apt clean && rm -rf /var/lib/apt/lists/*

# Upgrade NPM.
RUN npm install -g npm

# Enable sudo permission.
RUN echo "node:p" | chpasswd \
    && echo "node ALL=(ALL:ALL) ALL" > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node

USER node
WORKDIR /home/node
CMD ["bash"]
