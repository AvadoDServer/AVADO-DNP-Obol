import { useNetwork } from "../hooks/useServerInfo";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { clusterDefinitionType } from "../lib/ClusterDefition";
import { server_config } from "../server_config";
import AnsiToHtml from 'ansi-to-html';

interface Props {
    onFinish?: () => void
}

const RunDKG = ({ onFinish }: Props) => {
    const { network } = useNetwork()

    const [feedback, setFeedback] = useState<string | undefined>("");
    const [showDropzone, setShowDropzone] = useState(true);
    const [clusterDefinition, setClusterDefinition] = useState<clusterDefinitionType>();
    const [file, setFile] = useState<any>();
    const [output, setOutput] = useState('');

    // Create an instance of AnsiToHtml
    const ansiToHtmlConverter = new AnsiToHtml({ escapeXML: true });

    // Convert the output string with ANSI escape codes to HTML
    const outputHtml = ansiToHtmlConverter.toHtml(output);

    const runDkg = async () => {
        try {
            //1. upload cluster config file and run DKG
            const formData = new FormData();
            formData.append('jsonFile', file);

            const response = await fetch(`${server_config.monitor_url}/runDkg`, {
                method: 'POST',
                body: formData,
            });

            console.log(response)

            // Read the streaming response and update the output state
            const reader = response.body?.getReader();
            if (reader) {
                const decoder = new TextDecoder('utf-8');
                let result: string = '';

                while (true) {
                    const { value, done } = await reader.read();
                    if (value) {
                        result += decoder.decode(value);
                        setOutput(result);
                    }
                    if (done) {
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching command output:', error);
        }
    }

    type validateFileFunction = {
        success: boolean,
        error?: string
    }

    const onFileReceived = (fileContent: string) => {
        const clusterDefinition = JSON.parse(fileContent) as clusterDefinitionType;
        setClusterDefinition(clusterDefinition)
    };

    const onDrop = useCallback((acceptedFiles: any) => {
        const validateFile = (fileContent: string): validateFileFunction => {
            try {
                const clusterDefinition = JSON.parse(fileContent) as clusterDefinitionType;
                if (clusterDefinition.name && clusterDefinition.version) {
                    return { success: true }
                }

                return { success: false, error: `Invalid cluster definition file` }
            } catch (e) {
                console.error(e)
                return { success: false, error: "Invalid JSON file" }
            }
        }

        acceptedFiles.forEach((file: any) => {
            var reader = new FileReader();

            reader.onload = function (evt: any) {
                if (evt.target.readyState != 2) return;
                if (evt.target.error) {
                    alert("Error while reading file");
                    return;
                }

                const filecontent = evt.target.result;

                const validationResult = validateFile(filecontent)
                if (validationResult.success) {
                    setShowDropzone(false);
                    onFileReceived(filecontent);
                    setFeedback(undefined)
                    setFile(file)
                } else {
                    setFeedback(validationResult!.error)
                }
            };

            reader.readAsText(file);
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });

    return (
        <div className="">
            {!showDropzone ? (
                <div className="border border-dashed border-green-500 bg-slate-200 w-full mb-2">
                    <div className="py-6 font-medium">Valid cluster definition {`"${clusterDefinition?.name}"`}</div>
                </div>
            ) : (
                <>
                    <div><b>Drop your DKG Cluster Definition file here:</b></div>
                    <br />
                    <div
                        className="border border-dashed border-gray-500 bg-slate-200 w-full mb-2 p-2"
                        {...getRootProps()}
                    >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <div className="">
                                <button className="btn btn-primary disabled my-2">
                                    Click to select file
                                </button>
                                <div>drop now</div>
                            </div>
                        ) : (
                            <div>
                                <button className="btn bg-gradient-to-r from-frens-blue to-frens-teal text-white no-animation my-2">
                                    Click to select file
                                </button>
                                <div>or simply drop it here</div>
                                {feedback && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                        <strong className="font-bold">{feedback}</strong>
                                    </div>
                                )
                                }
                            </div>
                        )}
                    </div>
                </>
            )}
            <button
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                disabled={!clusterDefinition}
                onClick={runDkg}>RunDKG</button>
            {output && (
                <>
                    <div>Output:</div>
                    <>
                        {/* <div className="container"> */}
                        <pre className="transcript" dangerouslySetInnerHTML={{ __html: outputHtml }} />
                        {/* </div> */}
                    </>
                </>
            )}
            {feedback && (
                <p className="text-red-700">{feedback}</p>
            )}
        </div>);
}


export default RunDKG