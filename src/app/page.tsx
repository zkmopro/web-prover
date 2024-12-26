"use client";
import Prove from "./prove";
import Footer from "./footer";

export default function Home() {
    return (
        <>
            <main className="min-h-screen flex-col items-center justify-between p-10 break-words dark:text-slate-400 text-slate-500">
                <img
                    src="logo.png"
                    className="display: inline-block"
                    style={{ maxWidth: "50px" }}
                ></img>
                <h1 className="display: inline-block text-xl font-bold pl-9">
                    Snarkjs Prover
                </h1>

                {/* <Prove circuit="multiplier2"></Prove> */}
                <Prove circuit="keccak256"></Prove>
                <Prove circuit="sha256"></Prove>
                <Prove circuit="RSA"></Prove>
                <Prove circuit="semaphore"></Prove>
                <Prove circuit="Aadhaar"></Prove>
                <div className="p-20"></div>
            </main>
            <Footer></Footer>
        </>
    );
}
