import {
    ChevronDownIcon
} from '@heroicons/react/20/solid'
import { server_config } from '../server_config';

import { abbreviatePublicKey, beaconchainUrl } from "../utils/utils"
import { useBeaconChainClientAndValidator, useNetwork } from '../hooks/useServerInfo';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSatelliteDish } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from 'react';
import ExitValidatorModal from "./ExitValidatorModal";

export interface ValidatorData {
    "index": string
    "balance": string,
    "status": string,
    "validator": {
        "pubkey": string,
        "withdrawal_credentials": string,
        "effective_balance": string,
        "slashed": boolean,
        "activation_eligibility_epoch": string,
        "activation_epoch": string,
        "exit_epoch": string,
        "withdrawable_epoch": string
    }
}

const Validators = () => {

    const { network } = useNetwork()
    const { bcClient } = useBeaconChainClientAndValidator()

    const [validatorData, setValidatorData] = useState<ValidatorData[]>();

    const updateValidators = async () => {
        console.log("Trying to update validators")
        try {
            const keystores = JSON.parse(await (await fetch(`${server_config.monitor_url}/keymanager/eth/v1/keystores`)).text())
            const validatorData = await Promise.all(keystores.data.map((v: any) => {
                console.log(v.validating_pubkey)
                return getValidatorData(v.validating_pubkey)
            }))
            setValidatorData(validatorData)
        } catch (e) {
            //
        }
    }

    const getValidatorData = async (pubKey: string): Promise<ValidatorData> => {
        const nullValue = {
            "index": "pending",
            "balance": "0",
            "status": "pending_initialized",
            "validator": {
                "pubkey": pubKey,
                "withdrawal_credentials": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "effective_balance": "00000000000",
                "slashed": false,
                "activation_eligibility_epoch": "0",
                "activation_epoch": "0",
                "exit_epoch": "0",
                "withdrawable_epoch": "0"
            }
        };
        try {
            const url = `${server_config.monitor_url}/rest/eth/v1/beacon/states/head/validators/${pubKey}`
            const rawResult = await (await fetch(url)).text()
            const result = JSON.parse(rawResult)
            if (!result.index)
                return nullValue
            else
                return result
        } catch (e) {
            return nullValue
        }
    }

    useEffect(() => {
        if (bcClient) {
            updateValidators()
        }
    }, [bcClient])


    const validatorsTable = () => {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                {/* <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold leading-6 text-gray-900">Validators</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all your validators.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <AddValidator currentNumberOfValidators={nodeStatus.validatorInfos.length} />
                    </div>
                </div> */}
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                            <a href="#" className="group inline-flex">
                                                PubKey
                                                <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                                                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            </a>
                                        </th>
                                        {/* <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            <a href="#" className="group inline-flex">
                                                Status
                                                <span className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200">
                                                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            </a>
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            <a href="#" className="group inline-flex">
                                                Validator Status
                                                <span className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200">
                                                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            </a>
                                        </th> 
                                        */}
                                        <th scope="col" className="relative py-3.5 pl-3 pr-0">
                                            <span className="sr-only">Exit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {validatorData!.map((validator) => (
                                        <tr key={validator.validator.pubkey}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                                {beaconchainUrl(network, validator.validator.pubkey, <><FontAwesomeIcon className="icon" icon={faSatelliteDish} /> {abbreviatePublicKey(validator.validator.pubkey)}</>)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {validatorData && (
                                <ExitValidatorModal validators={validatorData} updateValidators={updateValidators} />
                            )}
                        </div>
                    </div>
                </div>
            </div >
        )
    }


    return (
        <>
            {validatorData ? (
                <>
                    {validatorsTable()}
                </>
            ) : (
                <>
                    <p>No validator keyshares yet</p>
                </>
            )}
        </>
    )
}

export default Validators;
