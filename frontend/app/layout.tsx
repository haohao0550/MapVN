import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DTHub Platform - Digital Twin Vietnam',
  description: 'Advanced Digital Twin Platform for Vietnam with 3D models and GIS data',
  keywords: 'digital twin, 3D models, GIS, Vietnam, mapping, Cesium',
  authors: [{ name: 'DTHub Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cesium.com/downloads/cesiumjs/releases/1.117/Build/Cesium/Cesium.js"></script>
        <link href="https://cesium.com/downloads/cesiumjs/releases/1.117/Build/Cesium/Widgets/widgets.css" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.CESIUM_BASE_URL = 'https://cesium.com/downloads/cesiumjs/releases/1.117/Build/Cesium/';
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
}
