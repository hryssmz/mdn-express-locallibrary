FROM node:16

ARG USERNAME=dev
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Install packages.
RUN apt update -y && apt install -y --no-install-recommends \
    sudo \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a user.
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo "$USERNAME ALL=(ALL:ALL) NOPASSWD:ALL" > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME
