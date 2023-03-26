'use client';

import Head from 'next/head'
import {useEffect, useRef, useState} from 'react';
import mermaid from "mermaid";

const EXAMPLES = [
    "Mommy gives Alice X dollars. If X is larger than $50, Alice goes to the movie. Otherwise, Alice gives it to Bob. Whenever Bob gets the money, Bob go tells Mommy.",
    "OAuth2 flow for backend service",
    "User flow of a grammar checker program",
    "Database diagrams for a blog",
    "A customer visits an online store, adds items to cart, logs in, enters shipping address, pays, and receives confirmation email.",
    "A customer buys a laptop online, adds it to their cart, enters promo code, pays via credit card, receives confirmation email, item is shipped.",
    "Mindmap for researching rocket science"
];

export default function Home() {
    const ref = useRef<HTMLDivElement>(null);
    const [content, setContent] = useState('');
    const [diagram, setDiagram] = useState(``);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    mermaid.initialize({
        startOnLoad: true,
        securityLevel: 'strict',
        theme: 'neutral'
    });

    useEffect(() => {
        mermaid.contentLoaded();
        ref.current?.removeAttribute('data-processed');
    }, [diagram]);

    const requestDiagarm = async (content: string) => {
        ref.current?.removeAttribute('data-processed');
        setDiagram('');
        setLoading(true);

        const response = await fetch("/api/magic", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
            }),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        const answer = await response.json();
        const diagram = answer.result.split("\n").filter((line: string) => !line.startsWith("```")).join("\n");
        if (diagram.length && diagram !== "UNKNOWN_ERROR") {
            setDiagram(diagram);
        }
        setLoading(false);
    };

    const generateBtnHandler = async () => {
        if (!loading && content.trim().length > 0) {
            await requestDiagarm(content);
        }
    };

    const randomBtnHandler = () => {
        const randomIndex = Math.floor(Math.random() * EXAMPLES.length);
        setContent(EXAMPLES[randomIndex]);
    }

    const copyBtnHandler = async () => {
        try {
            await navigator.clipboard.writeText(diagram)
            setCopied(true)
            setTimeout(() => setCopied(false), 500)
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    return (
        <div className={"flex flex-col h-screen"}>
            <Head>
                <title>SequenceGenius</title>
                <meta name="description" content="Generate sequence diagram by describing it in natural language" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex flex-1 w-4/5 md:w-3/5 items-center justify-center flex-col gap-8 mx-auto my-10 font-sans">
                <div className={"mb-8 text-center mt-4"}>
                    <h1 className="sm:text-6xl text-4xl max-w-2xl font-bold text-slate-800 mb-4">
                        SequenceGenius
                    </h1>
                    <p className={"text-slate-700"}>Transforming Your Words into Diagrams - With AI Assistance</p>
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 border border-slate-400 rounded-md focus:border-black focus:ring-black bg-slate-100 h-24"
                    placeholder={'Example: Mommy gives Alice X dollars. If X is larger than $50, Alice goes to the movie. Otherwise, Alice gives it to Bob. Whenever Bob gets the money, Bob go tells Mommy.'}
                />
                <div className={"flex gap-4"}>
                    <button onClick={randomBtnHandler} className="py-2 px-5 bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-md shadow-lg shadow-slate-300/50 focus:outline-none">Random example</button>
                    <button onClick={generateBtnHandler} className="py-2 px-5 bg-blue-500 text-white text-sm font-semibold rounded-md shadow-lg shadow-blue-500/50 focus:outline-none">Generate diagram</button>
                </div>
                <div className='relative w-full min-h-[500px] border border-slate-200 rounded-md bg-white flex items-center justify-center'>
                    {loading ? "Loading..." : (
                        diagram.length > 0 ? "" : "Tell me what's in your mind and click Generate to create diagram"
                    )}
                    <div ref={ref} className={`mermaid ${diagram.length === 0 ? "hidden" : "w-full h-full flex justify-center items-center"}`}>{diagram}</div>
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={copyBtnHandler}
                            className={`p-1.5 bg-slate-50 border border-slate-300 text-sm rounded-md shadow-lg shadow-slate-300/50 focus:outline-none ${
                                diagram.length === 0 ?  'text-slate-300 cursor-not-allowed' : 'text-slate-700 cursor-pointer'
                            }`}
                            disabled={diagram.length === 0 || loading}
                            aria-label="Copy Button"
                        >
                          {copied ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M5 12l5 5l10 -10"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
                                <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
                            </svg>
                          )}
                        </button>
                    </div>
                </div>
            </main>
            <footer className={"w-full mx-auto my-4 font-sans text-center text-sm text-slate-700 py-4"}>
                Made by <a className={"text-blue-600"} href={"https://twitter.com/huytd189"}>{"Huy 🚀"}</a>. Open sourced at <a className={"text-blue-600"} href={"https://github.com/huytd/sequencegenius"}>GitHub</a>.
            </footer>
        </div>
    )
}
