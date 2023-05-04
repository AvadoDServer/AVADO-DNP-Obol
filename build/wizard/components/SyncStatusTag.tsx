import React from "react";

interface Props {
    clientStatus: any,
    label?: string
}

const SyncStatusTag = ({ clientStatus, label }: Props) => {
    const progress = clientStatus?.is_sycing ? "syncing" : "synced"

    var message = ""
    var className = "";

    if (!clientStatus) {
        className = "bg-red-200 text-red-700"
        message = `${(label ? `${label} ` : "")}not connected`
    } else {
        className = progress === "synced" ? "bg-green-200 text-green-700" : "bg-yellow-200 text-yellow-700"
        message = (label ? `${label} ` : "") + progress
    }


    return (
        <div className={`ml-4 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 ${className} rounded-full`}>
            {message}
        </div>
    );
};

export default SyncStatusTag


