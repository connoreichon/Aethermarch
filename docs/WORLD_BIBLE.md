# Aethermarch — World Bible

> Documento de diseño de mundo. Base de referencia para crear contenido nuevo: estratos, sectores, enemigos, lugares, NPCs, recursos y zonas secretas.
> Para estado de implementación, ver `docs/ABYSS_DESIGN.md`. Para roadmap técnico, ver `docs/PROJECT_BRIEF.md`.

---

## 1. Premisa del Mundo

Aethermarch ocurre en un mundo medieval oscuro donde existe una grieta vertical de profundidad desconocida llamada **El Abismo**.

El Abismo no es una mazmorra. Es un territorio subterráneo enorme, antiguo y parcialmente habitado. Hay caminos, campamentos, posadas excavadas, ruinas de expediciones antiguas, fortalezas ocupadas, mercados ocultos, criaturas propias de cada capa y zonas selladas que nadie ha vuelto a abrir.

**El jugador no es un héroe elegido.** Es un expedicionario con una caravana pequeña, una criatura compañera y un arquetipo de habilidades. Su progresión principal es:

> Caminar en la vida real → completar tramos → descender por estratos → descubrir sectores → sobrevivir combates → registrar el mundo en el Códice → conseguir recursos → mejorar opciones → contratar ayuda → alcanzar el fondo.

La escala de progreso es **vertical**. La profundidad es el indicador de avance. Ir más abajo = más peligro, más recompensa, más mundo.

---

## 2. El Abismo

El Abismo es una estructura vertical en espiral que lleva siglos existiendo bajo el mundo conocido. Nadie sabe cuándo se formó. Los mapas que existen son contradictorios y siempre incompletos.

Lo que saben los expedicionarios:

- El Abismo **baja en espiral**, no en línea recta. Cada estrato se abre lateralmente.
- Cada capa es más oscura, más antigua y más peligrosa que la anterior.
- Los recursos se vuelven más raros y más valiosos conforme se desciende.
- Algunas zonas solo existen para quienes cumplen condiciones específicas.
- La criatura compañera cambia la forma en que se percibe y navega el Abismo.
- Hay vida aquí abajo. No toda es hostil. No toda es amigable.
- Nadie ha llegado al fondo y vuelto igual.

**Lo que no se sabe:** qué hay en el fondo exactamente. Los relatos de quienes afirman haber llegado son contradictorios y pocos regresan para contarlo.

---

## 3. Reglas de Geografía

1. El Abismo baja, pero no en línea recta. Las rutas zigzaguean, se bifurcan y a veces suben antes de bajar.
2. Cada estrato se abre lateralmente: puede ser una cornisa, un anillo de cuevas, un sistema de túneles o una caverna abierta.
3. Las rutas tienen tipos distintos con comportamiento distinto en gameplay:
   - **Camino principal** — siempre accesible, bien marcado, mayor tráfico, más seguro.
   - **Senda oculta** — requiere mascota, exploración activa o dominio del sector.
   - **Ruta peligrosa** — accesible pero con penalización o mayor riesgo.
   - **Ruta bloqueada** — requiere condición activa (equipo, rango, contratable, recurso).
   - **Ruta de descenso** — conecta estratos. A veces tiene requisito.
   - **Ruta de retorno** — puede tener ventajas propias (recursos distintos, NPC diferente).
   - **Atajo** — reduce pasos de tramo pero puede tener mayor riesgo.
   - **Paso secreto** — solo visible con condición cumplida.
4. Un sector puede tener varias conexiones a otros sectores del mismo estrato o al siguiente.
5. Las zonas secretas no son aleatorias puras. Requieren condición. La condición puede incluir azar, pero el azar solo es un modificador.
6. Las rutas repetidas siguen siendo útiles: aumentan dominio, bajan riesgo, mejoran loot progresivo y pueden desbloquear eventos de segundo descubrimiento.
7. Cada estrato debe tener al menos un lugar seguro o punto de recuperación, aunque esté limitado o deteriorado.
8. Los lugares seguros no eliminan el peligro del estrato. Crean pausas estratégicas.

---

## 4. Estructura de Estratos

Los primeros 9 estratos son los planificados para contenido jugable. El fondo del Abismo queda sin nombre por diseño.

> **Nota de alineación:** El código actual implementa los estratos I–III con biomas coast y forge para II y III respectivamente (Cornisa Salina, Forjas Hundidas). El diseño de esta World Bible usa la nomenclatura provisional oficial. Ambas versiones serán alineadas en próximos bloques de implementación.

| # | Nombre provisional | Profundidad | Bioma | Peligro | Loot T |
|---|---|---|---|---|---|
| I | Linde de Raíz | 0–250 m | Bosque rúnico, raíces, niebla baja | Bajo | 1 |
| II | Corredor de Esporas | 250–500 m | Hongos luminosos, niebla de esporas, túneles estrechos | Bajo–Medio | 2 |
| III | Cuenca de Resina | 500–800 m | Resina endurecida, brasas enterradas, colonias primitivas | Medio | 2–3 |
| IV | Cámara de las Hormigas de Fuego | 800–1100 m | Túneles rojizos, resina ardiente, colonias masivas | Medio–Alto | 3 |
| V | Ruinas Sumergidas | 1100–1500 m | Piedra antigua bajo agua oscura, runas borradas | Alto | 4 |
| VI | Desierto de Hielo | 1500–1900 m | Viento helado, cristales de hielo, silencio absoluto | Alto | 4–5 |
| VII | Forjas Enterradas | 1900–2400 m | Hierro vivo, magma contenido, constructos durmientes | Muy alto | 5 |
| VIII | Huesos Colosales | 2400–3000 m | Esqueletos de criaturas antiguas, cavernas enormes | Extremo | 6 |
| IX | Campo de Cristal Vivo | 3000–3800 m | Cristales que crecen, resuenan y cortan | Extremo | 7 |
| ∞ | Fondo del Abismo | desconocida | Desconocido | Desconocido | — |

### Detalle por estrato

