# ✈️ Viadca Backend API

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge\&logo=nestjs\&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge\&logo=typescript\&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge\&logo=mysql\&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0708.svg?style=for-the-badge\&logo=typeorm\&logoColor=white)

> **Viadca Backend API** es una API RESTful robusta, modular y altamente escalable para la gestión integral de paquetes turísticos, vuelos y hoteles. Diseñada con **NestJS** y optimizada para rendimiento empresarial, soporta procesamiento de imágenes en segundo plano, generación dinámica de reportes, caching, limpieza automática y un sistema de papelera de reciclaje.

---

## 🚀 Visión del Proyecto

Viadca es el backend que impulsa una plataforma completa de turismo, permitiendo administrar paquetes profesionales con itinerarios, multimedia optimizada y relaciones entre hoteles, vuelos y destinos. El objetivo principal es ofrecer una **API confiable, rápida y extensible**, capaz de manejar grandes volúmenes de datos y operaciones sin afectar su rendimiento.

Este proyecto forma parte del ecosistema **Viadca** junto con su aplicación administrativa y su landing page pública.

---

## ✨ Características Principales

Este backend va más allá de las operaciones básicas: incorpora lógica empresarial compleja, procesamiento avanzado e integración modular.

### 📦 Gestión Avanzada de Paquetes Turísticos

* Creación de paquetes completos con itinerarios día por día.
* Asociación automática con hoteles y vuelos disponibles.
* Generación de enlaces públicos mediante **slugs únicos**.
* **Exportación a Excel (.xlsx)** totalmente estilizada: incluye detalles del paquete, itinerarios, precios y descripciones.

### 🖼️ Procesamiento de Imágenes de Alto Desempeño

* **Worker Threads:** evita bloquear el Event Loop al procesar imágenes.
* Redimensionamiento inteligente a **1920x1080**.
* Conversión automática a **AVIF**, reduciendo peso sin perder calidad.
* Permite cargas con **Base64** o desde **URLs externas**.

### ✈️🏨 Inventario Completo de Hoteles y Vuelos

* Gestión profesional de hoteles con integración de **Google Place ID**.
* Registro de vuelos con detalles dinámicos.
* Relación automática con paquetes turísticos.

### ♻️ Sistema de Papelera de Reciclaje (Soft Delete)

* Eliminación lógica totalmente personalizada.
* Módulo dedicado para restaurar o eliminar entidades permanentemente.
* Permite limpiar relaciones y sus elementos dependientes.

### 🛡️ Validación, Seguridad y Buenas Prácticas

* Validación estricta mediante **class-validator**.
* Configuración de CORS.
* Arquitectura modular y escalable basada en Servicios, Controladores y Módulos.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología     | Descripción                            |
| -------------- | -------------------------------------- |
| **NestJS**     | Framework backend modular y escalable  |
| **TypeScript** | Tipado estático para mayor robustez    |
| **MySQL**      | Base de datos relacional principal     |
| **TypeORM**    | Mapeo objeto–relacional y migraciones  |
| **Sharp**      | Procesamiento avanzado de imágenes     |
| **ExcelJS**    | Generación de archivos Excel dinámicos |

---

## 📂 Estructura del Proyecto

```bash
src/
├── config/             # Configuración de base de datos y variables de entorno
├── hoteles/            # Módulo de Hoteles
├── imagen/             # Módulo de gestión de Imágenes (incluye Worker)
│   ├── image-worker.ts # Lógica de procesamiento en segundo plano
├── paquetes/           # Módulo principal de Paquetes e Itinerarios
├── papelera/           # Sistema de recuperación y eliminación lógica
├── utils/              # Utilidades: Excel, Slugs, Conversores
├── vuelos/             # Módulo de Vuelos
└── main.ts             # Punto de entrada de la aplicación
```

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Linter
npm run lint
npm run lint:fix
```

---

## ⚙️ Variables de Entorno (.env)

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=viadca_db
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 📌 Roadmap (Próximas Implementaciones)

* [ ] Autenticación con JWT + Roles (Admin / Editor)
* [ ] Integración con sistema externo de reservaciones
* [ ] Caching con Redis
* [ ] Microservicio para reportes PDF
* [ ] WebSockets para estado de procesamiento
* [ ] Panel de métricas con Prometheus

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Puedes abrir un **Issue**, sugerir mejoras o enviar un **Pull Request**.

---

## 📜 Licencia

Distribuido bajo la licencia **MIT**.

---

✈️ **Viadca Backend API — Diseñado para escalar. Construido para durar.**
