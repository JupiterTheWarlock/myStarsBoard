import './index.css'
import App from './App'
import { createRoot } from 'react-dom/client'
import { STARSBOARD_DATA, STARSBOARD_TITLE, STARSBOARD_FAVICON, STARSBOARD_ICON, STARSBOARD_ICON_URL } from './data'

createRoot(document.getElementById('root')!).render(
  <App
    initialData={STARSBOARD_DATA}
    title={STARSBOARD_TITLE}
    favicon={STARSBOARD_FAVICON}
    icon={STARSBOARD_ICON}
    iconUrl={STARSBOARD_ICON_URL}
  />
);