#### Estrato I · Linde de Raíz
- **Fantasía visual:** bosque nocturno antiguo. Raíces gigantes que atraviesan la piedra. Niebla baja. Faroles de expedicionarios anteriores atados a troncos. Musgo y piedra rúnica.
- **Función jugable:** tutorial del descenso. Presenta mecánicas base.
- **Recursos:** Madera Rúnica, Raíz de Aethel, Hoja Luminaria.
- **Enemigos:** Saqueador Rúnico, Bestia de Fractura.
- **Lugares seguros:** Refugio de Linde (implementado como POI).
- **Secreto principal:** Cueva de Setas Huecas — acceso por mascota rastreadora o golpe contundente.
- **Primer momento memorable:** el farol de un expedicionario muerto con un mapa parcial colgado.
- **Contratables típicos:** Mira de las Cornisas (guía), Dos el Silencioso (explorador).
- **Requisitos de acceso:** ninguno.

#### Estrato II · Corredor de Esporas
- **Fantasía visual:** hongos bioluminiscentes de metro y medio de altura. Niebla de esporas azul-violeta. Túneles estrechos que bifurcan sin lógica aparente. Nula luz exterior.
- **Función jugable:** primeras mecánicas de peligro ambiental (esporas). Primer mercado real.
- **Recursos:** Quitina Blanda, Espora Luminosa, Resina de Hongo.
- **Enemigos:** Hongo Marchante, Araña de Esporas.
- **Lugares seguros:** Posada del Hongo (primera posada profunda), Puesto de Filtros.
- **Secreto principal:** Galería de Hongos Dorados — requiere máscara filtrante o criatura con resistencia a esporas.
- **Riesgo especial:** exposición prolongada sin protección aplica penalización de marcha.
- **Primer momento memorable:** entrar en una cámara de hongos gigantes que pulsan como latidos.
- **Contratables típicos:** Ivar el de las Esporas (rastreador), Tolk el Salinero (recolector).
- **Requisitos de acceso:** ninguno en primera versión; máscara para zonas profundas.

#### Estrato III · Cuenca de Resina
- **Fantasía visual:** ámbar oscuro en paredes y suelo. Brasas enterradas bajo la resina que brillan naranja. Colonias de insectos primitivos. Galerías horizontales amplias.
- **Función jugable:** primer estrato con estructuras antiguas y ruinas de colonias. Primeros coleccionables raros.
- **Recursos:** Núcleo de Resina, Brasa Enterrada, Quitina Dura.
- **Enemigos:** Colono de Resina, Guardia Larvario.
- **Lugares seguros:** Refugio de Brasa (pequeño, en grieta lateral), Puesto de Suministros de Resina.
- **Secreto principal:** Galería sellada por resina antigua — requiere herramienta disolvente.
- **Primer momento memorable:** descubrir una colonia completa atrapada en resina endurecida como ámbar.
- **Contratables típicos:** Sala la Herrera (forjadora errante), Bress Mano de Hierro (guerrero).
- **Requisitos de acceso:** ninguno.

#### Estrato IV · Cámara de las Hormigas de Fuego
- **Fantasía visual:** túneles rojizos. Resina ardiente en grietas del suelo. Columnas de larvas en las paredes. El suelo tiembla levemente siempre.
- **Función jugable:** primer estrato con restricción de acceso real (resistencia al calor). Sistema de colonia como enemigo de área.
- **Recursos:** Quitina Ardiente, Mandíbula Ígnea, Resina Viva.
- **Enemigos:** Hormiga Obrera, Hormiga Soldado, Reina Larvaria (jefe de estrato).
- **Lugares seguros:** Bastión Rojo (fortaleza de expedicionarios), fuera del perímetro de la colonia.
- **Secreto principal:** Cámara de la Reina — requiere armadura resistente al fuego.
- **Primer momento memorable:** escuchar el click de las mandíbulas antes de verlas.
- **Contratables típicos:** Anka Quitina (cazadora de insectos), Rein el Inundado (lector de runas).
- **Requisitos de acceso:** armadura con resistencia al calor o criatura ígnea.

#### Estrato V · Ruinas Sumergidas
- **Fantasía visual:** piedra antigua bajo aguas negras poco profundas. Runas casi borradas. Silencio absoluto roto por goteos. Arquitectura de civilización desconocida.
- **Función jugable:** exploración arqueológica. Lore profundo. Zonas secretas de alto valor.
- **Recursos:** Piedra Arcana, Runa Sumergida, Alga de Sellos.
- **Enemigos:** Guardián de Piedra, Espectro de Agua.
- **Lugares seguros:** Isla Seca (plataforma elevada sobre el agua).
- **Secreto principal:** Cámara de Archivo Subterráneo — requiere lector de runas o contratable rúnico.
- **Primer momento memorable:** ver a través del agua la sombra de una estatua del tamaño de un edificio.
- **Contratables típicos:** Rein el Inundado, El Cartógrafo Ciego.
- **Requisitos de acceso:** ninguno por defecto, pero muchas zonas requieren saber leer runas.

#### Estrato VI · Desierto de Hielo
- **Fantasía visual:** cero luz propia. Solo el reflejo de cristales de hielo. Viento constante que corta. Siluetas de figuras que podrían ser rocas o no.
- **Función jugable:** restricción severa de temperatura. Riesgo de desorientación sin guía o mapa.
- **Recursos:** Cristal de Hielo, Escarcha Arcana, Viento Solidificado.
- **Enemigos:** Gólem de Hielo, Cazador de Niebla Fría.
- **Lugares seguros:** Estación de Faroles (pequeño punto caliente, difícil de encontrar).
- **Secreto principal:** Cueva de Eco — no hacer acciones durante X pasos (silencio activo).
- **Primer momento memorable:** el primer paso en suelo de hielo y ver que el suelo es transparente.
- **Contratables típicos:** Dos el Silencioso, guías de temperatura.
- **Requisitos de acceso:** equipo con protección de frío o criatura adaptada al frío.

#### Estrato VII · Forjas Enterradas
- **Fantasía visual:** hierro vivo que cruje. Magma visible pero contenido en canales. Constructos dormidos en posición de trabajo. Ruido metálico constante sin fuente visible.
- **Función jugable:** constructos como amenaza principal. Primeros jefes de mecánica avanzada.
- **Recursos:** Hierro Vivo, Polvo de Magma, Núcleo de Constructo.
- **Enemigos:** Constructo Dormido (activado por vibración), Guardia de Forja.
- **Lugares seguros:** Cámara de Apagado (antigua zona de mantenimiento sin constructos activos).
- **Secreto principal:** Cámara de Planos — requiere contratable con especialidad en constructos.
- **Primer momento memorable:** ver un constructo del tamaño de una casa levantar la cabeza al acercarse.
- **Contratables típicos:** Sala la Herrera, ingenieros especializados.
- **Requisitos de acceso:** sigilo o equipo antivibración.

