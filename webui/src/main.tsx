import './index.css'
import App from './App'
import { createRoot } from 'react-dom/client'
import { STARSBOARD_DATA, STARSBOARD_TITLE, STARSBOARD_FAVICON } from './data'

createRoot(document.getElementById('root')!).render(
  <App
    initialData={STARSBOARD_DATA}
    title={STARSBOARD_TITLE}
    favicon={STARSBOARD_FAVICON}
  />
);
