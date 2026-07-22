import { createContext, useContext, useState } from "react";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

export type DeviceContextType = {
  isOn: boolean;
  setIsOn: Dispatch<SetStateAction<boolean>>;
};

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export function useDevice() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return context;
}

export function DeviceProvider({ children }: PropsWithChildren) {
  const [isOn, setIsOn] = useState(true);
  return (
    <DeviceContext.Provider value={{ isOn, setIsOn }}>
      {children}
    </DeviceContext.Provider>
  );
}