#### Estrato VIII · Huesos Colosales
- **Fantasía visual:** huesos de criaturas extintas que funcionan como arquitectura. Cráneos del tamaño de casas. Polvo de eras extintas. Hongos necrófagos. Microorganismos que brillan en los huesos.
- **Función jugable:** navegación en entorno de escala enorme. Zonas secretas dentro de criaturas.
- **Recursos:** Hueso Antiguo, Polvo de Era, Escama Fósil.
- **Enemigos:** Necrófago de Polvo, Eco de Criatura (sombra fantasmal).
- **Lugares seguros:** Cuenca de Marfil (dentro de cráneo estabilizado).
- **Secreto principal:** Cámara Craneal — requiere criatura pequeña o explorador de tamaño reducido.
- **Primer momento memorable:** darse cuenta de que el pasillo es una costilla.
- **Contratables típicos:** El Cartógrafo Ciego, arqueólogos.
- **Requisitos de acceso:** equipo de nivel alto.

#### Estrato IX · Campo de Cristal Vivo
- **Fantasía visual:** cristales que crecen visiblemente en tiempo real. Resuenan al paso. Cortan si se toca sin guantes. Emiten luz propia que cambia al moverse.
- **Función jugable:** el más complejo de los 9. Mecánicas de resonancia. Navegación sensorial.
- **Recursos:** Cristal Vivo, Eco de Luz, Fragmento de Resonancia.
- **Enemigos:** Fragmento Animado, Resonador.
- **Lugares seguros:** Cámara Muda (cristales ya resonados, quietos).
- **Secreto principal:** Cámara de Resonancia Perfecta — requiere criatura con sintonía cristalina.
- **Primer momento memorable:** el sonido de miles de cristales respondiendo al primer paso.
- **Contratables típicos:** Rein el Inundado, especialistas en magia arcana.
- **Requisitos de acceso:** equipo resistente a cortes + criatura de sintonía.

---

## 5. Tipos de Lugar

| Tipo | Tamaño | Función jugable | Notas de diseño |
|---|---|---|---|
| **Refugio** | Pequeño | Descanso básico, recuperación leve, guardar progreso narrativo | Primer tipo disponible. Sin rumores ni contratos avanzados. |
| **Posada** | Mediano | Descanso, rumores, recuperación mejorada, posibles contratos | Primer nodo social. Permite encuentros con contratables. |
| **Puesto de suministros** | Pequeño-Mediano | Compra de consumibles, venta de recursos comunes, preparación | Sin rumores. Enfocado en intercambio. |
| **Mercader errante** | Ninguno (NPC) | Inventario limitado. Aparece en rutas o zonas concretas | Aleatorio pero seeded. No siempre disponible. |
| **Forja** | Mediano | Reparar, mejorar o preparar equipo mecánico | No implica cambio visual del personaje. |
| **Taberna** | Mediano | Rumores, encuentro de contratables, encargos, pistas de secretos | Nodo de información. Puede generar misiones. |
| **Campamento** | Variable | Punto temporal de expedicionarios. Puede estar abandonado, ocupado o en peligro | Puede dar loot o eventos. |
| **Fortaleza** | Grande | Lugar militar o defensivo. Puede pertenecer a facción | Nodo de historia o misión. |
| **Castillo subterráneo** | Muy grande | Zona rara, narrativa. Mazmorra, facción, jefe o historia | No más de 1 por 3 estratos. |
| **Santuario** | Variable | Lugar espiritual o mágico. Reliquias, lore, desbloqueos | Puede ser condición para zonas secretas. |
| **Ruina** | Variable | Antiguo, sin control. Enemigos, recursos, secretos, códice | Muy común. Contenedor genérico de contenido. |
| **Mercado oculto** | Mediano | Varios NPCs. Intercambio avanzado de materiales y servicios | Raro. Aparece en estratos medios-altos. |

---

## 6. Asentamientos y Lugares Seguros

### Estrato I · Linde de Raíz

#### Refugio de Linde
Tipo: Refugio
Estrato: I · Linde de Raíz
Profundidad: ~80 m
Función: descanso básico, tutorial de recuperación, primer punto seguro real.
Descripción: estructura de madera rúnica encajada entre dos raíces gigantes. Tejado de musgo. Farol siempre encendido. Nadie sabe quién lo mantiene.
Implementado como: POI `shelter` en sector `Linde de Aethel`.

#### Mercader de Raíces
Tipo: Mercader errante
Estrato: I · Linde de Raíz
Profundidad: variable (ruta Linde–Raíz)
Función: primer mercader accesible. Compra recursos del bosque. Vende consumibles básicos.
Descripción: hombre mayor con mula cargada de sacos. No baja más allá del primer estrato. Implementado como: POI `trader` en sector `Raíz de Niebla`.

#### Ruina de Guardia Rúnica
Tipo: Ruina
Estrato: I · Linde de Raíz
Profundidad: ~160 m
Función: primer punto de exploración narrativa. Entrada de códice. Posible loot.
Descripción: torre de piedra rúnica derrumbada. Marcas de combate antiguo. Posible enemigo anidado.

#### Cueva de Setas Huecas
Tipo: Zona secreta
Estrato: I · Linde de Raíz
Profundidad: ~200 m
Función: primera zona secreta. Tutorial de secretos.
Descripción: cueva detrás de una pared de raíces compactas. Dentro: setas de un metro de altura, esporas de luz tenue, posible contratable escondido.
Requisito: mascota rastreadora o herramienta contundente.

---

### Estrato II · Corredor de Esporas

#### Posada del Hongo
Tipo: Posada
Estrato: II · Corredor de Esporas
Profundidad: ~300 m
Función: primera posada profunda. Rumores, recuperación, contratos simples.
Descripción: caverna ensanchada manualmente. Mesas de piedra. Hongos en las paredes como decoración funcional. Luz bioluminiscente. Posada de Varna.

#### Puesto de Filtros
Tipo: Puesto de suministros
Estrato: II · Corredor de Esporas
Profundidad: ~380 m
Función: venta de máscaras filtrantes y antídotos de espora. Preparación para zonas profundas del estrato.
Descripción: puesto construido en una curva del corredor. Gestionado por dos hermanos con cicatrices de esporas.

#### Campamento de la Niebla
Tipo: Campamento
Estrato: II · Corredor de Esporas
Profundidad: ~450 m
Función: nodo secundario. Encuentros con otros expedicionarios. Posible contrato.
Descripción: zona abierta con varios grupos acampados. No siempre seguro. Puede haber tensión entre expedicionarios.

