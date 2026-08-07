/**
 * Screen Wake Lock API helper — keeps display on during Cook Mode.
 */
window.CookModeWakeLock = {
  lock: null,

  isSupported() {
    return "wakeLock" in navigator;
  },

  async acquire() {
    if (!this.isSupported()) return false;

    try {
      if (this.lock) return true;
      this.lock = await navigator.wakeLock.request("screen");
      this.lock.addEventListener("release", () => {
        this.lock = null;
      });
      return true;
    } catch {
      this.lock = null;
      return false;
    }
  },

  async release() {
    if (!this.lock) return;
    try {
      await this.lock.release();
    } catch {
      /* already released */
    }
    this.lock = null;
  },

  isActive() {
    return Boolean(this.lock);
  },
};
