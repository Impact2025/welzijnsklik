'use client';

import { useState } from 'react';
import DemoWizardModal from './DemoWizardModal';

export default function DemoWizardButton({
  children,
}: {
  children: (props: { onClick: () => void }) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children({ onClick: () => setOpen(true) })}
      {open && <DemoWizardModal onClose={() => setOpen(false)} />}
    </>
  );
}
