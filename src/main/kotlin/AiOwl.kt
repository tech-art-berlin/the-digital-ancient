package com.techartberlin.digitalancient

import org.openrndr.*
import org.openrndr.draw.*
import org.openrndr.ffmpeg.VideoPlayerFFMPEG
import org.openrndr.math.Vector2

fun main() = application {
  configure {
    fullscreen = Fullscreen.CURRENT_DISPLAY_MODE
  }
  program {
    val width = 1920
    val height = 1080
    val frameRate = 90
    var frame = 0
    val videoPlayer = VideoPlayerFFMPEG.fromFile("file:media/owl.mp4")
    videoPlayer.play()
    val mixerBuffer = colorBuffer(
        width, height, format = ColorFormat.RGB, type = ColorType.FLOAT16
    )
    mixerBuffer.wrapV = WrapMode.MIRRORED_REPEAT
    mixerBuffer.wrapU = WrapMode.MIRRORED_REPEAT
    val owlShader = Filter(null, filterWatcherFromUrl("file:src/main/glsl/owl/AiOwlFilter.frag"))
    owlShader.parameters["resolution"] = Vector2(width.toDouble(), height.toDouble())
    owlShader.parameters["frameRate"] = frameRate.toDouble()
    extend {
      owlShader.parameters["frame"] = frame
      videoPlayer.update()
      owlShader.apply(arrayOf(mixerBuffer, videoPlayer.colorBuffer!!), mixerBuffer)
      drawer.image(mixerBuffer)
      frame++
    }
  }
}
