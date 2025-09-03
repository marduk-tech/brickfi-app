import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Brickfi - The Smartest Way to Buy your Next Property',
    short_name: 'Brickfi',
    description: 'The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.',
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#1890ff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    lang: 'en-IN',
  }
}