import { Helmet } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/index.tsx'

function App() {
  return (
    <>
      <Helmet>
        <title>LJK Lestari Ilmu</title>
        <meta name="description" content="Aplikasi LJK Lestari Ilmu" />
      </Helmet>
      <RouterProvider router={router} />
    </>
  )
}

export default App  
