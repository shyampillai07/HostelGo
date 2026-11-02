import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../api/axios';
import Layout from '../components/Layout';
import './ScannerPage.css';

const ELEMENT_ID = 'cp-qr-reader';

async function stopScanner(scanner, started) {
  let shouldStop = started;

  if (!shouldStop && typeof scanner.getState === 'function') {
    try {
      const state = scanner.getState();
      shouldStop = state === 2 || state === 3;
    } catch {
      shouldStop = false;
    }
  }

  if (shouldStop) {
    try {
      await Promise.resolve().then(() => scanner.stop());
    } catch {
      // The scanner may already have stopped while the camera permission request settled.
    }
  }

  try {
    await Promise.resolve().then(() => scanner.clear());
  } catch {
    // Clearing an unmounted scanner is safe to ignore.
  }
}

export default function ScannerPage() {
  const [cameraError, setCameraError] = useState('');
  const [result, setResult] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [cameraRetry, setCameraRetry] = useState(0);
  const busyRef = useRef(false);
  const scannerRef = useRef(null);

  async function verify(qrToken) {
    if (!qrToken || busyRef.current) return;
    busyRef.current = true;
    setIsScanning(false);
    setResult(null);
    try {
      const res = await api.post('/scanner/verify', { qrToken });
      setResult(res.data);
    } catch (error) {
      setResult({ accessGranted: false, reason: error.response?.data?.error || 'Verification request failed' });
    } finally {
      window.setTimeout(() => {
        busyRef.current = false;
        setIsScanning(true);
      }, 2000);
    }
  }

  useEffect(() => {
    let cancelled = false;
    let scanner = null;

    const startScanner = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('This device does not support camera-based QR scanning. Use the manual QR token input instead.');
        setIsScanning(false);
        return;
      }

      scanner = new Html5Qrcode(ELEMENT_ID);
      scannerRef.current = scanner;

      try {
        const permissionStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' } },
        });
        permissionStream.getTracks().forEach((track) => track.stop());

        if (cancelled) {
          await stopScanner(scanner, false);
          return;
        }

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (busyRef.current) return;
            verify(decodedText);
          },
          () => {}
        );

        if (cancelled) {
          await stopScanner(scanner, true);
          return;
        }
      } catch (error) {
        if (!cancelled) {
          const reason = error?.name === 'NotAllowedError'
            ? 'Camera permission is blocked. Allow camera access for localhost in your browser settings, then choose Retry camera.'
            : error?.name === 'NotFoundError'
              ? 'No camera was found on this device. You can still verify a token manually below.'
              : 'Camera access is unavailable. Check that no other app is using the camera, then choose Retry camera.';
          setCameraError(reason);
          setIsScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (scanner) {
        scannerRef.current = null;
        void stopScanner(scanner, false);
      }
    };
  }, [cameraRetry]);

  return (
    <Layout>
      <div className="cp-scanner">
        <header className="cp-page-header cp-page-header--compact">
          <div>
            <span className="cp-kicker">Entry</span>
            <h1>Gate scanner</h1>
          </div>
        </header>

        {cameraError ? (
          <div className="cp-scanner-error">
            <div>{cameraError}</div>
            <button type="button" onClick={() => {
              setCameraError('');
              setIsScanning(true);
              setCameraRetry((value) => value + 1);
            }}>
              Retry camera
            </button>
          </div>
        ) : (
          <div className="cp-scanner-shell">
            <div id={ELEMENT_ID} className="cp-scanner-view" />
            <div className="cp-scanner-indicator">{isScanning ? 'Scanning for a valid QR pass...' : 'Checking pass…'}</div>
          </div>
        )}

        <div className="cp-scanner-manual">
          <input
            aria-label="Manual QR token"
            placeholder="Paste QR token to verify manually"
            value={manualToken}
            onChange={(event) => setManualToken(event.target.value)}
          />
          <button type="button" onClick={() => verify(manualToken)}>
            Verify
          </button>
        </div>

        {result && (
          <div className={`cp-scan-result cp-scan-result--${result.accessGranted ? 'granted' : 'denied'}`}>
            <div className="cp-scan-status">{result.accessGranted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</div>
            {result.accessGranted ? (
              <>
                {result.photoUrl && <img src={result.photoUrl} alt="Student profile" className="cp-scan-photo" />}
                <div><strong>{result.name}</strong></div>
                <div>{result.usn}</div>
                <div>{result.room}</div>
                {result.passValidUntil && <div>Valid until: {new Date(result.passValidUntil).toLocaleString('en-IN')}</div>}
              </>
            ) : (
              <div>{result.reason}</div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}