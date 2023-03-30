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

#install nodejs and npm to build js files
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs
