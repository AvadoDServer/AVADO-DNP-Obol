
import { useEffect, useState } from "react";
import { server_config } from "../server_config";
import AnsiToHtml from 'ansi-to-html';

const SupervisorStatus = () => {

    const [status, setStatus] = useState<any[]>();
    useEffect(() => {
        const interval = setInterval(async () => {
            window.fetch(`${server_config.monitor_url}/service/status`)
                .then(async (res) => {
                    const data = await (res.json())
                    // console.log(data)
                    setStatus(data);
                }, (err) => {
                    setStatus([]);
                });
        }, 5 * 1000); // 5 seconds refresh
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <h2 className="title is-3 has-text-white">Services statuses:</h2>
            {status && (
                <ul>
                    {status.map((program) =>
                        <li key={program.name}>
                            <b>{program.name}</b>: {program.statename}
                        </li>
                    )}
                </ul>
            )}
            {!status && (
                <p>Loading...</p>
            )}
        </>
    );
}


export default SupervisorStatus
