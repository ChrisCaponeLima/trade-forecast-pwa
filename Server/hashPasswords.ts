// server/utils/hashPasswords.ts
import { hash } from 'bcrypt'

async function gerarHashesExemplo() {
  const saltRounds = 10

  // Gera o hash para a senha do Chris ("1")
  const hashChris = await hash('1', saltRounds)
  
  // Gera o hash para a senha da Vania ("7")
  const hashVania = await hash('7', saltRounds)

  console.log('Senha "1" (Chris):', hashChris)
  console.log('Senha "7" (Vania):', hashVania)
}

gerarHashesExemplo()