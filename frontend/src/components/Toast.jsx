import { useEffect, useState } from 'react';

let addToast;

export function useToast() {
  return (msg, type = 'success') => addToast && addToast(msg, type);
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToast = (msg, type) => {
      const id = Date.now();
      setToasts(p => [...p, { id, msg, type }]);
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' ? '✅' : '❌'} {t.msg}
        </div>
      ))}
    </div>
  );
}
