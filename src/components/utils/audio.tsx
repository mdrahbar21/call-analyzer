import React, { useState, useRef } from 'react';

const SpeakerControl = () => {
  // Initialize the volume state (0.5 is 50% volume)
const [volume, setVolume] = useState(0.5);

// Reference to the audio element
const audioRef = useRef<HTMLAudioElement>(null);

// Function to update volume from the slider
const handleVolumeChange = (event:any) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
        (audioRef.current as HTMLAudioElement).volume = newVolume;
    }
};
}
export default SpeakerControl;
