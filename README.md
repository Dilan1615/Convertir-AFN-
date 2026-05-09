# Simulador de Autómatas Finitos

Simulador visual de autómatas finitos que permite analizar cadenas sobre tres tipos de autómatas, mostrando el AFND original, su conversión a AFD y la versión minimizada, con diagrama de estados, tablas y recorrido paso a paso.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML · CSS · JavaScript (vanilla) |
| Servidor frontend | Flask (Python) |
| Backend / API | Spring Boot (Java) |

---

## Estructura del proyecto

```
/
├── frontend/
│   ├── index.html        # Interfaz principal
│   ├── styles.css        # Estilos
│   └── app.js            # Lógica del simulador
│
└── ape5/              # API REST en Spring Boot
    └── src/...
```

---

## Requisitos

- Python 3.10+ con Flask
- Java 17+ con Spring Boot
- Maven para el backend

---

## Levantar el proyecto

### 1. Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

La API queda disponible en `http://localhost:8080`.

### 2. Frontend (Flask)

```bash
cd frontend
pip install flask
python app.py
```

La interfaz queda disponible en `http://localhost:5000`.

> El frontend consume la API en el puerto `8080`. Ambos servicios deben estar corriendo al mismo tiempo.

---

## Endpoints de la API

Cada autómata expone cuatro rutas bajo `/api/{automata}/`:

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/{automata}/afnd` | Estructura del AFND original |
| `GET` | `/api/{automata}/convertir` | AFD determinizado |
| `GET` | `/api/{automata}/minimizar` | AFD minimizado |
| `POST` | `/api/{automata}/probar` | Simula una cadena sobre el AFND |

Los autómatas disponibles son: `telemetria`, `ecommerce` y `adn`.

**Ejemplo de cuerpo para `/probar`:**
```json
{ "cadena": ["HDR", "TEMP", "CRC"] }
```

---

## Funcionalidades

- Visualización del diagrama de estados con flechas dirigidas
- Tabla de estados y tabla de transiciones sincronizadas con el diagrama
- Navegación paso a paso del recorrido de la cadena
- Reproducción automática del recorrido
- Indicador visual de cadena aceptada / rechazada
- Pestañas para alternar entre AFND, AFD y AFD minimizado

---

## Autómatas incluidos

| Nombre | Patrón | Ejemplo de cadena |
|---|---|---|
| Telemetría | `HDR → (TEMP \| HUM)* → CRC` | `HDR,TEMP,HUM,CRC` |
| Ecommerce | `HOME → SEARCH* → CART` | `HOME,SEARCH,CART` |
| ADN | `K → G → X* → F` | `K,G,X,F` |
