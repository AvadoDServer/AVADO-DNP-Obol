#!/bin/bash
NETWORK="prater"
DATA_PATH="/data/data-${NETWORK}/"
mkdir -p ${DATA_PATH}

GRAFFITI="Avado Obol"

KEYMANAGER_TOKEN="${DATA_PATH}/keymanagertoken"

# Clean up stale locks if they exist
if compgen -G "/data/data-${NETWORK}/validator/key-manager/local/*.json.lock" >/dev/null; then
  echo "Found validator locks at startup."
  rm /data/data-${NETWORK}/validator/key-manager/local/*.json.lock
fi

until [ -d "/data/charon/validator_keys" ]; do
  echo "Waiting for validator keys"
  sleep 30
done

# exec /opt/teku/bin/teku --version

echo "Starting Teku"

# Start teku
echo "exec /opt/teku/bin/teku validator-client \
  --beacon-node-api-endpoint="http://localhost:3600" \
  --data-base-path="${DATA_PATH}" \
  --network="${NETWORK}" \
  --validator-keys="/data/charon/validator_keys:/data/charon/validator_keys" \
  --validators-keystore-locking-enabled=false \
  --validators-graffiti="${GRAFFITI}" \
  --validators-proposer-default-fee-recipient="0x0000000000000000000000000000000000000000" \
  --validator-api-cors-origins="*" \
  --validator-api-enabled=true \
  --validator-api-host-allowlist="*" \
  --validator-api-interface="0.0.0.0" \
  --validator-api-keystore-file=/opt/teku/avado.keystore \
  --validator-api-keystore-password-file=/opt/teku/keystorePasswordFile \
  --validator-api-port=5052"

exec /opt/teku/bin/teku validator-client \
  --beacon-node-api-endpoint="http://localhost:3600" \
  --data-base-path="${DATA_PATH}" \
  --network="${NETWORK}" \
  --validator-keys="/data/charon/validator_keys:/data/charon/validator_keys" \
  --validators-keystore-locking-enabled=false \
  --validators-graffiti="${GRAFFITI}" \
  --validators-proposer-default-fee-recipient="0x0000000000000000000000000000000000000000" \
  --validator-api-cors-origins="*" \
  --validator-api-enabled=true \
  --validator-api-host-allowlist="*" \
  --validator-api-interface="0.0.0.0" \
  --validator-api-keystore-file=/opt/teku/avado.keystore \
  --validator-api-keystore-password-file=/opt/teku/keystorePasswordFile \
  --validator-api-port=5052 \
  --validators-proposer-config=http://localhost:3600/teku_proposer_config \
  --validators-proposer-blinded-blocks-enabled=true 
