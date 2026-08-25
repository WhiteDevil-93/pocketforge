import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useStore } from "../../store/useStore"

// next-themes' ThemeProvider is never mounted in this app — PocketForge tracks
// its own theme in settings.theme (Zustand-persisted), so read that directly
// instead of a useTheme() that would always report "system".
const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useStore((s) => s.settings.theme)

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // PocketForge's own tokens are space-separated RGB components (not
          // a valid color on their own — see index.css's :root comment), so
          // every reference here needs the rgb(...) wrapper sonner's internal
          // stylesheet expects a real color value from.
          "--normal-bg": "rgb(var(--bg-elevated))",
          "--normal-text": "rgb(var(--text-primary))",
          "--normal-border": "rgb(var(--border-active))",
          "--success-bg": "rgb(var(--bg-elevated))",
          "--success-text": "rgb(var(--success))",
          "--success-border": "rgb(var(--border-active))",
          "--error-bg": "rgb(var(--bg-elevated))",
          "--error-text": "rgb(var(--danger))",
          "--error-border": "rgb(var(--border-active))",
          "--warning-bg": "rgb(var(--bg-elevated))",
          "--warning-text": "rgb(var(--warning))",
          "--warning-border": "rgb(var(--border-active))",
          "--border-radius": "var(--radius)",
          // Above BottomSheet's sheet layer (z-[100]) so a toast (e.g. an
          // import-error toast fired while a sheet is open) is never hidden
          // behind it.
          zIndex: 110,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
