# Configuração do Usuário Administrador

## 📋 Credenciais Padrão do Administrador

**Email:** admin@reidaquadra.com
**Senha:** admin123

## 🚀 Como Criar o Usuário Administrador

### Método 1: Firebase Console (Recomendado)

1. **Acesse o Firebase Console:**
   - Abra: https://console.firebase.google.com/
   - Selecione o projeto: `studio-1102529679-c8f41`

2. **Vá para Authentication:**
   - No menu lateral esquerdo, clique em **Authentication**
   - Clique na aba **Users**

3. **Adicione o usuário:**
   - Clique no botão **Add user** (ou "Adicionar usuário")
   - Preencha os campos:
     - **Email:** `admin@reidaquadra.com`
     - **Password:** `admin123`
     - **Display name:** `Administrador` (opcional)
     - ✅ Marque **Email verified** (para não precisar verificar o email)

4. **Salve:**
   - Clique em **Add user**

### Método 2: Via Código (Desenvolvimento)

Se estiver em desenvolvimento local, você pode executar este código no console do navegador:

```javascript
// Abra o console do navegador (F12) na página http://localhost:9002
// Execute este código:

import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

const auth = getAuth();
createUserWithEmailAndPassword(auth, 'admin@reidaquadra.com', 'admin123')
  .then((userCredential) => {
    console.log('Usuário admin criado:', userCredential.user.email);
  })
  .catch((error) => {
    console.error('Erro:', error.message);
  });
```

## ✅ Teste o Login

Após criar o usuário, teste o acesso:
- Acesse: http://localhost:9002
- Clique em **FAZER LOGIN**
- Use as credenciais acima

## 📝 Notas Importantes

- Este usuário terá acesso completo ao sistema
- Para produção, use senhas mais fortes
- Guarde essas credenciais em local seguro
- Você pode criar múltiplos administradores