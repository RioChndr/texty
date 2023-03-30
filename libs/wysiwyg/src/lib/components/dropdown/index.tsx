import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Styles from './style.module.scss';

export function Dropdown(props: {
  activator: React.ReactNode,
  children: React.ReactNode,
}) {
  const [isShow, setIsShow] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (button && isShow) {
      const handle = (event: MouseEvent) => {
        const target = event.target;
        if (
          dropdownRef.current &&
          dropdownRef.current.contains(target as Node)
        )
          return;
        if (!button.contains(target as Node)) {
          setIsShow(false);
        }
      };
      document.addEventListener('click', handle);

      return () => {
        document.removeEventListener('click', handle);
      };
    }
  }, [isShow])


  return (
    <div className={Styles.container}>
      <button
        className={Styles.activator}
        onClick={() => setIsShow(!isShow)}
        ref={buttonRef}
      >
        {props.activator}
      </button>

      {isShow && (
        <DropdownOptions ref={dropdownRef} onClick={() => {
          setIsShow(false)
        }}>
          {props.children}
        </DropdownOptions>
      )}
    </div>
  )
}

const DropdownOptions = React.forwardRef((props: {
  children: React.ReactNode
  onClick: () => void
}, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div className={Styles.options} onClick={props.onClick} ref={ref}>
      {props.children}
    </div>
  )
})