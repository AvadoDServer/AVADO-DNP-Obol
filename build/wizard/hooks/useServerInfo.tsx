import useSWR from "swr";
import { server_config } from "../server_config"
import { bcClientType, ecClientType, networkType } from "../types";
import { ClusterLockType } from "../lib/ClusterLock";

const get = (api_url: string) => {
    const fetcher = async (url: string) => await fetch(url).then((res) => res.json());
    return useSWR(api_url, fetcher);
}

export function useNetwork() {
    const api_url: string = `${server_config.monitor_url}/network`;
    const { data, error } = get(api_url)
    const network: networkType = data?.replace("goerli", "prater") ?? "mainnet"
    return { network, error };
}

export function useBeaconChainClientAndValidator() {
    const api_url: string = `${server_config.monitor_url}/bc-clients`;
    const { data, error } = get(api_url)
    const bcClient = (data ? data[0] : []) as bcClientType
    return { bcClient, error };
}

export function useExecutionClient() {
    const api_url: string = `${server_config.monitor_url}/ec-clients`;
    const { data, error } = get(api_url)
    const ecClient = (data ? data[0] : []) as ecClientType
    return { ecClient, error };
}

export function useENR() {
    const api_url: string = `${server_config.monitor_url}/enr`
    return get(api_url)
}

export function useClusterLock() {
    const api_url: string = `${server_config.monitor_url}/cluster-lock.json`;
    const { data, error } = get(api_url)
    const json = data ? data as ClusterLockType : undefined
    return { json, error };
}

export function useBeaconNodeStatus() {
    const api_url: string = `${server_config.monitor_url}/rest/eth/v1/node/syncing`;
    const { data, error } = get(api_url)
    if (error)
        console.log(error)
    return { data: data?.data, error: error };
}
