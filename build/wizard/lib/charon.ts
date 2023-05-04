import { server_config } from "../server_config";

export const charonCommandRaw = async (command: string) => {
    const response = await window.fetch(`${server_config.monitor_url}/charon`, {
        method: 'POST',
        headers: { 'content-type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ command }),
    })
    const result = await response.json()

    console.log(command, result)

    return result
}
