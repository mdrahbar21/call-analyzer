"use client";
import React from 'react';
import { AppStateContext } from '@/components/contexts/contextProvider';

const TranscriptionApp = () => {
    const { activeMenu } = AppStateContext();
    const [files, setFiles] = React.useState<any[]>([]);
    const [transcripts, setTranscripts] = React.useState<any[]>([]);
    const [analysis, setAnalysis] = React.useState<any[]>([]);
    const [error, setError] = React.useState<any>('');

    const handleFileChange = (event: any) => {
        setFiles(Array.from(event.target.files));
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        if (files.length === 0) {
            setError('Please select files first.');
            return;
        }

        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        try {
            const response = await fetch('/api/deepgram', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const result = await response.json();
            setTranscripts(result.results.map((res: any) => res.transcript));
            setAnalysis(result.results.map((res: any) => res.analysis));
        } catch (error: any) {
            setError(`Transcription failed: ${error.message}`);
        }
    };

    return (
        <div className="p-8 dark:bg-main-dark-bg bg-main-bg min-h-screen transition-all duration-300">
            <h1 className="text-2xl font-bold mb-4 text-white">Transcription App</h1>
            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleFileChange}
                    className="mb-2 p-2 border rounded"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Transcribe
                </button>
            </form>
            {error && <p className="text-red-500">{error}</p>}
            {transcripts.length > 0 && (
                <div className="mb-4 max-w-full">
                    <h2 className="text-xl font-bold text-white">Transcripts</h2>
                    {transcripts.map((transcript, index) => (
                        <div key={index} className="p-4 bg-gray-100 rounded text-black whitespace-pre-wrap break-words mb-2">
                            <h3 className="font-bold">File {index + 1}:</h3>
                            {transcript}
                        </div>
                    ))}
                </div>
            )}
            {analysis.length > 0 && (
                <div className="max-w-full">
                    <h2 className="text-xl font-bold text-white">Analysis</h2>
                    {analysis.map((result, index) => (
                        <div key={index} className="p-4 bg-gray-100 text-black rounded whitespace-pre-wrap break-words mb-2">
                            <h3 className="font-bold">File {index + 1}:</h3>
                            {JSON.stringify(result, null, 2).split('\n').map((line, idx) => (
                                <div key={idx}>{line}</div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TranscriptionApp;
