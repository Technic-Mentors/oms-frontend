import { useEffect, useRef, useState } from "react";

export const useTriggerModal = (trigger: number) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const prevRef = useRef(trigger);

  useEffect(() => {
    if (trigger > 0 && trigger !== prevRef.current) {
      setIsOpenModal(true);
    }
    prevRef.current = trigger;
  }, [trigger]);

  return { isOpenModal, setIsOpenModal };
};