import { useEffect, useState } from "react";
import { useClusterLock, useNetwork } from "../hooks/useServerInfo";
import { abbreviatePublicKey, beaconchainUrl } from "../utils/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSatelliteDish } from "@fortawesome/free-solid-svg-icons";

const Links = () => {
    const { json: clusterLock } = useClusterLock()
    const { network } = useNetwork()

    return (
        <>
            <h2 className="title is-3 has-text-white">Links:</h2>
            {clusterLock && clusterLock.lock_hash && (
                <ul>
                    {network == "prater" && (
                        <li >
                            <a href={`https://goerli.launchpad.obol.tech/dv#${clusterLock.cluster_definition.config_hash}`}>Obol Goerli launchpad for {abbreviatePublicKey(clusterLock.cluster_definition.config_hash)}</a>
                        </li>
                    )}
                    {clusterLock.distributed_validators.map(dv => <li key={dv.distributed_public_key}>
                        {beaconchainUrl(network, dv.distributed_public_key, <><FontAwesomeIcon className="icon" icon={faSatelliteDish} /> {abbreviatePublicKey(dv.distributed_public_key)}</>)}
                    </li>)}
                </ul>
            )}
        </>
    );
}


export default Links
