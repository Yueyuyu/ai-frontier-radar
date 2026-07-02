import './styles/tokens.css'
import './styles/frontier.css'
import './styles/public-web.css'
import FrontierIntelApp from './FrontierIntelApp'
import { PublicWebApp } from './PublicWebApp'
import { isWorkspaceLocation } from './publicRoutes'

export default function App() {
  return isWorkspaceLocation() ? <FrontierIntelApp /> : <PublicWebApp />
}
