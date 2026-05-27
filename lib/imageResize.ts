/**
 * Downscale an image file to a JPEG data URL no larger than `maxDim` on its
 * longest edge. Keeps localStorage friendly and trims memory pressure when
 * the user uploads a dozen full-resolution phone photos.
 */
export async function fileToResizedDataUrl(
  file: File,
  maxDim = 1200,
  quality = 0.85
): Promise<string> {
  // Fall back to raw FileReader if it's something the canvas can't handle
  // (HEIC in browsers without native support, exotic mime types, etc.).
  try {
    const img = await loadImage(file);
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (!w || !h) throw new Error("invalid image dimensions");
    const longest = Math.max(w, h);
    if (longest > maxDim) {
      const ratio = maxDim / longest;
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch (e) {
    console.warn("fileToResizedDataUrl: falling back to raw read", e);
    return readAsDataUrl(file);
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
      // Free the object URL once decoded.
      URL.revokeObjectURL(url);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
