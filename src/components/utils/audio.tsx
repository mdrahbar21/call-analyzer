import React, { useState, useRef } from 'react';

const SpeakerControl = () => {
const [volume, setVolume] = useState(0.5);

const audioRef = useRef<HTMLAudioElement>(null);

const handleVolumeChange = (event:any) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
        (audioRef.current as HTMLAudioElement).volume = newVolume;
    }
};
}
export default SpeakerControl;
