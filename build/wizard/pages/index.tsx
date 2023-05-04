import type { NextPage } from 'next';
import Validators from '../components/Validators';
import { useENR } from '../hooks/useServerInfo';
import RunDKG from '../components/RunDKG';
import Links from '../components/Links';

const Home: NextPage = () => {
    const { data: enr } = useENR();

    return (
        <>
            <br />
            <h2 className="font-bold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight">
                Obol Launchpad
            </h2>
            <a href="https://goerli.launchpad.obol.tech/" target="_blank" rel="noreferrer">https://goerli.launchpad.obol.tech/</a>
            <br />
            <br />
            <h2 className="font-bold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight">
                ENR
            </h2>
            <div className="border border-dashed border-gray-500 bg-slate-200 w-full mb-2 p-2">
                {enr}
            </div>
            <br />
            <br />
            <h2 className="font-bold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight">
                Run DKG
            </h2>
            <RunDKG />
            <br />
            <br />
            <Links />
            <br />
            <br />
            <h2 className="font-bold leading-7 text-gray-900 sm:truncate sm:text-xl sm:tracking-tight">
                Validators
            </h2>
            <Validators />
        </>
    )
}

export default Home;
