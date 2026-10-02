import type { NextApiRequest, NextApiResponse } from 'next'

const sampleProducts = [
  { id: 1, title: 'Wireless Headphones', price: 99.99, description: 'Comfortable wireless headphones', image: 'https://via.placeholder.com/400x300?text=Headphones' },
  { id: 2, title: 'Smart Watch', price: 149.99, description: 'Track fitness and notifications', image: 'https://via.placeholder.com/400x300?text=Smart+Watch' },
  { id: 3, title: 'Coffee Maker', price: 59.99, description: 'Brew the perfect cup', image: 'https://via.placeholder.com/400x300?text=Coffee+Maker' }
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(sampleProducts)
}
