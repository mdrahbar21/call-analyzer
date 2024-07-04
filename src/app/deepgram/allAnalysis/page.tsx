"use client"

import React, { useEffect, useState } from 'react';
import Sugar from 'sugar'

const TranscriptionsPage = () => {
    const [results, setResults] = useState<any[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchTranscriptions = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/firestore/collections/voice',{
                    method:'POST'
                });
                if (!response.ok) {
                    throw new Error(`Server error: ${response.statusText}`);
                }
                const ans = await response.json();
                setResults(ans.data);
            } catch (error:any) {
                console.error('Error fetching transcriptions:', error);
                setError('Failed to fetch transcriptions.');
            } finally {
                setLoading(false);
            }
        };

        fetchTranscriptions();
    }, []);

    const formatDate = (timestamp:any) => {
        const date = Sugar.Date.create(timestamp);
        const formattedDate = Sugar.Date.format(date, '%c');
        
        return <span>{formattedDate}</span>;
    };
      

    return (
        <div className="p-8 dark:bg-main-dark-bg bg-main-bg min-h-screen transition-all duration-300">
            <h1 className="text-2xl font-bold mb-4 text-white">Analysis</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {results.length > 0 && (
                <div className="mb-4 max-w-full">
                    {results.map((result, index) => (
                        <div key={result.id} className="p-4 bg-gray-100 rounded text-black whitespace-pre-wrap break-words mb-2">
                            <span>{formatDate(result.createdAt)}</span>
                            <h3 className="font-bold">File {index + 1} - {result.fileName}</h3>
                            <audio controls src={result.audioURL} className="mb-2"></audio>
                            {/* <h4 className="font-bold">Transcript:</h4>
                            <p>{result.transcript}</p> */}
                            <h4 className="font-bold">Analysis:</h4>
                            <p>{JSON.stringify(result.analysis, null, 2)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TranscriptionsPage;
