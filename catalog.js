(function () {
  'use strict';

  const permits = [
    { id: 'lifting', code: 'KQMS-SA-FO-006', name: 'Permiso de trabajo de izajes de materiales' },
    { id: 'electrical', code: 'KQMS-SA-FO-007', name: 'Permiso de trabajos eléctricos' },
    { id: 'hot_work', code: 'KQMS-SA-FO-008', name: 'Permiso de corte y soldadura' },
    { id: 'excavation', code: 'KQMS-SA-FO-009', name: 'Permiso de excavación ≥ 100 cm' },
    { id: 'height', code: 'KQMS-SA-FO-010', name: 'Permiso de trabajo en altura' },
    { id: 'civil', code: 'KQMS-SA-FO-011', name: 'Permiso de trabajo para obra civil' },
    { id: 'confined', code: 'KQMS-SA-FO-012', name: 'Permiso de espacios confinados' },
    { id: 'loto', code: 'KQMS-SA-FO-013', name: 'Permiso de trabajo LOTO' }
  ];

  const risks = [
    r('SEG-001','SEGURIDAD','Superficie de tránsito irregular, húmeda u obstruida','Resbalón, tropiezo o caída al mismo nivel','Contusión, esguince o fractura',2,3,'D',[
      'Mantener el área ordenada, limpia y con rutas de tránsito libres.','Delimitar y señalizar desniveles, derrames y obstáculos.','Inspeccionar la ruta antes de trasladar herramientas y materiales.','EPP: calzado de seguridad antiderrapante.'
    ]),
    r('SEG-002','SEGURIDAD','Trabajo en altura, borde abierto o acceso elevado','Caída de persona a distinto nivel','Lesión grave, incapacidad permanente o fatalidad',5,3,'D',[
      'Priorizar plataforma fija con barandal o plataforma elevadora inspeccionada.','Delimitar el nivel inferior y controlar el acceso.','Usar sistema personal de detención de caídas conectado a anclaje autorizado cuando aplique.','Inspeccionar arnés, línea y conectores antes de usar.','EPP: casco con barbiquejo; arnés y sistema de conexión compatibles.'
    ],['KQMS-SA-FO-010']),
    r('SEG-003','SEGURIDAD','Herramientas, materiales o componentes con posibilidad de caída','Golpe por objeto que cae o se proyecta','Herida, contusión, lesión ocular o traumatismo',4,3,'B',[
      'Asegurar herramientas y materiales durante traslado y trabajo.','Establecer zona de exclusión bajo el trabajo.','No colocar materiales en bordes sin retención.','EPP: casco; lentes de seguridad y protección facial cuando exista proyección.'
    ]),
    r('SEG-004','SEGURIDAD','Puntos de atrapamiento, cierre o movimiento de maquinaria','Atrapamiento, aplastamiento o amputación','Lesión grave, amputación o fatalidad',5,3,'A',[
      'Aislar todas las fuentes de energía y aplicar LOTO.','Verificar energía cero mediante intento de arranque y medición cuando aplique.','Instalar o reinstalar guardas antes de liberar el equipo.','Mantener manos fuera de la línea de fuego y usar herramienta de posicionamiento.'
    ],['KQMS-SA-FO-013']),
    r('SEG-005','SEGURIDAD','Energía eléctrica y partes energizadas','Contacto eléctrico o arco eléctrico','Quemadura, fibrilación, lesión grave o fatalidad',5,3,'E',[
      'Desenergizar, bloquear, etiquetar y verificar ausencia de tensión.','Usar instrumentos con categoría y calibración adecuadas.','Mantener distancias y barreras para partes energizadas expuestas.','EPP: protección dieléctrica y contra arco definida por el análisis eléctrico.'
    ],['KQMS-SA-FO-007','KQMS-SA-FO-013']),
    r('SEG-006','SEGURIDAD','Flama, chispa, metal caliente y materiales combustibles','Incendio o explosión durante trabajo en caliente','Quemaduras graves, daños materiales o fatalidad',5,3,'F',[
      'Retirar o proteger combustibles y controlar fuentes de ignición.','Verificar disponibilidad y vigencia de extintores.','Asignar vigía de fuego durante el trabajo y el periodo posterior definido por el permiso.','Inspeccionar mangueras, conexiones, reguladores y arrestadores.','EPP: careta de soldar; guantes y ropa resistente a flama.'
    ],['KQMS-SA-FO-008']),
    r('SEG-007','SEGURIDAD','Superficie, escoria o material caliente','Contacto térmico','Quemadura en piel u ojos',3,3,'F',[
      'Identificar y señalizar superficies o piezas calientes.','Permitir enfriamiento controlado y usar herramienta de manipulación.','EPP: guantes térmicos; protección ocular/facial y ropa de manga larga.'
    ]),
    r('SEG-008','SEGURIDAD','Humos, polvos, vapores o partículas suspendidas','Inhalación o contacto con contaminantes','Irritación, intoxicación o enfermedad ocupacional',4,3,'G',[
      'Aplicar extracción localizada o ventilación suficiente.','Consultar HDS y evaluación de higiene industrial antes de definir respirador.','Evitar barrer en seco; usar método de limpieza compatible con el contaminante.','EPP: protección respiratoria únicamente conforme a selección y ajuste autorizados; lentes cerrados cuando aplique.'
    ]),
    r('SEG-009','SEGURIDAD','Sustancia química peligrosa','Salpicadura, contacto dérmico, inhalación o reacción','Quemadura química, intoxicación o lesión ocular',4,3,'G',[
      'Revisar HDS y compatibilidad antes del uso.','Mantener recipientes etiquetados, cerrados y en contención secundaria.','Disponer de material de respuesta a derrames y lavaojos/regadera cuando aplique.','EPP: guante químico, protección ocular/facial y ropa conforme a la HDS.'
    ]),
    r('SEG-010','SEGURIDAD','Energía almacenada eléctrica, neumática, hidráulica, mecánica o gravitacional','Liberación inesperada de energía','Golpe, atrapamiento, amputación o fatalidad',5,3,'A',[
      'Identificar todas las energías en el diagrama o procedimiento LOTO.','Bloquear, purgar, descargar, soportar y verificar energía cero.','Usar candado personal y control de cambios de turno.','Retirar bloqueos únicamente mediante el procedimiento autorizado.'
    ],['KQMS-SA-FO-013']),
    r('SEG-011','SEGURIDAD','Carga suspendida y equipo de izaje','Caída, balanceo o desplazamiento no controlado de la carga','Aplastamiento, lesión grave o fatalidad',5,3,'B',[
      'Preparar plan de izaje y verificar capacidad de grúa, accesorios y puntos de anclaje.','Inspeccionar eslingas, grilletes y ganchos antes de usar.','Delimitar el área y prohibir personas bajo la carga.','Usar señalero designado y cuerdas guía cuando corresponda.'
    ],['KQMS-SA-FO-006']),
    r('SEG-012','SEGURIDAD','Vehículos industriales o equipos móviles','Atropellamiento, colisión o atrapamiento','Lesión grave o fatalidad',5,2,'C',[
      'Segregar peatones y vehículos mediante ruta y barrera.','Usar señalero en maniobras con visibilidad limitada.','Confirmar alarma, luces, frenos y condiciones del equipo.','EPP: chaleco de alta visibilidad.'
    ]),
    r('SEG-013','SEGURIDAD','Manipulación manual, postura forzada o esfuerzo','Sobreesfuerzo o movimiento repentino','Distensión, lumbalgia o lesión musculoesquelética',3,3,'G',[
      'Usar ayuda mecánica o reducir peso y distancia de manipulación.','Planear levantamiento en equipo cuando la carga o geometría lo requiera.','Mantener postura estable y evitar giros con carga.','Realizar pausas y rotación cuando la duración lo requiera.'
    ]),
    r('SEG-014','SEGURIDAD','Bordes, lámina, rebaba o herramienta cortante','Corte, punción o contacto con filo','Herida o lesión tendinosa',3,3,'B',[
      'Eliminar o proteger bordes filosos y usar herramienta adecuada.','Transportar piezas con filo cubierto y sin colocar manos en la trayectoria.','EPP: guantes anticorte del nivel definido; lentes de seguridad.'
    ]),
    r('SEG-015','SEGURIDAD','Presión neumática, hidráulica, refrigerante o gas','Descarga, ruptura o latigazo de línea','Golpe, inyección de fluido, quemadura fría o lesión grave',5,2,'G',[
      'Aislar, bloquear, purgar y verificar presión cero.','Usar mangueras, conexiones y manómetros compatibles y en buen estado.','Mantener el cuerpo fuera de la línea de fuego.','Realizar prueba de fugas con método autorizado, nunca con la mano.'
    ],['KQMS-SA-FO-013']),
    r('SEG-016','SEGURIDAD','Partes rotativas o transmisión de potencia','Enredo, arrastre o contacto con parte móvil','Atrapamiento, amputación o lesión grave',5,2,'A',[
      'Detener y aplicar LOTO antes de intervenir.','Mantener guardas instaladas y verificar interlocks.','Prohibir ropa suelta, joyería y cabello sin contener.','Usar herramienta de prueba que evite acercar el cuerpo.'
    ],['KQMS-SA-FO-013']),
    r('SEG-017','SEGURIDAD','Espacio confinado o atmósfera peligrosa','Deficiencia de oxígeno, intoxicación, incendio o atrapamiento','Pérdida de conciencia o fatalidad',5,3,'G',[
      'Clasificar el espacio y emitir permiso antes del ingreso.','Aislar energías y líneas; ventilar y monitorear atmósfera continuamente.','Mantener vigía, comunicación y plan de rescate sin ingreso.','Usar equipo de acceso, rescate y EPP conforme al permiso.'
    ],['KQMS-SA-FO-012','KQMS-SA-FO-013']),
    r('SEG-018','SEGURIDAD','Agua estancada, lodos o material biológico','Contacto, salpicadura o ingestión accidental','Dermatitis, infección o enfermedad',3,2,'G',[
      'Evitar contacto directo y controlar salpicaduras.','Aplicar higiene de manos y prohibir alimentos en el área.','Desinfectar herramientas y superficies conforme al procedimiento.','EPP: guantes impermeables; lentes cerrados/careta y botas lavables.'
    ]),
    r('SEG-019','SEGURIDAD','Ruido por herramienta, extractor, compresor o proceso','Exposición a nivel de ruido elevado','Daño auditivo o interferencia en comunicación',3,3,'G',[
      'Reducir ruido en la fuente y limitar tiempo de exposición.','Delimitar el área y coordinar señales de comunicación.','EPP: protección auditiva definida por la evaluación de ruido.'
    ]),
    r('SEG-020','SEGURIDAD','Herramienta portátil, disco, broca o partícula','Ruptura de herramienta o proyección de partículas','Lesión ocular, corte o golpe',4,3,'B',[
      'Inspeccionar herramienta, guarda, disco y accesorios antes de usar.','Usar velocidad y accesorio compatibles con el equipo.','Orientar proyecciones fuera de personas y materiales combustibles.','EPP: lentes de seguridad y careta facial; guantes compatibles con la herramienta.'
    ]),
    r('SEG-021','SEGURIDAD','Fosa, cárcamo, abertura o desnivel','Caída a abertura o inmersión','Fractura, atrapamiento o fatalidad',5,2,'D',[
      'Instalar cubierta resistente o barandal perimetral.','Delimitar y controlar el acceso.','Mantener medio seguro de entrada/salida y rescate cuando aplique.','No trabajar solo en zonas con riesgo de inmersión o acceso restringido.'
    ]),
    r('SEG-022','SEGURIDAD','Temperatura elevada o abatida','Estrés térmico o contacto con superficie fría/caliente','Quemadura, agotamiento o hipotermia',4,2,'F',[
      'Aislar la fuente y limitar el tiempo de exposición.','Establecer hidratación, pausas y vigilancia de síntomas.','EPP: protección térmica compatible con la tarea.'
    ]),
    r('SEG-023','SEGURIDAD','Trabajo simultáneo o interferencia entre cuadrillas','Ingreso no controlado o activación por tercero','Golpe, atrapamiento o exposición múltiple',4,3,'G',[
      'Coordinar responsables, alcance, zonas y horarios antes de iniciar.','Usar barreras, señalización y control de acceso.','Comunicar cambios de condición y detener el trabajo ante interferencias.'
    ]),
    r('ENV-001','AMBIENTAL','Aceite, químico, refrigerante o residuo líquido','Derrame o fuga','Contaminación de piso, suelo o drenaje',4,3,'G',[
      'Colocar contención secundaria y proteger drenajes.','Mantener kit de derrames compatible y personal capacitado.','Detener la fuente, contener, recuperar y reportar el evento.','Gestionar absorbentes usados conforme a su clasificación.'
    ]),
    r('ENV-002','AMBIENTAL','Residuo generado por la actividad','Mezcla, disposición o almacenamiento incorrecto','Contaminación y pérdida de trazabilidad del residuo',3,3,'G',[
      'Segregar el residuo en el punto de generación.','Identificar el contenedor con nombre, condición y fecha según el procedimiento interno.','Mantener recipientes cerrados y trasladar al área autorizada.','No asignar color de recipiente hasta que Ambiental publique su estándar.'
    ]),
    r('ENV-003','AMBIENTAL','Humo, polvo, vapor u olor','Emisión no controlada al aire','Afectación a calidad del aire o molestia',3,2,'G',[
      'Capturar la emisión en la fuente mediante extracción o método húmedo compatible.','Mantener cerrados recipientes volátiles.','Suspender y reportar si la ventilación o extracción no funciona.'
    ]),
    r('ENV-004','AMBIENTAL','Agua de limpieza, lodo o contaminante','Descarga a drenaje o infiltración','Contaminación de agua o suelo',4,2,'G',[
      'Bloquear o proteger drenajes antes de iniciar.','Recolectar agua y lodos en recipientes compatibles.','Disponer mediante la ruta aprobada por Ambiental; no descargar sin autorización.'
    ]),
    r('ENV-005','AMBIENTAL','Ruido hacia áreas vecinas','Emisión de ruido ambiental','Molestia o incumplimiento de límites aplicables',2,2,'G',[
      'Programar la actividad en horario autorizado.','Usar barreras o silenciadores y mantener equipos ajustados.','Notificar a las áreas potencialmente afectadas.'
    ]),
    r('ENV-006','AMBIENTAL','Gas refrigerante o consumo energético del equipo','Liberación de refrigerante o operación ineficiente','Emisión indirecta o afectación ambiental',3,2,'G',[
      'Recuperar el refrigerante con equipo compatible; no ventear.','Realizar prueba de hermeticidad y registrar cantidad recuperada/cargada.','Entregar refrigerante y residuos a la ruta autorizada por Ambiental.'
    ])
  ];

  const questions = [
    q('ctx_height','¿La tarea se realiza en altura o junto a un borde/abertura?','Considere plataforma, techo, escalera, fosa y cambio de nivel.'),
    q('ctx_energy','¿Se intervendrá energía eléctrica o energía almacenada?','Incluye eléctrica, neumática, hidráulica, mecánica, térmica y gravitacional.'),
    q('ctx_hot','¿Se generará flama, chispa, calor o metal fundido?','Soldadura, corte, esmerilado, calentamiento y actividades equivalentes.'),
    q('ctx_chemical','¿Se usará o liberará una sustancia química?','Incluye epóxicos, solventes, aceites, refrigerantes y limpiadores.'),
    q('ctx_lift','¿Se izará o sostendrá una carga?','Considere grúa, polipasto, eslinga, gato y carga suspendida.'),
    q('ctx_confined','¿La tarea implica ingresar a un espacio confinado?','Espacio con acceso limitado, no diseñado para ocupación continua o con atmósfera peligrosa.'),
    q('ctx_civil','¿Se perforará, anclará, excavará o modificará obra civil?','Revise interferencias ocultas, polvo, proyección y estabilidad.'),
    q('ctx_mobile','¿Habrá vehículos o equipos móviles en la zona?','Montacargas, plataformas, grúas, tractores y tránsito de materiales.'),
    q('ctx_pressure','¿Se abrirá o desconectará una línea presurizada?','Aire, hidráulico, agua, vapor, gas o refrigerante.'),
    q('ctx_moving','¿Se trabajará dentro de la zona de movimiento de una máquina o robot?','Incluye prensas, transportadores, elevadores, robots y ventiladores.'),
    q('ctx_noise','¿Se generará o existe ruido elevado?','Herramienta de impacto, esmeril, extractor, compresor o proceso.'),
    q('ctx_dust','¿Se generarán polvo, humo, vapor o partículas?','Considere extracción, ventilación e higiene industrial.'),
    q('ctx_manual','¿Habrá manipulación manual o postura forzada?','Peso, alcance, repetición, duración y geometría de la carga.'),
    q('ctx_sharp','¿Habrá filos, rebabas o herramienta cortante?','Incluye lámina, broca, disco, cuchilla y piezas dañadas.'),
    q('ctx_water','¿Se generará agua residual, lodo o riesgo de descarga?','Proteja drenajes y defina la ruta de disposición.'),
    q('ctx_refrigerant','¿Se intervendrá el circuito de refrigerante?','Recuperación, vacío, prueba de fugas y carga.'),
    q('ctx_simultaneous','¿Habrá trabajos simultáneos o interferencia con otras áreas?','Coordine accesos, energías, horarios y responsables.')
  ];

  const contextRules = {
    ctx_height: rule(['SEG-002','SEG-003'],[],['height']),
    ctx_energy: rule(['SEG-005','SEG-010'],[],['electrical','loto']),
    ctx_hot: rule(['SEG-006','SEG-007','SEG-008'],['ENV-003'],['hot_work']),
    ctx_chemical: rule(['SEG-009'],['ENV-001','ENV-002','ENV-003'],[]),
    ctx_lift: rule(['SEG-003','SEG-011','SEG-023'],[],['lifting']),
    ctx_confined: rule(['SEG-017','SEG-018'],['ENV-004'],['confined','loto']),
    ctx_civil: rule(['SEG-003','SEG-008','SEG-020'],['ENV-002','ENV-003'],['civil']),
    ctx_mobile: rule(['SEG-012','SEG-023'],[],[]),
    ctx_pressure: rule(['SEG-010','SEG-015'],['ENV-001'],['loto']),
    ctx_moving: rule(['SEG-004','SEG-010','SEG-016'],[],['loto']),
    ctx_noise: rule(['SEG-019'],['ENV-005'],[]),
    ctx_dust: rule(['SEG-008','SEG-020'],['ENV-003'],[]),
    ctx_manual: rule(['SEG-013'],[],[]),
    ctx_sharp: rule(['SEG-014','SEG-020'],[],[]),
    ctx_water: rule(['SEG-018','SEG-021'],['ENV-002','ENV-004'],[]),
    ctx_refrigerant: rule(['SEG-009','SEG-015','SEG-022'],['ENV-001','ENV-006'],['loto']),
    ctx_simultaneous: rule(['SEG-023'],[],[])
  };

  const activities = [
    a('ACT-001','Corte y soldadura',['hot_work'],[
      t('Trasladar e inspeccionar equipo, cilindros, cables y extintor',['SEG-001','SEG-003','SEG-013'],[]),
      t('Delimitar el área y retirar o proteger combustibles',['SEG-003','SEG-023'],['ENV-002']),
      t('Ejecutar corte, soldadura o esmerilado',['SEG-006','SEG-007','SEG-008','SEG-020'],['ENV-003']),
      t('Inspeccionar el área, retirar residuos y cerrar el permiso',['SEG-001','SEG-007'],['ENV-002'])
    ]),
    a('ACT-002','Instalaciones eléctricas',['electrical','loto'],[
      t('Identificar circuito, alcance y fuentes de energía',['SEG-005','SEG-010'],[]),
      t('Desenergizar, bloquear, etiquetar y verificar ausencia de tensión',['SEG-005','SEG-010'],[]),
      t('Instalar, conectar o reparar componentes',['SEG-014','SEG-020'],['ENV-002']),
      t('Cerrar tableros, retirar LOTO y probar de forma controlada',['SEG-005','SEG-023'],[])
    ]),
    a('ACT-003','Colocación de piso epóxico',[],[
      t('Delimitar y preparar la superficie',['SEG-001','SEG-008','SEG-020'],['ENV-002','ENV-003']),
      t('Preparar y mezclar componentes',['SEG-009'],['ENV-001','ENV-002','ENV-003']),
      t('Aplicar recubrimiento y controlar acceso',['SEG-001','SEG-009','SEG-013'],['ENV-001','ENV-003']),
      t('Limpiar herramientas y gestionar residuos',['SEG-009'],['ENV-001','ENV-002','ENV-004'])
    ]),
    a('ACT-004','Cambio de carga TR1',['electrical','loto'],[
      t('Coordinar ventana, cargas afectadas y plan de maniobra',['SEG-023'],[]),
      t('Identificar, desenergizar y bloquear fuentes',['SEG-005','SEG-010'],[]),
      t('Ejecutar transferencia o cambio de conexiones',['SEG-005','SEG-014'],[]),
      t('Verificar protecciones, energizar y monitorear',['SEG-005','SEG-006'],[])
    ]),
    a('ACT-005','Mantenimiento preventivo y correctivo de compresores',['loto'],[
      t('Inspeccionar el equipo y confirmar alcance',['SEG-001','SEG-019'],[]),
      t('Parar, aislar energías y descargar presión',['SEG-005','SEG-010','SEG-015'],['ENV-001']),
      t('Desmontar, limpiar, ajustar o reemplazar componentes',['SEG-004','SEG-014','SEG-016'],['ENV-001','ENV-002']),
      t('Reinstalar guardas, retirar bloqueo y probar',['SEG-004','SEG-015','SEG-019'],[])
    ]),
    a('ACT-006','Mantenimiento preventivo y correctivo de grúas',['loto','lifting'],[
      t('Delimitar área e inspeccionar acceso y equipo',['SEG-001','SEG-003','SEG-012'],[]),
      t('Aislar energías y asegurar puente, carro y gancho',['SEG-004','SEG-010','SEG-011'],[]),
      t('Inspeccionar y reparar mecanismos, cables y controles',['SEG-002','SEG-014','SEG-016'],['ENV-001','ENV-002']),
      t('Realizar prueba funcional y de carga controlada',['SEG-011','SEG-023'],[])
    ]),
    a('ACT-007','Anclaje de guardas',['civil','loto'],[
      t('Validar ubicación e interferencias ocultas',['SEG-005','SEG-023'],[]),
      t('Aislar la máquina y desmontar o posicionar la guarda',['SEG-004','SEG-010','SEG-013'],[]),
      t('Perforar y colocar anclajes',['SEG-008','SEG-014','SEG-020'],['ENV-002','ENV-003']),
      t('Verificar fijación, claros e interlocks',['SEG-004'],[])
    ]),
    a('ACT-008','Reparación de elevador de blanks',['loto','lifting'],[
      t('Delimitar e identificar energías y posición de la carga',['SEG-003','SEG-011','SEG-023'],[]),
      t('Bloquear, descargar y soportar partes elevadas',['SEG-004','SEG-010','SEG-015'],[]),
      t('Reparar sensores, cadenas, cilindros o estructura',['SEG-005','SEG-014','SEG-016'],['ENV-001','ENV-002']),
      t('Retirar soportes y realizar prueba controlada',['SEG-004','SEG-011'],[])
    ]),
    a('ACT-009','Mantenimiento preventivo y correctivo a prensas',['loto'],[
      t('Revisar historial, área y condición de la prensa',['SEG-001','SEG-023'],[]),
      t('Aplicar LOTO y soportar corredera/energía gravitacional',['SEG-004','SEG-010','SEG-015'],[]),
      t('Inspeccionar, ajustar o reemplazar componentes',['SEG-014','SEG-016','SEG-020'],['ENV-001','ENV-002']),
      t('Reinstalar guardas y ejecutar prueba segura',['SEG-004','SEG-019'],[])
    ]),
    a('ACT-010','Mantenimiento preventivo y correctivo a robots',['loto'],[
      t('Delimitar celda e identificar zonas de movimiento',['SEG-004','SEG-023'],[]),
      t('Aislar energías y verificar condición segura',['SEG-005','SEG-010'],[]),
      t('Inspeccionar, reparar o programar en modo controlado',['SEG-004','SEG-014','SEG-016'],['ENV-002']),
      t('Cerrar celda y probar interlocks y trayectoria',['SEG-004','SEG-023'],[])
    ]),
    a('ACT-011','Mantenimiento preventivo y correctivo a estacionarias',['loto'],[
      t('Inspeccionar equipo, herramientas y área',['SEG-001','SEG-019'],[]),
      t('Desenergizar y bloquear',['SEG-005','SEG-010'],[]),
      t('Reparar sistema mecánico o eléctrico',['SEG-014','SEG-016','SEG-020'],['ENV-001','ENV-002']),
      t('Colocar guardas y hacer prueba funcional',['SEG-004','SEG-019'],[])
    ]),
    a('ACT-012','Limpieza de extractores',['loto'],[
      t('Delimitar y preparar acceso al extractor',['SEG-001','SEG-002','SEG-003'],[]),
      t('Desenergizar y bloquear motor/ventilador',['SEG-005','SEG-010','SEG-016'],[]),
      t('Retirar acumulación y limpiar componentes',['SEG-008','SEG-013','SEG-014'],['ENV-002','ENV-003']),
      t('Cerrar equipo y verificar extracción',['SEG-016','SEG-019'],['ENV-003'])
    ]),
    a('ACT-013','Colocación de paso de gato',['civil'],[
      t('Revisar diseño, ubicación e interferencias',['SEG-005','SEG-023'],[]),
      t('Trasladar y posicionar estructura',['SEG-003','SEG-011','SEG-013'],[]),
      t('Perforar, anclar o soldar la estructura',['SEG-006','SEG-008','SEG-020'],['ENV-002','ENV-003']),
      t('Inspeccionar estabilidad, barandales y acceso',['SEG-002','SEG-003'],[])
    ]),
    a('ACT-014','Limpieza del cárcamo',['confined','loto'],[
      t('Clasificar el acceso, aislar entradas y preparar rescate',['SEG-017','SEG-021','SEG-023'],['ENV-004']),
      t('Ventilar y monitorear atmósfera',['SEG-017','SEG-018'],['ENV-003']),
      t('Extraer agua, lodos y residuos',['SEG-013','SEG-018','SEG-021'],['ENV-002','ENV-004']),
      t('Retirar equipos, cerrar acceso y disponer residuos',['SEG-001','SEG-018'],['ENV-002','ENV-004'])
    ]),
    a('ACT-015','Mantenimiento preventivo y correctivo a aires acondicionados',['loto'],[
      t('Inspeccionar equipo, acceso y condiciones de trabajo',['SEG-001','SEG-002','SEG-019'],[]),
      t('Desenergizar, bloquear y verificar ausencia de energía',['SEG-005','SEG-010'],[]),
      t('Recuperar refrigerante y liberar presión de forma controlada',['SEG-009','SEG-015','SEG-022'],['ENV-001','ENV-006']),
      t('Limpiar, reparar y reemplazar componentes',['SEG-014','SEG-016'],['ENV-002']),
      t('Probar hermeticidad, cargar y verificar operación',['SEG-005','SEG-015'],['ENV-006'])
    ])
  ];

  window.KTMEX_CATALOG = Object.freeze({
    version: 'DRAFT-2026-10-14.1',
    status: 'BORRADOR NO APROBADO POR SAFETY/AMBIENTAL',
    catalogStatus: 'DRAFT',
    activities,
    actividades: activities,
    risks,
    riesgos: risks,
    permits,
    permisos: permits,
    questions,
    preguntasContexto: questions,
    contextRules,
    reglasContexto: contextRules,
    severidades: [
      { valor: 1, etiqueta: 'Menor' }, { valor: 2, etiqueta: 'Moderada' }, { valor: 3, etiqueta: 'Seria' },
      { valor: 4, etiqueta: 'Crítica' }, { valor: 5, etiqueta: 'Fatal / catastrófica' }
    ],
    probabilidades: [
      { valor: 1, etiqueta: 'Remota' }, { valor: 2, etiqueta: 'Aislada' }, { valor: 3, etiqueta: 'Ocasional' },
      { valor: 4, etiqueta: 'Recurrente' }, { valor: 5, etiqueta: 'Frecuente' }
    ]
  });

  function r(id,type,hazard,event,consequence,severity,probability,jraCategory,controls,documents) {
    const jsaSeverity = severity >= 5 ? 4 : severity >= 4 ? 3 : severity >= 3 ? 2 : 1;
    const jraSeverity = severity >= 5 ? 40 : severity === 4 ? 20 : severity === 3 ? 3 : 2;
    return { id, type, tipo:type, hazard, peligro:hazard, event, riesgo:event, consequence, consecuencia:consequence,
      severity, jsaSeverity, severidad:jsaSeverity, probability, probabilidad:probability, jraCategory, jraSeverity,
      jraFrequency: probability >= 5 ? 8 : probability === 4 ? 6 : probability === 3 ? 4 : 1,
      jraProbability: probability >= 3 ? 1 : .5, controls, controles:controls, documents:documents || [], documentos:documents || [],
      owner: type === 'AMBIENTAL' ? 'AMBIENTAL' : 'SAFETY', status:'DRAFT' };
  }
  function q(id,label,help) { return { id, label, etiqueta:label, help, ayuda:help }; }
  function rule(risks,aspects,permits) { return { risks, riesgos:risks, aspects, aspectos:aspects, permits, permisos:permits }; }
  function t(task,risks,aspects) { return { task, tarea:task, risks, riesgos:risks, aspects, aspectos:aspects }; }
  function a(id,name,basePermits,tasks) { return { id, name, nombre:name, basePermits, permisosBase:basePermits, tasks, pasos:tasks, note:'Catálogo piloto: validar y aprobar la relación completa antes de producción.', nota:'Catálogo piloto: validar y aprobar la relación completa antes de producción.' }; }
})();
