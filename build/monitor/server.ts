import * as restify from "restify";
import corsMiddleware from "restify-cors-middleware2"
import { SupervisorCtl } from "./SupervisorCtl";
import { server_config } from "./server_config";
import { rest_url, getAvadoPackageName, getAvadoExecutionClientPackageName, client_url, supported_beacon_chain_clients, supported_execution_clients } from "./urls";
import { DappManagerHelper } from "./DappManagerHelper";
import AdmZip from 'adm-zip';
import { spawn } from 'child_process';
import axios, { Method } from "axios";
import { execSync } from "child_process";


const autobahn = require('autobahn');
const exec = require("child_process").exec;
const fs = require('fs');
const path = require("path");

console.log("Monitor starting...");

const server = restify.createServer({
    ...server_config.https_options,
    name: "MONITOR",
    version: "1.0.0"
});

const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: [
        /^http:\/\/localhost(:[\d]+)?$/,
        "http://*.my.ava.do"
    ]
});

const DATADIR = "/data/charon"
const TMPDIR = "/tmp/restore"

server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.bodyParser());

server.get("/ping", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    res.send(200, "pong");
    next()
});

server.get("/network", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    res.send(200, server_config.network);
    next()
});

server.get("/name", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    res.send(200, server_config.name);
    next()
});

const supervisorCtl = new SupervisorCtl(`localhost`, 5555, '/RPC2') || null;

const restart = async (service: string) => {
    await Promise.all([
        supervisorCtl.callMethod('supervisor.stopProcess', [service, true]),
    ])
    return Promise.all([
        supervisorCtl.callMethod('supervisor.startProcess', [service, true]),
    ])
}

server.post("/service/:service/restart", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const service = req.params["service"]
    restart(service).then((result) => {
        res.send(200, "restarted");
        return next()
    }).catch((error) => {
        res.send(500, "failed")
        return next();
    })
});

server.get("/service/status", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const method = 'supervisor.getAllProcessInfo'
    supervisorCtl.callMethod(method, [])
        .then((value: any) => {
            res.send(200, value);
            next()
        }).catch((_error: any) => {
            res.send(500, "failed")
            next();
        });
});

let wampSession: any = null;
{
    const url = "ws://wamp.my.ava.do:8080/ws";
    const realm = "dappnode_admin";

    const connection = new autobahn.Connection({ url, realm });
    connection.onopen = (session: any) => {
        console.log("CONNECTED to \nurl: " + url + " \nrealm: " + realm);
        wampSession = session;
    };
    connection.open();
}

const getInstalledClients = async () => {
    const dappManagerHelper = new DappManagerHelper(server_config.packageName, wampSession);
    const packages = await dappManagerHelper.getPackages();

    const installed_clients = supported_beacon_chain_clients
        .filter(client => (packages.includes(getAvadoPackageName(client, "beaconchain"))))
        .map(client => ({
            name: client,
            url: `http://${client_url(client)}`,
            validatorAPI: `http://${client_url(client)}:9999/keymanager`
        }))
    return installed_clients;
}

server.get("/bc-clients", async (req: restify.Request, res: restify.Response, next: restify.Next) => {
    res.send(200, await getInstalledClients())
    next();
})

server.get("/ec-clients", async (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const dappManagerHelper = new DappManagerHelper(server_config.packageName, wampSession);
    const packages = await dappManagerHelper.getPackages();

    const installed_clients = supported_execution_clients.filter(client => packages.includes(getAvadoExecutionClientPackageName(client)));

    res.send(200, installed_clients.map(client => ({
        name: client,
        api: rest_url(client),
        url: `http://${client_url(client)}`
    })))
    next();
})

server.get("/enr", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    charonCommand(`enr --data-dir="${DATADIR}"`).then((stdout) => {
        res.send(200, stdout);
        return next();
    }).catch((e) => {
        res.send(500, e);
        return next();
    })

})

