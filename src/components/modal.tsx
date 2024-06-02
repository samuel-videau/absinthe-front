'use client'

import React from 'react';

type ModalProps = {
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ type, title, message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className={`text-lg font-bold mb-2 ${type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{title}</h2>
        <p className="mb-4 text-black">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