#### Galería de Hongos Dorados
Tipo: Zona secreta
Estrato: II · Corredor de Esporas
Profundidad: ~420 m
Función: primera zona secreta de riesgo ambiental. Loot raro.
Descripción: galería llena de hongos dorados bioluminiscentes. Las esporas concentradas son tóxicas sin filtro.
Requisito: máscara filtrante o criatura con resistencia a esporas.

---

### Estrato III · Cuenca de Resina

#### Refugio de Brasa
Tipo: Refugio
Estrato: III · Cuenca de Resina
Profundidad: ~600 m
Función: descanso básico en zona hostil. Recuperación leve.
Descripción: grieta lateral en la roca con resina sellada como puerta. Cálido, oscuro, seguro. Parece haber sido usado mucho.

#### Forja de Cuenca
Tipo: Forja
Estrato: III · Cuenca de Resina
Profundidad: ~650 m
Función: primera forja funcional. Mejora de equipo con materiales del estrato.
Descripción: estructura de roca y hierro viejo excavada por herreros de La Fragua del Fondo. Siempre hay brasas activas.

#### Puesto de Suministros de Resina
Tipo: Puesto de suministros
Estrato: III · Cuenca de Resina
Profundidad: ~700 m
Función: intercambio de materiales de resina. Preparación para descenso a Estrato IV.
Descripción: tienda improvisada cerca de la ruta de descenso. Cambia de dueño con frecuencia.

#### Galería Sellada
Tipo: Zona secreta
Estrato: III · Cuenca de Resina
Profundidad: ~750 m
Función: zona secreta de loot alto. Posible entrada de facción La Fragua del Fondo.
Descripción: galería bloqueada por resina endurecida de siglos. Detrás: material antiguo sin reclamar.
Requisito: herramienta disolvente o Quitina Ardiente como llave.

---

### Estrato IV · Cámara de las Hormigas de Fuego (futuro)

#### Bastión Rojo
Tipo: Fortaleza
Estrato: IV
Función: primer bastión contra la colonia. Base de operaciones para contratos en el estrato.

#### Túnel de Resina Caliente
Tipo: Ruta peligrosa
Función: atajo entre zonas del estrato. Alta temperatura. Requiere equipo de calor.

#### Nido Exterior
Tipo: Ruina (zona hostil activa)
Función: zona de combate. Loot de colonia. Peligro constante.

#### Cámara de la Reina
Tipo: Zona secreta / jefe de estrato
Requisito: armadura resistente al fuego.

---

## 7. Rutas y Tramos

Cada tramo es una expedición entre dos puntos con pasos, eventos y recompensas definidos.

| Tramo | Estrato | Tipo | Peligro | Pasos proto | Secreto posible |
|---|---|---|---|---|---|
| Inicio → Linde de Aethel | I | Tutorial | Muy bajo | 400–600 | No |
| Linde de Aethel → Raíz de Niebla | I | Ruta principal | Bajo | 600–1000 | No |
| Linde de Aethel → Cueva de Setas | I | Ruta secreta | Bajo | 500–800 | Sí (la ruta es el secreto) |
| Raíz de Niebla → Paso de Esporas | I→II | Ruta de descenso | Bajo–Medio | 800–1200 | No |
| Paso de Esporas → Galería de Hongos | II | Ruta principal | Medio | 800–1000 | No |
| Galería de Hongos → Posada del Hongo | II | Ruta segura | Bajo | 500–700 | No |
| Posada del Hongo → Galería Dorada | II | Ruta secreta | Medio | 600–900 | Sí |
| Campamento de la Niebla → Umbral de Resina | II→III | Ruta de descenso | Medio | 1000–1400 | No |
| Umbral de Resina → Cuenca Central | III | Ruta principal | Medio | 800–1200 | No |
| Cuenca Central → Galería Sellada | III | Ruta secreta | Medio | 600–900 | Sí |
| Cuenca Central → Fragua Dormida | III | Ruta principal | Medio–Alto | 1000–1400 | No |
| Fragua Dormida → Bastión de Carbón | III | Ruta de descenso | Alto | 1000–1500 | No |

### Tramos detallados (ejemplos)

#### Tramo: Linde de Aethel → Raíz de Niebla
```
Estrato: I
Tipo: ruta principal con niebla baja
Riesgo: bajo
Eventos probables: raíces marcadas, farol de expedicionario, señal de camino, Saqueador Rúnico,
                   Madera Rúnica, Raíz de Aethel
Secreto posible: señal de la Cueva de Setas con mascota rastreadora
Pasos prototipo: 600–1000
Primer descubrimiento: Raíz de Niebla se revela con entrada de Códice.
```

#### Tramo: Paso de Esporas → Galería de Hongos (Estrato II)
```
Estrato: II
Tipo: ruta principal, esporas moderadas
Riesgo: medio
Eventos probables: hongos luminosos, Araña de Esporas, Espora Luminosa, microevento de niebla
Secreto posible: entrada a Galería Dorada con filtro activo
Riesgo ambiental: sin filtro → penalización de pasos
Pasos prototipo: 800–1000
```

#### Tramo: Cuenca Central → Galería Sellada (Estrato III)
```
Estrato: III
Tipo: ruta secreta / zona bloqueada
Riesgo: medio
Eventos probables: Colono de Resina, Brasa Enterrada, rastro de resina antigua
Requisito: herramienta disolvente o Quitina Ardiente en inventario
Secreto: la galería solo se activa si se cumple la condición
Pasos prototipo: 600–900
```

---

## 8. Facciones

### La Liga de Faroles
- **Función:** mantienen refugios, marcas de ruta y faroles en el Abismo. Son la red de seguridad básica para expedicionarios.
- **Estética:** cuero envejecido, farol siempre encendido, marcas triangulares en roca, sin uniforme definido.
- **Relación con jugador:** neutral positiva. Prestan servicios básicos, dan rumores de seguridad, pueden dar contratos de mantenimiento.
- **Dónde aparecen:** Refugios, rutas marcadas, posadas de bajo estrato.
- **Sistemas que desbloquean:** acceso a refugios avanzados, red de rutas seguras, información de nuevas zonas.

