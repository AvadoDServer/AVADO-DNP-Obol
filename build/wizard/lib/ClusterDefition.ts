export type clusterDefinitionType = {
    "name": string,
    "uuid": string,
    "creator": {
        "address": string,
        "config_signature": string
    },
    "version": string,
    "num_validators": number,
    "threshold": number,
    "dkg_algorithm": string,
    "fork_version": string,
    "config_hash": string,
    "timestamp": string,
    "operators": [
        {
            "address": string,
            "enr": string,
            "enr_signature": string,
            "config_signature": string
        }],
    "validators": [
        {
            "fee_recipient_address": string,
            "withdrawal_address": string
        }
    ],
    "definition_hash": string
}