import { isAxiosError } from 'axios'
import { http } from './http'
import { clearToken } from './tokenStorage'

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  access_token: string
}

function toFriendlyError(error: unknown): never {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const serverMessage = error.response?.data?.message

    if (status === 401) throw new Error('Email ou senha inválidos.')
    if (status === 409) throw new Error('Este email já está cadastrado.')
    if (status === 400) {
      const msg = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage
      throw new Error(msg ?? 'Dados inválidos.')
    }
    if (serverMessage) throw new Error(serverMessage)
  }
  throw new Error('Erro inesperado. Tente novamente.')
}

export async function login(credentials: { email: string; password: string }): Promise<AuthResponse> {
  try {
    const { data } = await http.post<AuthResponse>('/auth/login', credentials)
    return data
  } catch (error) {
    toFriendlyError(error)
  }
}

export async function register(payload: { name: string; email: string; password: string }): Promise<User> {
  try {
    const { data } = await http.post<User>('/auth/register', payload)
    return data
  } catch (error) {
    toFriendlyError(error)
  }
}

export async function getMe(): Promise<User> {
  try {
    const { data } = await http.get<User>('/auth/me')
    return data
  } catch (error) {
    toFriendlyError(error)
  }
}

export function logout(): void {
  clearToken()
}