### Los Cartógrafos Hundidos
- **Función:** obsesionados con mapear el Abismo. Buscan rutas nuevas, zonas secretas y confirmación de rumores.
- **Estética:** capas largas con bolsillos infinitos, rollo de pergamino siempre a mano, tinta en los dedos.
- **Relación con jugador:** neutral. Dan contratos de descubrimiento. Pagan bien en información y acceso.
- **Dónde aparecen:** rutas de exploración, ruinas, cerca de zonas secretas.
- **Sistemas que desbloquean:** misiones de Códice, rutas ocultas reveladas, acceso a información de estratos más profundos.

### La Fragua del Fondo
- **Función:** herreros, técnicos e ingenieros medievales que trabajan con materiales del Abismo. Fabrican el mejor equipo mecánico disponible.
- **Estética:** delantal de cuero grueso con remaches, brazos quemados, siempre con calor de fondo.
- **Relación con jugador:** comercial. Fabrican, reparan y mejoran equipo. Sin ideología visible.
- **Dónde aparecen:** forjas subterráneas a partir de Estrato III.
- **Sistemas que desbloquean:** equipo mecánico avanzado, recetas de forja, mejoras para zonas con requisitos de equipo.

### La Colmena Roja
- **Función:** facción hostil. No necesariamente humana. Controla el Estrato IV y expande su influencia hacia el III.
- **Estética:** quitina roja, movimientos en columna, comunicación por vibraciones, sin líderes visibles. La Reina Larvaria es su núcleo.
- **Relación con jugador:** hostil por defecto. No contratable. Puede ser objeto de contratos de eliminación.
- **Dónde aparecen:** Estrato IV y avanzada en Estrato III.
- **Sistemas que desbloquean:** contratos de limpieza, loot de quitina, zonas detrás de líneas de colonia.

### Los Juramentados del Descenso
- **Función:** mercenarios y contratables del Abismo. No tienen facción fija: se ofrecen al mejor postor dentro de ciertas reglas morales mínimas.
- **Estética:** sin uniforme. Se reconocen por una marca de runa en el brazo que marca su juramento de no abandonar un contrato activo.
- **Relación con jugador:** comercial. Son la base del sistema de contratos.
- **Dónde aparecen:** posadas, tabernas, campamentos, ruinas. Cualquier estrato.
- **Sistemas que desbloquean:** sistema completo de contratos, expediciones automáticas, acceso a zonas especiales via contratable especializado.

---

## 9. Enemigos y Fauna Hostil

### Tipos de enemigo

| Tipo | Descripción | Ejemplo |
|---|---|---|
| **Humanoide** | Bandidos, desertores, rivales. Motivación propia. Pueden negociar en futuro. | Saqueador Rúnico |
| **Bestia** | Criatura salvaje del bioma. Instinto. No razona. | Bestia de Fractura |
| **Insectoide** | Colonia, no individuo. No hay miedo, no hay piedad. | Hormiga Soldado |
| **Constructo** | Máquina antigua. Se activa por condición (vibración, luz, intruso). | Gólem Dormido, Guardián de Fractura |
| **Espectro** | Eco de algo antiguo. No siempre hostil. A veces solo territorial. | Eco de Criatura, Espectro de Agua |
| **Fauna ambiental** | No hostil por defecto. Puede volverse peligrosa si se activa. | Setas caminantes, larvas durmientes |
| **Jefe de estrato** | Único. Zona secreta o evento especial. Alto loot. | Reina Larvaria |

### Reglas de enemigo

1. Cada estrato debe tener al menos 2 enemigos comunes y 1 amenaza especial.
2. Los jefes de estrato se encuentran solo en zonas secretas o eventos específicos.
3. Cada enemigo tiene al menos un ataque y una postura favorable.
4. Los constructos se activan solo si se cumple una condición (vibración, luz, etc.) — diseño jugable importante.
5. Los espectros pueden ser derrotados o esquivados con condición.
6. Los insectoides son difíciles de enfrentar solos: diseñados para disuadir, no para ser el combate central.

### Enemigos implementados (Estrato I–III código actual)

| Enemigo | Estrato | Tipo | Daño |
|---|---|---|---|
| Saqueador Rúnico | I | Humanoide | 6–8 |
| Bestia de Fractura | I–II | Bestia | 8–10 |
| Gólem Dormido | III | Constructo | 12–13 |
| Guardián de Fractura | II–III | Constructo/Espectro | 14–15 |

---

## 10. Recursos y Loot

### Reglas de loot

1. El Loot Tier sube con la profundidad. Tier 1 en superficie, Tier 7+ en estratos finales.
2. Los recursos comunes sirven para progresión básica (mejoras, consumibles, contratos simples).
3. Los recursos raros desbloquean equipo mecánico avanzado, contratos especializados o acceso a zonas.
4. Los recursos únicos están ligados a secretos, jefes de estrato o eventos únicos. Solo uno por mundo.
5. Cada estrato tiene identidad de materiales propia: el loot debe narrar el lugar.

### Tabla de loot por estrato

| Estrato | Loot T | Recursos comunes | Recursos raros | Uso futuro |
|---|---|---|---|---|
| I · Linde de Raíz | 1 | Madera Rúnica, Raíz de Aethel, Hoja Luminaria | Espora Luminosa (borde), Resina Clara | Consumibles, mejoras de refugio, tónicos |
| II · Corredor de Esporas | 2 | Quitina Blanda, Espora Luminosa, Resina de Hongo | Espora Dorada, Filamento de Hongo | Máscaras, antídotos, filtros, mejoras de posada |
| III · Cuenca de Resina | 2–3 | Núcleo de Resina, Brasa Enterrada, Quitina Dura | Brasa Pura, Núcleo Antiguo | Forja, sellos, herramientas, llave de acceso (Estrato IV) |
| IV · Hormigas de Fuego | 3 | Quitina Ardiente, Mandíbula Ígnea, Resina Viva | Núcleo de Reina, Mandíbula Maestra | Armadura resistente al fuego, acceso a cámara |
| V · Ruinas Sumergidas | 4 | Piedra Arcana, Runa Sumergida, Alga de Sellos | Sello de Era, Runa Maestra | Acceso rúnico, reliquias, desbloqueos de códice |
| VI · Desierto de Hielo | 4–5 | Cristal de Hielo, Escarcha Arcana | Corazón de Hielo, Cristal Permanente | Armadura de frío, viales raros |
| VII · Forjas Enterradas | 5 | Hierro Vivo, Polvo de Magma | Núcleo de Constructo, Hierro Maestro | Mejoras de nivel 5+, armas de forja profunda |
| VIII · Huesos Colosales | 6 | Hueso Antiguo, Polvo de Era | Escama Colosal, Núcleo Oseo | Armadura de alto nivel, reliquias |
| IX · Campo de Cristal Vivo | 7 | Cristal Vivo, Eco de Luz | Fragmento de Resonancia, Cristal Maestro | Equipo final, acceso al Fondo |

