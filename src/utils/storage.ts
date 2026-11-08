import { RecordingItem, ScreenshotItem } from '../types/recorder';

const DB_NAME = 'StitchRecorderDB';
const DB_VERSION = 1;
const STORE_RECORDINGS = 'recordings';
const STORE_SCREENSHOTS = 'screenshots';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_RECORDINGS)) {
        db.createObjectStore(STORE_RECORDINGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SCREENSHOTS)) {
        db.createObjectStore(STORE_SCREENSHOTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generate a sample video blob if empty so the user can test playback and MP4 export right away
async function createDemoVideoBlob(): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new Blob(['demo video'], { type: 'video/mp4' });
  }

  // Draw a sleek mobile demo screen animation into canvas
  const stream = canvas.captureStream(30);
  let mimeType = 'video/mp4';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  return new Promise((resolve) => {
    try {
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: 'video/mp4' }));
      };

      recorder.start();

      let frame = 0;
      const totalFrames = 90; // 3 seconds demo

      function renderFrame() {
        if (!ctx) return;
        frame++;

        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
        grad.addColorStop(0, '#1E293B');
        grad.addColorStop(0.5, '#0F172A');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);

        // Status bar
        ctx.fillStyle = '#94A3B8';
        ctx.font = '600 36px sans-serif';
        ctx.fillText('09:41', 70, 90);
        ctx.fillText('5G · 100%', 880, 90);

        // Stitch App Bar card
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.roundRect(60, 160, 960, 180, 36);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 52px sans-serif';
        ctx.fillText('🎮 Mobile Game Stream Demo', 110, 260);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '36px sans-serif';
        ctx.fillText('Recorded at 1080p FHD 60FPS with Stitch HD Recorder', 110, 310);

        // Animated bouncing ball / game graphic
        const angle = (frame / totalFrames) * Math.PI * 4;
        const ballX = 540 + Math.sin(angle) * 320;
        const ballY = 900 + Math.cos(angle) * 220;

        // Glow
        const radGrad = ctx.createRadialGradient(ballX, ballY, 10, ballX, ballY, 180);
        radGrad.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        radGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(ballX, ballY, 180, 0, Math.PI * 2);
        ctx.fill();

        // Inner ball
        ctx.fillStyle = '#60A5FA';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 60, 0, Math.PI * 2);
        ctx.fill();

        // Animated chart / metric
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const x = 120 + i * 115;
          const y = 1450 - Math.sin((frame + i * 10) * 0.1) * 120;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Live badge
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(100, 1680, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(`REC · 00:0${Math.floor(frame / 30)} · 1080p 60FPS`, 140, 1692);

        if (frame < totalFrames) {
          requestAnimationFrame(renderFrame);
        } else {
          recorder.stop();
        }
      }

      renderFrame();
    } catch {
      resolve(new Blob(['fallback'], { type: 'video/mp4' }));
    }
  });
}

function createThumbnailFromCanvas(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 270;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const grad = ctx.createLinearGradient(0, 0, 480, 270);
  grad.addColorStop(0, '#1E293B');
  grad.addColorStop(1, '#0F172A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 480, 270);

  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(240, 135, 45, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(230, 115);
  ctx.lineTo(260, 135);
  ctx.lineTo(230, 155);
  ctx.closePath();
  ctx.fill();

  ctx.font = '600 20px sans-serif';
  ctx.fillText('1080p FHD Sample', 30, 240);

  return canvas.toDataURL('image/jpeg', 0.8);
}

export async function getAllRecordings(): Promise<RecordingItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECORDINGS, 'readonly');
    const store = tx.objectStore(STORE_RECORDINGS);
    const req = store.getAll();

    req.onsuccess = async () => {
      let items: RecordingItem[] = req.result || [];
      // If empty on first launch, seed a demo item
      if (items.length === 0) {
        try {
          const sampleBlob = await createDemoVideoBlob();
          const demoItem: RecordingItem = {
            id: 'sample-rec-1',
            title: 'Sample Mobile Screen Capture - 1080p FHD',
            blob: sampleBlob,
            thumbnailUrl: createThumbnailFromCanvas(),
            duration: 3,
            sizeBytes: sampleBlob.size || 2450000,
            resolution: '1080p FHD',
            fps: 60,
            hasAudio: true,
            audioSource: 'mixed',
            createdAt: Date.now() - 3600000,
            isFavorite: true,
            format: 'mp4',
          };
          await saveRecording(demoItem);
          items = [demoItem];
        } catch {
          // ignore seeding error
        }
      }
      // Sort newest first
      items.sort((a, b) => b.createdAt - a.createdAt);
      resolve(items);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function saveRecording(item: RecordingItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
    const store = tx.objectStore(STORE_RECORDINGS);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
    const store = tx.objectStore(STORE_RECORDINGS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function updateRecording(item: Partial<RecordingItem> & { id: string }): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
    const store = tx.objectStore(STORE_RECORDINGS);
    const getReq = store.get(item.id);

    getReq.onsuccess = () => {
      if (!getReq.result) {
        resolve();
        return;
      }
      const updated = { ...getReq.result, ...item };
      store.put(updated).onsuccess = () => resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// Screenshot storage
export async function getAllScreenshots(): Promise<ScreenshotItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SCREENSHOTS, 'readonly');
    const store = tx.objectStore(STORE_SCREENSHOTS);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = (req.result || []) as ScreenshotItem[];
      items.sort((a, b) => b.createdAt - a.createdAt);
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveScreenshot(item: ScreenshotItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SCREENSHOTS, 'readwrite');
    const store = tx.objectStore(STORE_SCREENSHOTS);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteScreenshot(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SCREENSHOTS, 'readwrite');
    const store = tx.objectStore(STORE_SCREENSHOTS);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Calculate total storage usage
export async function getStorageUsage(): Promise<{ usedBytes: number; count: number }> {
  try {
    const recordings = await getAllRecordings();
    const usedBytes = recordings.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
    return { usedBytes, count: recordings.length };
  } catch {
    return { usedBytes: 0, count: 0 };
  }
}
