import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SequencingPage } from './pages/SequencingPage';
import { SynthesisPage } from './pages/SynthesisPage';
import { EditingPage } from './pages/EditingPage';
import { GeneticCodesPage } from './pages/GeneticCodesPage';
import { GelElectrophoresisPage } from './pages/GelElectrophoresisPage';
import { CentralDogmaPage } from './pages/CentralDogmaPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sequencing" element={<SequencingPage />} />
      <Route path="/synthesis" element={<SynthesisPage />} />
      <Route path="/editing" element={<EditingPage />} />
      <Route path="/genetic-codes" element={<GeneticCodesPage />} />
      <Route path="/gel-electrophoresis" element={<GelElectrophoresisPage />} />
      <Route path="/central-dogma" element={<CentralDogmaPage />} />
    </Routes>
  );
}

export default App;
