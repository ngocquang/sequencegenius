'use client';

import Head from 'next/head'
import {ReactNode, useEffect, useRef, useState} from 'react';
import mermaid from "mermaid";

const IconDownload = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
    );
};

const IconCopy = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z"></path>
            <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2"></path>
        </svg>
    );
};

const IconDone = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M5 12l5 5l10 -10"></path>
        </svg>
    );
}

const ActionButton = (props: { icon: ReactNode, loading: boolean, disabled: boolean, text: string, onClick: Function }) => {
    const [done, setDone] = useState(false);
    const clickHandler = () => {
        setDone(true);
        props.onClick();
        setTimeout(() => setDone(false), 500)
    }
    return (
        <button
            onClick={clickHandler}
            className={`p-1.5 bg-slate-50 border border-slate-300 text-xs rounded-md shadow-lg shadow-slate-300/50 focus:outline-none flex justify-center items-center gap-1 ${
                props.disabled ?  'text-slate-300 cursor-not-allowed' : 'text-slate-700 cursor-pointer'
            }`}
            disabled={props.disabled || props.loading}
            aria-label={`${props.text} button`}
        >
            {done ? <IconDone/> : props.icon } {props.text}
        </button>
    )
};

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
    const [apiKey, setApiKey] = useState('');
    const [content, setContent] = useState('');
    const [diagram, setDiagram] = useState('');
    const [loading, setLoading] = useState(false);

    mermaid.initialize({
        startOnLoad: true,
        securityLevel: 'strict',
        theme: 'neutral'
    });

    useEffect(() => {
        if (ref.current && diagram) {
            mermaid.contentLoaded();
            ref.current.removeAttribute('data-processed');
        }
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
                apiKey
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
        } catch (err) {
            console.error('Failed to copy: ', err)
        }
    }

    const downloadBtnHandler = async () => {
        const svgContent = ref.current?.innerHTML;
        if (svgContent) {
            const blob = new Blob([svgContent], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            let a = document.createElement('a');
            document.body.appendChild(a);
            a.href = url;
            a.download = 'sequencegenius.svg';
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
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
            <main className="flex flex-1 w-4/5 md:w-3/5 items-center justify-center flex-col gap-6 mx-auto my-10 font-sans">
                <div className={"mb-8 text-center mt-4"}>
                    <h1 className="sm:text-6xl text-4xl max-w-2xl font-bold text-slate-800 mb-4">
                        SequenceGenius
                    </h1>
                    <p className={"text-slate-700"}>Transforming Your Words into Diagrams - With AI Assistance</p>
                </div>
                <p className={"text-left"}>
                    <span className='w-6 h-6 mr-1 rounded-full bg-slate-700 text-white text-center font-bold inline-block'>1</span> Enter your OpenAI API key <br/>
                    <span className={"text-slate-500 text-sm"}><a className='text-blue-600 italic underline' target="_blank" href="https://platform.openai.com/account/api-keys">Your API Key</a> is needed to call OpenAI&rsquo;s API, we do not store your API key anywhere, even on this browser, so you&rsquo;ll have to enter this key everytime you enter the page. <a className='text-blue-600 italic underline' target="_blank" href="https://kingbazoka.typeform.com/to/gIq80bu7">Want to use SequenceGenius without API key?</a></span>
                </p>
                <input 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-3 border border-slate-400 rounded-md focus:border-black focus:ring-black bg-slate-100"
                    placeholder='sk-XXX...'></input>
                <p className={"text-left"}>
                    <span className='w-6 h-6 mr-1 rounded-full bg-slate-700 text-white text-center font-bold inline-block'>2</span> Tell me what you want to generate<br/>
                    <span className={"text-slate-500 text-sm"}>Describe the idea you want to transform into a diagram, AI will automatically pick the best diagram model that fits your idea best, the more percise you describe, the better your diagram will be.</span>
                </p>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 border border-slate-400 rounded-md focus:border-black focus:ring-black bg-slate-100 h-24"
                    placeholder={'Example: Mommy gives Alice X dollars. If X is larger than $50, Alice goes to the movie. Otherwise, Alice gives it to Bob. Whenever Bob gets the money, Bob go tells Mommy.'}
                />
                <div className={"flex gap-4"}>
                    <button 
                        onClick={randomBtnHandler} 
                        className="py-2 px-5 bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-md shadow-lg shadow-slate-300/50 focus:outline-none"
                    >
                        Random example
                    </button>
                    <button 
                        disabled={!apiKey || !content}
                        onClick={generateBtnHandler} 
                        className="py-2 px-5 bg-blue-500 shadow-blue-500/50 disabled:bg-slate-300 disabled:shadow-slate-300/50 disabled:text-slate-200 text-white text-sm font-semibold rounded-md shadow-lg focus:outline-none"
                    >
                        Generate diagram
                    </button>
                </div>
                <div className='relative w-full min-h-[500px] border border-slate-200 rounded-md bg-white flex items-center justify-center'>
                    {loading ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-4 h-4 animate-spin mr-2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Loading...
                        </>
                    ) : (
                        diagram.length > 0 ? "" : "Tell me what's in your mind and click Generate to create diagram"
                    )}
                    <div ref={ref} className={`mermaid ${diagram.length === 0 ? "hidden" : "w-full h-full flex justify-center items-center"}`}>{diagram}</div>
                    <div className="absolute top-2 right-2 flex gap-2">
                        <ActionButton icon={<IconCopy/>} loading={loading} disabled={diagram.length === 0} text={'Code'} onClick={copyBtnHandler} />
                        <ActionButton icon={<IconDownload/>} loading={loading} disabled={diagram.length === 0} text={'SVG'} onClick={downloadBtnHandler} />
                    </div>
                </div>
            </main>
            <footer className={"w-full mx-auto my-4 font-sans text-center text-sm text-slate-700 py-4"}>
                Made by <a className={"text-blue-600"} href={"https://twitter.com/huytd189"}>{"Huy 🚀"}</a>. Open sourced at <a className={"text-blue-600"} href={"https://github.com/huytd/sequencegenius"}>GitHub</a>.
            </footer>
        </div>
    )
}
