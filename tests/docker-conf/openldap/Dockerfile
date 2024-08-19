# -----------------
# Openldap service
#
# from https://github.com/dinkel/docker-openldap
# -----------------
FROM debian:buster-slim
LABEL org.opencontainers.image.authors="3Liz"

# properly setup debian sources
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get -y update && apt-get install -y --no-install-recommends \
      slapd \
      ldap-utils \
      openssl ssl-cert \
    && apt-get clean \
    && adduser openldap ssl-cert \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && mv /etc/ldap /etc/ldap.dist

COPY entrypoint.sh /bin/entrypoint.sh
COPY ctl.sh /bin/ctl.sh

RUN chmod 755 /bin/entrypoint.sh /bin/ctl.sh

# Expose default ldap and ldaps ports
EXPOSE 389 636

ENTRYPOINT ["/bin/entrypoint.sh"]

CMD ["slapd", "-d", "32768", "-u", "openldap", "-g", "openldap", "-h", "ldap:/// ldapi:///"]
