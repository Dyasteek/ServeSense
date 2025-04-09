# ServeSense - Sistema de Seguimiento de Estadísticas de Voleibol

ServeSense es una aplicación integral para el seguimiento de estadísticas de voleibol, diseñada para asistentes técnicos y entrenadores. La aplicación permite registrar y analizar estadísticas individuales y de equipo en tiempo real.

## Características Principales

- Registro de estadísticas individuales por jugador
- Seguimiento de saques, remates, defensas y bloqueos
- Cálculo automático de promedios individuales y de equipo
- Versión móvil para registro en tiempo real
- Versión web para visualización y análisis de datos
- Sincronización manual de datos entre versiones

## Estructura del Proyecto

```
ServeSense/
├── mobile/           # Aplicación móvil (React Native)
├── web/             # Frontend web (Next.js)
│   ├── frontend/    # Interfaz de usuario
│   └── backend/     # API REST (Node.js/Express)
└── docs/            # Documentación
```

## Tecnologías Utilizadas

- **App móvil**: React Native + SQLite/Realm DB
- **Web frontend**: Next.js + Tailwind CSS
- **Web backend**: Node.js/Express + MongoDB
- **Base de datos**: MongoDB Atlas
- **Sincronización**: Axios + REST API
- **Gráficos**: Recharts/Victory.js

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- React Native CLI
- MongoDB Atlas account
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS)

## Instalación

(Instrucciones de instalación pendientes)

## Licencia

MIT 