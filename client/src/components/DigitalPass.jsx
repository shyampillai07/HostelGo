import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';
import './DigitalPass.css';

export default function DigitalPass({ user }) {
  const [pass, setPass] = useState(null);
  const [reason, setReason] = useState('');

  async function fetchPass() {
    const res = await api.get('/pass/me');
    setPass(res.data.pass);
    setReason(res.data.reason || '');
  }

  useEffect(() => {
    fetchPass();

    const interval = setInterval(fetchPass, 40000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cp-pass-card">
      <div className="cp-pass-photo">{user.photoUrl ? <img src={user.photoUrl} alt="" /> : <span>{user.name?.[0]}</span>}</div>
      <div className="cp-pass-info">
        <h2>{user.name}</h2>
        <div className="cp-pass-field"><span>USN</span>{user.usn}</div>
        <div className="cp-pass-field"><span>Branch</span>{user.branch} · {user.category}</div>
        <div className="cp-pass-field"><span>Room</span>{pass ? pass.room : 'Not allocated yet'}</div>
      </div>
      <div className="cp-pass-qr">
        {pass ? <QRCodeSVG value={pass.qrToken} size={176} level="M" marginSize={2} /> : <span>{reason || 'Loading...'}</span>}
      </div>
    </div>
  );
}