import { readFileSync } from "fs";

const localdev = false;

const network = () => {
    var env_network = process.env.NETWORK ?? "goerli" // use goerli by default
    if (env_network === "prater") env_network = "goerli" // use goerli if env variable is set to prater
    return env_network
}

const validator_data_path = `/data/data-${network().replace("goerli", "prater")}`
export const server_config = {
    network: network(),
    name: "obol",
    keymanager_token_path: `${validator_data_path}/validator/key-manager/validator-api-bearer`,
    validator_path: validator_data_path,
    https_options: localdev ? {} : {
        key: readFileSync('/etc/nginx/my.ava.do.key'),
        certificate: readFileSync('/etc/nginx/my.ava.do.crt')
    },
    keymanager_url: `https://obol.my.ava.do:5052`,
    packageName: "obol.avado.dappnode.eth"
}