
# Guía para Probar la Aplicación Localmente

Para poder probar esta aplicación en tu propia computadora, necesitas usar un servidor web local. Esto es necesario porque los navegadores modernos tienen restricciones de seguridad que impiden que el archivo `index.html` cargue los módulos de JavaScript (`.tsx`) directamente desde tu sistema de archivos.

A continuación, te presentamos dos métodos muy sencillos para iniciar un servidor local. Solo necesitas seguir uno de ellos.

---

### Opción 1: Usando Node.js (Recomendado)

Este método es ideal si planeas hacer más desarrollo web en el futuro.

#### 1. Requisitos Previos
- **Instalar Node.js:** Si no lo tienes, descárgalo e instálalo desde [nodejs.org](https://nodejs.org/). Esto también instalará `npm`, que es el gestor de paquetes de Node.

#### 2. Pasos para Ejecutar

1.  **Abre una terminal o línea de comandos:**
    -   En **Windows**, busca "cmd" o "PowerShell".
    -   En **Mac**, busca "Terminal".

2.  **Instala un servidor web simple:** Escribe el siguiente comando y presiona Enter. Esto solo necesitas hacerlo una vez.
    ```bash
    npm install -g http-server
    ```

3.  **Navega a la carpeta de tu proyecto:** Usa el comando `cd` para moverte al directorio donde guardaste todos los archivos de la aplicación (como `index.html`, `App.tsx`, etc.).
    ```bash
    # Ejemplo: si tus archivos están en el Escritorio en una carpeta llamada "app-luminarias"
    cd Desktop/app-luminarias
    ```

4.  **Inicia el servidor:** Una vez que estés en la carpeta correcta, ejecuta el siguiente comando:
    ```bash
    http-server -c-1
    ```
    *(El `-c-1` es para desactivar la caché, lo que ayuda a que veas los cambios que hagas en el código al instante).*

5.  **Abre la aplicación en tu navegador:** La terminal te mostrará una o varias direcciones URL. Abre una de ellas en tu navegador, usualy será:
    `http://localhost:8080`

---

### Opción 2: Usando Python (Si ya lo tienes instalado)

Muchas computadoras (especialmente Mac y Linux) ya vienen con Python.

#### 1. Pasos para Ejecutar

1.  **Abre una terminal o línea de comandos.**

2.  **Navega a la carpeta de tu proyecto:** Usa el comando `cd` para moverte al directorio donde guardaste los archivos.
    ```bash
    # Ejemplo:
    cd Desktop/app-luminarias
    ```

3.  **Inicia el servidor:**
    -   Si usas **Python 3** (la mayoría de los casos), ejecuta:
        ```bash
        python3 -m http.server
        ```
    -   Si tienes una versión más antigua de **Python 2**, ejecuta:
        ```bash
        python -m SimpleHTTPServer
        ```

4.  **Abre la aplicación en tu navegador:** Abre la siguiente dirección en tu navegador:
    `http://localhost:8000`

---

### ¡Paso Final y Muy Importante!

Una vez que la aplicación esté corriendo en tu navegador:

1.  **Haz clic en el icono de la llave (🔑)** en la esquina superior derecha.
2.  **Pega tu clave de API de Google Gemini** en el campo que aparece.
3.  Haz clic en **"Guardar Clave"**.

¡Y listo! Ahora puedes cargar imágenes y probar toda la funcionalidad de la aplicación en tu propia computadora. **¡Los metadatos de las imágenes (como la ubicación GPS) se conservarán al descargarlas!**
