import React from "react";
import { useNetwork } from "../hooks/useServerInfo";

const NetworkBanner = () => {
    const { network } = useNetwork()

    return (
        <>
            {(network === "prater") && (
                <div className="flex items-center gap-x-6 bg-yellow-200 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
                    <div className="text-sm leading-6 text-black">
                        ⚠️ Using the {network} test network ⚠️
                    </div>
                </div>
            )}
        </>
    );
};

export default NetworkBanner