server.get("/cluster-lock.json", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    try {
        const result = JSON.parse(fs.readFileSync(`${DATADIR}/cluster-lock.json`, 'utf8'))
        res.send(200, result);
        return next()
    } catch (err) {
        const result = {}
        res.send(200, result);
        return next()
    }
})

server.get("/logs-validator", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const logFile = `${server_config.validator_path}/logs/teku-validator.log`
    try {
        const log = fs.readFileSync(logFile, 'utf8').trim();
        res.send(200, log)
        return next()
    } catch (err) {
        const result = ""
        res.send(200, result);
        return next()
    }
})

server.post("/charon", (req: restify.Request, res: restify.Response, next: restify.Next) => {
    if (!req.body) {
        res.send(400, "not enough parameters");
        return next();
    } else {
        charonCommand(req.body.command).then((stdout) => {
            res.send(200, stdout);
            return next();
        }).catch((e) => {
            res.send(500, e);
            return next();
        })
    }
});

const charonCommand = (command: string) => {
    const cmd = `/usr/local/bin/charon ${command}`;
    console.log(`Running ${cmd}`);
    return execute(cmd);
}

const execute = (cmd: string) => {
    return new Promise<string>((resolve, reject) => {
        const child = exec(cmd, (error: Error, stdout: string | Buffer, stderr: string | Buffer) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return reject(error.message);
            }
            if (stderr) {
                console.log(`error: ${stderr}`);
                return reject(stderr);
            }
            return resolve(stdout.toString());

        });
        child.stdout.on('data', (data: any) => console.log(data.toString()));
    });
}

server.post('/runDkg', async (req: restify.Request, res: restify.Response, next: restify.Next) => {
    console.log("Starting DKG");
    const jsonFile = req?.files?.jsonFile;
    if (jsonFile) {
        const clusterConfigFilePath = `/tmp/${jsonFile.name}`;
        fs.renameSync(jsonFile.path, clusterConfigFilePath, (err: any) => { if (err) console.log('ERROR: ' + err) });
        console.log(`received cluster config file "${jsonFile.name}"`);
        try {
            const command = `/usr/local/bin/charon dkg --data-dir="${DATADIR}" --log-level=debug --definition-file="${clusterConfigFilePath}" --publish`
            console.log("Running:", command)

            const child = spawn(command, { shell: true });
            // Wrap the event-driven part in a Promise
            await new Promise<void>((resolve, reject) => {
                child.stdout.pipe(res);
                child.stderr.pipe(res);

                child.stderr.on('data', (data: Buffer) => {
                    console.error(`stderr: ${data.toString()}`);
                });

                child.on('close', (code: number) => {
                    console.log(`Command exited with code ${code}`);
                    res.end();
                    resolve(); // Resolve the Promise
                });

                child.on('error', (error: Error) => {
                    console.error(`Command error: ${error.message}`);
                    reject(); // Reject the Promise in case of an error
                });
            });

            next();
        } catch (e) {
            console.log("Exception", e)
            console.dir(e);
            res.send({
                code: 400,
                message: e,
            });
            return next();
        }
    } else {
        res.send(400, 'JSON file is missing');
        next();
    }
})

/////////////////////////////
// Backup                  //
/////////////////////////////
const backupFileName = "obol-backup.zip";
server.get("/" + backupFileName, (req: restify.Request, res: restify.Response, next: restify.Next) => {
    res.setHeader("Content-Disposition", "attachment; " + backupFileName);
    res.setHeader("Content-Type", "application/zip");
    const zip = new AdmZip();
    zip.addLocalFolder(DATADIR, "charon");
    zip.toBuffer(
        (buffer: Buffer) => {
            res.setHeader("Content-Length", buffer.length);
            res.end(buffer, "binary");
            next();
        }
    )
});

/////////////////////////////
// Restore backup          //
/////////////////////////////


