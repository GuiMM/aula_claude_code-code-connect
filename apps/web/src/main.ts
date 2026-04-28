import './style.css'
import { LoginPage } from './components/pages/LoginPage/LoginPage'

const root = document.querySelector<HTMLDivElement>('#app')!
root.replaceChildren(LoginPage())
