ARG php_version=8.1

FROM 3liz/liz-php-cli:${php_version}

ARG php_version
ARG DEBIAN_FRONTEND=noninteractive
ENV PHP_VERSION=${php_version}

RUN export DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
        make \
        git \
        zip \
    ; apt-get clean

# Install nodejs and npm to build js files
RUN apt-get install -y ca-certificates curl gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install nodejs -y
