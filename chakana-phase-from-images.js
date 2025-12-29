
// chakana-phase-from-images.js
(function () {
  // Utilidad: carga imagen y devuelve ImageData
  async function loadImageData(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';            // necesario en Pages/Netlify
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          const data = ctx.getImageData(0, 0, img.width, img.height);
          resolve({ data, width: img.width, height: img.height });
        } catch (err) {
          reject(new Error('Lectura de píxeles bloqueada. Usa HTTP/HTTPS.'));
        }
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen: ' + src));
      img.src = src;
    });
  }

  // Mapa de fases → imagen patrón + N (tamaño del tablero)
  // Ajusta las rutas a tus archivos reales en assets/img/patterns/
  const PHASE_IMAGE_MAP = {
    1: { src: 'assets/img/patterns/1_7x7.jpg',  n: 7  },
    2: { src: 'assets/img/patterns/2_7x7.jpg',  n: 7  },
    3: { src: 'assets/img/patterns/3_7x7.jpg',  n: 7  },
    4: { src: 'assets/img/patterns/4_7x7.jpg',  n: 7  },
    5: { src: 'assets/img/patterns/1_9x9.jpg',  n: 9  },
    6: { src: 'assets/img/patterns/2_9x9.jpg',  n: 9  },
    7: { src: 'assets/img/patterns/3_9x9.jpg',  n: 9  },
    8: { src: 'assets/img/patterns/4_9x9.jpg',  n: 9  },
    9: { src: 'assets/img/patterns/1_10x10.jpg', n: 10 },
    10:{ src: 'assets/img/patterns/2_10x10.jpg', n: 10 },
    11:{ src: 'assets/img/patterns/3_10x10.jpg', n: 10 },
    12:{ src: 'assets/img/patterns/4_10x10.jpg', n: 10 },
  };

  /**
   * Convierte un patrón de imagen en una matriz N×N con valores por celda.
   * Debes definir tu criterio de clasificación (color → valor).
   * Aquí hay un ejemplo simple que mapea por luminancia:
   */
  async function extractMatrixFromImage(src, n) {
    const { data, width, height } = await loadImageData(src);

    // Reescalado lógico: muestrear n×n celdas tomando el color medio de cada bloque
    const cells = Array.from({ length: n }, () => Array(n).fill(0));
    const blockW = Math.floor(width / n), blockH = Math.floor(height / n);

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        // muestreo: píxel central del bloque (rápido)
        const x = Math.min(c * blockW + Math.floor(blockW / 2), width - 1);
        const y = Math.min(r * blockH + Math.floor(blockH / 2), height - 1);
        const idx = (y * width + x) * 4;
        const R = data.data[idx], G = data.data[idx + 1], B = data.data[idx + 2];
        // luminancia simple
        const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;

        // Clasificación de ejemplo (ajústala a tus colores):
        // valores: 0 = vacío, 1 = verde claro, 2 = amarillo, 4 = marrón/oscuro
        let val = 0;
        if (Y > 200) val = 1;            // claro → 1
        else if (Y > 120) val = 2;       // medio → 2
        else val = 4;                    // oscuro → 4

        cells[r][c] = val;
      }
    }
    return cells;
  }

  // Exponer API global
  window.ChakanaPhaseFromImages = {
    PHASE_IMAGE_MAP,
    extractMatrixFromImage,
  };
})();
