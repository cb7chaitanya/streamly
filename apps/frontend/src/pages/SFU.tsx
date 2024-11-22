import { useSFUClient } from "../hooks/useSFUClient";
import { useState } from "react";

const SFU = () => {
  const { localVideoRef, remoteVideoRefs, remoteStreams } = useSFUClient();
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleFullScreen = () => {
    const videoElement = localVideoRef.current;
    if (videoElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoElement.requestFullscreen();
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localVideoRef.current) {
      localVideoRef.current.muted = !isMuted;
    }
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (localVideoRef.current) {
      localVideoRef.current.style.display = isVideoOff ? 'block' : 'none';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-800">
        <h1 className="text-xl font-bold">Video Conference</h1>
        <div className="flex space-x-2">
          <button 
            onClick={toggleMute} 
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button 
            onClick={toggleVideo} 
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            {isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
          </button>
          <button 
            onClick={toggleFullScreen} 
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Toggle Fullscreen
          </button>
        </div>
      </header>
      <div className="flex p-4 gap-4 relative flex-grow">
        {/* Local Video */}
        <video
          id="localVideo"
          ref={localVideoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-1/3 rounded-md border-2 border-gray-600"
        />
        {/* Remote Videos */}
        {Array.from(remoteStreams.entries()).map(([id, stream]) => (
          <video
            key={id}
            ref={(el) => {
              if (el) {
                remoteVideoRefs.current.set(id, el);
                el.srcObject = stream; // Set the stream to the video element
              }
            }}
            autoPlay
            playsInline
            className="w-1/3 rounded-md border-2 border-gray-600"
          />
        ))}
      </div>
    </div>
  );
};

export default SFU;