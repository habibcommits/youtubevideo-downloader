import type { NextApiRequest, NextApiResponse } from 'next';
import ytdl from '@distube/ytdl-core';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, itag, format } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  if (!ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    let downloadOptions: ytdl.downloadOptions = {};
    let selectedFormat;
    let ext = 'mp4';
    let contentType = 'video/mp4';
    
    if (itag && typeof itag === 'string') {
      downloadOptions.quality = parseInt(itag);
      selectedFormat = info.formats.find(f => f.itag === parseInt(itag));
      if (selectedFormat) {
        const mime = selectedFormat.mimeType || '';
        if (mime.includes('webm')) {
          ext = 'webm';
          contentType = selectedFormat.hasVideo ? 'video/webm' : 'audio/webm';
        } else if (mime.includes('audio/mp4')) {
          ext = 'm4a';
          contentType = 'audio/mp4';
        } else if (selectedFormat.container === 'webm') {
          ext = 'webm';
          contentType = selectedFormat.hasVideo ? 'video/webm' : 'audio/webm';
        } else {
          ext = selectedFormat.container || 'mp4';
          contentType = selectedFormat.hasVideo ? 'video/mp4' : 'audio/mp4';
        }
      }
    } else if (format === 'mp3' || format === 'audio') {
      downloadOptions.filter = (fmt) => fmt.hasAudio && !fmt.hasVideo;
      downloadOptions.quality = 'highestaudio';
      
      const audioFormats = info.formats.filter(f => f.hasAudio && !f.hasVideo);
      selectedFormat = audioFormats.reduce((best, current) => {
        if (!best) return current;
        return (current.audioBitrate || 0) > (best.audioBitrate || 0) ? current : best;
      }, null as any);
      
      if (selectedFormat) {
        const mime = selectedFormat.mimeType || '';
        if (mime.includes('webm')) {
          ext = 'webm';
          contentType = 'audio/webm';
        } else if (mime.includes('audio/mp4')) {
          ext = 'm4a';
          contentType = 'audio/mp4';
        } else if (selectedFormat.container === 'webm') {
          ext = 'webm';
          contentType = 'audio/webm';
        } else {
          ext = selectedFormat.container || 'm4a';
          contentType = 'audio/mp4';
        }
      }
    } else {
      downloadOptions.filter = (fmt) => fmt.hasAudio && fmt.hasVideo;
      downloadOptions.quality = 'highest';
      
      const muxedFormats = info.formats.filter(f => f.hasAudio && f.hasVideo);
      selectedFormat = muxedFormats.reduce((best, current) => {
        if (!best) return current;
        const bestQuality = parseInt(best.qualityLabel || '0');
        const currentQuality = parseInt(current.qualityLabel || '0');
        return currentQuality > bestQuality ? current : best;
      }, null as any);
      
      if (selectedFormat) {
        const mime = selectedFormat.mimeType || '';
        if (mime.includes('webm')) {
          ext = 'webm';
          contentType = 'video/webm';
        } else if (selectedFormat.container === 'webm') {
          ext = 'webm';
          contentType = 'video/webm';
        } else {
          ext = 'mp4';
          contentType = 'video/mp4';
        }
      }
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${videoTitle}.${ext}"`);
    res.setHeader('Cache-Control', 'no-cache');

    const videoStream = ytdl(url, downloadOptions);
    
    videoStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream video' });
      }
    });

    videoStream.pipe(res);
  } catch (error) {
    console.error('Error downloading video:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download video' });
    }
  }
}
