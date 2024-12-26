"use client";
import { useState } from "react";
import { CircuitSignals } from "snarkjs";
import Inputs from "./inputs.json";

const url = "https://ci-keys.zkmopro.org";

async function getKeys(wasmPath: string, zkeyPath: string) {
    const wasmUrl = new URL(wasmPath, url).toString();
    const zkeyUrl = new URL(zkeyPath, url).toString();
    const wasm = await fetch(wasmUrl).then((r) => r.arrayBuffer());
    const zkey = await fetch(zkeyUrl).then((r) => r.arrayBuffer());
    return { wasm, zkey };
}

async function fullProve(
    wasmPath: string,
    zkeyPath: string,
    inputs: CircuitSignals
) {
    const _snarkjs = import("snarkjs");
    const snarkjs = await _snarkjs;
    const { wasm, zkey } = await getKeys(wasmPath, zkeyPath);
    const wtns = {
        type: "mem",
    };

    const witStart = +Date.now();
    await snarkjs.wtns.calculate(inputs, new Uint8Array(wasm), wtns);
    const witEnd = +Date.now();

    const proveStart = +Date.now();
    const { proof, publicSignals } = await snarkjs.groth16.prove(
        new Uint8Array(zkey),
        wtns as any
    );
    const proveEnd = +Date.now();
    return {
        proof,
        publicSignals,
        witGenTime: witEnd - witStart,
        provingTime: proveEnd - proveStart,
    };
}

// async function verifyProof(
//     circuit: string,
//     proof: Groth16Proof,
//     publicSignals: PublicSignals
// ) {
//     const _snarkjs = import("snarkjs");
//     const vkeyUrl = new URL(`${circuit}.vkey.json`, url).toString();
//     const vkeyBuffer = await fetch(vkeyUrl).then((r) => r.arrayBuffer());
//     const vkeyString = String.fromCharCode.apply(
//         null,
//         new Uint8Array(vkeyBuffer) as any
//     );
//     const vkey = JSON.parse(vkeyString);
//     const snarkjs = await _snarkjs;
//     const start = +Date.now();
//     const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
//     const end = +Date.now();
//     return { valid: valid, verifyingTime: end - start };
// }

export default function Prove(props: any) {
    const [proving, setProving] = useState<boolean>(false);
    const [witGenTime, setWitGenTime] = useState<string>("");
    const [provingTime, setProvingTime] = useState<string>("");
    const [proof, setProof] = useState<string>();
    const [publicSignals, setPublicSignals] = useState<string>("");
    const [output, setOutput] = useState<boolean>(false);
    const { wasm, zkey, inputs } = Inputs[props.circuit as keyof typeof Inputs];

    function toggle() {
        setOutput(!output);
    }

    async function generateProof() {
        setProving(true);
        setProvingTime("Calculating...");
        const { proof, publicSignals, witGenTime, provingTime } =
            await fullProve(wasm, zkey, inputs);
        setWitGenTime(`${witGenTime / 1000} s`);
        setProvingTime(`${provingTime / 1000} s`);
        setProof(JSON.stringify(proof));
        setPublicSignals(JSON.stringify(publicSignals));
        setProving(false);
    }

    return (
        <div>
            <div className="mb-4 mt-8">
                <h2 className="fix text-2xl font-bold mb-4">{props.circuit}</h2>
                <button
                    disabled={proving}
                    className="display: inline-block btn mr-4 text-slate-200 p-1 pl-3 pr-3 rounded-lg bg-[#FF8946] hover:bg-[#FFB546] disabled:bg-[#a0a0a0] disabled:cursor-not-allowed shadow-md"
                    onClick={generateProof}
                >
                    Prove
                </button>
                <button
                    className="display: inline-block btn mr-4 text-slate-800 p-1 pl-3 pr-3 rounded-lg hover:bg-[#FFB546] disabled:bg-[#a0a0a0] disabled:cursor-not-allowed shadow-md"
                    onClick={toggle}
                >
                    Show Proof
                </button>
                {/*The bottom code should toggle on and off when the button is pressed*/}
                <div
                    style={{
                        display: output ? "block" : "none",
                    }}
                >
                    {proof && publicSignals && (
                        <div className=" dark:bg-blue-950 p-5 rounded-md shadow-md">
                            {proof && (
                                <h3 className="text-1xl font-bold">proof</h3>
                            )}
                            <p className="mt-1 break-all ">{proof}</p>
                            {publicSignals && (
                                <h3 className="text-1xl font-bold">
                                    public signals
                                </h3>
                            )}
                            <p className="mt-1 break-all ">{publicSignals}</p>
                        </div>
                    )}
                </div>
                {/* <button className="btn">Verify</button> */}
                {witGenTime && (
                    <p className="mt-2">
                        Witness Generation time: {witGenTime}
                    </p>
                )}
                {provingTime && (
                    <p className="mt-2">Proving time: {provingTime}</p>
                )}
            </div>
        </div>
    );
}