---

## 11. Zonas Secretas

### Tipos de condición de acceso

| Tipo | Descripción |
|---|---|
| **Por mascota** | Criatura detecta entrada, señal o paso. Específico por tipo de mascota. |
| **Por equipo** | Armadura, herramienta, arma o accesorio con propiedad concreta. |
| **Por arma/herramienta** | Golpe contundente, disolvente, fuerza mínima. |
| **Por rango** | El jugador debe haber alcanzado rango suficiente. |
| **Por contratable** | Solo accesible enviando contratable con especialidad. |
| **Por dominio del sector** | Se desbloquea tras cierto número de visitas o nivel de dominio. |
| **Por códice/lore** | El jugador debe haber leído un fragmento de información previo. |
| **Por evento raro** | Condición de tiempo, acción o ausencia de acción (silencio, inacción). |
| **Por combinación** | Varias condiciones a la vez. Para zonas de alto valor. |

### Ejemplos de zonas secretas

#### Cueva de Setas Huecas
Estrato: I · Linde de Raíz
Profundidad: ~200 m
Tipo: por mascota o herramienta
Requisito: mascota rastreadora (Velthar) o herramienta contundente
Descripción: cueva detrás de pared de raíces compactas. Setas gigantes. Esporas de luz suave.
Recompensa: Espora Luminosa, entrada de Códice, posible contratable escondido.
Probabilidad: aumenta con modo Exploración y dominio del sector.

#### Galería de Hongos Dorados
Estrato: II · Corredor de Esporas
Profundidad: ~420 m
Tipo: por equipo (máscara) o criatura resistente
Requisito: máscara filtrante o criatura con resistencia a esporas
Descripción: galería de hongos de color dorado. Concentración de esporas tóxicas alta.
Recompensa: Espora Dorada, loot raro del estrato, entrada de Códice.
Probabilidad: fija si se cumple condición.

#### Galería Sellada de Resina
Estrato: III · Cuenca de Resina
Profundidad: ~750 m
Tipo: por herramienta o recurso como llave
Requisito: herramienta disolvente o Quitina Ardiente en inventario
Descripción: galería bloqueada por resina antigua. Interior intacto por siglos.
Recompensa: Núcleo Antiguo, planos de forja, información de facción.
Probabilidad: fija si se cumple condición.

#### Torre de Guardián Rúnico
Estrato: I · Linde de Raíz
Profundidad: ~170 m
Tipo: por dominio del sector
Requisito: dominio de Linde de Aethel nivel 3+
Descripción: torre semiderruida. El Guardián solo se activa tras varias visitas. Primera vez: solo rastro. Segunda: huella. Tercera: el guardián emerge.
Recompensa: reliquia rúnica, entrada de Códice especial.

#### Cámara de la Reina
Estrato: IV · Cámara de las Hormigas de Fuego
Profundidad: ~1050 m
Tipo: por equipo
Requisito: armadura con resistencia mínima al fuego
Descripción: cámara central de la colonia. La Reina Larvaria es el jefe de estrato.
Recompensa: loot T3 máximo, Núcleo de Reina único, fragmento de lore de La Colmena.

#### Isla Seca Profunda
Estrato: V · Ruinas Sumergidas
Profundidad: ~1300 m
Tipo: por contratable
Requisito: Rein el Inundado o contratable rúnico en grupo
Descripción: plataforma elevada en zona inundada con acceso bloqueado por sello arcano.
Recompensa: Sello de Era, entrada completa de Códice, acceso a Cámara de Archivo.

#### Cueva de Eco
Estrato: VI · Desierto de Hielo
Profundidad: ~1700 m
Tipo: por evento de inacción (silencio)
Requisito: no realizar acciones durante X pasos consecutivos (sin combate, sin recolección)
Descripción: cueva de cristal que resuena solo en silencio absoluto. Se sella si hay ruido.
Recompensa: Cristal Permanente, evento narrativo único.

#### Cámara de Planos de Forja
Estrato: VII · Forjas Enterradas
Profundidad: ~2100 m
Tipo: por contratable especializado
Requisito: contratable con especialidad en constructos
Descripción: archivo de planos de los constructos originales. Solo un especialista puede descifrarlos.
Recompensa: Núcleo de Constructo único, capacidad de desactivar constructos dormidos.

#### Cámara Craneal
Estrato: VIII · Huesos Colosales
Profundidad: ~2700 m
Tipo: por tamaño de criatura
Requisito: criatura pequeña (Lúmora, Velthar) o explorador especializado
Descripción: cráneo colosal. La entrada es demasiado pequeña para criaturas grandes.
Recompensa: Escama Colosal, lore de la criatura original.

#### Cámara de Resonancia Perfecta
Estrato: IX · Campo de Cristal Vivo
Profundidad: ~3500 m
Tipo: por criatura con sintonía cristalina (Lúmora)
Requisito: Lúmora equipada con Eco de Cristal activado
Descripción: cámara central del campo. Solo una criatura en sintonía puede entrar sin romper los cristales.
Recompensa: Fragmento de Resonancia maestro, acceso al Fondo del Abismo.

---

## 12. NPCs y Contratables

Los contratables son personajes encontrados durante la marcha que el jugador puede contratar para expediciones automáticas.

### Reglas de acceso (implementadas desde 15A)

- **Rango I (Iniciado):** no hay contratables disponibles. La caravana baja sola.
- **Rango II (Caminante):** los exploradores empiezan a aceptar contratos. Los contratos tendrán duración real (ejemplo: 2 h). El explorador parte y vuelve con informe, recursos o complicaciones.
- **Rango III (Explorador):** acceso a contratables de mayor especialidad y estratos más profundos.

Los rangos se calculan derivados del estado: XP acumulado, sectores descubiertos y contratos completados. No se guardan por separado.

### Lista base

#### Mira de las Cornisas
Rango: I → II
Tipo: Guía de rutas
Estrato habitual: I–II
Especialidad: navegación en bruma, primeras rutas del Abismo
Rasgo narrativo: joven, eficiente, desconfía de los Cartógrafos Hundidos
Riesgo base: bajo
Contrato ejemplo: *"Guíar al siguiente campamento sin usar el camino principal. 45 min. Recompensa: mapa parcial de ruta oculta."*
Uso: descubrir sendas ocultas, reducir pasos en rutas conocidas.

