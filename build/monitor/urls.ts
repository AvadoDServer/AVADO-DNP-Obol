import { server_config } from "./server_config";

const network = server_config.network

export const supported_beacon_chain_clients = ["prysm", "teku", "nimbus"];
export const supported_execution_clients = ["geth", "nethermind"];

export const client_url = (client: string) => {
    switch (client) {
        case "prysm": switch (network) {
            case "goerli": return "eth2validator-prater.my.ava.do"
            case "mainnet": return "eth2validator.my.ava.do"
        }
        case "nimbus": switch (network) {
            case "goerli": return "nimbus-prater.my.ava.do"
            case "mainnet": return "nimbus.my.ava.do"
        }
        case "nethermind": switch (network) {
            case "goerli": return "nethermind-goerli.my.ava.do"
            case "mainnet": return "nethermind.my.ava.do"
        }
        case "geth": switch (network) {
            case "goerli": return "goerli-geth.my.ava.do"
            case "mainnet": return "geth.my.ava.do"
        }
        default/*"geth"*/: switch (network) {
            case "goerli": return "teku-prater.my.ava.do"
            case "mainnet": return "teku.my.ava.do"
        }
    }
}

export const rest_url = (client: string) => {
    switch (client) {
        case "prysm": return `http://prysm-beacon-chain-${network.replace("goerli", "prater")}.my.ava.do:3500`
        case "nimbus": return `http://nimbus-${network.replace("goerli", "prater")}.my.ava.do:5052`
        case "geth":
        case "nethermind": return `http://${client_url(client)}:8545`
        default: return `http://${client_url(client)}:5051`
    }
}

export const validatorAPI = (client: string) => {
    switch (client) {
        case "prysm": return "http://" + client_url(client) + ":7500"
        case "nimbus":
        case "teku": return `https://${client_url(client)}:5052`
    }
}

export const getAvadoPackageName = (client: string, type: "beaconchain" | "validator") => {
    switch (client) {
        case "prysm": switch (type) {
            case "beaconchain": return `prysm-beacon-chain-${network.replace("goerli", "prater")}.avado.dnp.dappnode.eth`
            case "validator": return (network === "goerli") ? "eth2validator-prater.avado.dnp.dappnode.eth" : "eth2validator.avado.dnp.dappnode.eth"
        }
        case "nimbus": return (network === "goerli") ? "nimbus-prater.avado.dnp.dappnode.eth" : "nimbus.avado.dnp.dappnode.eth"
        default /*"teku"*/: return (network === "goerli") ? "teku-prater.avado.dnp.dappnode.eth" : "teku.avado.dnp.dappnode.eth"
    }
}

export const getAvadoExecutionClientPackageName = (client: string) => {
    switch (client) {
        case "nethermind": return (network === "goerli") ? "nethermind-goerli.avado.dnp.dappnode.eth" : "avado-dnp-nethermind.avado.dnp.dappnode.eth"
        default /*"geth"*/: return (network === "goerli") ? "goerli-geth.avado.dnp.dappnode.eth" : "geth.avado.dnp.dappnode.eth"
    }
}

export const getTokenPathInContainer = (client: string) => {
    switch (client) {
        case "prysm": return "/usr/share/nginx/wizard/auth-token.txt"
        case "nimbus": return `/data/data-${network.replace("goerli", "prater")}/keymanagertoken`
        default /* "teku" */: return `/data/data-${network.replace("goerli", "prater")}/validator/key-manager/validator-api-bearer`

    }
}