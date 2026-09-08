import './App.css'
import PokemonGuide from './components/PokemonGuide'
import { ScrollToTop } from './components/ScrollToTop' // 1. Importamos el componente

function App() {
  return (
    <>
      <PokemonGuide />
      <ScrollToTop /> {/* 2. Lo ponemos aquí para que flote sobre la guía */}
    </>
  )
}

export default App
