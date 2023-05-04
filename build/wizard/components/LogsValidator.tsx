import { useEffect, useState } from "react";
import { server_config } from "../server_config";
import AnsiToHtml from 'ansi-to-html';

const LogsValidator = () => {

    const [log, setLog] = useState<string>("Loading...");
    useEffect(() => { refresh() }, [])

    const refresh = async () => {
        const response = await window.fetch(`${server_config.monitor_url}/logs-validator`)
        const result = await response.json()
        setLog(result)
    }

    // Create an instance of AnsiToHtml
    const ansiToHtmlConverter = new AnsiToHtml({ escapeXML: true });
    // Convert the output string with ANSI escape codes to HTML
    const outputHtml = ansiToHtmlConverter.toHtml(log);

    return (
        <>
            <h2 className="title is-3 has-text-white">Validator logs</h2>
            <div className="w-full max-w-sm">


                {log && (
                    <>
                        {/* <div className="container"> */}
                        <pre className="transcript" dangerouslySetInnerHTML={{ __html: outputHtml }} />
                        {/* <pre className="transcript">
                            {log.replace(/\\n/g, "\n")}
                        </pre> */}
                        {/* </div> */}
                    </>
                )}
                <button className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
                    type="button"
                    onClick={refresh}
                >
                    Refresh
                </button>
            </div>
        </>
    );
}


export default LogsValidator