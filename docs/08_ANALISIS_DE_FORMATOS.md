# Análisis de los formatos oficiales recibidos

## JSA · F-SGA-8.1-7

Archivo analizado: `F-SGA-8.1-7Análisis de riesgo para trabajos especiales(1).xlsx`.

- Hojas: `JSA` y `Hoja2`; la segunda está oculta y contiene la matriz.
- Área de impresión: `A1:S49`, una página vertical.
- Capacidad visible: 10 tareas, cada una con un renglón de Seguridad y otro Ambiental.
- Método: severidad 1–4 por probabilidad 1–5, con resultado 1–20.
- Categorías del propio archivo:
  - 1–3: `[E] Mínimo`;
  - 4: `[D] Bajo`;
  - 5, 6 y 8: `[C] Medio`;
  - 9, 10 y 12: `[B] Elevado`;
  - 15, 16 y 20: `[A] Grave`.
- Las fórmulas convierten las etiquetas de severidad/probabilidad, calculan el producto y consultan la categoría en `Hoja2`.
- El formato pide controles y documentación requerida, pero no incluye un catálogo de peligros/controles; por eso la fuente gobernada debe vivir en el sistema.
- Mantiene nombres y firmas manuscritas de trabajadores y seis bloques de responsables.
- No se detectó protección activa de hoja.

Implicación: el sistema puede llenar los valores y conservar las fórmulas, pero debe bloquear o dividir un JSA de más de 10 tareas hasta que Calidad autorice un formato multipágina.

## JRA · KQMS-SA-FO-015 Rev. 00

Archivo analizado: `KQMS-SA-FO-015 ANÁLISIS DE RIESGO PARA TRABAJOS RUTINARIOS- JRA Rev.00.xls`.

- Libro heredado `.xls` con seis hojas:
  - `Analisis de riesgos `;
  - `Anexo hoja sustancias química` (KQMS-SA-FO-016);
  - `Hoja de Instruccion`;
  - `IH RA Instrucciones`;
  - dos hojas de control de cambios.
- Revisión `00`; control de cambios indica creación del documento.
- Hoja principal: 10 renglones de sustancias y 30 renglones de evaluación de seguridad.
- Fórmulas oficiales por renglón:
  - `UC = S × F × P`;
  - `CT = S × F × P × C`.
- Valores instruidos:
  - S: 2, 3, 20 o 40;
  - F: 1, 4, 6 u 8;
  - P: 0.5 o 1;
  - C: 1, 0.9, 0.5 o 0.1.
- Categorías H: A atrapamiento; B golpe/contacto; C vehículos; D resbalón/tropiezo/caída; E eléctrico; F térmico/incendio/explosión; G otros.
- Incluye información de higiene industrial y anexo para sustancias químicas.
- La hoja principal contiene datos de ejemplo (`Estampado` y `Corte y Soldadura (Kaizen)`); la generación debe reemplazarlos.
- Las liberaciones mostradas son MGR/AM, Engineering, Safety y Environmental; el documento impreso conserva espacios de firma.

Implicación: JRA y JSA pueden compartir peligros, riesgos, controles y gobierno, pero no deben compartir la misma fórmula ni escala. El backend mantiene motores separados.

## Integridad del maestro

El paquete registra las huellas SHA-256 de ambos originales y las valida en las pruebas. Las copias convertidas a Google Sheets deben verificarse visualmente antes de usarse como maestros operativos.

