#!/usr/bin/env bash

# Verify proper argument usage
if [[ -z $1 || -n $2 ]]; then
    echo "Usage: bash build.sh <project-dir>"
    exit 1
fi

DOCKER_CLI=""

if command -v docker &> /dev/null; then
    DOCKER_CLI="docker"
elif command -v podman &> /dev/null; then
    DOCKER_CLI="podman"
else
    echo "Docker and Podman not installed"
    exit 1
fi

${DOCKER_CLI} run --rm \
    -v ${PWD}/$1:/code \
    -v ${HOME}/.cargo/registry:/cargo/registry \
    -v ${HOME}/.cargo/git:/cargo/git \
    softprops/lambda-rust