#### Ivar el de las Esporas
Rango: II
Tipo: Rastreador de esporas
Estrato habitual: II
Especialidad: hongos, zonas húmedas, esporas, detección de entradas ocultas en Estrato II
Rasgo narrativo: torpe emocionalmente pero preciso en el trabajo. Cicatrices de esporas en la cara.
Riesgo base: bajo-medio
Contrato ejemplo: *"Buscar zona secreta en Corredor de Esporas. 3 horas. Requiere filtro. Recompensa: Espora Dorada + informe."*

#### Tolk el Salinero
Rango: I
Tipo: Recolector
Estrato habitual: II
Especialidad: recursos de Estrato II, extracción eficiente en ambiente hostil
Rasgo narrativo: cobarde pero increíblemente productivo cuando está a salvo
Riesgo base: muy bajo (no va a zonas de riesgo alto)
Contrato ejemplo: *"Recolectar Espora Luminosa x3 en Galería de Hongos. 2 horas. Sin combate."*

#### Bress Mano de Hierro
Rango: II
Tipo: Guerrero de rutas
Estrato habitual: I–III
Especialidad: limpieza de amenazas, escolta en zonas de riesgo medio
Rasgo narrativo: tiene deuda pendiente con La Colmena Roja. No habla de ello.
Riesgo base: medio (atrae combate pero lo gana con frecuencia)
Contrato ejemplo: *"Limpiar sección de Saqueadores en Raíz de Niebla. 1 hora. Recompensa: XP + ruta despejada."*

#### Sala la Herrera
Rango: II
Tipo: Forjadora errante
Estrato habitual: III
Especialidad: mejoras de equipo con materiales del estrato. No necesita forja fija.
Rasgo narrativo: busca un material específico que no menciona. Paga parte en trabajo.
Riesgo base: bajo (no entra en combate pero puede quedar atrapada)
Contrato ejemplo: *"Mejorar armadura con Quitina Dura. 30 min. Requiere 2x Quitina Dura + pago."*

#### Rein el Inundado
Rango: III
Tipo: Lector de runas
Estrato habitual: II–V
Especialidad: descifrado de sellos, acceso a ruinas sumergidas, zonas rúnicas cerradas
Rasgo narrativo: fue cartógrafo. Algo lo dejó solo bajo el agua. No está completo mentalmente pero funciona.
Riesgo base: medio (entra en zonas de riesgo alto)
Contrato ejemplo: *"Abrir sello de acceso en Ruinas Sumergidas. 4 horas. Requiere Runa Sumergida x1."*

#### Anka Quitina
Rango: III
Tipo: Cazadora de insectoides
Estrato habitual: IV
Especialidad: combate contra insectoides, conocimiento de colonias, acceso periférico a zonas de La Colmena
Rasgo narrativo: ácido de hormiga en brazo derecho. Lo muestra como trofeo.
Riesgo base: alto (entra en Estrato IV)
Contrato ejemplo: *"Explorar avanzada de colonia en Estrato IV. 6 horas. Alto riesgo. Alto loot."*

#### Dos el Silencioso
Rango: II
Tipo: Explorador sigiloso
Estrato habitual: I–III
Especialidad: exploración sin activar amenazas, detección de zonas secretas, rutas alternativas
Rasgo narrativo: no habla. Se comunica con señales y notas. Nadie sabe su nombre real.
Riesgo base: bajo (esquiva el combate)
Contrato ejemplo: *"Explorar sección desconocida de Cuenca de Resina. 3 horas. Informe de rutas y peligros."*

#### Varna (NPC estático)
Tipo: Posadiera
Estrato: II · Corredor de Esporas
Función: gestiona la Posada del Hongo. Da rumores de Estrato II y III. No se contrata.
Rasgo narrativo: bajó hace 20 años y nunca subió. No da motivos.
Uso: fuente de información, contratos de menor riesgo, nodo social.

#### El Cartógrafo Ciego
Rango: IV
Tipo: Lector de mapas / informante
Estrato habitual: todos (pero sedentario en Ruinas Sumergidas)
Especialidad: información de rutas de todos los estratos conocidos. No va a ningún lado.
Rasgo narrativo: fue líder de Los Cartógrafos Hundidos. Un accidente en Estrato V lo dejó sin visión pero con memoria perfecta de mapas.
Riesgo base: nulo (nunca se mueve)
Uso: fuente de información avanzada, misiones de Códice, acceso a rutas de alto estrato.

---

## 13. Equipo, Skins y Progresión Visual

### Separación obligatoria

> `Equipo = efectos, stats, requisitos y progresión.`
> `Skins = apariencia visual.`

El equipo mecánico no define la apariencia del personaje durante el gameplay. Un jugador puede llevar la mejor armadura del juego y seguir viendo la silueta base de su personaje.

### Ranuras de equipo mecánico (futuro)

| Ranura | Función principal |
|---|---|
| Arma | Bonus de combate, postura favorable |
| Yelmo | Resistencia a daño de cabeza, visión en zonas |
| Armadura | Resistencia general, acceso a zonas de temperatura |
| Botas | Velocidad de tramo, acceso a terrenos especiales |
| Guantes | Manipulación de recursos, acceso a objetos |
| Reliquia | Efecto pasivo especial único |
| Herramienta | Desbloqueo de zonas bloqueadas por herramienta |
| Amuleto | Bonus de criatura, vínculo, efecto de espora/veneno |

### La apariencia visual se gestiona mediante

- Skins de personaje completo
- Trajes cosméticos
- Personajes visuales predefinidos seleccionables
- Variantes cosméticas de criatura

### Por qué esta separación

El equipo cambia con frecuencia. Redibujarlo a nivel visual sería inasumible en prototipo y no añade valor jugable. Las skins son un sistema cosmético independiente que se implementa por separado, más adelante, sin afectar la mecánica.

---

## 14. Códice y Lore Descubrible

El Códice del Abismo registra el conocimiento acumulado por la expedición. No cuenta todo desde el principio: cada entrada se desbloquea con descubrimiento real.

### Categorías del Códice

