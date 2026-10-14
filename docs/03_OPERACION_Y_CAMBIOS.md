# Manual de operación, administración y correcciones

## Flujo JSA

1. El usuario registra datos generales y selecciona una actividad.
2. El sistema carga la secuencia sugerida.
3. En cada tarea el usuario responde preguntas de contexto y confirma riesgos.
4. El sistema agrega peligro, evento, consecuencia, controles y documentos, y consolida duplicados.
5. Si todo corresponde a catálogo publicado y no hay riesgo bloqueante, el JSA pasa a la bandeja de aprobación simple de Safety.
6. Safety confirma con un clic; no necesita releer el contenido catalogado.
7. El responsable genera el formato oficial, lo imprime y obtiene firmas manuscritas.

## Flujo JRA

1. El usuario selecciona actividad rutinaria y documenta MOE.
2. Confirma tareas, riesgos y contexto.
3. Cada riesgo conserva S, F, P y C; el formato agrupa por tarea y categoría H usando el peor caso.
4. El sistema calcula UC y CT.
5. MGR/AM, Engineering, Safety y Ambiental liberan digitalmente.
6. Después de las cuatro liberaciones se genera KQMS-SA-FO-015 para impresión y firmas manuscritas.

## Ruta de excepción

Se requiere revisión técnica cuando:

- la actividad es nueva;
- aparece un peligro/riesgo no catalogado;
- el usuario altera una contramedida aprobada;
- falta MOE cuando es requisito;
- el riesgo residual queda bloqueado;
- se excede la capacidad del formato;
- el catálogo usado ya no está vigente.

La meta “sin correcciones” aplica al camino catalogado; eliminar la ruta de excepción sería un riesgo del propio sistema.

## Cambios al catálogo

1. El área operativa registra la propuesta y el escenario real.
2. Safety o Ambiental asigna propietario y evalúa el cambio.
3. Se crea una versión DRAFT; nunca se edita directamente la versión publicada.
4. Se ejecutan pruebas de regresión contra las actividades afectadas.
5. Safety y Ambiental aprueban la versión.
6. Se publica con fecha de vigencia.
7. Los JSA/JRA existentes conservan su versión y huella; no se reescriben.

## Corrección urgente

Si un control publicado es incorrecto:

1. cambie `CATALOG_STATUS` a `REVIEW` para detener aprobaciones rápidas;
2. identifique documentos generados con la versión afectada;
3. comunique la suspensión a las áreas;
4. corrija y valide una versión nueva;
5. publique y documente la decisión;
6. determine si los documentos anteriores requieren revalidación.

## Revisión periódica sugerida

- mensual durante el piloto: excepciones, controles duplicados, errores y tiempo de llenado;
- trimestral: usuarios, roles, sesiones, cursos, DC3 y permisos;
- anual o ante cambios: catálogo completo, NOM aplicables, formatos y política de conservación;
- inmediata: incidente, cambio de proceso, equipo, sustancia, MOE o requisito legal.

## Indicadores

- tiempo mediano de captura por JSA/JRA;
- porcentaje de documentos por ruta rápida;
- porcentaje de excepciones;
- retrabajos después de envío;
- tiempo de aprobación de Safety;
- controles/riesgos nuevos incorporados;
- JSA/JRA ejecutados con versión vigente;
- DC3 pendientes, rechazados o vencidos;
- tasa de aprobación y reintentos de cursos.

