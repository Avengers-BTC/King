// Chat sound notifications utility

export class ChatSounds {
  private static audioContext: AudioContext | null = null;
  private static enabled = true;

  static init() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }

  static setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  static isEnabled() {
    return this.enabled;
  }

  private static playTone(frequency: number, duration: number, volume: number = 0.1) {
    if (!this.audioContext || !this.enabled) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  static playMessageReceived() {
    // Pleasant notification sound
    this.playTone(800, 0.1, 0.05);
    setTimeout(() => this.playTone(1000, 0.1, 0.03), 100);
  }

  static playMessageSent() {
    // Subtle confirmation sound
    this.playTone(600, 0.08, 0.03);
  }

  static playUserJoined() {
    // Cheerful ascending sound for user joining
    if (!this.enabled) return;
    
    this.playTone(440, 0.1, 0.05); // A4
    setTimeout(() => this.playTone(523.25, 0.1, 0.05), 100); // C5
    setTimeout(() => this.playTone(659.25, 0.2, 0.05), 200); // E5
  }

  static playUserLeft() {
    // Soft descending sound for user leaving
    if (!this.enabled) return;
    
    this.playTone(523.25, 0.1, 0.05); // C5
    setTimeout(() => this.playTone(440, 0.2, 0.05), 150); // A4
  }

  static playDJJoined() {
    // Special fanfare for DJ joining
    if (!this.enabled) return;
    
    this.playTone(523.25, 0.1, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 0.1), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.3, 0.1), 200); // G5
  }

  static playTypingStart() {
    // Very subtle typing sound
    this.playTone(1200, 0.05, 0.02);
  }
}