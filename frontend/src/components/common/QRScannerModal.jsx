import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Keyboard, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess, title = "Scan Passenger QR Pass" }) {
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const qrRegionId = "pilago-qr-reader";
  const html5QrCodeRef = useRef(null);

  // Success Audio Beep
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio feedback failed', e);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setManualCode('');
      setCameraError('');
      setSuccessMessage('');
      return;
    }

    // Initialize camera scanner when modal opens
    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    setCameraError('');
    try {
      // Small delay to ensure modal DOM is mounted
      setTimeout(async () => {
        const qrContainer = document.getElementById(qrRegionId);
        if (!qrContainer) return;

        const html5QrCode = new Html5Qrcode(qrRegionId);
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        };

        try {
          await html5QrCode.start(
            { facingMode: "environment" }, // Prefer back camera on mobile
            config,
            (decodedText) => {
              handleDecoded(decodedText);
            },
            (errorMessage) => {
              // Frame parse failure, normal while scanning
            }
          );
          setScanning(true);
        } catch (err) {
          console.warn("Camera start error:", err);
          setCameraError("Camera access unavailable. You can enter the ticket code manually below.");
        }
      }, 200);
    } catch (e) {
      setCameraError("Unable to initialize scanner.");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn("Scanner stop error:", e);
      }
      html5QrCodeRef.current = null;
      setScanning(false);
    }
  };

  const handleDecoded = async (text) => {
    playBeep();
    setSuccessMessage("QR Scanned successfully!");
    if (onScanSuccess) {
      await onScanSuccess(text);
    }
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    playBeep();
    onScanSuccess(manualCode.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-2">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-extrabold text-brand-900">{title}</h3>
          <p className="text-xs text-gray-500">Scan passenger pass to verify fare and confirm boarding.</p>
        </div>

        {/* Live Camera Viewfinder */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-950 min-h-[240px] flex items-center justify-center border border-gray-200 shadow-inner">
          <div id={qrRegionId} className="w-full h-full" />
          {successMessage && (
            <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white z-10 animate-in fade-in">
              <CheckCircle2 className="w-12 h-12 mb-2 animate-bounce" />
              <span className="font-extrabold text-sm">{successMessage}</span>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-2.5 rounded-xl flex items-start space-x-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Manual Code Fallback */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 text-center flex items-center justify-center">
            <Keyboard className="w-3.5 h-3.5 mr-1" /> Or Enter Ticket Token Manually
          </span>
          <form onSubmit={handleManualSubmit} className="flex space-x-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. TKT-71844F256351"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
