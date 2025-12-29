
// chakana-phase-from-images.js (REAL)
(function () {
  async function loadImageData(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';     // HTTPS (Pages/Netlify)
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const x = c.getContext('2d');
        x.drawImage(img, 0, 0);
        try {
          const d = x.getImageData(0, 0, img.width, img.height);
          resolve({ data: d, width: img.width, height: img.height });
        } catch (err) {
          reject(new Error('Lectura bloqueada: usa HTTP/HTTPS (Pages/Netlify), no file://'));
        }
      };
      img.onerror = () => reject(new Error('No se pudo cargar: '+src));
      img.src = src;
    });
  }

  const PHASE_IMAGE_MAP = {
    1:  { src: 'assets/img/patterns/1_7x7.jpg',   n: 7  },
    2:  { src: 'assets/img/patterns/2_7x7.jpg',   n: 7  },
    3:  { src: 'assets/img/patterns/3_7x7.jpg',   n: 7  },
    4:  { src: 'assets/img/patterns/4_7x7.jpg',   n: 7  },
    5:  { src: 'assets/img/patterns/1_9x9.jpg',   n: 9  },
    6:  { src: 'assets/img/patterns/2_9x9.jpg',   n: 9  },
    7:  { src: 'assets/img/patterns/3_9x9.jpg',   n: 9  },
    8:  { src: 'assets/img/patterns/4_9x9.jpg',   n: 9  },
    9:  { src: 'assets/img/patterns/1_10x10.jpg', n: 10 },
    10: { src: 'assets/img/patterns/2_10x10.jpg', n: 10 },
    11: { src: 'assets/img/patterns/3_10x10.jpg', n: 10 },
    12: { src: 'assets/img/patterns/4_10x10.jpg', n: 10 },
  };

  // Mapeo simple por luminancia (ajusta si usas colores específicos)
  async function extractMatrixFromImage(src, n) {
    const { data, width, height } = await loadImageData(src);
    const cells = Array.from({ length: n }, () => Array(n).fill(0));
    const bw = Math.floor(width / n), bh = Math.floor(height / n);

    for (let r=0; r<n; r++){
      for (let c=0; c<n; c++){
        const x = Math.min(c * bw + (bw>>1), width - 1);
        const y = Math.min(r * bh + (bh>>1), height - 1);
        const idx = (y * width + x) * 4;
        const R = data.data[idx], G = data.data[idx+1], B = data.data[idx+2];
        const Y = 0.2126*R + 0.7152*G + 0.0722*B;

        // 0/1/2/4 a modo demostración
        cells[r][c] = Y > 200 ? 1 : (Y > 120 ? 2 : 4);
      }
    }
    return cells;
  }

  window.ChakanaPhaseFromImages = { PHASE_IMAGE_MAP, extractMatrixFromImage };
})();
