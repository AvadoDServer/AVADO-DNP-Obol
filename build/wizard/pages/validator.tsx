import type { NextPage } from 'next';

import CharonCommandField from '../components/ObolCommandField'
import DownloadBackup from '../components/DownloadBackup';
import { server_config } from "../server_config"
import { useEffect, useState } from 'react';
import { etherscanAddressUrl, etherscanTransactionUrl } from '../utils/utils';
import { useNetwork } from '../hooks/useServerInfo';
import LogsValidator from '../components/LogsValidator';
import SupervisorStatus from '../components/SupervisorStatus';


const ValidatorPage: NextPage = () => {
    const { network } = useNetwork()

    const restartService = (service: string) => {
        fetch(`${server_config.monitor_url}/service/${service}/restart`, { method: 'POST' })
    }

    return (
        <>
            <SupervisorStatus />
            <br />
            <br />

            <p>Restart Teku validator</p>
            <button
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => restartService("teku")}>
                Restart Teku validator
            </button>
            <br />
            <br />
            <LogsValidator />
        </>
    )
}

export default ValidatorPage;
