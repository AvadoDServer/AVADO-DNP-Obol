import type { NextPage } from 'next';

import CharonCommandField from '../components/ObolCommandField'
import DownloadBackup from '../components/DownloadBackup';
import { server_config } from "../server_config"
import { useNetwork } from '../hooks/useServerInfo';
import SupervisorStatus from '../components/SupervisorStatus';
import RestoreBackup from '../components/RestoreBackup';


const AdminPage: NextPage = () => {
    const { network } = useNetwork()

    const restartService = (service: string) => {
        fetch(`${server_config.monitor_url}/service/${service}/restart`, { method: 'POST' })
    }

    return (
        <>
            <SupervisorStatus />
            <br />
            <br />
            <CharonCommandField />
            <br />
            <br />
            <p>Download backup</p>
            <DownloadBackup />
            <br />
            <br />
            <p>Restore backup</p>
            <RestoreBackup />
            <br />
            <br />
            <p>Restart Obol Charon daemon</p>
            <button
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => restartService("charon")}>
                Restart
            </button>
            <p>Restart Teku validator</p>
            <button
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => restartService("teku")}>
                Restart
            </button>
        </>
    )
}

export default AdminPage;
