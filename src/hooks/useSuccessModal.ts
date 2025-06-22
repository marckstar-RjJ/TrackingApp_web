import { useState } from 'react';

export const useSuccessModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  const showSuccess = (msg: string) => {
    setMessage(msg);
    setIsVisible(true);
  };

  const hideSuccess = () => {
    setIsVisible(false);
    setMessage('');
  };

  return {
    isVisible,
    message,
    showSuccess,
    hideSuccess
  };
}; 