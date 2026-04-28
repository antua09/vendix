# Vendix 📦

Registro compartido de ventas para tu equipo. Construido con React + Firebase.

## Stack
- **React 18** + Vite
- **Firebase Auth** (Google)
- **Firestore** (base de datos en tiempo real)
- **Firebase Storage** (fotos de productos)
- **React Router v6**

## Configuración paso a paso

### 1. Crear proyecto en Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado `vendix`
3. Activa **Authentication** → Sign-in method → Google
4. Activa **Firestore Database** → Crear en modo producción
5. Activa **Storage** → Comenzar
6. En **Configuración del proyecto** → Aplicaciones web → Registra una app

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```
Llena `.env` con las credenciales de tu app web de Firebase.

### 3. Instalar y correr
```bash
npm install
npm run dev
```

### 4. Subir reglas de seguridad
```bash
npm install -g firebase-tools
firebase login
firebase init   # selecciona Firestore y Storage
firebase deploy --only firestore:rules,storage
```

## Estructura del proyecto
```
src/
├── components/
│   ├── Dashboard.jsx     # Panel principal con stats
│   ├── RegisterSale.jsx  # Formulario de venta + foto
│   ├── GlobalSales.jsx   # Ventas del equipo + privadas
│   ├── PrivateSales.jsx  # Re-export
│   ├── Layout.jsx        # Sidebar + navegación
│   ├── Login.jsx         # Login con Google
│   └── ui.jsx            # Componentes reutilizables
├── firebase.js           # Configuración de Firebase
├── App.jsx               # Rutas + contexto de auth
├── main.jsx              # Entry point
└── index.css             # Estilos globales
```

## Estructura de Firestore
```
sales/                          ← ventas públicas
  {saleId}/
    product, quantity, price
    sellerId, sellerName
    location, notes, category
    photoURL
    isPrivate: false
    createdAt

users/
  {userId}/
    privateSales/               ← ventas privadas (solo el dueño)
      {saleId}/ ...mismo schema
```

## Deploy en Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```
