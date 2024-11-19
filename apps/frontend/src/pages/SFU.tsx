import { useEffect } from "react";
import { useSFUClient } from "../hooks/useSFUClient";

const SFU = () => {
  const { localVideoRef, remoteVideoRefs, localStream, remoteStreams } = useSFUClient();
  
  useEffect(() => {
    if(localVideoRef.current){
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, localVideoRef]);

  console.log('Remote streams:', Array.from(remoteStreams.entries()));
  console.log('Remote video refs:', Array.from(remoteVideoRefs.current.entries()));

  return (
    <div className="min-h-screen bg-[#202124]">
      <div className="max-w-[1600px] mx-auto p-8">
        {/* Main content area */}
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          {/* Top section with main video grid */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {/* Local video */}
              <div className="relative rounded-lg overflow-hidden group bg-[#3c4043]">
                <video
                  id="local-video"
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                ></video>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <div className="bg-[#3c4043]/90 text-[#e8eaed] px-3 py-1.5 rounded-lg text-sm font-medium">
                    You
                  </div>
                </div>
              </div>

              {/* Remote videos */}
              {Array.from(remoteStreams.entries()).map(([id, stream]) => (
                <div key={id} className="relative rounded-lg overflow-hidden group bg-[#3c4043]">
                  <video
                    ref={(el) => {
                      if (el) {
                        remoteVideoRefs.current.set(id, el);
                        el.srcObject = stream;
                        el.play().catch(console.error); 
                      }
                    }}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                    <div className="bg-[#3c4043]/90 text-[#e8eaed] px-3 py-1.5 rounded-lg text-sm font-medium">
                      Participant {id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom controls bar */}
          <div className="h-20 mt-4 rounded-lg bg-[#3c4043]">
            <div className="flex items-center justify-center h-full space-x-4">
              {/* Mic button */}
              <button className="p-4 rounded-full hover:bg-[#4a4d51] transition-colors bg-[#3c4043]">
                <svg className="w-6 h-6 text-[#e8eaed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Camera button */}
              <button className="p-4 rounded-full hover:bg-[#4a4d51] transition-colors bg-[#3c4043]">
                <svg className="w-6 h-6 text-[#e8eaed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>

              {/* End call button */}
              <button className="p-4 rounded-full bg-[#ea4335] hover:bg-[#dc3626] transition-colors">
                <svg className="w-6 h-6 text-[#e8eaed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SFU;