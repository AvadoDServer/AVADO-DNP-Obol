#!/bin/sh

# Create your charon ENR private key, this will create a charon-enr-private-key file in the .charon directory

echo "Preparing node to start"

DATA_DIR=/data/charon
PRIVATE_KEY_FILE=${DATA_DIR}/charon-enr-private-key
if [ ! -f ${PRIVATE_KEY_FILE} ]; then
    echo "Creating Obol Charon ENR private key"
    /usr/local/bin/charon --data-dir=${DATA_DIR} create enr
    /usr/local/bin/charon --data-dir=${DATA_DIR} enr >${DATA_DIR}/charon-enr
fi

CHARON_BEACON_NODE_ENDPOINTS="http://teku.my.ava.do:5051"
#CHARON_BEACON_NODE_ENDPOINTS="http://209.35.77.243:50520"

export CHARON_LOG_LEVEL=${CHARON_LOG_LEVEL:-info}
export CHARON_LOG_FORMAT=${CHARON_LOG_FORMAT:-console}
export CHARON_P2P_RELAYS=${CHARON_P2P_RELAYS:-https://0.relay.obol.tech}
export CHARON_P2P_EXTERNAL_HOSTNAME=${CHARON_P2P_EXTERNAL_HOSTNAME:-} # Empty default required to avoid warnings.
export CHARON_P2P_TCP_ADDRESS=0.0.0.0:${CHARON_PORT_P2P_TCP:-3610}
export CHARON_VALIDATOR_API_ADDRESS=0.0.0.0:3600
export CHARON_MONITORING_ADDRESS=0.0.0.0:3620

CLUSTER_LOCK="${DATA_DIR}/cluster-lock.json"
until [ -f ${CLUSTER_LOCK} ]; do
    echo "Waiting for cluster file"
    sleep 30
done

echo "Running: /usr/local/bin/charon run --lock-file ${CLUSTER_LOCK} --private-key-file=${PRIVATE_KEY_FILE} --beacon-node-endpoints=${CHARON_BEACON_NODE_ENDPOINTS} --monitoring-address=${CHARON_MONITORING_ADDRESS}  --builder-api"

/usr/local/bin/charon run --lock-file ${CLUSTER_LOCK} --private-key-file=${PRIVATE_KEY_FILE} --beacon-node-endpoints=${CHARON_BEACON_NODE_ENDPOINTS} --monitoring-address=${CHARON_MONITORING_ADDRESS}  --builder-api
