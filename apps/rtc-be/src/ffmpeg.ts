import { spawn, ChildProcessWithoutNullStreams } from "child_process"
import ffmpegPath from "ffmpeg-static"
import { Readable } from "stream"

const handleStream = (streamData: Readable, rtmpUrl: string): void => {
    const ffmpeg: ChildProcessWithoutNullStreams = spawn(ffmpegPath!, [
        '-i', 'pipe:0',
        '-f', 'flv',
        rtmpUrl
    ])

    streamData.pipe(ffmpeg.stdin)

    ffmpeg.stderr.on('data', (data) => {
        console.error(`FFmpeg stderr: ${data}`)
    })

    ffmpeg.on('close', (code) => {
        console.log(`FFmpeg exited with code ${code}`)
    })
}

export default handleStream