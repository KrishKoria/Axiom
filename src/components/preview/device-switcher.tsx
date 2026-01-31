"use client";

import { cn } from "@/lib/utils";
import { MonitorIcon, SmartphoneIcon, TabletIcon } from "lucide-react";
import { type ComponentProps } from "react";

export type DeviceType = "desktop" | "tablet" | "mobile";

export interface DeviceConfig {
  type: DeviceType;
  icon: typeof MonitorIcon;
  label: string;
  width: string; // CSS width value
}

export const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
  desktop: {
    type: "desktop",
    icon: MonitorIcon,
    label: "Desktop",
    width: "100%",
  },
  tablet: {
    type: "tablet",
    icon: TabletIcon,
    label: "Tablet",
    width: "768px",
  },
  mobile: {
    type: "mobile",
    icon: SmartphoneIcon,
    label: "Mobile",
    width: "375px",
  },
};

interface DeviceSwitcherProps extends Omit<ComponentProps<"div">, "onChange"> {
  value: DeviceType;
  onChange: (device: DeviceType) => void;
}

export const DeviceSwitcher = ({
  value,
  onChange,
  className,
  ...props
}: DeviceSwitcherProps) => {
  const devices: DeviceType[] = ["desktop", "tablet", "mobile"];

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-lg bg-muted p-1",
        className
      )}
      role="group"
      aria-label="Device preview size"
      {...props}
    >
      {devices.map((device) => {
        const config = DEVICE_CONFIGS[device];
        const Icon = config.icon;
        const isActive = value === device;

        return (
          <button
            key={device}
            type="button"
            onClick={() => onChange(device)}
            className={cn(
              "flex items-center justify-center size-7 rounded-md transition-all duration-150",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
            title={config.label}
            aria-pressed={isActive}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
};
