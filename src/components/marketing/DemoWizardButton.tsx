'use client';

import { cloneElement, isValidElement, useState, type ReactElement } from 'react';
import DemoWizardModal from './DemoWizardModal';

export default function DemoWizardButton({
  children,
}: {
  children: ReactElement<{ onClick?: () => void }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {isValidElement(children)
        ? cloneElement(children, {
            onClick: () => {
              children.props.onClick?.();
              setOpen(true);
            },
          })
        : children}
      {open && <DemoWizardModal onClose={() => setOpen(false)} />}
    </>
  );
}
