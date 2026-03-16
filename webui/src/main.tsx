import './index.css'
import App from './App'
import { createRoot } from 'react-dom/client'
import { STARSBOARD_DATA, STARSBOARD_USERNAME } from './data'

createRoot(document.getElementById('root')!).render(
  <App initialData={STARSBOARD_DATA} username={STARSBOARD_USERNAME} />
);
