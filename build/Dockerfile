ARG UPSTREAM_VERSION
ARG NIMBUS_VERSION
ARG TEKU_VERSION

FROM node:18.15.0 as builder

# build wizard
WORKDIR /usr/src/app/wizard
COPY wizard .
RUN yarn --frozen-lockfile
RUN rm -Rf build && yarn run build

# Monitor
WORKDIR /usr/src/monitor
COPY monitor .
RUN yarn --frozen-lockfile
RUN rm -Rf build && yarn run build
RUN rm -Rf node_modules
RUN yarn --production

FROM --platform=linux/amd64 obolnetwork/charon:${UPSTREAM_VERSION} as charon
# FROM --platform=linux/amd64 statusim/nimbus-eth2:amd64-${NIMBUS_VERSION} as nimbus-bc
# FROM --platform=linux/amd64 statusim/nimbus-validator-client:amd64-${NIMBUS_VERSION} as nimbus-vc
FROM --platform=linux/amd64 consensys/teku:${TEKU_VERSION} as teku

####### Main image

FROM --platform=linux/amd64 node:18.15.0

COPY --from=charon /usr/local/bin/charon /usr/local/bin/charon
# COPY --from=nimbus-bc /home/user/nimbus_beacon_node /usr/local/bin/nimbus_beacon_node
# COPY --from=nimbus-vc /home/user/nimbus_validator_client /usr/local/bin/nimbus_validator_client
COPY --from=teku /opt/teku/ /opt/teku/

RUN mkdir -p /etc/ssl/certs/java

RUN apt-get -y clean && apt-get -y update && apt-get -y upgrade && apt-get -y install \
    ca-certificates-java 
RUN apt-get -y install \
    openjdk-17-jre-headless \
    gettext\
    jq \
    nginx \
    sudo \
    supervisor \
    vim-tiny \
    && rm -rf /var/lib/apt/lists/*

RUN curl "https://iso.ava.do/my.ava.do.crt" --output /etc/nginx/my.ava.do.crt --silent
RUN curl "https://iso.ava.do/my.ava.do.key" --output /etc/nginx/my.ava.do.key --silent

RUN openssl pkcs12 -export -in /etc/nginx/my.ava.do.crt -inkey /etc/nginx/my.ava.do.key -out /opt/teku/my.ava.do.p12 -name myavado -CAfile myavado.crt -caname root -password  pass:avadoKeyStorePassword
RUN keytool -importkeystore -deststorepass avadoKeyStorePassword -destkeystore /opt/teku/avado.keystore  -srckeystore /opt/teku/my.ava.do.p12 -srcstoretype PKCS12 -srcstorepass avadoKeyStorePassword -alias myavado
RUN echo "avadoKeyStorePassword" > /opt/teku/keystorePasswordFile

RUN useradd -s /bin/false nginx

# copy wizard & monitor
COPY --from=builder /usr/src/app/wizard/out /usr/local/wizard
COPY --from=builder /usr/src/monitor/ /usr/local/monitor

COPY startCharon.sh /
COPY startNimbus.sh /
COPY startTeku.sh /
RUN chmod a+x /startCharon.sh /startNimbus.sh /startTeku.sh


COPY supervisord.conf /etc/supervisord.conf
COPY nginx.conf /etc/nginx/

WORKDIR /
ENTRYPOINT ["supervisord", "--nodaemon", "--configuration", "/etc/supervisord.conf"]


