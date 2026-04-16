import { Toaster } from 'sonner'

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#1E293B',
          border: '1px solid #475569',
          color: '#f1f5f9',
        },
      }}
    />
  )
}
