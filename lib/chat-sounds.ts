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
    // Welcome sound
    this.playTone(523, 0.1, 0.04); // C
    setTimeout(() => this.playTone(659, 0.1, 0.04), 80); // E
    setTimeout(() => this.playTone(784, 0.15, 0.04), 160); // G
  }

  static playUserLeft() {
    // Goodbye sound
    this.playTone(784, 0.1, 0.03); // G
    setTimeout(() => this.playTone(659, 0.1, 0.03), 80); // E
    setTimeout(() => this.playTone(523, 0.15, 0.03), 160); // C
  }

  static playTypingStart() {
    // Very subtle typing sound
    this.playTone(1200, 0.05, 0.02);
  }
} 