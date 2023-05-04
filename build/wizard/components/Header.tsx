import React from 'react'
import {
    MapIcon,
    AdjustmentsHorizontalIcon,
    ServerIcon,
    PlayIcon,
} from '@heroicons/react/20/solid'
import NetworkBanner from '../components/NetworkBanner';
import SyncStatusTag from '../components/SyncStatusTag';

import { useBeaconChainClientAndValidator, useBeaconNodeStatus, useExecutionClient, useNetwork } from '../hooks/useServerInfo';
import Link from 'next/link';
import logo from "../public/obol.png";
import Image from 'next/image';

const Header = () => {

    const { network } = useNetwork()
    const { bcClient } = useBeaconChainClientAndValidator()
    const { ecClient } = useExecutionClient()
    const beaconNodeStatus = useBeaconNodeStatus();


    const title = "Avado Obol"

    const ecClientLink = () => {
        if (ecClient)
            return <a href={ecClient.url}>{ecClient.name}</a>
        else
            return <div className="bg-red-200 text-red-700">Missing execution client</div>
    }

    const bcClientLink = () => {
        if (bcClient)
            return <a href={bcClient.url}>{bcClient.name}</a>
        else
            return <div className="bg-red-200 text-red-700">Missing beacon client</div>
    }

    return (
        <header>
            <NetworkBanner />
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* https://tailwindui.com/components/application-ui/headings/page-headings */}
                <div className="lg:flex lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-shrink-0 items-center">
                            <Image
                                className="block h-8 w-auto"
                                src={logo.src}
                                alt="Logo"
                                height={logo.height}
                                width={logo.width}
                            />
                            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                <Link href="/">{title}</Link>
                            </h1>
                        </div>
                        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <ServerIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                {ecClientLink()},{bcClientLink()}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <AdjustmentsHorizontalIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                <a href="http://my.ava.do/#/Packages/obol.avado.dappnode.eth/detail" className="text-sm leading-6 text-gray-600 hover:text-gray-900" target="_blank" rel="noopener noreferrer">
                                    Logs
                                </a>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <PlayIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                <Link
                                    className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                                    href="/validator">Validator (Teku)
                                </Link>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <MapIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                <Link
                                    className="text-sm leading-6 text-gray-600 hover:text-gray-900"
                                    href="/admin">Admin
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex justify-items-end">
                        <div className="min-w-0 flex-1">
                            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">

                                <span className="ml-3 hidden sm:block">
                                    <SyncStatusTag clientStatus={beaconNodeStatus.data} label={bcClient?.name ?? "beacon client"} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header;
