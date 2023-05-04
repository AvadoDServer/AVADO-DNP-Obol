#!/bin/bash

NETWORK="prater"
DATA_PATH="/data/data-${NETWORK}/"
mkdir -p ${DATA_PATH}

GRAFFITI="Avado Obol"

KEYMANAGER_TOKEN="/data/data-${NETWORK}/keymanagertoken"
if [[ ! -e ${KEYMANAGER_TOKEN} ]]; then
  openssl rand -hex 32 >${KEYMANAGER_TOKEN}
fi

# Start Nimbus Validator
exec /usr/local/bin/nimbus_validator_client \
  --log-level=info \
  --data-dir="${DATA_PATH}" \
  --doppelganger-detection=false \
  --non-interactive \
  --keymanager \
  --keymanager-token-file="${KEYMANAGER_TOKEN}" \
  --validators-dir="/data/charon/validator_keys" \
  --secrets-dir="/data/charon/validator_keys" \
  --graffiti="${GRAFFITI}" \
  --beacon-node="http://localhost:3600"