| Categoría | Condición de descubrimiento |
|---|---|
| Estratos | Visitar cualquier sector del estrato |
| Sectores | Descubrir el sector |
| Recursos | Tener qty > 0 en inventario o aparecer en recompensas/eventos del diario |
| Enemigos | Encontrarlos en combate o como evento de amenaza |
| Criaturas | Solo la criatura del jugador. Las demás se desbloquean en futuro. |
| Lugares (POIs) | Descubrir el sector que los contiene |
| Contratables | Encontrarlos durante la marcha (futuro) |
| Facciones | Interactuar con miembro de la facción (futuro) |
| Zonas secretas | Solo si se han visitado (futuro) |
| Reliquias | Solo si se han obtenido o identificado (futuro) |
| Eventos únicos | Solo si ocurrieron (futuro) |
| Lore del Abismo | Encontrado en ruinas, sellos, archivos, NPCs (futuro) |

### Regla de diseño

Una entrada de Códice con `discovered: false` no revela ningún dato real: nombre, descripción, bioma, pasiva ni ubicación. Solo confirma que la entrada existe sin revelar su contenido.

---

## 15. La Torre como Postgame

La Torre no se implementa en los bloques actuales.

La Torre es un mundo aparte desbloqueado únicamente tras llegar al fondo del Abismo al menos una vez. Es contenido de largo plazo, posterior a la estabilización completa del Abismo.

Características reservadas:
- Dirección inversa: sube, no baja.
- Lógica propia, biomas distintos, enemigos propios.
- Acceso desde el Fondo del Abismo, no desde la superficie.
- Dificultad más alta desde el primer piso.
- Historia y lore ampliado.

Regla de roadmap: **no diseñar contenido detallado de La Torre hasta que el Abismo tenga al menos 5 estratos jugables y estables.**

---

## 16. Reglas para Crear Contenido Nuevo

### Checklist de nuevo estrato

- [ ] 1 identidad visual clara (color, luz, temperatura, sonido)
- [ ] 3 recursos propios del bioma (común, común, raro)
- [ ] 3 enemigos (2 comunes, 1 especial o jefe)
- [ ] 1 lugar seguro (mínimo refugio)
- [ ] 1 ruta de descenso al siguiente estrato
- [ ] 2–3 sectores navegables
- [ ] 1 zona secreta con condición definida
- [ ] 1 posible contratable asociado
- [ ] 1 entrada de Códice relevante para el mundo
- [ ] 1 primer momento memorable (narrativo o visual)

### Checklist de nuevo sector

- [ ] Nombre
- [ ] Estrato y profundidad
- [ ] Bioma (puede ser variante del bioma del estrato)
- [ ] Nivel de peligro (`threat`)
- [ ] Loot tier
- [ ] Recursos disponibles
- [ ] Enemigos del pool
- [ ] Conexiones a otros sectores
- [ ] POI (opcional)
- [ ] Zona secreta (opcional)
- [ ] Texto de primer descubrimiento

### Checklist de nuevo enemigo

- [ ] Silueta clara y reconocible
- [ ] Bioma donde aparece
- [ ] 1–2 ataques con postura favorable definida
- [ ] Recompensa al vencer
- [ ] Entrada de Códice (concepto + bioma)
- [ ] Tipo (humanoide / bestia / insectoide / constructo / espectro / jefe)

### Checklist de nuevo lugar seguro

- [ ] Tipo (refugio / posada / puesto / forja / etc.)
- [ ] Estrato y profundidad
- [ ] Función jugable
- [ ] Descripción breve
- [ ] Conexión a POI en gameData.js (si se implementa)

### Checklist de nueva zona secreta

- [ ] Estrato y profundidad
- [ ] Tipo de condición de acceso
- [ ] Requisito concreto (equipo, mascota, rango, recurso, contratable)
- [ ] Descripción del interior
- [ ] Recompensa (loot + Códice mínimo)
- [ ] Probabilidad de aparición (fija o modificada)

---

## 17. Primer Mapa de Contenido Jugable

Estado actual y gaps de los primeros 3 estratos.

### Estrato I · Linde de Raíz (implementado en código como `stratum_01`)

**Sectores implementados:**
- Linde de Aethel (120 m, forest, low) — sector inicial descubierto
- Raíz de Niebla (180 m, forest, medium) — descubrible

**POIs implementados:** Refugio en Linde de Aethel, Mercader en Raíz de Niebla

**Falta por añadir:**
- Ruina de Guardia Rúnica (tercera zona del estrato, narrativa)
- Cueva de Setas Huecas (zona secreta)
- Campamento de Faroles (nodo secundario)

**Prioridad jugable:**
1. Añadir tercer sector del estrato
2. Implementar primera zona secreta simple
3. Implementar primer NPC contratable (Mira o Dos)

---

### Estrato II · (implementado en código como `stratum_02 · Cornisa Salina`)

> *El código usa bioma de costa (sal, marea). El diseño de World Bible coloca "Corredor de Esporas" en este rango de profundidad. Alineación pendiente en bloque futuro.*

**Sectores implementados:**
- Faro de Sal (340 m, coast, medium)
- Roca de Marea (410 m, coast, high)

**POIs implementados:** ninguno activo

**Falta por añadir:**
- Posada del Hongo / Posada del Faro (primer nodo social real)
- Puesto de suministros en zona de acceso
- Zona secreta de estrato (Galería Dorada u equivalente)
- NPC contratable (Ivar o Tolk)

**Prioridad jugable:**
1. Primera posada funcional (rumores, descanso)
2. Primer mercado de intercambio básico
3. Zona secreta con condición de equipo o criatura

---

### Estrato III · (implementado en código como `stratum_03 · Forjas Hundidas`)

> *El código usa bioma de forja. El diseño de World Bible coloca "Cuenca de Resina" en este rango. Alineación pendiente.*

**Sectores implementados:**
- Fragua Dormida (690 m, forge, high)
- Bastión de Carbón (760 m, forge, medium)

**POIs implementados:** ninguno activo

**Falta por añadir:**
- Refugio de Brasa (primer punto seguro del estrato)
- Forja de Cuenca / Forja del Fondo (primer POI de forja activo)
- Zona secreta de resina o sellada
- NPC contratable (Sala o Bress)

**Prioridad jugable:**
1. Primer lugar seguro funcional del estrato
2. Primera forja activa con funcionalidad básica
3. Zona secreta con condición de equipo

---

*Este documento es la base de diseño del mundo de Aethermarch. Se actualiza conforme el juego avanza.*
*Para estado de implementación técnica, ver `docs/ABYSS_DESIGN.md`.*
*Para roadmap de bloques, ver `docs/PROJECT_BRIEF.md`.*
