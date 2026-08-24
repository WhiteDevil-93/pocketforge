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
          "--normal-bg": "var(--bg-elevated)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border-active)",
          "--success-bg": "var(--bg-elevated)",
          "--success-text": "var(--success)",
          "--success-border": "var(--border-active)",
          "--error-bg": "var(--bg-elevated)",
          "--error-text": "var(--danger)",
          "--error-border": "var(--border-active)",
          "--warning-bg": "var(--bg-elevated)",
          "--warning-text": "var(--warning)",
          "--warning-border": "var(--border-active)",
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
