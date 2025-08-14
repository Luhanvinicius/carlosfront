import { useState } from 'react';
import { Dialog, DialogOverlay } from '@headlessui/react';

export default function TesteDialog() {
  const [open, setOpen] = useState(true);

return (
  <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
    <DialogOverlay className="fixed inset-0 bg-black opacity-30" />
    <div className="bg-white p-6 rounded shadow-lg z-10">
      {/* conteúdo do modal */}
    </div>
  </Dialog>
);
}