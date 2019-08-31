# the-digital-ancient

Generative videos for the visual essay of
[Qinyuan Lei](https://www.inbetweenalbum.com) presented
during the first Tech Art Berlin event


## video pre-processing

Fixing Lei's camera color range for ffmpeg and better compression:

    ffmpeg -i MVI_0514.MOV -vf scale=in_range=full:out_range=full -preset slow nedia/owl.mp4

