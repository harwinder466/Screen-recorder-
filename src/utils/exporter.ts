// Utilities for local storage HD MP4 export, file formatting, trimming, and audio extraction

export function formatDuration(seconds: number): string {
  const rounded = Math.round(seconds);
  const hrs = Math.floor(rounded / 3600);
  const mins = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Download HD MP4 to Local Storage
export async function exportVideoToLocalStorage(blob: Blob, suggestedFileName: string): Promise<boolean> {
  const safeName = suggestedFileName.endsWith('.mp4') ? suggestedFileName : `${suggestedFileName}.mp4`;

  // Create an explicit MP4 typed blob for high definition output
  const mp4Blob = blob.type === 'video/mp4' 
    ? blob 
    : new Blob([blob], { type: 'video/mp4' });

  // 1. Try modern Native File System Access API if user's browser supports it
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as unknown as {
        showSaveFilePicker: (options: {
          suggestedName: string;
          types: Array<{ description: string; accept: Record<string, string[]> }>;
        }) => Promise<FileSystemFileHandle>;
      }).showSaveFilePicker({
        suggestedName: safeName,
        types: [
          {
            description: 'High Definition MP4 Video (*.mp4)',
            accept: { 'video/mp4': ['.mp4'] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(mp4Blob);
      await writable.close();
      return true;
    } catch (err: unknown) {
      const errorObj = err as Error;
      if (errorObj.name === 'AbortError') {
        // User cancelled save dialog
        return false;
      }
      // Fallback to standard anchor download on any API issue
    }
  }

  // 2. Reliable Direct Browser Local Download
  const url = URL.createObjectURL(mp4Blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);

  return true;
}

// Download Screenshot Image
export function exportImageToLocalStorage(dataUrl: string, fileName: string) {
  const safeName = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = dataUrl;
  a.download = safeName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
  }, 1000);
}

// Share recording via Web Share API or copy link
export async function shareRecording(blob: Blob, title: string): Promise<boolean> {
  const safeName = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp4`;
  const file = new File([blob], safeName, { type: 'video/mp4' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: title,
        text: 'Recorded with Stitch HD Screen Recorder',
        files: [file],
      });
      return true;
    } catch {
      // User cancelled
      return false;
    }
  }

  // Fallback: trigger download
  return exportVideoToLocalStorage(blob, safeName);
}

// Video Trimmer implementation
export async function trimVideo(
  videoBlob: Blob,
  startTimeSec: number,
  endTimeSec: number,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoBlob);
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const duration = endTimeSec - startTimeSec;
      if (duration <= 0) {
        reject(new Error('Invalid trim range'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const stream = canvas.captureStream(30);
      let mimeType = 'video/mp4';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        URL.revokeObjectURL(video.src);
        resolve(new Blob(chunks, { type: 'video/mp4' }));
      };

      video.currentTime = startTimeSec;

      video.onseeked = () => {
        recorder.start();
        video.play();

        const renderInterval = setInterval(() => {
          if (video.currentTime >= endTimeSec || video.ended) {
            clearInterval(renderInterval);
            video.pause();
            recorder.stop();
            if (onProgress) onProgress(100);
          } else {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const progress = Math.min(99, Math.round(((video.currentTime - startTimeSec) / duration) * 100));
            if (onProgress) onProgress(progress);
          }
        }, 1000 / 30);
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video for trimming'));
    };
  });
}
