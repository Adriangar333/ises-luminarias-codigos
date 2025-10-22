
# Cómo Guardar el Estado y Desplegar la Aplicación

## 1. ¿Cómo se guarda el estado de la aplicación?

Hemos actualizado la aplicación para que utilice `localStorage`, una característica del navegador que permite guardar datos de forma persistente.

- **Guardado Automático:** Cada vez que cargas o procesas una imagen, o cuando introduces tu clave de API, el estado se guarda en tu navegador.
- **Recuperación al Recargar:** Si cierras la pestaña o recargas la página, la aplicación leerá los datos guardados y restaurará todas las imágenes y tu clave de API.
- **Limpieza:** El botón "Limpiar Todo" ahora también elimina los datos del `localStorage` para empezar de cero.

No necesitas hacer nada extra, ¡la persistencia ya está integrada!

## 2. ¿Cómo desplegar la aplicación en Internet?

Esta es una aplicación web estática. Esto significa que no necesita un servidor complejo para funcionar y puede ser desplegada en servicios de alojamiento de sitios estáticos de forma muy sencilla y, a menudo, gratuita.

Aquí te explicamos cómo hacerlo usando **Netlify**, aunque los pasos son muy similares para otras plataformas como **Vercel** o **GitHub Pages**.

### Requisitos

1.  **Una cuenta de GitHub:** Donde guardarás el código de tu aplicación.
2.  **Una cuenta de Netlify:** El servicio que usaremos para desplegar la web.

### Paso 1: Subir tu Código a GitHub

1.  Crea un nuevo repositorio en [GitHub](https://github.com/new).
2.  Sube todos los archivos de tu aplicación (`index.html`, `App.tsx`, `components/`, etc.) a este repositorio.

### Paso 2: Conectar GitHub con Netlify

1.  Inicia sesión en tu cuenta de [Netlify](https://app.netlify.com/).
2.  En el panel principal, haz clic en **"Add new site"** y selecciona **"Import an existing project"**.
3.  Conecta tu cuenta de GitHub y autoriza a Netlify.
4.  Busca y selecciona el repositorio que creaste en el Paso 1.

### Paso 3: Configurar el Despliegue

Netlify te mostrará la configuración de despliegue. Como esta aplicación no tiene un paso de "construcción" (build), la configuración es muy simple:

- **Build command:** Deja este campo **vacío**.
- **Publish directory:** Escribe `.` (un solo punto), para indicar que tu `index.html` está en la raíz del proyecto.

Haz clic en **"Deploy site"**. Netlify tomará los archivos de tu repositorio y los publicará en una URL pública (algo como `https-nombre-aleatorio.netlify.app`).

### Paso 4: Configurar la Clave de API (¡MUY IMPORTANTE!)

La aplicación necesita una clave de API de Google Gemini para funcionar. Ahora tienes dos formas de proporcionarla:

#### Método 1: Campo de API en la Aplicación (Recomendado)

La aplicación ahora tiene un campo para introducir la clave de API directamente.
1.  Haz clic en el icono de la llave (🔑) en la esquina superior derecha.
2.  Pega tu clave de API de Google Gemini en el campo y haz clic en "Guardar".
3.  La clave se guardará en tu navegador y se usará para todas las solicitudes.

#### Método 2: Variable de Entorno (Como Respaldo)

Puedes configurar una clave de API a nivel de sitio, que se usará si no se ha introducido ninguna clave en el campo manual.

1.  En el panel de tu sitio en Netlify, ve a **Site configuration** > **Environment variables**.
2.  Haz clic en **Add a variable** y selecciona **Create a single variable**.
3.  Rellena los campos:
    -   **Key:** `API_KEY`
    -   **Value:** Pega aquí tu clave de API de Google Gemini.
4.  Guarda la variable.
5.  Para que Netlify "inyecte" esta clave en tu código desplegado, ve a **Site configuration** > **Build & deploy** > **Post processing**.
6.  Asegúrate de que **Asset optimization** esté activado y haz clic en **"Edit settings"**. Habilita la opción **"Inject environment variables"**.

Esto hará que Netlify reemplace automáticamente `process.env.API_KEY` en tus archivos `.tsx` con el valor real de tu clave durante el despliegue.

¡Y listo! Vuelve a desplegar el sitio para que los cambios surtan efecto (en la pestaña "Deploys", puedes hacer clic en "Trigger deploy"). Tu aplicación estará funcionando en la URL pública.
