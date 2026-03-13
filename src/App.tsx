import { HashRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { lazy, Suspense } from 'react'

const Home = lazy(() => import('./pages/Home'))
const Admin = lazy(() => import('./pages/Admin'))

function App() {
  return (
    <HashRouter>
      <Toaster position="top-center" richColors />
      <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a1628'}}><div style={{width:40,height:40,border:'3px solid #c9a227',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}} /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