function copyDir(sourceDir: string, targetDir: string) {
    // Create the target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    // Get all files and subdirectories in the source directory
    const files = fs.readdirSync(sourceDir);

    files.forEach((file: File) => {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);

        // Get the stats of the current file or directory
        const stats = fs.statSync(sourcePath);

        if (stats.isFile()) {
            // If it's a file, copy it to the target directory
            fs.copyFileSync(sourcePath, targetPath);
        } else if (stats.isDirectory()) {
            // If it's a directory, recursively copy it to the target directory
            copyDir(sourcePath, targetPath);
        }
    });
}



function listFilesRecursive(directory: string): string[] {
    const files: string[] = [];

    function traverseDirectory(currentDir: string) {
        const items = fs.readdirSync(currentDir);

        items.forEach((item: File) => {
            const itemPath = path.join(currentDir, item);
            const stats = fs.statSync(itemPath);

            if (stats.isFile()) {
                const filePath = path.join(currentDir, item);
                files.push(filePath);
            } else if (stats.isDirectory()) {
                traverseDirectory(itemPath);
            }
        });
    }

    traverseDirectory(directory);

    return files;
}




server.post('/restore-backup', async (req: restify.Request, res: restify.Response, next: restify.Next) => {
    console.log("======================");
    console.log("upload backup zip file");
    const backupFile = req?.files?.backupFile;
    if (!backupFile) {
        res.send(400, 'Backup file is missing');
        next();
        return
    }

    const zipfilePath = "/tmp/backup.zip";
    fs.renameSync(backupFile.path, zipfilePath, (err: any) => { if (err) console.log('ERROR: ' + err) });
    console.log("received backup file " + backupFile.name);
    try {

        function getRootFolderName(zipPath: string): string | null {
            const zip = new AdmZip(zipPath);
            const zipEntries = zip.getEntries();

            let dirName = null;
            for (const entry of zipEntries) {
                if (entry.entryName.split('/').length > 1) {
                    dirName = entry.entryName.split('/')[0];
                }
            }
            return dirName;
        }

        const rootFolder = getRootFolderName(zipfilePath);
        if (rootFolder) {
            console.log('ZIP contains single root folder:', rootFolder);
            // delete existing data folder (if it exists)
            console.log(`clearing DATA dir: ${DATADIR}`);
            fs.rmSync(DATADIR, { recursive: true, force: true /* ignore if not exists */ });
            console.log(`clearing TMP dir : ${TMPDIR}`);
            fs.rmSync(TMPDIR, { recursive: true, force: true /* ignore if not exists */ });
            console.log(`opening ZIPfile "${zipfilePath}"`);
            const zip = new AdmZip(zipfilePath);
            console.log(`exctract ZIPfile to ${TMPDIR}`);
            await zip.extractAllTo(/*target path*/ TMPDIR, /*overwrite*/ true);

            const sourceFolder = `${TMPDIR}/${rootFolder}`;
            console.log(`copy ${sourceFolder} to ${TMPDIR}`);
            copyDir(sourceFolder, DATADIR);
            console.log(`clearing TMP dir : ${TMPDIR}`);
            fs.rmSync(TMPDIR, { recursive: true, force: true /* ignore if not exists */ });
            console.log(`remove ZIP file: ${zipfilePath}`);
            fs.rmSync(zipfilePath);

            console.log(`list of files in ${DATADIR} after restore`)
            const files = listFilesRecursive(DATADIR);
            console.log(files);

            console.log("======================");

            console.log(`restart Teku`);
            restart("teku")
            console.log(`restart Charon`);
            restart("charon")

            res.send({
                code: 200,
                message: `Successfully restored backup.`,
            });
            return next();

        } else {
            // invalid ZIP file
            // zipfile does not have a single root folder..

            res.send({
                code: 500,
                message: `Invalid ZIP file (file should contain exactly 1 folder).`,
            });
            return next();
        }


    } catch (e) {
        console.dir(e);
        console.log(e);
        res.send({
            code: 500,
            message: e,
        });
        return next();
    }





    // function validateZipFile(zipfilePath: string) {
    //     console.log("Validating " + zipfilePath);
    //     const zip = new AdmZip(zipfilePath);
    //     const zipEntries = zip.getEntries();
    //     requiredZipFiles.forEach(fileName => {
    //         checkFileExistsInZipFile(zipEntries, fileName)
    //     });
    //     console.log(`Zipfile OK`);
    // }

    // function checkFileExistsInZipFile(zipEntries: AdmZip.IZipEntry[], expectedPath: string) {
    //     const containsFile = zipEntries.some((entry) => entry.name == expectedPath);
    //     if (!containsFile)
    //         throw new Error(`Invalid backup file. The zip file must contain "${expectedPath}"`)
    // }
});

