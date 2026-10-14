# Manual de implementación

## 1. Preparación

Requisitos:

- cuenta de Google propietaria de Facilities;
- cuenta de GitHub y repositorio nuevo;
- Node.js 20 o superior para ejecutar pruebas;
- formatos originales controlados;
- dos responsables temporales para instalación: propietario técnico y Safety.

No se requieren cuentas corporativas de Google para los usuarios del piloto; se utilizará el acceso propio del sistema.

## 2. Crear backend y base de datos

1. Cree un proyecto independiente en [script.google.com](https://script.google.com/).
2. Copie `apps-script/Code.gs` y `apps-script/appsscript.json`.
3. Ejecute `setupSystem()` desde el editor y autorice los permisos solicitados.
4. Registre los IDs devueltos en el acta de instalación; no los copie a GitHub.
5. Ejecute una sola vez `createInitialAdmin(usuario, contraseña, nombre, correo)`.
6. Confirme que se creó la carpeta `KTMEX Safety Management System` y la base de datos separada.

## 3. Instalar plantillas controladas

1. En la carpeta `01 Controlled Templates`, cargue los originales de `private-setup/official-templates`.
2. Conserve los originales sin cambios.
3. Abra cada archivo con Google Sheets y guarde una copia controlada.
4. Compare la copia con el original: logotipo, áreas combinadas, fórmulas, saltos, orientación y una impresión PDF.
5. Ejecute `setControlledTemplateIds(idJsa, idJra)` con las copias de Google Sheets.

El JRA original es `.xls`; Apps Script no debe sobrescribirlo. La copia Google Sheets es el maestro operativo y el original conserva la evidencia de revisión.

## 4. Cargar el catálogo piloto

1. Ejecute `node tools/export-catalog.js data/catalog-draft.json`.
2. Cargue `data/catalog-draft.json` a Drive.
3. Ejecute `importCatalogFromDrive(fileId)` en Apps Script.
4. Mantenga `CATALOG_STATUS = DRAFT` durante revisión.
5. Safety y Ambiental completan y validan la matriz.
6. Después de las dos aprobaciones, ejecute `publishCatalog(version, responsableSafety, responsableAmbiental, fechaVigencia)`.

Publicar no significa que toda actividad sea segura en cualquier condición. Las preguntas de contexto y la verificación de campo siguen siendo obligatorias. Actividad nueva, riesgo no catalogado o cambio manual relevante debe ir a excepción.

## 5. Crear usuarios

La matriz de roles/correos está pendiente. Antes de pruebas con varias personas, defina al menos:

- `REQUESTER`: captura JSA/JRA;
- `SAFETY_APPROVER`: aprobación simple de JSA conforme al catálogo;
- `SAFETY_ADMIN`: catálogo, excepciones y DC3;
- `MANAGER`, `ENGINEERING`, `ENVIRONMENTAL`: liberaciones JRA;
- `TRAINING_ADMIN`: cursos y exámenes;
- `AUDITOR`: consulta sin cambios;
- `ADMIN`: configuración técnica, con uso restringido.

Agregue una función administrativa o capture usuarios únicamente durante la instalación. No comparta la cuenta `ADMIN`.

## 6. Publicar el Web App

1. En Apps Script seleccione **Deploy > New deployment > Web app**.
2. Ejecutar como: propietario de la implementación.
3. Acceso: cualquier persona, porque los usuarios no disponen de Workspace.
4. Copie la URL `/exec`.
5. En `assets/api-config.js`, coloque la URL en `apiUrl` y cambie `requireAuth` a `true`.
6. No coloque en ese archivo contraseña, token o ID de Drive.

La URL del Web App será visible. La seguridad depende de autenticación y autorización en servidor, no de ocultar la URL.

## 7. Publicar GitHub Pages

1. Cree un repositorio nuevo para el sistema.
2. Confirme que `private-setup/` no se incluye con `git status`.
3. Ejecute `npm test`.
4. Suba el contenido del proyecto a la rama `main`.
5. En **Settings > Pages**, elija **GitHub Actions**.
6. El flujo `.github/workflows/pages.yml` prueba y publica automáticamente.
7. Active HTTPS.

## 8. Prueba de aceptación

Ejecute el guion de `docs/06_PRUEBAS_Y_ACEPTACION.md`. No active producción con fallas, matriz DRAFT, roles pendientes, DC3 sin política de conservación o formatos visualmente distintos.

