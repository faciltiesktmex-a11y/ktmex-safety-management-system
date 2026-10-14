# Pruebas y criterios de aceptación

## Automáticas

Ejecute:

```bash
npm test
```

La suite valida 15 actividades, referencias de riesgos y permisos, matriz JSA 1–20, consolidación de EPP/documentos, huellas de plantillas, sintaxis, archivos faltantes y ausencia de IDs configurados.

## Funcionales mínimas

| ID | Prueba | Resultado esperado |
|---|---|---|
| F-01 | Seleccionar cada actividad JSA | Carga tareas sin errores |
| F-02 | Marcar contexto en una tarea | Agrega solo riesgos/controles de esa tarea |
| F-03 | Tres riesgos con EPP | Una sola línea EPP consolidada |
| F-04 | Riesgos con mismo permiso | Un solo código documental |
| F-05 | Crear actividad nueva | Ruta de excepción, sin aprobación rápida |
| F-06 | Cambiar documento aprobado | Revoca aprobación |
| F-07 | JRA con varios riesgos misma H | Un renglón con peor S/F/P/C |
| F-08 | JRA con 31 renglones | Bloquea y solicita dividir |
| F-09 | Catálogo DRAFT | Bloquea aprobación productiva |
| F-10 | Catálogo PUBLISHED sin excepción | Safety puede aprobar JSA con un clic |
| F-11 | JRA sin cuatro liberaciones | No genera formato |
| F-12 | JRA liberado | PDF conserva KQMS-SA-FO-015 |
| F-13 | DC3 sin política | Archivo bloqueado, metadatos piloto permitidos |
| F-14 | Rechazar DC3 sin motivo | Bloqueado |
| F-15 | Modificar URL/HTML del navegador | Backend rechaza rol o datos inválidos |

## Validación visual de formatos

Imprima casos de 1, 5, 10 y máximo de renglones. Compare con los originales:

- dimensiones, orientación, logotipo y código;
- celdas combinadas;
- fórmulas y categorías;
- ajuste de texto y saltos de página;
- espacios de firmas manuscritas;
- ausencia de texto cortado;
- leyendas de revisión.

## Aceptación del piloto

Recomendación: 30 documentos de prueba, al menos dos por cada una de las 15 actividades. Meta sugerida:

- 100% de riesgos/controles revisados sin omisión crítica;
- 0 controles o permisos duplicados;
- 100% de excepciones enviadas a revisión;
- reducción medible del tiempo de llenado y aprobación;
- 0 generación con versión DRAFT o aprobaciones incompletas.

