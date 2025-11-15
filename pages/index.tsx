import { useState } from 'react';
import Head from 'next/head';

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

type VideoInfo = {
  title: string;
  duration: string;
  thumbnail: string;
  formats: VideoFormat[];
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const fetchInfo = async () => {
    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video info');
      }

      setVideoInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (itag?: number, isAudio?: boolean) => {
    const params = new URLSearchParams({ url });
    if (itag) {
      params.append('itag', itag.toString());
    }
    if (isAudio) {
      params.append('format', 'audio');
    }
    window.open(`/api/download?${params.toString()}`, '_blank');
  };

  const getQualityBadge = (quality: string) => {
    const q = quality.toLowerCase();
    if (q.includes('1440p') || q.includes('2160p') || q.includes('4k')) {
      return { text: 'Ultra HD', color: '#9c27b0' };
    }
    if (q.includes('1080p')) {
      return { text: 'Full HD', color: '#e91e63' };
    }
    if (q.includes('720p')) {
      return { text: 'HD', color: '#2196F3' };
    }
    return null;
  };

  const videoFormats = videoInfo?.formats
    .filter(f => f.hasVideo)
    .sort((a, b) => {
      const aQuality = parseInt(a.qualityLabel || '0');
      const bQuality = parseInt(b.qualityLabel || '0');
      return bQuality - aQuality;
    }) || [];

  const muxedFormats = videoFormats.filter(f => f.hasAudio);
  const videoOnlyFormats = videoFormats.filter(f => !f.hasAudio);

  return (
    <>
      <Head>
        <title>YouTube Downloader - Educational Use Only</title>
        <meta name="description" content="Educational YouTube downloader with HD quality support" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div style={styles.pageContainer}>
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>
                <span style={styles.titleIcon}>📥</span>
                YouTube Downloader
              </h1>
              <p style={styles.subtitle}>Download videos in multiple quality options including HD</p>
            </div>

            <div style={styles.warningCard}>
              <span style={styles.warningIcon}>⚠️</span>
              <div>
                <strong>Educational Use Only</strong>
                <p style={styles.warningText}>
                  Only download content you own or have explicit permission to download. Respect copyright laws.
                </p>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste YouTube URL here..."
                  style={styles.input}
                  onKeyPress={(e) => e.key === 'Enter' && fetchInfo()}
                />
                <button
                  onClick={fetchInfo}
                  disabled={loading}
                  style={{
                    ...styles.button,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <>
                      <span style={styles.spinner}>⏳</span> Loading...
                    </>
                  ) : (
                    <>
                      <span style={styles.buttonIcon}>🔍</span> Get Info
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div style={styles.errorCard}>
                <span style={styles.errorIcon}>❌</span>
                <span>{error}</span>
              </div>
            )}

            {videoInfo && (
              <div style={styles.videoCard}>
                <div style={styles.videoHeader}>
                  {videoInfo.thumbnail && (
                    <img src={videoInfo.thumbnail} alt="Thumbnail" style={styles.thumbnail} />
                  )}
                  <div style={styles.videoMeta}>
                    <h2 style={styles.videoTitle}>{videoInfo.title}</h2>
                    <p style={styles.duration}>
                      <span style={styles.durationIcon}>⏱️</span>
                      Duration: {Math.floor(parseInt(videoInfo.duration) / 60)}:
                      {(parseInt(videoInfo.duration) % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>

                <div style={styles.formatsSection}>
                  <h3 style={styles.formatsTitle}>
                    <span style={styles.formatsTitleIcon}>🎬</span>
                    Available Quality Options ({videoFormats.length} formats)
                  </h3>
                  
                  {videoOnlyFormats.length > 0 && (
                    <>
                      <h4 style={styles.sectionTitle}>High Definition (HD) - Video Only</h4>
                      <p style={styles.sectionNote}>⚠️ These HD formats contain video only. Download separately or use lower quality muxed formats below.</p>
                      <div style={styles.formatsList}>
                        {videoOnlyFormats.map((format, index) => {
                          const badge = getQualityBadge(format.qualityLabel || '');
                          return (
                            <div key={`video-only-${format.itag}-${index}`} style={styles.formatItem}>
                              <div style={styles.formatInfo}>
                                <div style={styles.formatHeader}>
                                  <strong style={styles.qualityLabel}>
                                    {format.qualityLabel || format.resolution || 'Unknown'}
                                  </strong>
                                  {badge && (
                                    <span style={{...styles.badge, backgroundColor: badge.color}}>
                                      {badge.text}
                                    </span>
                                  )}
                                  <span style={{...styles.badge, backgroundColor: '#757575'}}>
                                    VIDEO ONLY
                                  </span>
                                </div>
                                <span style={styles.formatDetails}>
                                  <span style={styles.formatTag}>{format.container.toUpperCase()}</span>
                                  <span style={styles.formatDivider}>•</span>
                                  <span>{format.approximateSize || 'Size calculating...'}</span>
                                </span>
                              </div>
                              <button
                                onClick={() => handleDownload(format.itag)}
                                style={styles.downloadButton}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                <span style={styles.downloadIcon}>⬇️</span>
                                Download
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {muxedFormats.length > 0 && (
                    <>
                      <h4 style={styles.sectionTitle}>Complete Formats (Video + Audio)</h4>
                      <div style={styles.formatsList}>
                        {muxedFormats.map((format, index) => {
                          const badge = getQualityBadge(format.qualityLabel || '');
                          return (
                            <div key={`muxed-${format.itag}-${index}`} style={styles.formatItem}>
                              <div style={styles.formatInfo}>
                                <div style={styles.formatHeader}>
                                  <strong style={styles.qualityLabel}>
                                    {format.qualityLabel || format.resolution || 'Unknown'}
                                  </strong>
                                  {badge && (
                                    <span style={{...styles.badge, backgroundColor: badge.color}}>
                                      {badge.text}
                                    </span>
                                  )}
                                </div>
                                <span style={styles.formatDetails}>
                                  <span style={styles.formatTag}>{format.container.toUpperCase()}</span>
                                  <span style={styles.formatDivider}>•</span>
                                  <span>{format.approximateSize || 'Size calculating...'}</span>
                                </span>
                              </div>
                              <button
                                onClick={() => handleDownload(format.itag)}
                                style={styles.downloadButton}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                <span style={styles.downloadIcon}>⬇️</span>
                                Download
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {videoInfo.formats.some(f => f.isAudioOnly) && (
                    <>
                      <h4 style={styles.sectionTitle}>Audio Only</h4>
                      <div style={styles.formatsList}>
                        <div key="audio-only" style={styles.formatItem}>
                          <div style={styles.formatInfo}>
                            <div style={styles.formatHeader}>
                              <strong style={styles.qualityLabel}>Audio Only</strong>
                              <span style={{...styles.badge, backgroundColor: '#ff9800'}}>
                                🎵 MP3
                              </span>
                            </div>
                            <span style={styles.formatDetails}>
                              Highest quality audio track
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownload(undefined, true)}
                            style={styles.downloadButton}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <span style={styles.downloadIcon}>⬇️</span>
                            Download
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <p style={styles.footerText}>
              Created by <strong style={styles.creatorName}>Habib Hassan</strong>
            </p>
            <p style={styles.footerSubtext}>
              For educational purposes only • {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  main: {
    flex: 1,
    padding: '2rem 1rem',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '0.5rem',
    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  titleIcon: {
    fontSize: '2.5rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#f0f0f0',
    margin: 0,
  },
  warningCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.95)',
    backdropFilter: 'blur(10px)',
    color: '#ffffff',
    padding: '1.5rem',
    borderRadius: '16px',
    marginBottom: '2rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  warningIcon: {
    fontSize: '1.5rem',
  },
  warningText: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.9rem',
    opacity: 0.95,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '20px',
    marginBottom: '2rem',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  inputGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  input: {
    flex: '1 1 300px',
    padding: '1rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
    backgroundColor: '#ffffff',
    color: '#333',
    outline: 'none',
    transition: 'all 0.3s',
  },
  button: {
    padding: '1rem 2.5rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  buttonIcon: {
    fontSize: '1.2rem',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  errorCard: {
    backgroundColor: 'rgba(244, 67, 54, 0.95)',
    backdropFilter: 'blur(10px)',
    color: '#ffffff',
    padding: '1.25rem',
    borderRadius: '12px',
    marginBottom: '2rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    boxShadow: '0 4px 20px rgba(244, 67, 54, 0.3)',
  },
  errorIcon: {
    fontSize: '1.5rem',
  },
  videoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  videoHeader: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: '100%',
    maxWidth: '320px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  videoMeta: {
    flex: 1,
    minWidth: '250px',
  },
  videoTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#333',
    marginBottom: '0.75rem',
    lineHeight: '1.4',
  },
  duration: {
    fontSize: '1rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  durationIcon: {
    fontSize: '1.2rem',
  },
  formatsSection: {
    marginTop: '2rem',
  },
  formatsTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#333',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  formatsTitleIcon: {
    fontSize: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#555',
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
  },
  sectionNote: {
    fontSize: '0.9rem',
    color: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid rgba(255, 107, 107, 0.3)',
  },
  formatsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  formatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    transition: 'all 0.3s',
    border: '2px solid transparent',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  formatInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
    minWidth: '200px',
  },
  formatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  qualityLabel: {
    fontSize: '1.1rem',
    color: '#333',
    fontWeight: '600',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  formatDetails: {
    fontSize: '0.9rem',
    color: '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  formatTag: {
    backgroundColor: '#e0e0e0',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#555',
  },
  formatDivider: {
    color: '#999',
  },
  downloadButton: {
    padding: '0.75rem 1.75rem',
    fontSize: '0.95rem',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 4px 15px rgba(67, 233, 123, 0.4)',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    whiteSpace: 'nowrap',
  },
  downloadIcon: {
    fontSize: '1rem',
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '2rem 1rem',
    marginTop: 'auto',
  },
  footerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
  },
  footerText: {
    color: '#ffffff',
    fontSize: '1.1rem',
    margin: '0 0 0.5rem 0',
  },
  creatorName: {
    background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '1.3rem',
    fontWeight: '800',
  },
  footerSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
    margin: 0,
  },
};
