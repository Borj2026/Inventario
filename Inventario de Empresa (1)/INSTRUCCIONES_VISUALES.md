# 🎯 Instrucciones Visuales - Configuración en 5 Pasos

## ⚠️ ¿Ves este error al intentar login?

```
❌ Error al iniciar sesión
Could not find the table 'public.users'
```

**No te preocupes, se soluciona en 2 minutos.**

---

## 📍 PASO 1: Busca el Botón Naranja

```
┌─────────────────────────────────────────┐
│  Sistema de Gestión de Inventario       │
│                           [Configurar BD]│ ← ESTE BOTÓN
└─────────────────────────────────────────┘
         
         🔹 INICIAR SESIÓN
         
         Email: _________________
         
         Password: _______________
         
         [        ENTRAR        ]
```

El botón **"Configurar BD"** está en la **esquina superior derecha** de color **naranja**.

---

## 📍 PASO 2: Haz Clic y Verás Este Modal

```
┌───────────────────────────────────────────────┐
│  🗄️ Configuración de Base de Datos      [X]  │
├───────────────────────────────────────────────┤
│                                               │
│  Estado de la Base de Datos:                 │
│                                               │
│  ❌ Tabla "users" NO existe                  │
│  ⚠️  Usuario administrador NO creado         │
│                                               │
│  [🔄 Verificar de nuevo]                     │
│                                               │
│  📋 Instrucciones Paso a Paso:               │
│                                               │
│  1. Abre el Dashboard de Supabase           │
│  2. Abre el SQL Editor                      │
│  3. Copia el script SQL                     │
│  4. Pega y ejecuta el script                │
│  5. Verifica la ejecución                   │
│  6. Refresca la aplicación                  │
│                                               │
│  [   Ver Script SQL   ] [📋 Copiar Script]  │
│                                               │
│  [        Cerrar        ]                    │
└───────────────────────────────────────────────┘
```

---

## 📍 PASO 3: Copia el Script SQL

**Opción A: Con un Clic** (Fácil)
```
Haz clic en el botón verde: [📋 Copiar Script]
                             ↓
              ✅ ¡Script copiado al portapapeles!
```

**Opción B: Manual**
```
1. Haz clic en [Ver Script SQL]
2. Se mostrará el código en verde
3. Selecciona todo (Ctrl+A)
4. Copia (Ctrl+C)
```

---

## 📍 PASO 4: Ve a Supabase

### A. Abre tu navegador en una nueva pestaña

```
URL: https://supabase.com/dashboard
     ↓
[Inicia sesión en Supabase]
     ↓
[Selecciona tu proyecto]
```

### B. Busca el SQL Editor

```
┌─ SUPABASE DASHBOARD ───────────────┐
│                                    │
│  📊 Dashboard                      │
│  🔧 Table Editor                   │
│  ⚡ SQL Editor         ← HAZ CLIC  │
│  🔑 Authentication                 │
│  📁 Storage                        │
│  ⚙️  Settings                      │
│                                    │
└────────────────────────────────────┘
```

---

## 📍 PASO 5: Pega y Ejecuta

### A. Pega el Script

```
┌─ SQL EDITOR ────────────────────────────────┐
│                                             │
│  New query ▼                     [+ New]   │
│  ┌─────────────────────────────────────┐   │
│  │ CREATE TABLE IF NOT EXISTS          │   │
│  │ public.users (                      │   │
│  │   id UUID DEFAULT gen_random_uuid() │   │
│  │   ...                               │   │
│  │ );                                  │   │ ← PEGA AQUÍ
│  │                                     │   │   (Ctrl+V)
│  │ INSERT INTO public.users ...        │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│              [▶ RUN]  ← HAZ CLIC           │
└─────────────────────────────────────────────┘
```

### B. Verifica el Resultado

```
Después de hacer clic en RUN, verás:

✅ Success
   Rows affected: 1
   
   ↓
   
¡Perfecto! La tabla se creó correctamente.
```

---

## 📍 VERIFICACIÓN FINAL

### Vuelve a la aplicación y:

```
1. Haz clic en [🔄 Verificar de nuevo]
   
   Ahora verás:
   ✅ Tabla "users" existe
   ✅ Usuario administrador creado
   
2. Haz clic en [Cerrar]

3. Inicia sesión con:
   
   ┌─────────────────────────────┐
   │ Email:                      │
   │ jorge@centromaster.com      │
   │                             │
   │ Contraseña:                 │
   │ 123456                      │
   │                             │
   │ [    INICIAR SESIÓN    ]    │
   └─────────────────────────────┘

4. ✅ ¡LISTO! Ya estás dentro del sistema.
```

---

## 🎨 Ayuda Visual - Dónde Encontrar Cada Cosa

### En la Aplicación:

```
┌──────────────────────────────────────┐
│ Sistema Inventario    [Configurar BD]│ ← 1. BOTÓN NARANJA
├──────────────────────────────────────┤
│                                      │
│     🔒 INICIAR SESIÓN                │
│                                      │
│     Email: __________________        │
│     Password: _______________        │
│                                      │
│     [   INICIAR SESIÓN   ]           │
│                                      │
│     ¿No tienes cuenta? Regístrate    │ ← 2. PARA NUEVOS USUARIOS
│                                      │
└──────────────────────────────────────┘
```

### En Supabase Dashboard:

