import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket, faSatelliteDish } from "@fortawesome/free-solid-svg-icons";
import { ValidatorData } from "./Validators";
import { abbreviatePublicKey, beaconchainUrl } from "../utils/utils"
import { useNetwork } from "../hooks/useServerInfo";
import { server_config } from "../server_config";
import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, useEffect, useState } from "react";
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Props {
    validators: ValidatorData[]
    updateValidators: () => void
}


const ExitValidatorModal = ({ validators, updateValidators }: Props) => {
    const { network } = useNetwork()

    const [showModal, setShowModal] = useState(false);
    const [confirmation, setConfirmation] = useState('');

    const exitValidators = () => {
        const pubKeys = validators.map(v => v.validator.pubkey)
        console.log("Exiting " + pubKeys.join(","));

        setShowModal(false)

        fetch(`${server_config.monitor_url}/exit_validators/`, { method: 'POST' })
            .then(async (res: any) => {
                const data = await res.json()
                console.log(data, res)
                if (res.status === 200) {
                    triggerValidatorUpdates()
                }
                alert(data);
            }).catch((e) => {
                console.log(e)
            });
    }

    // trigger 3 updates with different waiting intervals
    // because it takes a while before exit status is in the validator data
    const triggerValidatorUpdates = async () => {
        // now
        updateValidators();
        // in 15s
        await setTimeout(updateValidators, 15000);
        // in 12 min
        await setTimeout(updateValidators, 12 * 60000 + 2000);
    }

    const cancel = () => {
        setConfirmation("")
        setShowModal(false)
    }

    const content = () => {
        return <div>
            <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:px-6">
                    <h2 className="text-xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Exit validators {validators.map(v => v.index).join(",")} ?
                    </h2>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <h4 className="title is-4 has-text-white">
                        Are you sure you want to exit validators
                        {validators.map(validator => <>
                            {beaconchainUrl(network, "/validator/" + validator.validator.pubkey, <><code>{abbreviatePublicKey(validator.validator.pubkey)}</code> <FontAwesomeIcon className="icon" icon={faSatelliteDish} /></>)}
                        </>).join(", ")}
                        ?
                    </h4>


                    <p>
                        Please make sure you understand the consequences of performing a voluntary exit.
                        Once an account is exited, the action cannot be reverted.
                    </p>

                    <br />

                    <label className="block text-sm font-medium leading-6 text-gray-900">
                        Type {`"`}<i>agree</i>{`"`} if you want to exit this validator
                    </label>
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">

                        <input
                            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            type="text"
                            placeholder="Confirmation" value={confirmation} onChange={e => setConfirmation(e.target.value)}
                        />
                    </div>
                    <br />

                    <p >
                        Note that it takes a while to broadcast your exit-message. It might take a few minutes before the validator list reflects the new status of your validator.
                        Keep your validator running until the status is {`"exited_unslashed"`}.
                    </p>

                    <button
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        disabled={confirmation !== "agree"} onClick={exitValidators}>
                        Exit validators
                    </button>


                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </button>

                </div>
            </div>
        </div>
    }

    return <>
        {!showModal && (
            <button
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => setShowModal(!showModal)}
            >Exit validators</button>
        )}
        {showModal && (
            <>
                <Transition.Root show={showModal} as={Fragment}>
                    <Dialog as="div" className="relative z-10" onClose={setShowModal}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                        </Transition.Child>

                        <div className="fixed inset-0 z-10 overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                >
                                    <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                        <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                            <button
                                                type="button"
                                                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                onClick={() => setShowModal(false)}
                                            >
                                                <span className="sr-only">Close</span>
                                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>
                                        {content()}
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition.Root>
            </>
        )}
    </>
};

export default ExitValidatorModal
