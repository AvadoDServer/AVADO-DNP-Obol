import { server_config } from "./server_config";

const network = server_config.network

export const supported_beacon_chain_clients = ["prysm", "teku", "nimbus"];
export const supported_execution_clients = ["geth", "nethermind"];


export const getAvadoValidatorPackageBaseName = (client: string) => {
    switch (client) {
        case "prysm": return (network === "goerli") ? "eth2validator-prater" : "eth2validator"
        case "nimbus": return (network === "goerli") ? "nimbus-prater" : "nimbus"
        case "teku":
        default:
            return (network === "goerli") ? "teku-prater" : "teku"
    }
}

export const getAvadoBeaconChainPackageBaseName = (client: string) => {
    switch (client) {
        case "prysm": return `prysm-beacon-chain-${network.replace("goerli", "prater")}`
        case "nimbus": return (network === "goerli") ? "nimbus-prater" : "nimbus"
        case "teku":
        default:
            return (network === "goerli") ? "teku-prater" : "teku"
    }
}

export const getAvadoExecutionClientPackageBaseName = (client: string) => {
    switch (client) {
        case "nethermind": switch (network) {
            case "goerli": return "nethermind-goerli"
            case "mainnet": return "avado-dnp-nethermind"
        }
        case "geth":
        default:
            switch (network) {
                case "goerli": return "goerli-geth"
                case "mainnet": return "ethchain-geth"
            }
    }
}

export const bc_client_url = (client: string) => {
    return `${getAvadoBeaconChainPackageBaseName(client)}.my.ava.do`
}

export const vc_client_url = (client: string) => {
    return `${getAvadoValidatorPackageBaseName(client)}.my.ava.do`
}

export const ec_client_url = (client: string) => {
    return `${getAvadoExecutionClientPackageBaseName(client)}.my.ava.do`
}

export const rest_url = (client: string) => {
    switch (client) {
        case "prysm": return `http://${bc_client_url(client)}:3500`
        case "nimbus": return `http://${bc_client_url(client)}:5052`
        case "teku": return `http://${bc_client_url(client)}:5051`
        case "geth":
        case "nethermind":
        default:
            return `http://${ec_client_url(client)}:8545`
    }
}

export const validatorAPI = (client: string) => {
    switch (client) {
        case "prysm": return `http://${vc_client_url(client)}:7500`
        case "nimbus":
        case "teku":
        default:
            return `https://${vc_client_url(client)}:5052`
    }
}

export const getAvadoBeaconChainPackageName = (client: string) => {
    return `${getAvadoBeaconChainPackageBaseName(client)}.avado.dnp.dappnode.eth`
}

export const getAvadoExecutionClientPackageName = (client: string) => {
    if (client == "nethermind" && network === "mainnet") {
        return "avado-dnp-nethermind.public.dappnode.eth"
    } else {
        return `${getAvadoExecutionClientPackageBaseName(client)}.avado.dnp.dappnode.eth`
    }
}