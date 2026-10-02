import { useEffect, useState } from 'react'

type Product = {
  id: number
  title: string
  price: number
  description?: string
  image?: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error)
  }, [])

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, system-ui' }}>
      <h1>e-comorrce — Product catalog</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginTop: 16 }}>
        {products.map((p) => (
          <article key={p.id} style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8 }}>
            {p.image && <img src={p.image} alt={p.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
            <h2 style={{ fontSize: 18, marginTop: 8 }}>{p.title}</h2>
            <p style={{ color: '#6b7280' }}>{p.description}</p>
            <div style={{ marginTop: 8, fontWeight: 700 }}>${p.price}</div>
          </article>
        ))}
      </div>
    </main>
  )
}