```
MENÚ LATERAL
┌─────────────────┐
│ 📊 Dashboard    │
│ 🗂️  Table Editor│ ← Aquí verás la tabla "users" después
│ ⚡ SQL Editor   │ ← Aquí pegas el script
│ 🔑 Auth         │
│ 📁 Storage      │
│ ⚙️  Settings    │
└─────────────────┘
```

---

## 💡 Consejos Útiles

### ✅ DO (Hacer):

✔️ **Usa el botón "Copiar Script"** - Es más fácil  
✔️ **Espera a que diga "Success"** en Supabase  
✔️ **Verifica de nuevo** después de ejecutar  
✔️ **Cambia la contraseña** después del primer login  

### ❌ DON'T (No Hacer):

✖️ **No cierres Supabase** antes de ver "Success"  
✖️ **No copies solo parte del script** - Copia todo  
✖️ **No modifiques el script** si no sabes SQL  
✖️ **No ejecutes el script** en otra base de datos  

---

## 🆘 ¿Problemas?

### Problema 1: No veo el botón "Configurar BD"

```
Solución:
1. Refresca la página (F5)
2. O usa Ctrl + Shift + R (limpia caché)
3. Espera a que cargue completamente
```

### Problema 2: Error al copiar script

```
Solución:
1. Haz clic en "Ver Script SQL"
2. Selecciona todo manualmente (Ctrl+A)
3. Copia (Ctrl+C)
4. Pega en Supabase (Ctrl+V)
```

### Problema 3: Error en Supabase al ejecutar

```
Si ves error rojo:
1. Lee el mensaje de error
2. Si dice "already exists" → ¡Está bien! Ya estaba creado
3. Si dice otro error → Copia el error completo
4. Consulta /SOLUCION_ERROR_TABLA_USERS.md
```

### Problema 4: Sigue sin funcionar el login

```
Verifica en Supabase:
1. Ve a "Table Editor"
2. Busca tabla "users"
3. Debe haber un registro:
   Email: jorge@centromaster.com
   
Si no está:
1. Vuelve a SQL Editor
2. Ejecuta SOLO esta línea:
   
   INSERT INTO public.users 
   (name, email, password, company, role, department, status, is_active)
   VALUES 
   ('Jorge', 'jorge@centromaster.com', '123456', 'AMS', 'administrador', 'Informática', 'active', true);
```

---

## 📱 Desde Móvil/Tablet

Si estás desde un dispositivo móvil:

```
1. Es mejor hacer esto desde un ordenador

PERO si es necesario desde móvil:

2. Abre Supabase en el navegador móvil
3. Activa "Vista de escritorio" en el menú
4. Sigue los mismos pasos
5. Ten paciencia - puede ser más lento
```

---

## 🎯 Atajos de Teclado

Para ir más rápido:

```
En la aplicación:
- F5 → Refresca la página
- Ctrl+Shift+R → Refresca sin caché

En Supabase SQL Editor:
- Ctrl+A → Seleccionar todo
- Ctrl+C → Copiar
- Ctrl+V → Pegar
- Ctrl+Enter → Ejecutar script

En cualquier navegador:
- Ctrl+T → Nueva pestaña
- Ctrl+W → Cerrar pestaña
- F12 → Abrir consola (para ver errores)
```

---

## ✅ Checklist Rápido

Marca cada paso que completes:

```
□ Abrí la aplicación
□ Vi el botón naranja "Configurar BD"
□ Hice clic en el botón
□ Se abrió el modal de configuración
□ Vi que la tabla NO existe
□ Hice clic en "Copiar Script"
□ Abrí Supabase Dashboard
□ Fui a SQL Editor
□ Pegué el script
□ Hice clic en RUN
□ Vi el mensaje "Success"
□ Volví a la aplicación
□ Hice clic en "Verificar de nuevo"
□ Vi que ahora TODO está ✅
□ Cerré el modal
□ Inicié sesión con jorge@centromaster.com
□ ¡FUNCIONA! Estoy dentro del sistema
```

---

## 🎓 Para Nuevos Usuarios

Si eres un usuario nuevo (no Jorge):

```
Después de que Jorge configure la base de datos:

1. Ve a la aplicación
2. Haz clic en "Regístrate aquí"
3. Llena el formulario:
   - Nombre completo
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Empresa (AMS/CEM/RUGH/SADAF)
4. Acepta términos y condiciones
5. Haz clic en "Crear Cuenta"
6. ¡Listo! Ahora puedes iniciar sesión
```

---

## 🎉 ¡Felicidades!

Si llegaste hasta aquí y todo funcionó:

```
   🎊 ¡SISTEMA CONFIGURADO! 🎊
   
   Ya puedes:
   ✅ Gestionar productos
   ✅ Ver dashboard
   ✅ Crear reportes
   ✅ Gestionar inventario
   ✅ Invitar a otros usuarios
   
   ¡Disfruta del sistema!
```

---

**💬 Recuerda:** Si tienes dudas, consulta:
- `/LEEME_PRIMERO.md` - Guía rápida
- `/SOLUCION_ERROR_TABLA_USERS.md` - Guía completa
- La consola del navegador (F12) para mensajes de ayuda

**📧 Credenciales iniciales:**
- Email: `jorge@centromaster.com`
- Password: `123456`

**⚠️ Importante:** Cambia la contraseña después del primer login.