/////////////////////////////
// Beacon chain rest API   //
/////////////////////////////

server.get('/rest/*', async (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const path = req.params["*"]

    const bcClients = await getInstalledClients()
    if (bcClients.length > 0) {
        const bcClient = bcClients[0]
        const beaconNodeAddr = rest_url(bcClient.name);
        if (beaconNodeAddr) {
            const url = `${beaconNodeAddr}/${path}`
            const result = await (await fetch(url)).text()
            res.send(200, JSON.parse(result));
            return next();
        }
    }

    const errorMessage = "Missing Beacon Chain client"
    console.log(errorMessage);
    res.send(400, errorMessage)
    next()
});

////////////////////////
// EXIT validator    ///
////////////////////////

server.post("/exit_validators/", (req: restify.Request, res: restify.Response, next: restify.Next) => {

    console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
    console.log(`Sending exit message for validators`)
    console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)

    const teku = "/opt/teku/bin/teku"
    const fixed_opts = `--beacon-node-api-endpoint=http://127.0.0.1:3600 --confirmation-enabled=false --validator-keys="${DATADIR}/validator_keys:/${DATADIR}/validator_keys"`
    // const cmd = `${teku} voluntary-exit --validator-public-keys="${pubkey}" ${fixed_opts}`
    const cmd = `${teku} voluntary-exit ${fixed_opts}`

    try {
        const stdout = execSync(cmd)
        res.send(200, stdout.toString().trim() || "success")
        next();
    } catch (e: any) {
        // console.log(e.stderr.toString())
        res.send(500, e.stderr.toString().trim())
        next();
    }
})

/////////////////////////////
// Key manager API         //
/////////////////////////////

server.get('/keymanager/*', (req: restify.Request, res: restify.Response, next: restify.Next) => {
    processKeyMangerRequest(req, res, next);
});


server.post('/keymanager/*', (req: restify.Request, res: restify.Response, next: restify.Next) => {
    processKeyMangerRequest(req, res, next);
});

server.del('/keymanager/*', (req: restify.Request, res: restify.Response, next: restify.Next) => {
    processKeyMangerRequest(req, res, next);
});

const processKeyMangerRequest = (req: restify.Request, res: restify.Response, next: restify.Next) => {
    const path = req.params["*"]
    const url = `${server_config.keymanager_url}/${path}`
    const keymanagertoken = getKeyManagerToken();
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keymanagertoken}`
    }

    axiosRequest(
        url,
        headers,
        req,
        res,
        next
    )
}

const axiosRequest = (url: string, headers: object, req: restify.Request, res: restify.Response, next: restify.Next) => {
    axios.request({
        method: req.method as Method,
        url: url,
        data: req.body,
        headers: headers,
    }).then((response: any) => {
        res.send(response.status, response.data)
        next();
    }).catch((error: any) => {
        console.log("Error contacting ", url, error.cause);
        res.send(500, "failed")
        next();
    });
}

const getKeyManagerToken = () => {
    try {
        return fs.readFileSync(server_config.keymanager_token_path, 'utf8').trim();
    } catch (err) {
        console.error(err);
    }
}

server.listen(9999, function () {
    console.log("%s listening at %s", server.name, server.url);
});


