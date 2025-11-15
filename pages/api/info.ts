import type { NextApiRequest, NextApiResponse } from 'next';
import ytdl from '@distube/ytdl-core';

type VideoFormat = {
  itag: number;
  container: string;
  resolution?: string;
  bitrate: number;
  approximateSize?: string;
  isAudioOnly: boolean;
  qualityLabel?: string;
  hasVideo: boolean;
  hasAudio: boolean;
};

type InfoResponse = {
  title: string;
  duration: string;
  thumbnail: string;
  formats: VideoFormat[];
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InfoResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  if (!ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    
    const formats: VideoFormat[] = info.formats
      .filter(format => format.hasVideo || format.hasAudio)
      .map(format => ({
        itag: format.itag,
        container: format.container || 'unknown',
        resolution: format.qualityLabel || undefined,
        bitrate: format.bitrate || 0,
        approximateSize: format.contentLength 
          ? `${(parseInt(format.contentLength) / (1024 * 1024)).toFixed(2)} MB`
          : undefined,
        isAudioOnly: !format.hasVideo && format.hasAudio,
        qualityLabel: format.qualityLabel || (format.hasAudio && !format.hasVideo ? 'Audio Only' : undefined),
        hasVideo: format.hasVideo,
        hasAudio: format.hasAudio,
      }))
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    res.status(200).json({
      title: info.videoDetails.title,
      duration: info.videoDetails.lengthSeconds,
      thumbnail: info.videoDetails.thumbnails[0]?.url || '',
      formats,
    });
  } catch (error) {
    console.error('Error fetching video info:', error);
    res.status(500).json({ error: 'Failed to fetch video information' });
  }
}
