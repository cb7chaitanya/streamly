import { spawn, ChildProcessWithoutNullStreams } from "child_process"
import ffmpegPath from "ffmpeg-static"
import { Readable } from "stream"

const handleStream = (streamData: Readable, rtmpUrl: string): ChildProcessWithoutNullStreams => {
    const ffmpeg: ChildProcessWithoutNullStreams = spawn(ffmpegPath.toString(), [
        '-i', 'pipe:0',
        '-f', 'flv',
        '-re',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'veryfast',
        '-b:a', '128k',
        rtmpUrl
    ])

    streamData.pipe(ffmpeg.stdin)

    ffmpeg.stderr.on('data', (data) => {
        console.error(`FFmpeg stderr: ${data}`)
    })

    ffmpeg.on('close', (code) => {
        console.log(`FFmpeg exited with code ${code}`)
    })

    return ffmpeg
}

export default handleStream